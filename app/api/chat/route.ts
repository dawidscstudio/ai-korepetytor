import { GoogleGenerativeAI } from "@google/generative-ai"; // Zamiast OpenAI

// Podpinamy Twój nowy darmowy klucz
const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject, level, topic } = body;

    // Wybieramy darmowy, bardzo szybki model Gemini
    const model = client.getGenerativeModel({ model: "gemini-2.5-flash"});

    // Złączyliśmy Twoje instrukcje w jedną wiadomość (Gemini woli to w ten sposób)
    const prompt = `Jesteś bardzo przyjaznym nauczycielem-korepetytorem.
Twoje zadanie:
- tłumacz prosto
- krok po kroku
- jak człowiek
- podawaj przykłady
- zadawaj uczniowi pytania
- WAŻNE: równania i ułamki zapisuj zwykłym tekstem na klawiaturze (np. 1/4 lub 3/4), bez używania formatowania matematycznego LaTeX (bez znaków $$ i \\frac).

Przedmiot: ${subject}
Poziom: ${level}
Temat lekcji: ${topic}

Rozpocznij lekcję 👇`;

    // Czekamy na odpowiedź od AI
    const result = await model.generateContent(prompt);

    // Zwracamy odpowiedź DOKŁADNIE tak samo jak wcześniej
    return Response.json({
      message: result.response.text(), 
    });

  } catch (error: any) {
    // Stare, dobre wyświetlanie błędów zostaje!
    return Response.json({
      message: `PRAWDZIWY BŁĄD: ${error.message || "Nieznany błąd"}`,
    });
  }
}