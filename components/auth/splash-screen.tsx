"use client"

import { useEffect, useState } from "react"

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<"idle" | "backdrop-in" | "content-in" | "exiting">("idle")

  useEffect(() => {
    const backdropTimer = setTimeout(() => {
      setPhase("backdrop-in")
    }, 60)

    const contentTimer = setTimeout(() => {
      setPhase("content-in")
    }, 320)

    const exitTimer = setTimeout(() => {
      setPhase("exiting")
    }, 2380)

    const finishTimer = setTimeout(() => {
      onFinish()
    }, 3140)

    return () => {
      clearTimeout(backdropTimer)
      clearTimeout(contentTimer)
      clearTimeout(exitTimer)
      clearTimeout(finishTimer)
    }
  }, [onFinish])

  return (
    <div className={`splash-container ${phase}`}>
      <style>{`
        @keyframes contentRise {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes badgeIn {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.78) rotate(-8deg);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(0deg);
          }
        }

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
          background:
            radial-gradient(circle at 50% 18%, rgba(255,255,255,0.2), transparent 32%),
            linear-gradient(180deg, #1b96ff 0%, #0a84ff 50%, #0362d3 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: var(--font-inter), sans-serif;
          overflow: hidden;
          pointer-events: none;
          opacity: 0;
          transform: scale(1.035);
          filter: saturate(0.95);
          transition:
            opacity 880ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 880ms cubic-bezier(0.22, 1, 0.36, 1),
            filter 880ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .splash-container::before {
          content: "";
          position: absolute;
          inset: -18%;
          background:
            radial-gradient(circle at 50% 12%, rgba(255,255,255,0.18), transparent 28%),
            radial-gradient(circle at 20% 85%, rgba(255,255,255,0.08), transparent 26%);
          opacity: 0;
          transform: scale(1.08);
          transition:
            opacity 900ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 900ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .splash-container::after {
          content: "";
          position: absolute;
          inset: auto 50% 12%;
          width: min(70vw, 320px);
          height: 90px;
          transform: translateX(-50%);
          border-radius: 999px;
          background: rgba(255,255,255,0.12);
          filter: blur(40px);
          opacity: 0;
          transition: opacity 900ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .splash-container.backdrop-in,
        .splash-container.content-in {
          opacity: 1;
          transform: scale(1);
          filter: saturate(1);
        }

        .splash-container.backdrop-in::before,
        .splash-container.content-in::before {
          opacity: 0.9;
          transform: scale(1);
        }

        .splash-container.backdrop-in::after,
        .splash-container.content-in::after {
          opacity: 1;
        }

        .splash-container.exiting {
          opacity: 0;
          transform: scale(1.02);
          filter: blur(10px) saturate(0.95);
        }

        .splash-container.exiting::before {
          opacity: 0.22;
          transform: scale(1.03);
        }

        .splash-container.exiting::after {
          opacity: 0;
        }

        .splash-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 0 24px;
          transform: translateY(24px) scale(0.965);
          opacity: 0;
        }

        .splash-container.content-in .splash-content {
          animation: contentRise 720ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .splash-container.exiting .splash-content {
          opacity: 0;
          transform: translateY(-10px) scale(0.985);
          transition:
            opacity 420ms cubic-bezier(0.4, 0, 1, 1),
            transform 420ms cubic-bezier(0.4, 0, 1, 1);
        }

        .splash-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .splash-icon {
          animation: none;
        }

        .splash-container.content-in .splash-icon {
          animation: badgeIn 700ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        .dot1 { animation: dotPulse 1.4s ease-in-out infinite 0s; }
        .dot2 { animation: dotPulse 1.4s ease-in-out infinite 0.2s; }
        .dot3 { animation: dotPulse 1.4s ease-in-out infinite 0.4s; }

        .icon-wrap {
          width: 92px;
          height: 92px;
          background: linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0.08));
          border-radius: 28px;
          border: 1.5px solid rgba(255,255,255,0.24);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 28px;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.22),
            0 18px 45px rgba(3, 56, 126, 0.18);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .initials {
          font-family: 'Clash Display', sans-serif;
          font-size: 38px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.04em;
          line-height: 1;
          text-shadow: 0 6px 20px rgba(255,255,255,0.14);
        }

        .title {
          font-family: 'Clash Display', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.02em;
          margin: 0 0 18px;
          text-align: center;
        }

        .title-wordmark {
          display: inline-block;
          letter-spacing: 0.03em;
        }

        .title-accent {
          display: inline-block;
          font-family: var(--font-inter), sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: none;
          color: rgba(255,255,255,0.62);
          margin-left: 5px;
          position: relative;
          top: -2px;
        }

        .dots-row {
          display: flex;
          gap: 9px;
          align-items: center;
        }

        .dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.92);
          box-shadow: 0 0 14px rgba(255,255,255,0.22);
        }
      `}</style>

      <div className="splash-content">
        <div className="splash-brand">
          <div className="splash-icon icon-wrap">
            <span className="initials">TE</span>
          </div>

          <h1 className="splash-title title">
            <span className="title-wordmark">TOMSKID</span>{" "}
            <span className="title-accent">eSIM</span>
          </h1>

          <div className="splash-dots dots-row">
            <span className="dot1 dot" />
            <span className="dot2 dot" />
            <span className="dot3 dot" />
          </div>
        </div>
      </div>
    </div>
  )
}
