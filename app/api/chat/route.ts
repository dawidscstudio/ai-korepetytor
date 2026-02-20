import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject, level, topic, history, message } = body;

    // Definiujemy model i jego "osobowość" (dzięki temu nigdy nie zapomni kim jest)
    const model = client.getGenerativeModel({ 
        model: "gemini-2.5-flash-lite",
        systemInstruction: `Jesteś bardzo przyjaznym nauczycielem-korepetytorem. 
Tłumacz prosto, krok po kroku. Używaj przykładów i zadawaj uczniowi pytania, żeby sprawdzić jego wiedzę.
WAŻNE: równania i ułamki zapisuj zwykłym tekstem (np. 1/4).
Uczysz przedmiotu: ${subject}, poziom ucznia to: ${level}.`
    });

    // Uruchamiamy czat i ładujemy historię wiadomości, którą wysyła strona
    const chat = model.startChat({
        history: history.map((msg: any) => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }))
    });

    // Wysyłamy do AI to, co wpisałeś i czekamy na odpowiedź
    const result = await chat.sendMessage(message);

    return NextResponse.json({
      message: result.response.text(), 
    });

  } catch (error: any) {
    return NextResponse.json({ message: `BŁĄD: ${error.message}` }, { status: 500 });
  }
}