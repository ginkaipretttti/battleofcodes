import express from "express"
import cors from "cors"
import { exec } from "child_process"
import { promises as fs } from "fs"
import path from "path"
import { randomBytes } from "crypto"

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3002
const TEMP_DIR = path.join(__dirname, "temp")

// Ensure temp directory exists
fs.mkdir(TEMP_DIR, { recursive: true }).catch(console.error)

interface TestCase {
  input: string
  expectedOutput: string
}

interface ExecutionResult {
  passed: boolean
  input: string
  expected: string
  actual: string | null
  error: string | null
  executionTime: number
}

async function executeCode(code: string, testCases: TestCase[]): Promise<ExecutionResult[]> {
  const sessionId = randomBytes(16).toString("hex")
  const sessionDir = path.join(TEMP_DIR, sessionId)
  const sourceFile = path.join(sessionDir, "Program.cs")
  const exeFile = path.join(sessionDir, "Program.exe")

  try {
    // Create session directory
    await fs.mkdir(sessionDir, { recursive: true })

    // Write source code to file
    await fs.writeFile(sourceFile, code)

    // Compile C# code
    const compileCommand = `csc /out:"${exeFile}" "${sourceFile}"`

    const compileResult = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
      exec(compileCommand, { cwd: sessionDir, timeout: 10000 }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Compilation failed: ${stderr || error.message}`))
        } else {
          resolve({ stdout, stderr })
        }
      })
    })

    // Run test cases
    const results: ExecutionResult[] = []

    for (const testCase of testCases) {
      const startTime = Date.now()

      try {
        const runCommand = `"${exeFile}" ${testCase.input}`

        const runResult = await new Promise<string>((resolve, reject) => {
          exec(runCommand, { timeout: 5000, cwd: sessionDir }, (error, stdout, stderr) => {
            if (error) {
              reject(new Error(stderr || error.message))
            } else {
              resolve(stdout.trim())
            }
          })
        })

        const executionTime = Date.now() - startTime
        const actualOutput = runResult.trim()
        const passed = actualOutput === testCase.expectedOutput.trim()

        results.push({
          passed,
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: actualOutput,
          error: null,
          executionTime,
        })
      } catch (error: any) {
        const executionTime = Date.now() - startTime
        results.push({
          passed: false,
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: null,
          error: error.message,
          executionTime,
        })
      }
    }

    return results
  } finally {
    // Clean up temporary files
    try {
      await fs.rm(sessionDir, { recursive: true, force: true })
    } catch (error) {
      console.error("Failed to clean up session directory:", error)
    }
  }
}

app.post("/execute", async (req, res) => {
  try {
    const { code, testCases } = req.body

    if (!code || !testCases || !Array.isArray(testCases)) {
      return res.status(400).json({ error: "Invalid request. Required: code and testCases array" })
    }

    console.log(`[C# Executor] Executing code with ${testCases.length} test cases`)

    const results = await executeCode(code, testCases)
    const allPassed = results.every((r) => r.passed)
    const totalTime = results.reduce((sum, r) => sum + r.executionTime, 0)

    res.json({
      success: true,
      allPassed,
      results,
      totalExecutionTime: totalTime,
    })
  } catch (error: any) {
    console.error("[C# Executor] Error:", error)
    res.status(500).json({
      success: false,
      error: error.message || "Code execution failed",
    })
  }
})

app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: Date.now() })
})

app.listen(PORT, () => {
  console.log(`[C# Executor] Server running on port ${PORT}`)
})
