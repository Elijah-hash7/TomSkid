"use client"

import * as React from "react"
import { Headset, Send, User, X } from "lucide-react"
import { getBotResponse } from "@/lib/bot"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "bot"
  content: string
  timestamp: string
}

const HISTORY_TTL_MS = 10 * 60 * 1000
const formatTimestamp = () =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date())

const INITIAL_MESSAGE: Message = {
  role: "bot",
  content: "Hello! I'm your friendly bot assistant. How can I help you today?",
  timestamp: "14:23",
}

const ROWS = {
  numbers: ["1","2","3","4","5","6","7","8","9","0"],
  top:     ["Q","W","E","R","T","Y","U","I","O","P"],
  mid:     ["A","S","D","F","G","H","J","K","L"],
  bot:     ["Z","X","C","V","B","N","M"],
}

const PUNCT_ROWS = {
  top:  ["!","@","#","$","%","^","&","*","(",")"],
  mid:  ["-","_","=","+","[","]","{","}",";"],
  bot:  [",",".",'"',"'",":","/","?"],
}

const Key = React.memo(function Key({
  label,
  onPress,
  wide,
}: {
  label: React.ReactNode
  onPress: () => void
  wide?: boolean
}) {
  return (
    <button
      type="button"
      onPointerDown={(e) => {
        e.preventDefault()
        onPress()
      }}
      style={{ minWidth: 0 }}
      className={cn(
        "flex items-center justify-center rounded-[7px]",
        "border border-border/50 bg-muted/80 text-foreground",
        "h-[42px] text-[13px] font-semibold select-none",
        "shadow-[0_1px_0_rgba(0,0,0,0.15)]",
        "active:scale-95 active:bg-muted transition-transform duration-75",
        wide ? "flex-1" : "flex-1",
      )}
    >
      {label}
    </button>
  )
})

