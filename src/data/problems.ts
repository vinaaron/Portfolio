export interface TestCase {
  id: string;
  inputs: Record<string, unknown>;
  expected: unknown;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  starterCode: string;
  functionName: string;
  testCases: TestCase[];
}

export const problems: Problem[] = [
  {
    id: 'longest-consecutive-sequence',
    title: 'Longest Consecutive Sequence',
    difficulty: 'Medium',
    tags: ['Arrays', 'Hash Table'],
    description: `Given an unsorted array of integers <code>nums</code>, return the length of the longest consecutive elements sequence.

You must write an algorithm that runs in <strong>O(n)</strong> time.`,
    examples: [
      {
        input: 'nums = [100, 4, 200, 1, 3, 2]',
        output: '4',
        explanation: 'The longest consecutive sequence is [1, 2, 3, 4]. Therefore its length is 4.'
      },
      {
        input: 'nums = [0, 3, 7, 2, 5, 8, 4, 6, 0, 1]',
        output: '9'
      }
    ],
    constraints: [
      '0 ≤ nums.length ≤ 10⁵',
      '-10⁹ ≤ nums[i] ≤ 10⁹'
    ],
    starterCode: `class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        # Write your solution here
        pass`,
    functionName: 'longestConsecutive',
    testCases: [
      {
        id: 'case1',
        inputs: { nums: [100, 4, 200, 1, 3, 2] },
        expected: 4
      },
      {
        id: 'case2',
        inputs: { nums: [0, 3, 7, 2, 5, 8, 4, 6, 0, 1] },
        expected: 9
      },
      {
        id: 'case3',
        inputs: { nums: [] },
        expected: 0
      },
      {
        id: 'case4',
        inputs: { nums: [1] },
        expected: 1
      },
      {
        id: 'case5',
        inputs: { nums: [5, 5, 5, 5] },
        expected: 1
      },
      {
        id: 'case6',
        inputs: { nums: [-3, -2, -1, 0, 1] },
        expected: 5
      },
      {
        id: 'case7',
        inputs: { nums: [9, 1, 4, 7, 3, -1, 0, 5, 8, -1, 6] },
        expected: 7
      }
    ]
  },
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Arrays', 'Hash Table'],
    description: `Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.

You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]'
      },
      {
        input: 'nums = [3, 3], target = 6',
        output: '[0, 1]'
      }
    ],
    constraints: [
      '2 ≤ nums.length ≤ 10⁴',
      '-10⁹ ≤ nums[i] ≤ 10⁹',
      '-10⁹ ≤ target ≤ 10⁹',
      'Only one valid answer exists.'
    ],
    starterCode: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Write your solution here
        pass`,
    functionName: 'twoSum',
    testCases: [
      {
        id: 'case1',
        inputs: { nums: [2, 7, 11, 15], target: 9 },
        expected: [0, 1]
      },
      {
        id: 'case2',
        inputs: { nums: [3, 2, 4], target: 6 },
        expected: [1, 2]
      },
      {
        id: 'case3',
        inputs: { nums: [3, 3], target: 6 },
        expected: [0, 1]
      },
      {
        id: 'case4',
        inputs: { nums: [-1, -2, -3, -4, -5], target: -8 },
        expected: [2, 4]
      },
      {
        id: 'case5',
        inputs: { nums: [0, 4, 3, 0], target: 0 },
        expected: [0, 3]
      },
      {
        id: 'case6',
        inputs: { nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], target: 19 },
        expected: [8, 9]
      }
    ]
  },
  {
    id: 'valid-sudoku',
    title: 'Valid Sudoku',
    difficulty: 'Medium',
    tags: ['Arrays', 'Hash Table', 'Matrix'],
    description: `Determine if a <code>9 x 9</code> Sudoku board is valid. Only the filled cells need to be validated according to the following rules:

<ol>
<li>Each row must contain the digits <code>1-9</code> without repetition.</li>
<li>Each column must contain the digits <code>1-9</code> without repetition.</li>
<li>Each of the nine <code>3 x 3</code> sub-boxes of the grid must contain the digits <code>1-9</code> without repetition.</li>
</ol>

<strong>Note:</strong>
<ul>
<li>A Sudoku board (partially filled) could be valid but is not necessarily solvable.</li>
<li>Only the filled cells need to be validated according to the mentioned rules.</li>
</ul>`,
    examples: [
      {
        input: `board = 
[["5","3",".",".","7",".",".",".","."]
,["6",".",".","1","9","5",".",".","."]
,[".","9","8",".",".",".",".","6","."]
,["8",".",".",".","6",".",".",".","3"]
,["4",".",".","8",".","3",".",".","1"]
,["7",".",".",".","2",".",".",".","6"]
,[".","6",".",".",".",".","2","8","."]
,[".",".",".","4","1","9",".",".","5"]
,[".",".",".",".","8",".",".","7","9"]]`,
        output: 'true'
      },
      {
        input: `board = 
[["8","3",".",".","7",".",".",".","."]
,["6",".",".","1","9","5",".",".","."]
,[".","9","8",".",".",".",".","6","."]
,["8",".",".",".","6",".",".",".","3"]
,["4",".",".","8",".","3",".",".","1"]
,["7",".",".",".","2",".",".",".","6"]
,[".","6",".",".",".",".","2","8","."]
,[".",".",".","4","1","9",".",".","5"]
,[".",".",".",".","8",".",".","7","9"]]`,
        output: 'false',
        explanation: 'There are two 8\'s in the first column, which is invalid.'
      }
    ],
    constraints: [
      'board.length == 9',
      'board[i].length == 9',
      'board[i][j] is a digit 1-9 or \'.\'.'
    ],
    starterCode: `class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        # Write your solution here
        pass`,
    functionName: 'isValidSudoku',
    testCases: [
      {
        id: 'case1',
        inputs: {
          board: [
            ["5","3",".",".","7",".",".",".","."],
            ["6",".",".","1","9","5",".",".","."],
            [".","9","8",".",".",".",".","6","."],
            ["8",".",".",".","6",".",".",".","3"],
            ["4",".",".","8",".","3",".",".","1"],
            ["7",".",".",".","2",".",".",".","6"],
            [".","6",".",".",".",".","2","8","."],
            [".",".",".","4","1","9",".",".","5"],
            [".",".",".",".","8",".",".","7","9"]
          ]
        },
        expected: true
      },
      {
        id: 'case2',
        inputs: {
          board: [
            ["8","3",".",".","7",".",".",".","."],
            ["6",".",".","1","9","5",".",".","."],
            [".","9","8",".",".",".",".","6","."],
            ["8",".",".",".","6",".",".",".","3"],
            ["4",".",".","8",".","3",".",".","1"],
            ["7",".",".",".","2",".",".",".","6"],
            [".","6",".",".",".",".","2","8","."],
            [".",".",".","4","1","9",".",".","5"],
            [".",".",".",".","8",".",".","7","9"]
          ]
        },
        expected: false
      },
      {
        id: 'case3',
        inputs: {
          board: [
            [".",".",".",".",".",".",".",".","."],
            [".",".",".",".",".",".",".",".","."],
            [".",".",".",".",".",".",".",".","."],
            [".",".",".",".",".",".",".",".","."],
            [".",".",".",".",".",".",".",".","."],
            [".",".",".",".",".",".",".",".","."],
            [".",".",".",".",".",".",".",".","."],
            [".",".",".",".",".",".",".",".","."],
            [".",".",".",".",".",".",".",".","."]
          ]
        },
        expected: true
      },
      {
        id: 'case4',
        inputs: {
          board: [
            ["1","2",".",".",".",".",".",".","3"],
            ["4",".",".",".",".",".",".",".","."],
            [".",".",".",".",".",".",".",".","."],
            [".",".",".",".",".",".",".",".","."],
            [".",".",".",".",".",".",".",".","."],
            [".",".",".",".",".",".",".",".","."],
            [".",".",".",".",".",".",".",".","."],
            [".",".",".",".",".",".",".",".","."],
            ["1",".",".",".",".",".",".",".","."]
          ]
        },
        expected: false
      },
      {
        id: 'case5',
        inputs: {
          board: [
            ["5","3",".",".","7",".",".",".","."],
            ["6",".",".","1","9","5",".",".","."],
            [".","9","8",".",".",".",".","6","."],
            ["8",".",".",".","6",".",".",".","3"],
            ["4",".",".","8",".","3",".",".","1"],
            ["7",".",".",".","2",".",".",".","6"],
            [".","6",".",".",".",".","2","8","."],
            [".",".",".","4","1","9",".",".","5"],
            [".",".",".",".",".",".",".","7","9"]
          ]
        },
        expected: true
      }
    ]
  }
];

export function getProblemById(id: string): Problem | undefined {
  return problems.find(p => p.id === id);
}
