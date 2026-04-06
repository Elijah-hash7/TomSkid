"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BackButton({ label = "Back" }: { label?: string }) {
  const router = useRouter()

  return (
    <Button
      type="button"
      variant="ghost"
      className="h-auto p-0 text-sm text-muted-foreground hover:bg-transparent hover:text-foreground"
      onClick={() => router.back()}
    >
      <ChevronLeft className="size-4" />
      {label}
    </Button>
  )
}
