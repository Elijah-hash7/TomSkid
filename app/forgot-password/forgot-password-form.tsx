"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requestPasswordReset } from "@/app/actions/auth"
import { Loader2, Mail, ArrowRight, ArrowLeft } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="group h-12 w-full rounded-xl bg-primary font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-[0.98]"
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <>
          Send reset link
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </>
      )}
    </Button>
  )
}

export function ForgotPasswordForm() {
  const searchParams = useSearchParams()
  const err = searchParams.get("error")
  const message = searchParams.get("message")

  return (
    <Card className="border-border/50 bg-background/80 shadow-2xl backdrop-blur-xl">
      <CardHeader className="space-y-3 pb-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Mail className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Forgot password?
          </CardTitle>
          <CardDescription className="text-balance">
            No worries, we&apos;ll send you reset instructions.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {err && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-center text-sm font-medium text-destructive">
            {err}
          </div>
        )}
        {message && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-center text-sm font-medium text-primary">
            {message}
          </div>
        )}
        
        {!message ? (
          <form action={requestPasswordReset} className="space-y-5">
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-medium leading-none">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                  className="h-12 rounded-xl border-border/50 bg-muted/30 pl-10 ring-offset-background placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
            
            <SubmitButton />
            
            <div className="text-center text-sm">
              <Link href="/login" className="inline-flex items-center font-medium text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </div>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <p className="text-sm text-muted-foreground">
              We&apos;ve sent a password reset link to your email. Please check your inbox and follow the instructions.
            </p>
            <Button asChild variant="outline" className="h-12 w-full rounded-xl">
              <Link href="/login">Return to login</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
