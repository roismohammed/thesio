import { useEffect, useState } from "react"

/**
 * Keeps a component mounted for a deferred duration after active becomes false,
 * allowing smooth exit/fade-out transitions.
 */
export function useDeferredUnmount(active: boolean, delayMs: number): boolean {
  const [mounted, setMounted] = useState(active)

  useEffect(() => {
    if (active) {
      setMounted(true)
      return
    }

    const timer = setTimeout(() => {
      setMounted(false)
    }, delayMs)

    return () => clearTimeout(timer)
  }, [active, delayMs])

  return mounted
}
