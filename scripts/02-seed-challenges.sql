-- Seed initial challenges for the game

INSERT INTO challenges (title, description, difficulty, test_cases, initial_code, solution_template, points, time_limit) VALUES
(
    'Sum of Two Numbers',
    'Write a function that takes two integers and returns their sum.',
    'easy',
    '[
        {"input": "2, 3", "expectedOutput": "5"},
        {"input": "0, 0", "expectedOutput": "0"},
        {"input": "-1, 1", "expectedOutput": "0"},
        {"input": "100, 200", "expectedOutput": "300"}
    ]'::jsonb,
    'public class Solution {
    public static int Sum(int a, int b) {
        // Write your code here
        return 0;
    }
}',
    'public class Solution {
    public static int Sum(int a, int b) {
        return a + b;
    }
}',
    100,
    180
),
(
    'Reverse a String',
    'Write a function that takes a string and returns it reversed.',
    'easy',
    '[
        {"input": "hello", "expectedOutput": "olleh"},
        {"input": "world", "expectedOutput": "dlrow"},
        {"input": "a", "expectedOutput": "a"},
        {"input": "racecar", "expectedOutput": "racecar"}
    ]'::jsonb,
    'public class Solution {
    public static string Reverse(string input) {
        // Write your code here
        return "";
    }
}',
    'public class Solution {
    public static string Reverse(string input) {
        char[] arr = input.ToCharArray();
        Array.Reverse(arr);
        return new string(arr);
    }
}',
    100,
    180
),
(
    'Find Maximum in Array',
    'Write a function that returns the maximum number in an array of integers.',
    'medium',
    '[
        {"input": "[1, 2, 3, 4, 5]", "expectedOutput": "5"},
        {"input": "[-1, -2, -3]", "expectedOutput": "-1"},
        {"input": "[42]", "expectedOutput": "42"},
        {"input": "[10, 5, 20, 15]", "expectedOutput": "20"}
    ]'::jsonb,
    'public class Solution {
    public static int FindMax(int[] numbers) {
        // Write your code here
        return 0;
    }
}',
    'public class Solution {
    public static int FindMax(int[] numbers) {
        return numbers.Max();
    }
}',
    150,
    240
),
(
    'Is Palindrome',
    'Write a function that checks if a string is a palindrome (reads the same forwards and backwards).',
    'medium',
    '[
        {"input": "racecar", "expectedOutput": "True"},
        {"input": "hello", "expectedOutput": "False"},
        {"input": "a", "expectedOutput": "True"},
        {"input": "noon", "expectedOutput": "True"}
    ]'::jsonb,
    'public class Solution {
    public static bool IsPalindrome(string str) {
        // Write your code here
        return false;
    }
}',
    'public class Solution {
    public static bool IsPalindrome(string str) {
        string reversed = new string(str.ToCharArray().Reverse().ToArray());
        return str == reversed;
    }
}',
    150,
    240
),
(
    'Fibonacci Sequence',
    'Write a function that returns the nth Fibonacci number (0-indexed).',
    'hard',
    '[
        {"input": "0", "expectedOutput": "0"},
        {"input": "1", "expectedOutput": "1"},
        {"input": "5", "expectedOutput": "5"},
        {"input": "10", "expectedOutput": "55"}
    ]'::jsonb,
    'public class Solution {
    public static int Fibonacci(int n) {
        // Write your code here
        return 0;
    }
}',
    'public class Solution {
    public static int Fibonacci(int n) {
        if (n <= 1) return n;
        return Fibonacci(n - 1) + Fibonacci(n - 2);
    }
}',
    200,
    300
);
