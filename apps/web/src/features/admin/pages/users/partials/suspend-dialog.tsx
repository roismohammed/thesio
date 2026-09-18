import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { api, ApiError } from "@/lib/api"
import type { AdminUser } from "../types"

export interface SuspendDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUser | null
  mode: "suspend" | "unsuspend"
  onSaved: () => void
}

export function SuspendDialog({
  open,
  onOpenChange,
  user,
  mode,
  onSaved,
}: SuspendDialogProps) {
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setReason("")
  }, [open, user, mode])

  if (!user) return null

  const isSuspend = mode === "suspend"
  const trimmedReason = reason.trim()
  const canSubmit = isSuspend ? trimmedReason.length > 0 && reason.length <= 500 : true

  async function handleSubmit() {
    if (!user) return
    setSubmitting(true)

    try {
      if (isSuspend) {
        await api(`/api/admin/users/${user.id}/suspend`, {
          method: "POST",
          body: { reason: trimmedReason },
        })
        toast.add({
          title: `Pengguna ${user.name} berhasil dinonaktifkan.`,
          type: "success",
        })
      } else {
        await api(`/api/admin/users/${user.id}/unsuspend`, {
          method: "POST",
        })
        toast.add({
          title: `Pengguna ${user.name} berhasil diaktifkan kembali.`,
          type: "success",
        })
      }
      onSaved()
    } catch (err) {
      toast.add({
        title: err instanceof ApiError ? err.message : "Terjadi kesalahan sistem.",
        type: "error",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isSuspend ? "Nonaktifkan Pengguna" : "Aktifkan Kembali Pengguna"}
          </DialogTitle>
          <DialogDescription>
            {isSuspend
              ? `Apakah Anda yakin ingin menonaktifkan akun ${user.name} (${user.email})? Sesi aktif pengguna akan diblokir.`
              : `Apakah Anda yakin ingin mengaktifkan kembali akun ${user.name} (${user.email})?`}
          </DialogDescription>
        </DialogHeader>

        {isSuspend ? (
          <div className="grid gap-2 py-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="suspend-reason">
                Alasan Penonaktifan <span className="text-destructive">*</span>
              </Label>
              <span className="text-xs text-muted-foreground">
                {reason.length}/500
              </span>
            </div>
            <Textarea
              id="suspend-reason"
              placeholder="Tuliskan alasan penonaktifan pengguna..."
              value={reason}
              maxLength={500}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
              rows={4}
            />
          </div>
        ) : null}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Batal
          </Button>
          <Button
            variant={isSuspend ? "destructive" : "default"}
            onClick={() => void handleSubmit()}
            disabled={!canSubmit || submitting}
          >
            {isSuspend ? "Nonaktifkan" : "Aktifkan Kembali"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
