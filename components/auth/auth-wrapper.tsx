"use client"

import { useState, useEffect } from "react"
import { SplashScreen } from "./splash-screen"

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false)

  useEffect(() => {
    // Only show splash if not already shown in this session
    const hasShownSplash = sessionStorage.getItem("tomskid_splash_shown")
    if (!hasShownSplash) {
      setShowSplash(true)
      sessionStorage.setItem("tomskid_splash_shown", "true")
    }
  }, [])

  const handleSplashFinish = () => {
    setShowSplash(false)
  }

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      {children}
    </>
  )
}
