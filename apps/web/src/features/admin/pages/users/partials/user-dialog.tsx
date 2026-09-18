import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { api, ApiError } from "@/lib/api"
import type { AdminUser } from "../types"

export interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUser | null
  roles: string[]
  onSaved: () => void
}

export function UserDialog({ open, onOpenChange, user, roles, onSaved }: UserDialogProps) {
  const { t } = useTranslation()
  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user?.roles ?? [])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setName(user?.name ?? "")
    setEmail(user?.email ?? "")
    setPassword("")
    setPasswordConfirmation("")
    setSelectedRoles(user?.roles ?? [])
  }, [user, open])

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const body: Record<string, unknown> = {
        name,
        email,
        roles: selectedRoles,
      }
      if (password) {
        body.password = password
        body.password_confirmation = passwordConfirmation
      }
      await api(`/api/admin/users/${user?.id ?? ""}`, {
        method: user ? "PATCH" : "POST",
        body,
      })
      toast.add({ title: t("admin.users.toast.saved"), type: "success" })
      onSaved()
    } catch (err) {
      toast.add({ title: err instanceof ApiError ? err.message : t("admin.common.error"), type: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {user ? t("admin.users.editTitle") : t("admin.users.createTitle")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="user-name">{t("admin.users.name")}</Label>
            <Input id="user-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="user-email">{t("admin.users.email")}</Label>
            <Input id="user-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="user-password">
              {user ? t("admin.users.newPassword") : t("admin.users.password")}
            </Label>
            <Input
              id="user-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {password ? (
            <div className="grid gap-2">
              <Label htmlFor="user-password-confirm">{t("admin.users.passwordConfirm")}</Label>
              <Input
                id="user-password-confirm"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
              />
            </div>
          ) : null}
          <div className="grid gap-2">
            <Label>{t("admin.users.roles")}</Label>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <label key={role} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={(e) => {
                      setSelectedRoles((prev) =>
                        e.target.checked ? [...prev, role] : prev.filter((r) => r !== role),
                      )
                    }}
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("admin.common.cancel")}
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={submitting}>
            {t("admin.common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
