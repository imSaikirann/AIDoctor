import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Home from "./pages/Home";
import MyAppointments from "./pages/MyAppointments";
import ChatBot from "./pages/ChatBot";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/ai-chat" element={<ChatBot />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;