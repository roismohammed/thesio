export type StageState = "done" | "now" | "todo"

export interface DashboardStage {
  id: string
  number: string
  name: string
  state: StageState
  detail: string
}

export interface DashboardKpi {
  daysToDefense: number
  defenseDate: string
  chaptersFinal: number
  chaptersTotal: number
  chaptersRemainingLabel: string
  wordsWritten: number
  wordsTarget: number
  wordsPercent: number
  streakDays: number
  streakLabel: string
}

export interface WeeklyWordsPoint {
  week: string
  words: number
}

export interface DashboardChapter {
  id: string
  number: string
  title: string
  percent: number
  state: "done" | "now" | "todo"
}

export interface DashboardTask {
  id: string
  title: string
  meta: string
  tag: "today" | "revision" | "draft"
}

export interface DashboardSupervision {
  note: string
  authorLabel: string
  date: string
}

export interface DashboardData {
  greetingName: string
  progressPercent: number
  thesisTitle: string
  stages: DashboardStage[]
  kpi: DashboardKpi
  weeklyWords: WeeklyWordsPoint[]
  wordsTarget: number
  chapters: DashboardChapter[]
  tasks: DashboardTask[]
  supervision: DashboardSupervision
  quote: string
}