export function ChatDrawer() {
  const [open, setOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<Message[]>([INITIAL_MESSAGE])
  const inputRef = React.useRef("")
  const [inputDisplay, setInputDisplay] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const [keyboardOpen, setKeyboardOpen] = React.useState(true)
  const [page, setPage] = React.useState<"alpha" | "punct">("alpha")
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  React.useEffect(() => {
    if (!open) {
      setKeyboardOpen(true)
      setPage("alpha")
    }
  }, [open])

  // Lock body scroll when drawer open
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  React.useEffect(() => {
    if (messages.length <= 1 && !isTyping) return
    const timer = window.setTimeout(() => {
      setMessages([{ ...INITIAL_MESSAGE }])
      inputRef.current = ""
      setInputDisplay("")
      setIsTyping(false)
    }, HISTORY_TTL_MS)
    return () => window.clearTimeout(timer)
  }, [messages, isTyping])

  const handleSend = React.useCallback(() => {
    const val = inputRef.current.trim()
    if (!val) return
    const userMessage: Message = { role: "user", content: val, timestamp: formatTimestamp() }
    setMessages((prev) => [...prev, userMessage])
    inputRef.current = ""
    setInputDisplay("")
    setIsTyping(true)
    setTimeout(() => {
      const response = getBotResponse(val)
      const botMessage: Message = { role: "bot", content: response, timestamp: formatTimestamp() }
      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1000)
  }, [])

  const appendChar = React.useCallback((char: string) => {
    inputRef.current += char
    setInputDisplay(inputRef.current)
  }, [])

  const handleBackspace = React.useCallback(() => {
    inputRef.current = inputRef.current.slice(0, -1)
    setInputDisplay(inputRef.current)
  }, [])

  const activeRows = page === "alpha" ? ROWS : PUNCT_ROWS

  return (
    <>
      <style>{`
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
      {/* Trigger button — fixed to viewport always */}
      <button
        aria-label="Open chat assistant"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed z-[60] flex size-11 items-center justify-center rounded-full",
          "border border-primary/20 bg-background/95 text-primary",
          "shadow-lg backdrop-blur-md transition-all hover:scale-110 active:scale-95",
          "top-4 right-4"
        )}
      >
        <Headset className="size-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer — fixed to viewport, always centered */}
      <div
        onTouchStart={(e) => {
          const target = e.target as HTMLElement | null
          const tagName = target?.tagName
          if (tagName === "INPUT" || tagName === "TEXTAREA") {
            e.preventDefault()
          }
        }}
        className={cn(
          "fixed z-[80] left-1/2 -translate-x-1/2",
          "flex flex-col",
          "w-[calc(100vw-1.5rem)] max-w-[26rem]",
          "rounded-[2rem] border border-border/50 bg-background/98 p-0",
          "shadow-[0_28px_90px_rgba(15,23,42,0.22)] backdrop-blur-xl",
          "transition-all duration-300 ease-out",
          open
            ? "bottom-2 opacity-100 pointer-events-auto"
            : "bottom-[-110%] opacity-0 pointer-events-none"
        )}
        style={{ maxHeight: "78dvh" }}
      >
        {/* Header */}
        <div className="shrink-0 border-b border-border/50 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Headset className="size-4" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-foreground">Tomskid Assistant</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Online · Ask me anything
              </p>
            </div>
          </div>
          <button
            onPointerDown={(e) => { e.preventDefault(); setOpen(false) }}
            className="size-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="h-[28vh] overflow-y-auto overscroll-contain px-4 py-4 space-y-4"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex w-full gap-2.5",
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border",
                message.role === "user"
                  ? "bg-muted border-border"
                  : "bg-primary/10 border-primary/20 text-primary"
              )}>
                {message.role === "user"
                  ? <User className="size-3.5" />
                  : <Headset className="size-3.5" />}
              </div>
              <div className={cn(
                "max-w-[82%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed shadow-sm",
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-none"
                  : "bg-muted/50 border border-border/40 rounded-tl-none"
              )}>
                {message.content}
                <div className={cn(
                  "mt-1 text-[10px] opacity-50",
                  message.role === "user" ? "text-right" : "text-left"
                )}>
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-primary/10 border-primary/20 text-primary">
                <Headset className="size-3.5" />
              </div>
              <div className="bg-muted/50 border border-border/40 rounded-2xl rounded-tl-none px-3.5 py-2.5">
                <div className="flex gap-1">
                  <span className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input + Keyboard */}
        <div className="shrink-0 border-t border-border/50 bg-muted/20 px-3 pt-3 pb-4">

          {/* Input row */}
          <div className="flex items-center gap-2 mb-2.5">
            <div
              onPointerDown={(e) => { e.preventDefault(); setKeyboardOpen(true) }}
              className="flex-1 h-11 rounded-full border border-border/60 bg-background/90 px-4 flex items-center cursor-pointer select-none overflow-hidden"
            >
              <span className={cn("text-[14px]", !inputDisplay && "text-muted-foreground/60")}>
                {inputDisplay}
              </span>
              <span
                className="inline-block w-[1.5px] h-[16px] bg-primary ml-[1px] align-middle"
                style={{ animation: "blink 1s step-end infinite" }}
              />
            </div>
            <button
              onPointerDown={(e) => { e.preventDefault(); handleSend() }}
              disabled={!inputDisplay.trim() || isTyping}
              className="size-11 rounded-full shrink-0 bg-primary text-primary-foreground flex items-center justify-center shadow-md active:scale-90 transition-transform disabled:opacity-40"
            >
              <Send className="size-4" />
            </button>
          </div>

          {/* Hide/Show toggle */}
          <div className="flex justify-center mb-2">
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); setKeyboardOpen((p) => !p) }}
              className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 px-3.5 py-1.5 rounded-full border border-border/40 bg-background/60"
            >
              {keyboardOpen ? "Hide Keyboard" : "Show Keyboard"}
            </button>
          </div>

          {/* Keyboard */}
          {keyboardOpen && (
            <div className="w-full rounded-2xl border border-border/50 bg-background/80 px-2.5 pt-2.5 pb-3">
              <div className="space-y-1.5">

                {/* Numbers row */}
                <div className="flex gap-[2px]">
                  {ROWS.numbers.map((k) => (
                    <Key key={k} label={k} onPress={() => appendChar(k)} />
                  ))}
                </div>

                {/* Top row */}
                <div className="flex gap-[2px]">
                  {activeRows.top.map((k) => (
                    <Key key={k} label={k} onPress={() => appendChar(page === "alpha" ? k.toLowerCase() : k)} />
                  ))}
                </div>

                {/* Mid row */}
                <div className="flex gap-[2px]" style={{ paddingLeft: "4%", paddingRight: "4%" }}>
                  {activeRows.mid.map((k) => (
                    <Key key={k} label={k} onPress={() => appendChar(page === "alpha" ? k.toLowerCase() : k)} />
                  ))}
                </div>

                {/* Bot row */}
                <div className="flex gap-[2px]" style={{ paddingLeft: "13%", paddingRight: "13%" }}>
                  {activeRows.bot.map((k) => (
                    <Key key={k} label={k} onPress={() => appendChar(page === "alpha" ? k.toLowerCase() : k)} />
                  ))}
                </div>

                {/* Action row */}
                <div className="flex gap-[3px] pt-1">
                  <button
                    type="button"
                    onPointerDown={(e) => { e.preventDefault(); setPage((p) => p === "alpha" ? "punct" : "alpha") }}
                    className="w-[13%] h-[42px] flex items-center justify-center rounded-[7px] border border-border/50 bg-primary/10 text-primary text-[12px] font-bold active:scale-95 transition-transform duration-75 select-none"
                    style={{ minWidth: 0 }}
                  >
                    {page === "alpha" ? "!@#" : "ABC"}
                  </button>

                  <Key label="SPACE" onPress={() => appendChar(" ")} wide />

                  <button
                    type="button"
                    onPointerDown={(e) => { e.preventDefault(); handleBackspace() }}
                    className="w-[13%] h-[42px] flex items-center justify-center rounded-[7px] border border-border/50 bg-muted/80 active:scale-95 transition-transform duration-75 select-none"
                    style={{ minWidth: 0 }}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                      <line x1="18" y1="9" x2="12" y2="15"/>
                      <line x1="12" y1="9" x2="18" y2="15"/>
                    </svg>
                  </button>
                </div>

              </div>
            </div>
          )}

          <p className="text-[10px] text-center mt-2 text-muted-foreground/50 uppercase tracking-widest font-medium">
            Powered by Tomskid AI
          </p>
        </div>
      </div>
    </>
  )
}
