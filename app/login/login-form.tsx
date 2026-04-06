"use client"

import { useState } from "react"
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
import { signIn } from "@/app/actions/auth"
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react"

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
          Sign in
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </>
      )}
    </Button>
  )
}

export function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/profile"
  const err = searchParams.get("error")
  const message = searchParams.get("message")
  const [email, setEmail] = useState("")

  return (
    <Card className="border-border/50 bg-background/80 shadow-2xl backdrop-blur-xl">
      <CardHeader className="space-y-3 pb-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Lock className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription className="text-balance">
            Enter your credentials to access your account dashboard.
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
        <form action={signIn} className="space-y-5">
          <input type="hidden" name="next" value={next} />
          <div className="space-y-2.5">
            <Label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="name@example.com"
                className="h-12 rounded-xl border-border/50 bg-muted/30 pl-10 ring-offset-background placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="font-medium">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary hover:underline hover:underline-offset-4"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-12 rounded-xl border-border/50 bg-muted/30 pl-10 ring-offset-background placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-xl border-border/50 bg-muted/30 transition-all hover:bg-muted/50"
            onClick={() => {
              const { signInWithGoogle } = require("@/app/actions/auth");
              signInWithGoogle();
            }}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
          <SubmitButton />
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don&apos;t have an account? </span>
            <Link href="/signup" className="font-medium text-primary hover:underline hover:underline-offset-4">
              Sign up
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
