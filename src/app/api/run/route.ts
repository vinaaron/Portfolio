import { NextRequest, NextResponse } from 'next/server';
import { TestCase } from '@/data/problems';
import {
  executeCode,
  generateTestWrapper,
  parseExecutionOutput,
  parsePythonOutput,
  compareOutputs,
} from '@/lib/piston';

interface RunRequest {
  code: string;
  problemTitle: string;
  functionName: string;
  testCases: TestCase[];
  language?: string;
}

export interface TestResult {
  caseId: string;
  passed: boolean;
  expectedOutput: string;
  actualOutput: string;
  error?: string;
  stdout?: string;
}

export interface RunResponse {
  results: TestResult[];
  allPassed: boolean;
  summary: string;
}

export async function POST(request: NextRequest) {
  try {
    const { code, functionName, testCases, language = 'python' }: RunRequest =
      await request.json();

    if (!code || !functionName || !testCases) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const results: TestResult[] = [];

    // Execute code against each test case
    for (const testCase of testCases) {
      // Generate wrapper code that calls the function with test inputs
      const wrappedCode = generateTestWrapper(code, functionName, testCase.inputs);

      // Execute using Piston API
      const execution = await executeCode(wrappedCode, language);

      // Parse the result
      let actualOutput: string;
      let passed = false;
      let error: string | undefined;
      let stdout: string | undefined;

      if (!execution.success || execution.error) {
        // Execution failed (runtime error, syntax error, etc.)
        actualOutput = execution.error || 'Execution failed';
        error = execution.error;
        passed = false;
      } else if (execution.output.startsWith('ERROR:')) {
        // Our wrapper caught an exception
        actualOutput = execution.output;
        error = execution.output;
        passed = false;
      } else {
        // Separate stdout (user's print statements) from the return value
        const { stdout: userStdout, result } = parseExecutionOutput(execution.output);
        stdout = userStdout || undefined;

        // Parse the return value and compare
        const parsedOutput = parsePythonOutput(result);
        actualOutput = formatOutput(parsedOutput);
        passed = compareOutputs(testCase.expected, parsedOutput);
      }

      results.push({
        caseId: testCase.id,
        passed,
        expectedOutput: formatOutput(testCase.expected),
        actualOutput,
        error,
        stdout,
      });
    }

    const allPassed = results.every((r) => r.passed);
    const passedCount = results.filter((r) => r.passed).length;

    // Generate summary
    let summary: string;
    if (allPassed) {
      summary = 'All test cases passed!';
    } else if (passedCount === 0) {
      const hasError = results.some((r) => r.error);
      summary = hasError ? 'Runtime Error' : 'Wrong Answer';
    } else {
      summary = `${passedCount}/${results.length} test cases passed`;
    }

    return NextResponse.json({
      results,
      allPassed,
      summary,
    } as RunResponse);
  } catch (error) {
    console.error('Run API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Format a value for display
 */
function formatOutput(value: unknown): string {
  if (value === null || value === undefined) {
    return 'null';
  }
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  if (Array.isArray(value)) {
    return `[${value.map(formatOutput).join(', ')}]`;
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}
