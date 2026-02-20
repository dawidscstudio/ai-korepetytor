"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

// To uspokaja VS Code, żeby nie świecił na czerwono!
interface Message {
  role: string;
  text: string;
}

export default function Home() {
  const [subject, setSubject] = useState("Matematyka");
  const [level, setLevel] = useState("Klasa 1–4");
  const [topic, setTopic] = useState("");
  
  const [messages, setMessages] = useState<Message[]>([]); 
  const [userMessage, setUserMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); 

  const chatEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startLesson = async () => {
    if (!topic) return alert("Wpisz najpierw jakiś temat!");
    if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); setIsSpeaking(false); }
    
    setIsLoading(true); 
    const initialText = `Cześć! Proszę, wytłumacz mi temat: ${topic}`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, level, topic, history: [], message: initialText }),
      });

      const data = await res.json();
      setMessages([
        { role: "user", text: initialText },
        { role: "model", text: data.message }
      ]); 
    } catch (error) {
      alert("Wystąpił błąd z połączeniem.");
    }
    setIsLoading(false); 
  };

  const sendMessage = async () => {
    if (!userMessage.trim()) return;
    if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); setIsSpeaking(false); }

    const newMessages = [...messages, { role: "user", text: userMessage }];
    setMessages(newMessages); 
    setUserMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, level, topic, history: messages, message: userMessage }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "model", text: data.message }]);
    } catch (error) {
      alert("Błąd połączenia 😢");
    }
    setIsLoading(false);
  };

  const toggleSpeech = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const lastModelMessage = [...messages].reverse().find(m => m.role === "model")?.text;
        if (!lastModelMessage) return;

        const cleanText = lastModelMessage.replace(/[*#_]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'pl-PL'; 
        utterance.rate = 0.95; 
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const resetLesson = () => {
     if ('speechSynthesis' in window) window.speechSynthesis.cancel();
     setMessages([]);
     setTopic("");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-300 to-gray-800 flex flex-col items-center p-10 text-black">
      
      <h1 className="text-6xl text-center mb-4">🤖</h1>
      
      {messages.length === 0 ? (
        <div className="w-full flex flex-col items-center">
          <p className="text-blue-600 text-center max-w-xl mb-10 bg-white p-4 rounded-xl shadow-md font-medium">
            Wybierz przedmiot i rozpocznij naukę z inteligentnym nauczycielem AI. Teraz możesz z nim pisać!
          </p>
          <div className="bg-white p-8 rounded-2xl w-full max-w-md space-y-4 shadow-xl">
            <select className="w-full p-3 border rounded-lg" value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option>Matematyka</option><option>Angielski</option><option>Fizyka</option><option>Informatyka</option><option>Biologia</option><option>Polski</option><option>Sieci komputerowe</option><option>Bazy danych</option><option>Chemia</option><option>Geografia</option><option>Historia</option><option>Hiszpański</option><option>Niemiecki</option>
            </select>
            <select className="w-full p-3 border rounded-lg" value={level} onChange={(e) => setLevel(e.target.value)}>
              <option>Klasa 1–4</option><option>Klasa 5–8</option><option>Liceum/technikum</option><option>Studia</option>
            </select>
            <input className="w-full p-3 border rounded-lg" placeholder="Jaki temat chcesz przerobić?" value={topic} onChange={(e) => setTopic(e.target.value)} />
            <button onClick={startLesson} disabled={isLoading} className="w-full bg-blue-600 text-white p-3 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors">
              {isLoading ? "Łączenie... ⏳" : "Rozpocznij lekcję 🚀"}
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl flex flex-col gap-6">
          
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md">
            <span className="font-bold text-gray-700">Lekcja: {subject} ({level}) - {topic}</span>
            <button onClick={resetLesson} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
              Zakończ lekcję ❌
            </button>
          </div>

          {messages.map((msg, index) => (
            <div key={index} className={`w-full bg-white p-6 rounded-xl shadow-lg flex gap-6 items-start ${msg.role === "user" ? "flex-row-reverse border-l-8 border-l-blue-500" : "border-l-8 border-l-green-500"}`}>
              <div className="flex-shrink-0 flex flex-col items-center">
                <img 
                  src={msg.role === "user" ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Uczen&backgroundColor=e2e8f0" : "https://api.dicebear.com/7.x/avataaars/svg?seed=NauczycielMichal&backgroundColor=b6e3f4"} 
                  className="w-16 h-16 rounded-full border-4 border-gray-100 shadow-sm" 
                  alt={msg.role} 
                />
                <span className="text-xs font-bold text-gray-500 mt-2">{msg.role === "user" ? "Ty" : "Nauczyciel"}</span>
              </div>
              <div className="flex-1 leading-relaxed prose max-w-none">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))}

          <div className="bg-white p-4 rounded-xl shadow-xl flex flex-col gap-4 sticky bottom-4 border-2 border-blue-200">
            <div className="flex justify-center border-b pb-4">
              <button onClick={toggleSpeech} className={`px-10 py-3 rounded-full font-bold text-white shadow-md transition-all ${isSpeaking ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-green-500 hover:bg-green-600"}`}>
                {isSpeaking ? "⏹️ ZATRZYMAJ" : "🔊 PRZECZYTAJ ODPOWIEDŹ"}
              </button>
            </div>
            
            <div className="flex gap-4">
              <input 
                className="flex-1 p-4 border-2 border-gray-300 rounded-xl text-lg outline-none focus:border-blue-500" 
                placeholder="Napisz odpowiedź lub zadaj pytanie..." 
                value={userMessage} 
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage} disabled={isLoading || !userMessage.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-xl font-bold transition-all text-lg">
                {isLoading ? "⏳..." : "Wyślij ✉️"}
              </button>
            </div>
          </div>
          
          <div ref={chatEndRef} />
        </div>
      )}

    </main>
  );
}