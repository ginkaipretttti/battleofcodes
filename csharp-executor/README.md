# Battle of Codes - C# Code Executor

Secure C# code compilation and execution service.

## Requirements

- .NET SDK 8.0 or higher
- Node.js 20.x or higher

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install .NET SDK:
   - Windows: Download from https://dotnet.microsoft.com/download
   - Linux: `sudo apt-get install dotnet-sdk-8.0`
   - macOS: `brew install dotnet-sdk`

3. Create `.env` file:
```
PORT=3002
```

4. Run development server:
```bash
npm run dev
```

## API

### POST /execute

Execute C# code with test cases.

**Request:**
```json
{
  "code": "public class Solution { public static int Sum(int a, int b) { return a + b; } }",
  "testCases": [
    { "input": "2 3", "expectedOutput": "5" },
    { "input": "0 0", "expectedOutput": "0" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "allPassed": true,
  "results": [
    {
      "passed": true,
      "input": "2 3",
      "expected": "5",
      "actual": "5",
      "error": null,
      "executionTime": 45
    }
  ],
  "totalExecutionTime": 45
}
```

## Deploy to Render

1. Create a new Web Service on Render
2. Use Docker deployment
3. Environment Variables:
   - `PORT`: 3002
4. Add the Render URL to your Next.js app as `NEXT_PUBLIC_CSHARP_EXECUTOR_URL`

## Security Notes

- Code execution is sandboxed
- Timeout limits prevent infinite loops
- Temporary files are cleaned up after execution
- Should be deployed behind authentication in production
