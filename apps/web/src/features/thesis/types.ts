export interface Thesis {
  id: number
  title: string
  status: "in_progress" | "submitted" | "completed"
  defense_deadline_at?: string | null
  guidance_last_viewed_at?: string | null
  chapters_count?: number
  chapters?: Chapter[]
  created_at: string
  updated_at: string
}

export interface Chapter {
  id: number
  thesis_id: number
  title: string
  position: number | null
  status: "draft" | "submitted" | "reviewed"
  current_version_id: number | null
  current_version?: ChapterVersion | null
  references?: Reference[]
  supervision_note?: SupervisionNote | null
  created_at: string
  updated_at: string
}

export interface ChapterVersion {
  id: number
  chapter_id: number
  version_number: number
  source: "upload" | "paraphrase"
  original_file_name?: string | null
  mime?: string | null
  size?: number | null
  conversion_status: "pending" | "succeeded" | "failed"
  conversion_message?: string | null
  markdown_content?: string | null
  uploaded_by: number
  created_at: string
}

export interface Reference {
  id: number
  chapter_id: number
  type: "link" | "file"
  title: string
  authors?: string | null
  year?: string | null
  publication?: string | null
  volume?: string | null
  pages?: string | null
  doi?: string | null
  url?: string | null
  file_name?: string | null
  mime?: string | null
  size?: number | null
  created_at: string
  updated_at: string
}

export interface Milestone {
  id: number
  thesis_id: number
  name: string
  target_date?: string | null
  completed_date?: string | null
  status: "pending" | "in_progress" | "completed"
  position: number
  created_at?: string
  updated_at?: string
}

export interface SupervisionNote {
  id: number
  chapter_id: number
  content: string
  created_at: string
  updated_at: string
}

export interface Paraphrase {
  id: number
  chapter_id: number
  original_selection: string
  paraphrased_text?: string | null
  outcome: "applied" | "discarded" | "failed"
  created_at: string
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  total: number
}

export interface SupervisionGuide {
  id: number
  thesis_id: number
  origin: "scheduled" | "on_demand"
  status: "current" | "archived"
  is_tailored: boolean
  generated_at: string
  defense_deadline_at?: string | null
  defense_remaining_days?: number | null
  is_unread: boolean
  points: GuidancePoint[]
}

export interface GuidancePoint {
  id: number
  origin: "system" | "student"
  title: string
  description?: string | null
  status: "pending" | "prepared"
  priority: number
  chapter_id?: number | null
  supervision_note_id?: number | null
}

export interface SupervisionGuideListItem {
  id: number
  origin: "scheduled" | "on_demand"
  status: "current" | "archived"
  is_tailored: boolean
  generated_at: string
  points_count: number
  prepared_count: number
}

export interface ChapterAnnotation {
  id: number
  chapter_id: number
  user_id: number
  version_id?: number | null
  selected_text: string
  color: "yellow" | "green" | "blue" | "pink" | "orange"
  comment?: string | null
  author_name?: string | null
  author_role: "student" | "lecturer" | "general"
  is_resolved: boolean
  created_at: string
  updated_at: string
}

export type TaskStatus = "todo" | "doing" | "done"
export type Urgency = "late" | "soon" | "safe" | "none"
export type DueAtMode = "auto" | "manual"
export type TaskOrigin = "manual" | "suggestion"

export interface Task {
  id: number
  thesis_id: number
  title: string
  description?: string | null
  status: TaskStatus
  priority: number
  position: number
  due_at?: string | null
  due_at_mode: DueAtMode
  origin: TaskOrigin
  chapter_id?: number | null
  supervision_note_id?: number | null
  task_suggestion_id?: number | null
  urgency: Urgency
  created_at: string
  updated_at: string
}

export type TaskSuggestionStatus = "pending" | "accepted" | "rejected"

export interface TaskSuggestion {
  id: number
  thesis_id: number
  title: string
  description?: string | null
  priority: number
  source_type: "note_revision" | "chapter_draft"
  chapter_id?: number | null
  supervision_note_id?: number | null
  status: TaskSuggestionStatus
  due_at_suggestion?: string | null
  generated_at: string
}
