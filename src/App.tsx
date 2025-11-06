import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AppProvider } from "@/contexts/AppContext"
import Index from "./pages/Index"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import Quiz from "./pages/Quiz"
import Agenda from "./pages/Agenda"
import Memories from "./pages/Memories"
import Documents from "./pages/Documents"
import UserManagement from "./pages/UserManagement"
import NotFound from "./pages/NotFound"

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/memories" element={<Memories />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
