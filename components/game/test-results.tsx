import { Card } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"

interface TestResultsProps {
  results: any
}

export function TestResults({ results }: TestResultsProps) {
  const { is_correct, test_results, points_earned, execution_time } = results

  return (
    <Card className={`p-6 ${is_correct ? "border-green-500/50" : "border-destructive/50"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {is_correct ? (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          ) : (
            <XCircle className="w-6 h-6 text-destructive" />
          )}
          <h3 className="font-semibold text-lg">{is_correct ? "All Tests Passed!" : "Some Tests Failed"}</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">+{points_earned}</p>
          <p className="text-xs text-muted-foreground">{execution_time}ms</p>
        </div>
      </div>

      <div className="space-y-2">
        {test_results.map((result: any, index: number) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${
              result.passed ? "bg-green-500/10 border-green-500/20" : "bg-destructive/10 border-destructive/20"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {result.passed ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive" />
              )}
              <span className="font-mono text-sm font-semibold">Test Case {index + 1}</span>
            </div>
            <div className="ml-6 text-sm space-y-1">
              <p className="text-muted-foreground">
                Input: <span className="font-mono">{result.input}</span>
              </p>
              <p className="text-muted-foreground">
                Expected: <span className="font-mono">{result.expected}</span>
              </p>
              <p>
                Your Output: <span className="font-mono font-semibold">{result.actual || "Error"}</span>
              </p>
              {result.error && <p className="text-destructive text-xs">{result.error}</p>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
