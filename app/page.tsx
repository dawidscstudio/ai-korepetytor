"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [subject, setSubject] = useState("Matematyka");
  const [level, setLevel] = useState("Klasa 1–4");
  const [topic, setTopic] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); 

  const startLesson = async () => {
    if (!topic) {
      alert("Wpisz najpierw jakiś temat, np. 'ułamki'!");
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    setIsLoading(true); 
    setAnswer(""); 

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject, level, topic }),
      });

      const data = await res.json();
      setAnswer(data.message); 
    } catch (error) {
      setAnswer("Wystąpił błąd z połączeniem. Upewnij się, że serwer działa! 😢");
    }

    setIsLoading(false); 
  };

  const readAloud = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      // Proste, bezpieczne czyszczenie ze znaczków Markdowna
      const cleanText = answer.replace(/[*#_]/g, '');
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'pl-PL'; 
      utterance.rate = 0.95; 

      // Bezpieczne szukanie lepszego (ludzkiego) głosu w systemie
      const voices = window.speechSynthesis.getVoices();
      const polishVoices = voices.filter(v => v.lang.includes('pl'));
      
      if (polishVoices.length > 0) {
        const betterVoice = polishVoices.find(v => v.name.includes('Google')) || polishVoices[0];
        utterance.voice = betterVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false); // W razie błędu odblokuj przycisk

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Twoja przeglądarka niestety nie obsługuje czytania na głos 😢");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-black flex flex-col items-center justify-center p-10">
      
      <h1 className="text-5xl font-bold text-center mb-6 text-white sm:text-black mix-blend-difference">
        🤖 AI Korepetytor
      </h1>

      <p className="text-xl text-blue-600 text-center max-w-xl mb-10 bg-white/80 p-2 rounded-lg backdrop-blur-sm">
        Wybierz przedmiot i rozpocznij naukę z inteligentnym nauczycielem AI,
        który tłumaczy jak prawdziwy człowiek.
      </p>

      <div className="bg-white text-black shadow-xl rounded-2xl p-8 w-full max-w-md space-y-4">
      
        <select 
          className="w-full p-3 border rounded-lg"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          <option>Matematyka</option>
          <option>Angielski</option>
          <option>Fizyka</option>
          <option>Informatyka</option>
          <option>Biologia</option>
        </select>

        <select 
          className="w-full p-3 border rounded-lg"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option>Klasa 1–4</option>
          <option>Klasa 5–8</option>
          <option>Liceum/technikum</option>
          <option>Studia</option>
        </select>

        <input 
          className="w-full p-3 border rounded-lg"
          placeholder="Jaki temat chcesz przerobić?"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <button 
          onClick={startLesson}
          disabled={isLoading || isSpeaking}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-3 rounded-lg text-lg transition-colors"
        >
          {isLoading ? "korepetytor myśli... ⏳" : "Rozpocznij lekcję 🚀"}
        </button>

      </div>

      {answer && (
        <div className="mt-10 max-w-3xl w-full flex flex-col items-center">
          
          {/* Białe okno z odpowiedzią i awatarem */}
          <div className="w-full bg-white text-black p-6 rounded-xl shadow-lg border border-gray-200 flex gap-6 items-start">
            
            {/* ZDJĘCIE NAUCZYCIELA */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=NauczycielMichal&backgroundColor=b6e3f4" 
                alt="Nauczyciel" 
                className="w-20 h-20 rounded-full border-4 border-blue-100 shadow-sm"
              />
              <span className="text-xs font-bold text-gray-500 mt-2">Twój Nauczyciel</span>
            </div>

            {/* TEKST LEKCJI */}
            <div className="flex-1 leading-relaxed">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-2 mb-4 text-blue-600" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3 text-blue-600" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2 text-blue-600" {...props} />,
                  p: ({node, ...props}) => <p className="mb-4 text-gray-800" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-black" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 text-gray-800" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 text-gray-800" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />
                }}
              >
                {answer}
              </ReactMarkdown>
            </div>

          </div>

          {/* Przycisk do czytania na głos */}
          <button 
            onClick={readAloud}
            className={`mt-6 px-8 py-3 rounded-full font-bold text-white shadow-md transition-all ${
              isSpeaking ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isSpeaking ? "🗣️ Nauczyciel mówi (kliknij by odświeżyć)" : "🔊 Przeczytaj na głos"}
          </button>

        </div>
      )}

    </main>
  );
}