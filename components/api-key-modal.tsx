"use client";

import { useState } from "react"
import { X } from "lucide-react" // Import icon X
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ApiKeyModalProps {
  onSave: (key: string) => void
  onClose: () => void // Tambahkan prop ini untuk handle tutup modal
}

export function ApiKeyModal({ onSave, onClose }: ApiKeyModalProps) {
  const [key, setKey] = useState("")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Tambahkan relative agar tombol X bisa diposisikan absolute terhadap Card */}
      <Card className="w-full max-w-md bg-card border-border relative">
        
        {/* Tombol Close (X) */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <CardHeader>
          <CardTitle className="text-xl font-bold pr-8">Masukkan Gemini API Key</CardTitle>
          <p className="text-sm text-muted-foreground">
            API Key di server tidak ditemukan atau limit. Silakan masukkan milik Anda sendiri untuk melanjutkan.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="AIzaSy..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="bg-background border-border"
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Batal
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => onSave(key)}
              disabled={!key}
            >
              Simpan
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">API Key disimpan secara lokal di browser Anda.</p>
        </CardContent>
      </Card>
    </div>
  )
}