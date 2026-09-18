import { api } from "@/lib/api"
import type { Chapter, ChapterAnnotation, ChapterVersion, Reference, SupervisionNote, Thesis } from "@/features/thesis/types"

export interface ThesisData {
  data: Thesis
}

export interface ThesisListData {
  data: Thesis[]
}

export interface ChapterData {
  data: Chapter
}

export interface ChapterListData {
  data: Chapter[]
}

export interface VersionListData {
  data: ChapterVersion[]
}

export interface VersionData {
  data: ChapterVersion
}

export interface ReferenceListData {
  data: Reference[]
}

export interface ReferenceData {
  data: Reference
}

export interface NoteData {
  data: SupervisionNote | null
}

// ---- Thesis ----

export function listTheses(): Promise<ThesisListData> {
  return api<ThesisListData>("/api/thesis")
}

export function createThesis(body: { title: string }): Promise<ThesisData> {
  return api<ThesisData>("/api/thesis", { method: "POST", body })
}

export function showThesis(thesisId: number): Promise<ThesisData> {
  return api<ThesisData>(`/api/thesis/${thesisId}`)
}

export function updateThesis(
  thesisId: number,
  body: { title?: string; status?: string; defense_deadline_at?: string | null },
): Promise<ThesisData> {
  return api<ThesisData>(`/api/thesis/${thesisId}`, { method: "PATCH", body })
}

export function deleteThesis(thesisId: number): Promise<void> {
  return api<void>(`/api/thesis/${thesisId}`, { method: "DELETE" })
}

export function thesisExportDocxUrl(thesisId: number): string {
  return `/api/thesis/${thesisId}/export/docx`
}

export function thesisExportPdfUrl(thesisId: number): string {
  return `/api/thesis/${thesisId}/export/pdf`
}

// ---- Chapter ----

export function listChapters(thesisId: number): Promise<ChapterListData> {
  return api<ChapterListData>(`/api/thesis/${thesisId}/chapters`)
}

export function createChapter(
  thesisId: number,
  body: { title: string; position?: number },
): Promise<ChapterData> {
  return api<ChapterData>(`/api/thesis/${thesisId}/chapters`, { method: "POST", body })
}

export function showChapter(thesisId: number, chapterId: number): Promise<ChapterData> {
  return api<ChapterData>(`/api/thesis/${thesisId}/chapters/${chapterId}`)
}

export function updateChapter(
  thesisId: number,
  chapterId: number,
  body: { title?: string; position?: number | null; status?: string },
): Promise<ChapterData> {
  return api<ChapterData>(`/api/thesis/${thesisId}/chapters/${chapterId}`, { method: "PATCH", body })
}

export function saveChapterContent(
  thesisId: number,
  chapterId: number,
  markdown_content: string,
): Promise<VersionData> {
  return api<VersionData>(`/api/thesis/${thesisId}/chapters/${chapterId}/content`, {
    method: "PUT",
    body: { markdown_content },
  })
}

export function deleteChapter(thesisId: number, chapterId: number): Promise<void> {
  return api<void>(`/api/thesis/${thesisId}/chapters/${chapterId}`, { method: "DELETE" })
}

// ---- Chapter versions ----

export function uploadChapterVersion(
  thesisId: number,
  chapterId: number,
  file: File,
): Promise<VersionData> {
  const formData = new FormData()
  formData.append("file", file)

  return api<VersionData>(`/api/thesis/${thesisId}/chapters/${chapterId}/versions`, {
    method: "POST",
    body: formData,
  })
}

export function listVersions(thesisId: number, chapterId: number): Promise<VersionListData> {
  return api<VersionListData>(`/api/thesis/${thesisId}/chapters/${chapterId}/versions`)
}

export function showVersion(
  thesisId: number,
  chapterId: number,
  versionId: number,
): Promise<VersionData> {
  return api<VersionData>(`/api/thesis/${thesisId}/chapters/${chapterId}/versions/${versionId}`)
}

export function revertVersion(
  thesisId: number,
  chapterId: number,
  versionId: number,
): Promise<{ data: { id: number; current_version_id: number } }> {
  return api<{ data: { id: number; current_version_id: number } }>(
    `/api/thesis/${thesisId}/chapters/${chapterId}/versions/${versionId}/revert`,
    { method: "POST" },
  )
}

export function versionDownloadUrl(thesisId: number, chapterId: number, versionId: number): string {
  return `/api/thesis/${thesisId}/chapters/${chapterId}/versions/${versionId}/download`
}

// ---- References ----

export function listReferences(thesisId: number, chapterId: number): Promise<ReferenceListData> {
  return api<ReferenceListData>(`/api/thesis/${thesisId}/chapters/${chapterId}/references`)
}

