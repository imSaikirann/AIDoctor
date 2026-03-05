import { useState, useRef } from "react";
import { sendChatMessage, getTriage } from "@/services/ai.api";
import { typeText } from "@/lib/typeText";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import TriageCard from "./TriageCard";

interface Msg {
  role: "user" | "assistant" | "triage";
  content: string;
  triage?: any;
}

// speech api typings
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef<any>(null);

  // 🎤 START VOICE
  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US"; // change if using multilingual
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + " " + transcript);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognition.start();
    recognitionRef.current = recognition;
  };

  // ✅ MAIN SEND HANDLER
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userText },
    ]);

    setInput("");
    setLoading(true);

    try {
      // ===== CHAT =====
      const res = await sendChatMessage(userText);

      let aiIndex = -1;

      setMessages((prev) => {
        aiIndex = prev.length;
        return [...prev, { role: "assistant", content: "" }];
      });

      await typeText(res.data.reply, (val) => {
        setMessages((prev) => {
          const copy = [...prev];
          copy[aiIndex] = {
            role: "assistant",
            content: val,
          };
          return copy;
        });
      });

      // ===== TRIAGE =====
      try {
        const triageRes = await getTriage(userText);
        const parsed = JSON.parse(triageRes.data.raw);

        setMessages((prev) => [
          ...prev,
          {
            role: "triage",
            content: "",
            triage: parsed,
          },
        ]);
      } catch (triageErr) {
        console.warn("Triage parse failed", triageErr);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
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
    <>
      {/* 💬 Floating Button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:scale-105"
      >
        🤖
      </button>

      {/* 📦 Chat Panel */}
      {open && (
        <Card className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[350px] flex-col shadow-2xl">

          {/* Header */}
          <div className="border-b p-3 font-semibold">
            AI Health Assistant
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-3">

            {messages.length === 0 && (
              <p className="text-center text-xs text-muted-foreground">
                Ask about symptoms…
              </p>
            )}

            {messages.map((msg, i) => {

              if (msg.role === "triage" && msg.triage) {
                return (
                  <TriageCard
                    key={i}
                    riskLevel={msg.triage.riskLevel}
                    possibleConditions={msg.triage.possibleConditions}
                    advice={msg.triage.advice}
                    seeDoctor={msg.triage.seeDoctor}
                  />
                );
              }

              return (
                <div
                  key={i}
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "ml-auto bg-primary text-white"
                      : "bg-muted"
                  }`}
                >
                  {msg.content}
                </div>
              );
            })}

            {loading && (
              <span className="animate-pulse text-xs text-muted-foreground">
                AI typing…
              </span>
            )}

          </div>

          {/* Input */}
          <div className="flex gap-2 border-t p-2">

            <Input
              placeholder="Type symptoms..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />

            {/* 🎤 MIC */}
            <Button
              size="sm"
              variant={listening ? "destructive" : "outline"}
              onClick={startVoice}
            >
              {listening ? "🎙" : "🎤"}
            </Button>

            <Button
              size="sm"
              onClick={handleSend}
              disabled={loading}
            >
              Send
            </Button>

          </div>

        </Card>
      )}
    </>
  );
}