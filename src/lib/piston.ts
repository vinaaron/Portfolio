const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

export interface PistonRunResult {
  stdout: string;
  stderr: string;
  code: number;
  signal: string | null;
}

export interface PistonResponse {
  run: PistonRunResult;
  compile?: PistonRunResult;
  language: string;
  version: string;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error: string;
  exitCode: number;
}

/**
 * Execute code using the Piston API
 */
export async function executeCode(
  code: string,
  language: string = 'python',
  version: string = '3.10'
): Promise<ExecutionResult> {
  try {
    const response = await fetch(PISTON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language,
        version,
        files: [
          {
            name: 'main.py',
            content: code,
          },
        ],
        run_timeout: 5000, // 5 second timeout
        run_memory_limit: 100000000, // 100MB memory limit
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        output: '',
        error: `Execution service error: ${errorText}`,
        exitCode: -1,
      };
    }

    const data: PistonResponse = await response.json();

    // Check for compilation errors (if applicable)
    if (data.compile && data.compile.code !== 0) {
      return {
        success: false,
        output: data.compile.stdout || '',
        error: data.compile.stderr || 'Compilation failed',
        exitCode: data.compile.code,
      };
    }

    // Return run results
    const hasError = data.run.code !== 0 || data.run.stderr.length > 0;

    return {
      success: !hasError,
      output: data.run.stdout.trim(),
      error: data.run.stderr.trim(),
      exitCode: data.run.code,
    };
  } catch (error) {
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : 'Unknown execution error',
      exitCode: -1,
    };
  }
}

/**
 * Generate test runner code that executes user's solution against test cases
 */
export function generateTestWrapper(
  userCode: string,
  functionName: string,
  testInputs: Record<string, unknown>
): string {
  // Convert inputs to Python argument format
  const args = Object.entries(testInputs)
    .map(([key, value]) => `${key}=${pythonRepr(value)}`)
    .join(', ');

  return `from typing import List, Optional, Dict, Set, Tuple

${userCode}

# Execute test
try:
    _solution = Solution()
    _result = _solution.${functionName}(${args})
    print("___RESULT___")
    print(repr(_result))
except Exception as e:
    import traceback
    print(f"ERROR: {type(e).__name__}: {e}")
    traceback.print_exc()
`;
}

/**
 * Convert a JavaScript value to Python repr format
 */
function pythonRepr(value: unknown): string {
  if (value === null || value === undefined) {
    return 'None';
  }
  if (typeof value === 'boolean') {
    return value ? 'True' : 'False';
  }
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(pythonRepr).join(', ')}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value)
      .map(([k, v]) => `${JSON.stringify(k)}: ${pythonRepr(v)}`)
      .join(', ');
    return `{${entries}}`;
  }
  return String(value);
}

/**
 * Separate stdout (user's print statements) from the return value
 */
export function parseExecutionOutput(fullOutput: string): { stdout: string; result: string } {
  const marker = "___RESULT___";
  const markerIndex = fullOutput.lastIndexOf(marker);

  if (markerIndex === -1) {
    // No marker - treat entire output as result (error case or no return)
    return { stdout: "", result: fullOutput.trim() };
  }

  const stdout = fullOutput.slice(0, markerIndex).trim();
  const result = fullOutput.slice(markerIndex + marker.length).trim();

  return { stdout, result };
}

/**
 * Parse Python repr output back to JavaScript value
 */
export function parsePythonOutput(output: string): unknown {
  const trimmed = output.trim();

  // Handle None
  if (trimmed === 'None') return null;

  // Handle booleans
  if (trimmed === 'True') return true;
  if (trimmed === 'False') return false;

  // Handle numbers
  if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  if (/^-?\d*\.\d+$/.test(trimmed)) return parseFloat(trimmed);

  // Handle strings (Python uses single quotes by default in repr)
  if ((trimmed.startsWith("'") && trimmed.endsWith("'")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    return trimmed.slice(1, -1);
  }

  // Handle lists/arrays
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      // Convert Python syntax to JSON
      const jsonStr = trimmed
        .replace(/'/g, '"')
        .replace(/True/g, 'true')
        .replace(/False/g, 'false')
        .replace(/None/g, 'null');
      return JSON.parse(jsonStr);
    } catch {
      return trimmed; // Return as string if parsing fails
    }
  }

  // Handle dicts
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const jsonStr = trimmed
        .replace(/'/g, '"')
        .replace(/True/g, 'true')
        .replace(/False/g, 'false')
        .replace(/None/g, 'null');
      return JSON.parse(jsonStr);
    } catch {
      return trimmed;
    }
  }

  // Return as-is for other cases
  return trimmed;
}

/**
 * Compare two values for equality (handles arrays and objects)
 */
export function compareOutputs(expected: unknown, actual: unknown): boolean {
  // Handle null/undefined
  if (expected === null || expected === undefined) {
    return actual === null || actual === undefined;
  }

  // Handle arrays
  if (Array.isArray(expected) && Array.isArray(actual)) {
    if (expected.length !== actual.length) return false;
    return expected.every((val, idx) => compareOutputs(val, actual[idx]));
  }

  // Handle objects
  if (typeof expected === 'object' && typeof actual === 'object' &&
      expected !== null && actual !== null) {
    const expectedKeys = Object.keys(expected);
    const actualKeys = Object.keys(actual as object);
    if (expectedKeys.length !== actualKeys.length) return false;
    return expectedKeys.every(key =>
      compareOutputs(
        (expected as Record<string, unknown>)[key],
        (actual as Record<string, unknown>)[key]
      )
    );
  }

  // Handle primitives
  return expected === actual;
}
