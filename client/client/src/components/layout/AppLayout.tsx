import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import FloatingChat from "../chat/Floating";


export default function AppLayout() {
  return (
    <div className="min-h-screen bg-muted/40">
      <Navbar />

      <main className="pb-10">
        <Outlet />
      </main>

      {/* 🤖 Global chatbot */}
      <FloatingChat />
    </div>
  );
}