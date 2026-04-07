"use client"

import { useState, useEffect } from "react"
import { SplashScreen } from "./splash-screen"

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false)

  useEffect(() => {
    // Only show splash if not already shown on this device
    const hasShownSplash = localStorage.getItem("tomskid_splash_shown")
    if (!hasShownSplash) {
      setShowSplash(true)
      localStorage.setItem("tomskid_splash_shown", "true")
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
