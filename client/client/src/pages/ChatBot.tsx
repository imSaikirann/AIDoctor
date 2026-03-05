import { useState, useRef } from "react";
import { sendChatMessage } from "@/services/ai.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

// SpeechRecognition types
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef<any>(null);

  // 🎤 Start voice recognition
  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US"; // change dynamically if needed
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + " " + transcript);
    };

    recognition.onend = () => setListening(false);

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Msg = { role: "user", content: input };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendChatMessage(input);

      const aiMsg: Msg = {
        role: "assistant",
        content: res.data.reply,
      };

      setMessages((p) => [...p, aiMsg]);
    } catch {
      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          content: "⚠️ AI failed. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-3xl font-bold">
        🤖 AI Health Assistant
      </h1>

      <p className="mb-6 text-sm text-muted-foreground">
        This AI provides informational guidance only. Always consult
        a qualified doctor for medical advice.
      </p>

      <Card className="flex h-[500px] flex-col">

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">

          {messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Ask about symptoms, diseases, precautions…
            </p>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                msg.role === "user"
                  ? "ml-auto bg-primary text-white"
                  : "bg-muted"
              }`}
            >
              {msg.content}
            </div>
          ))}

          {loading && (
            <div className="text-sm text-muted-foreground">
              AI is typing…
            </div>
          )}

        </div>

        {/* Input */}
        <div className="flex gap-2 border-t p-3">

          <Input
            placeholder="Describe your symptoms..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          {/* 🎤 Voice Button */}
          <Button
            variant={listening ? "destructive" : "outline"}
            onClick={startVoice}
          >
            {listening ? "🎙 Listening..." : "🎤"}
          </Button>

          <Button onClick={handleSend} disabled={loading}>
            Send
          </Button>

        </div>

      </Card>
    </div>
  );
}