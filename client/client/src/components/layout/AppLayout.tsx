import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import FloatingChat from "../chat/Floating";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      {/* Global Floating AI Chat */}
      <FloatingChat />
    </div>
  );
}