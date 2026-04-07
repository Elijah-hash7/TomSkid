"use client"

import * as React from "react"
import { MessageCircleMore, Send, User, Bot, X } from "lucide-react"
import { getBotResponse } from "@/lib/bot"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "bot"
  content: string
  timestamp: Date
}

export function ChatDrawer() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "bot",
      content: "Hello! I'm your friendly bot assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate bot thinking
    setTimeout(() => {
      const response = getBotResponse(input)
      const botMessage: Message = {
        role: "bot",
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1000)
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          aria-label="Open chat assistant"
          className="fixed right-4 top-4 z-50 flex size-11 items-center justify-center rounded-full border border-primary/20 bg-background/95 text-primary shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:shadow-primary/20 active:scale-95"
        >
          <MessageCircleMore className="size-5" />
          <span className="absolute -right-1 -top-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary text-[8px] font-bold text-white items-center justify-center">1</span>
          </span>
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[80dvh] p-0 sm:max-w-none rounded-t-[2rem] border-t border-border/50 bg-background/95 backdrop-blur-xl"
      >
        <SheetHeader className="border-b border-border/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="size-5" />
            </div>
            <div>
              <SheetTitle className="text-left font-bold tracking-tight">Tomskid Assistant</SheetTitle>
              <p className="text-left text-xs text-muted-foreground flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online · Ask me anything
              </p>
            </div>
          </div>
        </SheetHeader>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex w-full gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border",
                message.role === "user" 
                  ? "bg-muted border-border" 
                  : "bg-primary/10 border-primary/20 text-primary"
              )}>
                {message.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
              </div>
              <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-none"
                  : "bg-muted/50 border border-border/40 rounded-tl-none"
              )}>
                {message.content}
                <div className={cn(
                  "mt-1 text-[10px] opacity-50",
                  message.role === "user" ? "text-right" : "text-left"
                )}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3 animate-in fade-in duration-300">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-primary/10 border-primary/20 text-primary">
                <Bot className="size-4" />
              </div>
              <div className="bg-muted/50 border border-border/40 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm">
                <div className="flex gap-1">
                  <span className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border/50 bg-muted/30">
          <div className="max-w-2xl mx-auto flex gap-2 items-center">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 rounded-full border-border/60 bg-background/80 backdrop-blur-sm focus-visible:ring-primary/30"
            />
            <Button 
              size="icon" 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="rounded-full shrink-0 shadow-md shadow-primary/20 transition-transform active:scale-90"
            >
              <Send className="size-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
          <p className="text-[10px] text-center mt-3 text-muted-foreground/60 uppercase tracking-widest font-medium">
            Powered by Tomskid AI
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
