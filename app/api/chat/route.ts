import { getGeminiResponse } from "@/lib/gemini"
import { NextResponse } from "next/server"

// app/api/chat/route.ts
// ... (imports)

export async function POST(req: Request) {
  try {
    const { prompt, apiKey } = await req.json()
    console.log("1. Prompt diterima:", prompt) // Cek apakah prompt masuk

    if (!prompt) {
      return NextResponse.json({ error: "Prompt diperlukan" }, { status: 400 })
    }

    // Panggil fungsi gemini
    const responseText = await getGeminiResponse(prompt, apiKey)
    console.log("2. Respon Gemini:", responseText.substring(0, 50) + "...") // Cek respon

    return NextResponse.json({ response: responseText })
  } catch (error: any) {
    // Log error lengkap ke terminal server
    console.error("CRITICAL ERROR di Route:", error) 
    
    return NextResponse.json({ 
        error: error.message || "Terjadi kesalahan server internal" 
    }, { status: 500 })
  }
}