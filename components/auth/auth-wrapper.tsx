"use client"

import { useState, useEffect } from "react"
import { SplashScreen } from "./splash-screen"

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    setShowSplash(true)
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
