"use client"

import { useEffect, useState } from "react"

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<"entering" | "entered" | "exiting">("entering")

  useEffect(() => {
    const enterTimer = setTimeout(() => {
      setPhase("entered")
    }, 60)

    const exitTimer = setTimeout(() => {
      setPhase("exiting")
    }, 2100)

    const finishTimer = setTimeout(() => {
      onFinish()
    }, 2850)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(exitTimer)
      clearTimeout(finishTimer)
    }
  }, [onFinish])

  return (
    <div className={`splash-container ${phase}`}>
      <style>{`
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.75); }
          50%       { opacity: 1;   transform: scale(1); }
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
          pointer-events: none;
          opacity: 0;
          transform: scale(1.02);
          transition:
            opacity 720ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 720ms cubic-bezier(0.22, 1, 0.36, 1),
            filter 720ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .splash-container::before {
          content: "";
          position: absolute;
          inset: -15%;
          background: radial-gradient(circle at top, rgba(255,255,255,0.18), transparent 40%);
          opacity: 0.8;
          transition: opacity 720ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .splash-container.entered,
        .splash-container.entering {
          opacity: 1;
          transform: scale(1);
          filter: blur(0px);
        }

        .splash-container.exiting {
          opacity: 0;
          transform: scale(1.015);
          filter: blur(10px);
        }

        .splash-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transform: translateY(18px) scale(0.98);
          opacity: 0;
          transition:
            opacity 680ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 680ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .splash-container.entered .splash-content,
        .splash-container.entering .splash-content {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .splash-container.exiting .splash-content {
          opacity: 0;
          transform: translateY(-10px) scale(0.985);
        }

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
  text-transform: none;
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

      <div className="splash-content">
        <div className="splash-icon icon-wrap">
          <span className="initials">TE</span>
        </div>

        <h1 className="splash-title title">
          TOMSKID <span className="title-accent">eSIM</span>
        </h1>

        <div className="splash-dots dots-row">
          <span className="dot1 dot" />
          <span className="dot2 dot" />
          <span className="dot3 dot" />
        </div>
      </div>
    </div>
  )
}
