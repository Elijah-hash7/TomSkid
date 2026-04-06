"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react"

type ToastTone = "success" | "error" | "info"

type ToastItem = {
  id: number
  title: string
  description?: string
  tone: ToastTone
}

type ToastInput = {
  title: string
  description?: string
  tone?: ToastTone
}

type ToastContextValue = {
  toast: (input: ToastInput) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(
    ({ title, description, tone = "info" }: ToastInput) => {
      const id = nextId.current++
      setToasts((current) => [...current, { id, title, description, tone }])
      window.setTimeout(() => dismiss(id), 3200)
    },
    [dismiss]
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex flex-col items-center gap-3 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem
  onDismiss: (id: number) => void
}) {
  const styles = {
    success: {
      icon: CheckCircle2,
      card: "border-emerald-200/80 bg-white/95 text-emerald-950 shadow-[0_18px_45px_rgba(16,185,129,0.18)]",
      iconWrap: "bg-emerald-100 text-emerald-700",
    },
    error: {
      icon: CircleAlert,
      card: "border-red-200/80 bg-white/95 text-red-950 shadow-[0_18px_45px_rgba(239,68,68,0.16)]",
      iconWrap: "bg-red-100 text-red-700",
    },
    info: {
      icon: Info,
      card: "border-slate-200/80 bg-white/95 text-slate-950 shadow-[0_18px_45px_rgba(15,23,42,0.14)]",
      iconWrap: "bg-blue-100 text-blue-700",
    },
  }[toast.tone]

  const Icon = styles.icon

  return (
    <div
      className={`pointer-events-auto w-full max-w-sm rounded-2xl border px-4 py-3 backdrop-blur-xl sm:min-w-80 ${styles.card}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl ${styles.iconWrap}`}>
          <Icon className="size-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-5">{toast.title}</p>
          {toast.description ? (
            <p className="mt-1 text-sm leading-5 text-slate-600">{toast.description}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="rounded-full p-1 text-slate-400 transition-colors hover:bg-black/5 hover:text-slate-700"
          aria-label="Dismiss notification"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
