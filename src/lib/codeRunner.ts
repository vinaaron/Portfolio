import { TestCase } from '@/data/problems';

// Test result from real code execution
export interface TestResult {
  caseId: string;
  passed: boolean;
  expectedOutput: string;
  actualOutput: string;
  error?: string;
  stdout?: string;
}

// Run result from the API
export interface RunResult {
  results: TestResult[];
  allPassed: boolean;
  summary: string;
}

/**
 * Format a value for display
 */
export function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'null';
  }
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  if (Array.isArray(value)) {
    return `[${value.map(formatValue).join(', ')}]`;
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

/**
 * Execute code against test cases using the Piston API
 */
export async function runCode(
  code: string,
  problemTitle: string,
  functionName: string,
  testCases: TestCase[],
  language: string = 'python'
): Promise<RunResult> {
  const response = await fetch('/api/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      problemTitle,
      functionName,
      testCases,
      language,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to run code');
  }

  return response.json();
}