export function createLinkReference(
  thesisId: number,
  chapterId: number,
  body: {
    title: string
    url?: string | null
    authors?: string | null
    year?: string | null
    publication?: string | null
    volume?: string | null
    pages?: string | null
    doi?: string | null
  },
): Promise<ReferenceData> {
  return api<ReferenceData>(`/api/thesis/${thesisId}/chapters/${chapterId}/references`, {
    method: "POST",
    body: { ...body, type: "link" },
  })
}

export function createFileReference(
  thesisId: number,
  chapterId: number,
  title: string,
  file: File,
  meta?: {
    authors?: string | null
    year?: string | null
    publication?: string | null
    volume?: string | null
    pages?: string | null
    doi?: string | null
  },
): Promise<ReferenceData> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("title", title)
  formData.append("type", "file")
  if (meta?.authors) formData.append("authors", meta.authors)
  if (meta?.year) formData.append("year", meta.year)
  if (meta?.publication) formData.append("publication", meta.publication)
  if (meta?.volume) formData.append("volume", meta.volume)
  if (meta?.pages) formData.append("pages", meta.pages)
  if (meta?.doi) formData.append("doi", meta.doi)

  return api<ReferenceData>(`/api/thesis/${thesisId}/chapters/${chapterId}/references`, {
    method: "POST",
    body: formData,
  })
}

export function updateReference(
  thesisId: number,
  chapterId: number,
  referenceId: number,
  body: {
    title?: string
    url?: string | null
    authors?: string | null
    year?: string | null
    publication?: string | null
    volume?: string | null
    pages?: string | null
    doi?: string | null
  },
): Promise<ReferenceData> {
  return api<ReferenceData>(
    `/api/thesis/${thesisId}/chapters/${chapterId}/references/${referenceId}`,
    { method: "PATCH", body },
  )
}

export function deleteReference(
  thesisId: number,
  chapterId: number,
  referenceId: number,
): Promise<void> {
  return api<void>(`/api/thesis/${thesisId}/chapters/${chapterId}/references/${referenceId}`, {
    method: "DELETE",
  })
}

export function referenceDownloadUrl(thesisId: number, chapterId: number, referenceId: number): string {
  return `/api/thesis/${thesisId}/chapters/${chapterId}/references/${referenceId}/download`
}

// ---- Supervision note (notulen) ----

export function showNote(thesisId: number, chapterId: number): Promise<NoteData> {
  return api<NoteData>(`/api/thesis/${thesisId}/chapters/${chapterId}/notulen`)
}

export function upsertNote(
  thesisId: number,
  chapterId: number,
  content: string,
): Promise<NoteData> {
  return api<NoteData>(`/api/thesis/${thesisId}/chapters/${chapterId}/notulen`, {
    method: "PUT",
    body: { content },
  })
}

export function deleteNote(thesisId: number, chapterId: number): Promise<void> {
  return api<void>(`/api/thesis/${thesisId}/chapters/${chapterId}/notulen`, { method: "DELETE" })
}

// ---- Defense Simulator ----

export interface DefenseQuestion {
  id: number
  category: string
  question: string
  focus_hint: string
}

export interface DefenseEvaluation {
  score: number
  grade: string
  feedback: string
  strengths: string[]
  improvements: string[]
}

export function generateDefenseQuestions(thesisId: number): Promise<{ data: { questions: DefenseQuestion[] } }> {
  return api<{ data: { questions: DefenseQuestion[] } }>(
    `/api/thesis/${thesisId}/defense-simulator/questions`,
    { method: "POST" },
  )
}

export function evaluateDefenseAnswer(
  thesisId: number,
  question: string,
  answer: string,
): Promise<{ data: DefenseEvaluation }> {
  return api<{ data: DefenseEvaluation }>(
    `/api/thesis/${thesisId}/defense-simulator/evaluate`,
    {
      method: "POST",
      body: { question, answer },
    },
  )
}

// ---- Milestones ----

export interface MilestoneListData {
  data: import("@/features/thesis/types").Milestone[]
}

export function listMilestones(thesisId: number): Promise<MilestoneListData> {
  return api<MilestoneListData>(`/api/thesis/${thesisId}/milestones`)
}

export function updateMilestone(
  thesisId: number,
  milestoneId: number,
  body: { status?: string; target_date?: string | null; completed_date?: string | null; name?: string },
): Promise<{ data: import("@/features/thesis/types").Milestone }> {
  return api<{ data: import("@/features/thesis/types").Milestone }>(
    `/api/thesis/${thesisId}/milestones/${milestoneId}`,
    { method: "PATCH", body },
  )
}

// ---- Academic Grammar Checker ----

export interface GrammarSuggestion {
  type: string
  original: string
  suggestion: string
  reason: string
}

