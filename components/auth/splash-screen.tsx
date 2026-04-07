"use client"

import { useEffect, useState } from "react"

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Show splash for 2 seconds then start exit animation
    const timer = setTimeout(() => {
      setIsExiting(true)
    }, 2000)

    // After fade out (500ms), finish
    const exitTimer = setTimeout(() => {
      if (onFinish) onFinish()
    }, 2500)

    return () => {
      clearTimeout(timer)
      clearTimeout(exitTimer)
    }
  }, [onFinish])

  return (
    <div className={`splash-container ${isExiting ? "exit" : ""}`}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes spinIn {
          from { opacity: 0; transform: scale(0.5) rotate(-15deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }

        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.75); }
          50%       { opacity: 1;   transform: scale(1); }
        }

        @keyframes fadeOut {
          from { opacity: 1; }
          to   { opacity: 0; visibility: hidden; }
        }

        .splash-container {
          position: fixed;
          inset: 0;
          z-index: 9999;
          width: 100%;
          height: 100dvh;
          background: #0A84FF;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: var(--font-inter), sans-serif;
          overflow: hidden;
          transition: opacity 0.5s ease-in-out;
        }

        .splash-container.exit {
          animation: fadeOut 0.5s ease-in-out forwards;
        }

        .splash-icon  { animation: spinIn 0.7s cubic-bezier(0.34,1.56,0.64,1) both 0.1s; }
        .splash-title { animation: fadeUp 0.7s ease both 0.35s; }
        .splash-dots  { animation: fadeUp 0.7s ease both 0.55s; }

        .dot1 { animation: dotPulse 1.4s ease-in-out infinite 0s; }
        .dot2 { animation: dotPulse 1.4s ease-in-out infinite 0.2s; }
        .dot3 { animation: dotPulse 1.4s ease-in-out infinite 0.4s; }

        .icon-wrap {
          width: 80px;
          height: 62px;
          background: rgba(255,255,255,0.12);
          border-radius: 20px;
          border: 1.5px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

.initials {
  font-family: 'Clash Display', sans-serif;
  font-size: 29px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.02em;
  padding-left: 0.02em;
  line-height: 1;
}

.title {
  font-family: 'Clash Display', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.06em;
  margin-bottom: 32px;
  text-align: center;
  text-transform: uppercase;
}

.title-accent {
  display: inline-block;
  font-family: var(--font-inter), sans-serif;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255,255,255,0.5);
  margin-left: 2px;
  position: relative;
  top: -2px;
}

        .dots-row {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.85);
        }
      `}</style>

      {/* TE initials badge */}
      <div className="splash-icon icon-wrap">
        <span className="initials">TE</span>
      </div>

      {/* Brand name */}
      <h1 className="splash-title title">
        TOMSKID <span className="title-accent">eSIM</span>
      </h1>

      {/* Loading dots */}
      <div className="splash-dots dots-row">
        <span className="dot1 dot" />
        <span className="dot2 dot" />
        <span className="dot3 dot" />
      </div>
    </div>
  )
}
