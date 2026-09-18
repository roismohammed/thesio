import { api } from "@/lib/api"
import type { GuidancePoint, SupervisionGuide, SupervisionGuideListItem } from "@/features/thesis/types"

interface GuideData {
  data: SupervisionGuide | null
}

interface PointData {
  data: GuidancePoint
}

interface HistoryData {
  data: SupervisionGuideListItem[]
}

export function getCurrentGuide(thesisId: number): Promise<GuideData> {
  return api<GuideData>(`/api/thesis/${thesisId}/supervision-guides/current`)
}

export function generateGuide(thesisId: number): Promise<GuideData> {
  return api<GuideData>(`/api/thesis/${thesisId}/supervision-guides`, { method: "POST" })
}

export function showGuide(thesisId: number, guideId: number): Promise<GuideData> {
  return api<GuideData>(`/api/thesis/${thesisId}/supervision-guides/${guideId}`)
}

export function listGuideHistory(thesisId: number): Promise<HistoryData> {
  return api<HistoryData>(`/api/thesis/${thesisId}/supervision-guides`)
}

export function addGuidePoint(
  thesisId: number,
  guideId: number,
  body: { title: string; description?: string; chapter_id?: number | null },
): Promise<PointData> {
  return api<PointData>(`/api/thesis/${thesisId}/supervision-guides/${guideId}/points`, {
    method: "POST",
    body,
  })
}

export function updateGuidePoint(
  thesisId: number,
  guideId: number,
  pointId: number,
  body: { status?: "pending" | "prepared"; title?: string; description?: string },
): Promise<PointData> {
  return api<PointData>(`/api/thesis/${thesisId}/supervision-guides/${guideId}/points/${pointId}`, {
    method: "PATCH",
    body,
  })
}

export function removeGuidePoint(thesisId: number, guideId: number, pointId: number): Promise<void> {
  return api<void>(`/api/thesis/${thesisId}/supervision-guides/${guideId}/points/${pointId}`, {
    method: "DELETE",
  })
}