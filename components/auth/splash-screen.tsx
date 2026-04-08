"use client"

import { useEffect, useState, type CSSProperties } from "react"

type SplashScreenProps = {
  onFinish: () => void
}

const styles: Record<string, CSSProperties> = {
  container: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    width: "100%",
    height: "100dvh",
    minHeight: "100vh",
    background: "#0A84FF",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif",
    overflow: "hidden",
  },

  iconWrap: {
    width: 90,
    height: 90,
    background: "rgba(255,255,255,0.15)",
    borderRadius: 28,
    border: "1.5px solid rgba(255,255,255,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },

  initials: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 36,
    fontWeight: 800,
    color: "#ffffff",
    letterSpacing: "-0.03em",
    lineHeight: 1,
  },

  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 24,
    fontWeight: 800,
    color: "#ffffff",
    letterSpacing: "-0.02em",
    marginBottom: 12,
    textAlign: "center",
  },

  titleAccent: {
    color: "rgba(255,255,255,0.6)",
  },

  tagline: {
    fontSize: 13,
    color: "#ffffff",
    letterSpacing: "-0.01em",
    marginBottom: 6,
    textAlign: "center",
  },

  subTagline: {
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
    letterSpacing: "0.04em",
    marginBottom: 52,
    textAlign: "center",
  },

  dotsRow: {
    display: "flex",
    gap: 9,
    alignItems: "center",
  },

  dot: {
    display: "inline-block",
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.9)",
  },
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [visible, setVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true)
    }, 2900)

    const timer = setTimeout(() => {
      setVisible(false)
      onFinish()
    }, 3500)

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(timer)
    }
  }, [onFinish])

  if (!visible) return null

  return (
    <div className={`splash-screen ${isExiting ? "is-exiting" : ""}`} style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400&display=swap');

        @keyframes splashReveal {
          from {
            opacity: 0;
            transform: scale(1.035);
            filter: saturate(0.92);
          }
          to {
            opacity: 1;
            transform: scale(1);
            filter: saturate(1);
          }
        }

        @keyframes splashGlow {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes contentFloatIn {
          0% {
            opacity: 0;
            transform: translateY(28px) scale(0.94);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes badgeIn {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.72) rotate(-10deg);
          }
          65% {
            transform: translateY(-2px) scale(1.04) rotate(1deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(0deg);
          }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes dotPulse {
          0%, 100% { opacity: 0.35; transform: scale(0.72); }
          50% { opacity: 1; transform: scale(1); }
        }

        @keyframes shimmerSweep {
          0% {
            opacity: 0;
            transform: translateX(-140%) rotate(14deg);
          }
          30% {
            opacity: 0.55;
          }
          100% {
            opacity: 0;
            transform: translateX(180%) rotate(14deg);
          }
        }

        @keyframes splashExit {
          from {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
          to {
            opacity: 0;
            transform: scale(1.025);
            filter: blur(10px);
          }
        }

        @keyframes contentExit {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(-14px) scale(0.985);
          }
        }

        .splash-screen::before,
        .splash-screen::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .splash-screen {
          animation: splashReveal 820ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .splash-screen::before {
          inset: -16%;
          background:
            radial-gradient(circle at 50% 24%, rgba(255,255,255,0.2), transparent 28%),
            radial-gradient(circle at 50% 72%, rgba(255,255,255,0.08), transparent 34%);
          animation: splashGlow 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .splash-screen::after {
          inset: 22% auto auto 50%;
          width: min(62vw, 240px);
          height: 220px;
          transform: translateX(-50%);
          background: radial-gradient(circle, rgba(255,255,255,0.14), transparent 68%);
          filter: blur(28px);
          opacity: 0.8;
        }

        .splash-screen.is-exiting {
          animation: splashExit 520ms cubic-bezier(0.4, 0, 1, 1) both;
        }

        .splash-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          animation: contentFloatIn 820ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .splash-screen.is-exiting .splash-content {
          animation: contentExit 420ms cubic-bezier(0.4, 0, 1, 1) both;
        }

        .splash-icon {
          position: relative;
          animation: badgeIn 820ms cubic-bezier(0.34, 1.56, 0.64, 1) both 0.08s;
          box-shadow: 0 16px 38px rgba(9, 53, 122, 0.16);
        }

        .splash-icon::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(105deg, transparent 24%, rgba(255,255,255,0.42) 48%, transparent 72%);
          opacity: 0;
          animation: shimmerSweep 1.4s ease-out both 0.5s;
        }

        .splash-title { animation: fadeUp 720ms ease both 0.34s; }
        .splash-dots { animation: fadeUp 720ms ease both 0.58s; }

        .dot1 { animation: dotPulse 1.4s ease-in-out infinite 0s; }
        .dot2 { animation: dotPulse 1.4s ease-in-out infinite 0.2s; }
        .dot3 { animation: dotPulse 1.4s ease-in-out infinite 0.4s; }
      `}</style>

      <div className="splash-content">
        <div className="splash-icon" style={styles.iconWrap}>
          <span style={styles.initials}>Te</span>
        </div>

        <h1 className="splash-title" style={styles.title}>
          TOMSKID <span style={styles.titleAccent}>eSIM</span>
        </h1>

        <div className="splash-dots" style={styles.dotsRow}>
          <span className="dot1" style={styles.dot} />
          <span className="dot2" style={styles.dot} />
          <span className="dot3" style={styles.dot} />
        </div>
      </div>
    </div>
  )
}
