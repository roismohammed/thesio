export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") {
    return undefined
  }

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`))

  const value = match?.split("=")[1]
  if (!value) {
    return undefined
  }

  // Sanctum sets XSRF-TOKEN URL-encoded (e.g. trailing %3D). The header must
  // carry the decoded value, otherwise Laravel sees a mismatched token.
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}