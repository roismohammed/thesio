import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { listTheses, listChapters } from "@/features/thesis/api/thesis"
import { listTasks } from "@/features/thesis/api/kanban-tasks"
import type { Chapter, Task, Thesis } from "@/features/thesis/types"
import type { DashboardChapter, DashboardData, DashboardStage, DashboardTask } from "@/features/dasbor/types"
import { getCachedApi, setCachedApi } from "@/lib/api"

const DASHBOARD_CACHE_KEY = "__thesio_dashboard_data__"

const DEFAULT_STAGES: DashboardStage[] = [
  {
    id: "seminar-proposal",
    number: "01",
    name: "Seminar Proposal",
    state: "done",
    detail: "Selesai",
  },
  {
    id: "penelitian-penulisan",
    number: "02",
    name: "Penelitian & Penulisan",
    state: "now",
    detail: "Sedang berjalan",
  },
  {
    id: "seminar-hasil",
    number: "03",
    name: "Seminar Hasil",
    state: "todo",
    detail: "Belum dijadwalkan",
  },
  {
    id: "sidang-akhir",
    number: "04",
    name: "Sidang Akhir",
    state: "todo",
    detail: "Belum dijadwalkan",
  },
]

function buildDashboardData(
  userName: string | undefined,
  primaryThesis?: Thesis,
  rawChapters: Chapter[] = [],
  rawTasks: Task[] = [],
): DashboardData {
  const greetingName = userName?.split(" ")[0] || "Mahasiswa"

  if (!primaryThesis) {
    return {
      greetingName,
      progressPercent: 0,
      thesisTitle: "Belum ada judul skripsi aktif. Silakan buat di menu Skripsi.",
      stages: DEFAULT_STAGES,
      kpi: {
        daysToDefense: 0,
        defenseDate: "-",
        chaptersFinal: 0,
        chaptersTotal: 0,
        chaptersRemainingLabel: "0 bab",
        wordsWritten: 0,
        wordsTarget: 25000,
        wordsPercent: 0,
        streakDays: 0,
        streakLabel: "Konsistensi",
      },
      weeklyWords: [
        { week: "M1", words: 0 },
        { week: "M2", words: 0 },
        { week: "M3", words: 0 },
        { week: "M4", words: 0 },
      ],
      wordsTarget: 25000,
      chapters: [],
      tasks: [
        {
          id: "task-empty",
          title: "Belum ada tugas prioritas. Buat tugas baru di menu Tugas Skripsi.",
          meta: "Papan Kanban",
          tag: "draft",
        },
      ],
      supervision: {
        note: "Belum ada catatan revisi bimbingan terbaru.",
        authorLabel: "Dosen Pembimbing",
        date: "-",
      },
      quote: "Selesai bukan soal cepat. Soal terus jalan. Satu paragraf hari ini, sidang makin dekat.",
    }
  }

  // Calculate chapter metrics
  const mappedChapters: DashboardChapter[] = rawChapters.map((ch, idx) => {
    const isDone = ch.status === "reviewed"
    const isNow = ch.status === "submitted" || (ch.status === "draft" && ch.current_version_id !== null)
    const percent = isDone ? 100 : isNow ? 60 : 0
    return {
      id: String(ch.id),
      number: String(idx + 1).padStart(2, "0"),
      title: ch.title,
      percent,
      state: isDone ? "done" : isNow ? "now" : "todo",
    }
  })

  const finalCount = mappedChapters.filter((c) => c.state === "done").length
  const totalChapters = mappedChapters.length || 1
  const calculatedProgress = mappedChapters.length > 0
    ? Math.round(mappedChapters.reduce((acc, c) => acc + c.percent, 0) / totalChapters)
    : 0

  // Map priority tasks from kanban board
  const mappedTasks: DashboardTask[] = rawTasks
    .filter((t) => t.status !== "done")
    .slice(0, 4)
    .map((t) => ({
      id: String(t.id),
      title: t.title,
      meta: t.due_at ? `Tenggat: ${new Date(t.due_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}` : "Tugas Skripsi",
      tag: t.urgency === "late" ? "today" : t.urgency === "soon" ? "revision" : "draft",
    }))

  // Compute days to defense
  let daysToDefense = 0
  let defenseDateFormatted = "Belum diatur"
  if (primaryThesis.defense_deadline_at) {
    const target = new Date(primaryThesis.defense_deadline_at)
    const diffTime = target.getTime() - new Date().getTime()
    daysToDefense = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
    defenseDateFormatted = target.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
  }

  // Count words written from chapter markdown content if available
  const estimatedWords = rawChapters.reduce((acc, ch) => {
    const content = ch.current_version?.markdown_content || ""
    const words = content.trim().split(/\s+/).filter(Boolean).length
    return acc + words
  }, 0)

  const targetWords = 25000

  return {
    greetingName,
    progressPercent: calculatedProgress,
    thesisTitle: primaryThesis.title,
    stages: DEFAULT_STAGES,
    kpi: {
      daysToDefense,
      defenseDate: defenseDateFormatted,
      chaptersFinal: finalCount,
      chaptersTotal: rawChapters.length,
      chaptersRemainingLabel: `${Math.max(0, rawChapters.length - finalCount)} bab tersisa`,
      wordsWritten: estimatedWords,
      wordsTarget: targetWords,
      wordsPercent: Math.min(100, Math.round((estimatedWords / targetWords) * 100)),
      streakDays: daysToDefense > 0 ? Math.min(14, 30 - (daysToDefense % 30)) : 0,
      streakLabel: "Target sidang",
    },
    weeklyWords: [
      { week: "M1", words: Math.round(estimatedWords * 0.1) },
      { week: "M2", words: Math.round(estimatedWords * 0.3) },
      { week: "M3", words: Math.round(estimatedWords * 0.6) },
      { week: "M4", words: estimatedWords },
    ],
    wordsTarget: targetWords,
    chapters: mappedChapters,
    tasks: mappedTasks.length > 0 ? mappedTasks : [
      {
        id: "task-empty",
        title: "Belum ada tugas prioritas. Buat tugas baru di menu Tugas Skripsi.",
        meta: "Papan Kanban",
        tag: "draft",
      },
    ],
    supervision: {
      note: "Lanjutkan progres bab skripsi dan periksa catatan dosen secara berkala.",
      authorLabel: "Dosen Pembimbing",
      date: "-",
    },
    quote: "Selesai bukan soal cepat. Soal terus jalan. Satu paragraf hari ini, sidang makin dekat.",
  }
}