export interface GrammarCheckResult {
  data: {
    overall_score: number
    summary: string
    suggestions: GrammarSuggestion[]
  }
}

export function checkGrammar(
  thesisId: number,
  chapterId: number,
  text?: string,
): Promise<GrammarCheckResult> {
  return api<GrammarCheckResult>(`/api/thesis/${thesisId}/chapters/${chapterId}/grammar-check`, {
    method: "POST",
    body: { text },
  })
}

// ---- Paraphrase ----

export interface ParaphraseRequestPayload {
  selection: string
  supervision_note_id?: number | null
  custom_instruction?: string | null
  reference_context?: string | null
  style_mode?: "academic" | "concise" | "elaborative"
}

export interface ParaphrasePreviewData {
  data: {
    paraphrase_id: number
    original_selection?: string
    paraphrased_text: string
    style_mode?: string
  }
}

export interface ParaphraseHistoryItem {
  id: number
  original_selection: string
  paraphrased_text: string | null
  custom_instruction?: string | null
  reference_context?: string | null
  style_mode: string
  outcome: string
  applied_at: string | null
  created_at: string
}

export interface ParaphraseHistoryData {
  data: ParaphraseHistoryItem[]
}

export function requestParaphrase(
  thesisId: number,
  chapterId: number,
  payload: string | ParaphraseRequestPayload,
): Promise<ParaphrasePreviewData> {
  const body = typeof payload === "string" ? { selection: payload } : payload
  return api<ParaphrasePreviewData>(`/api/thesis/${thesisId}/chapters/${chapterId}/paraphrase`, {
    method: "POST",
    body,
  })
}

export function listParaphrases(
  thesisId: number,
  chapterId: number,
): Promise<ParaphraseHistoryData> {
  return api<ParaphraseHistoryData>(`/api/thesis/${thesisId}/chapters/${chapterId}/paraphrase`)
}

export function applyParaphrase(
  thesisId: number,
  chapterId: number,
  paraphraseId: number,
): Promise<{ data: { id: number; version_number: number; source: string; conversion_status: string } }> {
  return api<{ data: { id: number; version_number: number; source: string; conversion_status: string } }>(
    `/api/thesis/${thesisId}/chapters/${chapterId}/paraphrase/${paraphraseId}/apply`,
    { method: "POST" },
  )
}

// ---- Annotations & Comments ----

export interface AnnotationListData {
  data: ChapterAnnotation[]
}

export interface AnnotationData {
  data: ChapterAnnotation
}

export function listAnnotations(thesisId: number, chapterId: number): Promise<AnnotationListData> {
  return api<AnnotationListData>(`/api/thesis/${thesisId}/chapters/${chapterId}/annotations`)
}

export function createAnnotation(
  thesisId: number,
  chapterId: number,
  body: {
    selected_text: string
    color: "yellow" | "green" | "blue" | "pink" | "orange"
    comment?: string | null
    author_name?: string | null
    author_role?: "student" | "lecturer" | "general"
    version_id?: number | null
  },
): Promise<AnnotationData> {
  return api<AnnotationData>(`/api/thesis/${thesisId}/chapters/${chapterId}/annotations`, {
    method: "POST",
    body,
  })
}

export function updateAnnotation(
  thesisId: number,
  chapterId: number,
  annotationId: number,
  body: {
    color?: "yellow" | "green" | "blue" | "pink" | "orange"
    comment?: string | null
    is_resolved?: boolean
  },
): Promise<AnnotationData> {
  return api<AnnotationData>(
    `/api/thesis/${thesisId}/chapters/${chapterId}/annotations/${annotationId}`,
    {
      method: "PATCH",
      body,
    },
  )
}

export function deleteAnnotation(
  thesisId: number,
  chapterId: number,
  annotationId: number,
): Promise<void> {
  return api<void>(`/api/thesis/${thesisId}/chapters/${chapterId}/annotations/${annotationId}`, {
    method: "DELETE",
  })
}

// ---- AI Chapter Writer ----

export interface AiWriteChapterPayload {
  instruction: string
  section_title?: string | null
  reference_ids?: number[]
  current_content?: string | null
  writing_tone?: "academic" | "critical" | "methodological"
  target_length?: "short" | "medium" | "long"
}

export interface AiWriteChapterResponse {
  data: {
    content: string
    references_used: string[]
  }
}

export function aiWriteChapter(
  thesisId: number,
  chapterId: number,
  body: AiWriteChapterPayload,
): Promise<AiWriteChapterResponse> {
  return api<AiWriteChapterResponse>(`/api/thesis/${thesisId}/chapters/${chapterId}/ai-write`, {
    method: "POST",
    body,
  })
}


