import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiBrain01Icon,
  CheckmarkCircle02Icon,
  HelpCircleIcon,
  Loading03Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import {
  evaluateDefenseAnswer,
  generateDefenseQuestions,
  type DefenseEvaluation,
  type DefenseQuestion,
} from "@/features/thesis/api/thesis"
import { ApiError } from "@/lib/api"

interface DefenseSimulatorDialogProps {
  thesisId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DefenseSimulatorDialog({
  thesisId,
  open,
  onOpenChange,
}: DefenseSimulatorDialogProps) {
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [questions, setQuestions] = useState<DefenseQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [evaluations, setEvaluations] = useState<Record<number, DefenseEvaluation>>({})

  const loadQuestions = async () => {
    setLoadingQuestions(true)
    try {
      const res = await generateDefenseQuestions(thesisId)
      setQuestions(res.data.questions)
      setCurrentIndex(0)
      setAnswer("")
      setEvaluations({})
    } catch (err) {
      toast.add({
        title: err instanceof ApiError ? err.message : "Gagal menyusun simulasi pertanyaan sidang.",
        type: "error",
      })
    } finally {
      setLoadingQuestions(false)
    }
  }

  const handleStart = () => {
    void loadQuestions()
  }

  const currentQ = questions[currentIndex]
  const currentEval = currentQ ? evaluations[currentQ.id] : undefined

  const handleSubmitAnswer = async () => {
    if (!currentQ || !answer.trim()) return

    setEvaluating(true)
    try {
      const res = await evaluateDefenseAnswer(thesisId, currentQ.question, answer)
      setEvaluations((prev) => ({
        ...prev,
        [currentQ.id]: res.data,
      }))
      toast.add({ title: "Jawaban berhasil dievaluasi penguji AI.", type: "success" })
    } catch (err) {
      toast.add({
        title: err instanceof ApiError ? err.message : "Gagal mengevaluasi jawaban.",
        type: "error",
      })
    } finally {
      setEvaluating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <HugeiconsIcon icon={AiBrain01Icon} strokeWidth={2} className="size-5 text-primary" />
            Simulasi Sidang Skripsi (AI Defense Simulator)
          </DialogTitle>
        </DialogHeader>

        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <HugeiconsIcon icon={AiBrain01Icon} strokeWidth={2} className="size-8" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="font-semibold text-foreground text-base">Uji Kesiapan Sidang dengan Dosen Penguji AI</h3>
              <p className="text-xs text-muted-foreground">
                AI akan menelaah naskah bab skripsi Anda dan menyusun 3-5 pertanyaan kritis mengenai metodologi, batasan masalah, validitas data, dan kontribusi temuan.
              </p>
            </div>
            <Button onClick={handleStart} disabled={loadingQuestions} className="gap-2">
              {loadingQuestions ? (
                <>
                  <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />
                  Menyiapkan Pertanyaan Sidang...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-4" />
                  Mulai Simulasi Sidang
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Question Selector Tabs */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                {questions.map((q, idx) => {
                  const isDone = !!evaluations[q.id]
                  const isCurrent = idx === currentIndex
                  return (
                    <Button
                      key={q.id}
                      size="sm"
                      variant={isCurrent ? "default" : "outline"}
                      className={`text-xs h-7 gap-1.5 ${isDone && !isCurrent ? "border-green-500/50 text-green-600 dark:text-green-400" : ""}`}
                      onClick={() => {
                        setCurrentIndex(idx)
                        setAnswer("")
                      }}
                    >
                      {isDone ? (
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-3.5" />
                      ) : null}
                      Pertanyaan {idx + 1}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={handleStart}
                disabled={loadingQuestions}
              >
                Acak Ulang
              </Button>
            </div>

            {/* Current Question View */}
            {currentQ ? (
              <div className="flex flex-col gap-4">
                <Card className="border-primary/20 bg-muted/40">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary" className="text-xs font-semibold">
                        Fokus: {currentQ.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        Penguji Utama
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-relaxed">
                      "{currentQ.question}"
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 italic">
                      <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} className="size-3.5 text-primary" />
                      Petunjuk: {currentQ.focus_hint}
                    </p>
                  </CardContent>
                </Card>

                {/* Evaluation Result if already answered */}
                {currentEval ? (
                  <Card className="border-green-500/30 bg-green-500/5">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-300">
                          Evaluasi & Skor Penguji
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-green-600 text-white text-xs">
                            Skor: {currentEval.score}/100
                          </Badge>
                          <Badge variant="outline" className="font-bold text-xs">
                            Grade: {currentEval.grade}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">
                        {currentEval.feedback}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                        <div className="space-y-1">
                          <span className="font-semibold text-green-700 dark:text-green-400">Poin Kuat:</span>
                          <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                            {currentEval.strengths.map((str, i) => (
                              <li key={i}>{str}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-1">
                          <span className="font-semibold text-amber-700 dark:text-amber-400">Saran Perbaikan:</span>
                          <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                            {currentEval.improvements.map((imp, i) => (
                              <li key={i}>{imp}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                {/* Input Answer Field */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-foreground">
                    Jawaban Anda (sampaikan argumen & bukti pendukung):
                  </label>
                  <textarea
                    rows={4}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Tuliskan jawaban Anda secara lugas dan komprehensif..."
                    className="w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={evaluating || !answer.trim()}
                      className="gap-1.5"
                    >
                      {evaluating ? (
                        <>
                          <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />
                          Menilai Jawaban...
                        </>
                      ) : (
                        <>
                          <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-4" />
                          Kirim & Evaluasi Jawaban
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
