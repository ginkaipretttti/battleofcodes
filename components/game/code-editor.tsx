"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Send } from "lucide-react"

interface CodeEditorProps {
  code: string
  onChange: (code: string) => void
  onSubmit: () => void
  isSubmitting: boolean
}

export function CodeEditor({ code, onChange, onSubmit, isSubmitting }: CodeEditorProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Your Solution</h3>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          <Send className="w-4 h-4 mr-2" />
          {isSubmitting ? "Running..." : "Submit Solution"}
        </Button>
      </div>

      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-96 font-mono text-sm bg-muted p-4 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        spellCheck={false}
        placeholder="Write your C# code here..."
      />
    </Card>
  )
}
