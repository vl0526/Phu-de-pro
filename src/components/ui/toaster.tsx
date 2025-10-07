"use client"

import { useToast } from "@/hooks/use-toast"
import {
  ToastProvider,
  ToastViewport,
  ToasterToast
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map((toast) => (
        <ToasterToast key={toast.id} toast={toast} />
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
