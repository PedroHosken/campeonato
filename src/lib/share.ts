import { useEffect, useState } from 'react'

export function openWhatsApp(text: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/** Mensagem curta de confirmação que some sozinha. */
export function useFlash(duration = 2200) {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!message) return
    const id = window.setTimeout(() => setMessage(null), duration)
    return () => window.clearTimeout(id)
  }, [message, duration])

  return [message, setMessage] as const
}
