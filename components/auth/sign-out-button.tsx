"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function SignOutButton({ label = "Log out" }: { label?: string }) {
  const router = useRouter()
  return (
    <Button
      type="button"
      variant="ghost"
      className="h-12 w-full items-center justify-center gap-2 rounded-2xl font-bold tracking-tight text-destructive/80 transition-all hover:bg-destructive/10 hover:text-destructive active:scale-[0.98]"
      onClick={async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/")
        router.refresh()
      }}
    >
      <LogOut className="size-4" />
      {label}
    </Button>

  )
}
