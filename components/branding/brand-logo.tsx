import type { CSSProperties } from "react"
import { Syne } from "next/font/google"

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
})

type BrandLogoProps = {
  layout?: "column" | "row"
  scale?: number
  className?: string
  iconSize?: number
  iconWidth?: number
  iconHeight?: number
  titleSize?: number
  gap?: number
}

const styles: Record<string, CSSProperties> = {
  root: {
    display: "inline-flex",
    color: "#ffffff",
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
  },
  initials: {
    fontFamily: syne.style.fontFamily,
    fontSize: 36,
    fontWeight: 800,
    color: "#ffffff",
    letterSpacing: "-0.03em",
    lineHeight: 1,
  },
  title: {
    fontFamily: syne.style.fontFamily,
    fontSize: 24,
    fontWeight: 800,
    color: "#ffffff",
    letterSpacing: "-0.02em",
    margin: 0,
    lineHeight: 1,
  },
  titleAccent: {
    color: "rgba(255,255,255,0.6)",
  },
}

export function BrandLogo({
  layout = "column",
  scale = 1,
  className,
  iconSize = 90,
  iconWidth,
  iconHeight,
  titleSize = 24,
  gap,
}: BrandLogoProps) {
  const isColumn = layout === "column"
  const resolvedGap = gap ?? (isColumn ? 28 : 18)
  const resolvedIconWidth = iconWidth ?? iconSize
  const resolvedIconHeight = iconHeight ?? iconSize
  const iconRadius = Math.round(Math.min(resolvedIconWidth, resolvedIconHeight) * 0.311)
  const initialsSize = Math.min(resolvedIconWidth, resolvedIconHeight) * 0.4
  const accentSize = titleSize * 0.625

  return (
    <div
      className={`${syne.className}${className ? ` ${className}` : ""}`}
      style={{
        ...styles.root,
        flexDirection: isColumn ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
        gap: resolvedGap,
        transform: `scale(${scale})`,
        transformOrigin: isColumn ? "center center" : "left center",
      }}
    >
      <div
        style={{
          ...styles.iconWrap,
          width: resolvedIconWidth,
          height: resolvedIconHeight,
          borderRadius: iconRadius,
        }}
      >
        <span
          style={{
            ...styles.initials,
            fontSize: initialsSize,
          }}
        >
          Te
        </span>
      </div>

      <h1
        style={{
          ...styles.title,
          fontSize: titleSize,
          textAlign: isColumn ? "center" : "left",
          whiteSpace: "nowrap",
        }}
      >
        TOMSKID{" "}
        <span
          style={{
            ...styles.titleAccent,
            fontSize: accentSize,
            fontWeight: 800,
          }}
        >
          eSIM
        </span>
      </h1>
    </div>
  )
}
