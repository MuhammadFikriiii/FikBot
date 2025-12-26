"use client"

import { useState, useEffect, useRef } from "react"
import { Send, RotateCcw, Key, Bot, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ApiKeyModal } from "@/components/api-key-modal"
import { useToast } from "@/hooks/use-toast"

interface Message {
  role: "user" | "ai"
  content: string
}

export default function ChatPage() {
  // ... existing state ...
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [lastRequestTime, setLastRequestTime] = useState<number>(0)

  const { toast } = useToast()
  const scrollRef = useRef<HTMLDivElement>(null)

  // ... existing effects ...
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key")
    if (savedKey) setApiKey(savedKey)
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    }
  }, [messages, isLoading])

  const handleResetChat = () => {
    setMessages([])
    toast({
      title: "Chat Reset",
      description: "Percakapan telah dihapus.",
    })
  }

  const handleSaveKey = (key: string) => {
    localStorage.setItem("gemini_api_key", key)
    setApiKey(key)
    setShowKeyModal(false)
    toast({
      title: "API Key Tersimpan",
      description: "Anda sekarang dapat menggunakan API Key Anda sendiri.",
    })
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const now = Date.now()
    if (now - lastRequestTime < 2000) {
      toast({
        title: "Terlalu Cepat",
        description: "Harap tunggu sebentar.",
        variant: "destructive",
      })
      return
    }

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setLastRequestTime(now)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, apiKey: apiKey }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error?.includes("API Key") || response.status === 401) {
          setShowKeyModal(true)
        }
        throw new Error(data.error || "Gagal mendapatkan respon AI")
      }

      setMessages((prev) => [...prev, { role: "ai", content: data.response }])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex flex-col h-screen bg-background text-foreground selection:bg-primary/20">
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-foreground text-background">
            <Sparkles size={18} fill="currentColor" />
          </div>
          <h1 className="text-[15px] font-semibold tracking-tight">FikriBot</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowKeyModal(true)}
            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <Key size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleResetChat}
            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <RotateCcw size={18} />
          </Button>
        </div>
      </header>

      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="max-w-3xl mx-auto px-5 py-8 space-y-8">
          {messages.length === 0 && !isLoading ? (
            <div className="h-[65vh] flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-14 h-14 bg-muted/50 rounded-2xl flex items-center justify-center animate-in zoom-in duration-500">
                <Bot size={28} className="text-muted-foreground/60" />
              </div>
              <h2 className="text-3xl font-medium tracking-tight text-pretty max-w-md mx-auto">
                Halo! Apa yang bisa saya bantu buat kamu hari ini?
              </h2>
            </div>
          ) : (
            <div className="space-y-10 pb-10">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-5 group animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-muted border border-border/50 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <Bot size={16} />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] text-[15.5px] leading-relaxed transition-all ${
                      msg.role === "user"
                        ? "bg-muted/80 px-4 py-2.5 rounded-[22px] text-foreground font-medium"
                        : "text-foreground/90 whitespace-pre-wrap py-1.5"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-5 animate-in fade-in duration-500">
                  <div className="w-8 h-8 rounded-full bg-muted border border-border/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={16} className="animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground font-medium text-[15px] py-1.5">
                    <Loader2 className="animate-spin" size={15} />
                    <span className="animate-pulse">Berpikir...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      <footer className="w-full max-w-3xl mx-auto p-4 pb-8 sm:p-6 sm:pb-10">
        <div className="relative flex items-end gap-2 p-1.5 bg-card/60 border border-border/60 rounded-[30px] shadow-sm focus-within:border-foreground/20 focus-within:bg-card/80 transition-all duration-300">
          <textarea
            className="flex-1 bg-transparent border-none outline-none resize-none py-3.5 px-4.5 min-h-[52px] max-h-60 text-[15.5px] leading-relaxed placeholder:text-muted-foreground/50"
            placeholder="Tulis pesan..."
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              e.target.style.height = "auto"
              e.target.style.height = `${e.target.scrollHeight}px`
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <Button
            className={`h-10 w-10 p-0 rounded-full transition-all duration-300 shrink-0 mb-0.5 mr-0.5 ${
              input.trim()
                ? "bg-foreground text-background hover:scale-105 active:scale-95"
                : "bg-muted/50 text-muted-foreground opacity-40"
            }`}
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
          >
            <Send size={18} strokeWidth={2.5} />
          </Button>
        </div>
        <p className="text-[11px] text-center text-muted-foreground/40 mt-4 tracking-tight">
          Powered by Gemini 1.5 Flash • FikriBot
        </p>
      </footer>

      {showKeyModal && (<ApiKeyModal 
        onSave={handleSaveKey} 
        onClose={() => setShowKeyModal(false)}/>)}
    </main>
  )
}