function getInitialDashboardData(userName?: string): { data: DashboardData; hasCache: boolean } {
  const cachedDashboard = getCachedApi<DashboardData>(DASHBOARD_CACHE_KEY)
  if (cachedDashboard) {
    return {
      data: {
        ...cachedDashboard,
        greetingName: userName?.split(" ")[0] || cachedDashboard.greetingName,
      },
      hasCache: true,
    }
  }

  const cachedTheses = getCachedApi<{ data: Thesis[] }>("/api/thesis")?.data
  if (cachedTheses) {
    const primaryThesis = cachedTheses[0]
    const cachedChapters = primaryThesis
      ? getCachedApi<{ data: Chapter[] }>(`/api/thesis/${primaryThesis.id}/chapters`)?.data ?? []
      : []
    const cachedTasks = primaryThesis
      ? getCachedApi<{ data: Task[] }>(`/api/thesis/${primaryThesis.id}/tasks`)?.data ?? []
      : []

    const computed = buildDashboardData(userName, primaryThesis, cachedChapters, cachedTasks)
    return { data: computed, hasCache: true }
  }

  return {
    data: buildDashboardData(userName),
    hasCache: false,
  }
}

export function useDashboard() {
  const { user } = useAuth()
  const initial = getInitialDashboardData(user?.name)
  const [data, setData] = useState<DashboardData>(initial.data)
  const [loading, setLoading] = useState(!initial.hasCache)

  const loadDashboardData = useCallback(async () => {
    try {
      const thesesRes = await listTheses()
      const primaryThesis = thesesRes.data?.[0]

      if (!primaryThesis) {
        const emptyData = buildDashboardData(user?.name)
        setData(emptyData)
        setCachedApi(DASHBOARD_CACHE_KEY, emptyData)
        return
      }

      // Fetch chapters and tasks in parallel
      const [chaptersRes, tasksRes] = await Promise.all([
        listChapters(primaryThesis.id).catch(() => ({ data: [] })),
        listTasks(primaryThesis.id).catch(() => ({ data: [] })),
      ])

      const rawChapters = chaptersRes.data || []
      const rawTasks = tasksRes.data || []

      const computed = buildDashboardData(user?.name, primaryThesis, rawChapters, rawTasks)
      setData(computed)
      setCachedApi(DASHBOARD_CACHE_KEY, computed)
    } catch {
      // Fallback greeting using current authenticated user
      setData((prev) => ({
        ...prev,
        greetingName: user?.name?.split(" ")[0] || "Mahasiswa",
      }))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void loadDashboardData()
  }, [loadDashboardData])

  return { data, loading }
}
