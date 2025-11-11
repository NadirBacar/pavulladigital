"use client"

// src/pages/Home.tsx
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Calendar, Clock, QrCode, Trophy, Zap, Gift, ChevronRight, Users, UserPlus, CheckCircle2, CalendarPlus, File } from "lucide-react"
import BackgroundWithLogo from "@/components/BackgroundWithLogo"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import QRScannerModal from "@/components/QRScannerModal"
import { useAuth } from "@/contexts/AuthContext"
import { fetchActivities, ApiActivity, scanQRCode } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const Home = () => {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activities, setActivities] = useState<ApiActivity[]>([])
  const [loading, setLoading] = useState(true)

  // Atualiza o horário a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Fetch activities on mount
  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true)
        const data = await fetchActivities()
        setActivities(data)
      } catch (error) {
        console.error("Error fetching activities:", error)
        toast({
          title: "Erro",
          description: "Falha ao carregar atividades.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadActivities()
  }, [toast])

  // Formata a hora no formato HH:MM:SS
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("pt-PT", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  // Formata a data completa
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("pt-PT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Get today's activities stats
  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0]
    const todayActivities = activities.filter(a => a.activity_date === today)
    const signedCount = todayActivities.filter(a => a.has_signed).length
    return { total: todayActivities.length, signed: signedCount }
  }

  const todayStats = getTodayStats()

  return (
    <div className="min-h-screen bg-blue-50">
      <BackgroundWithLogo />
      <Header />

      <div className="max-w-6xl mx-auto p-4 pb-24 relative z-10 bg-blue-50">
        {/* Cabeçalho - Saudação e Data */}
        <div className="mb-6">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-5 shadow-elegant">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              Olá, {user?.full_name || "Visitante"}!
              {/* Uncomment when group feature is needed: */}
              {/* {user?.group_name && ` - ${user.group_name}`} */}
            </h2>
            <p className="text-gray-600 text-sm capitalize">{formatDate(currentTime)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Card Horário Atual */}
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-6 h-6 text-primary" />
              <span className="text-sm text-gray-600 font-medium">Horário Atual</span>
            </div>
            <p className="text-4xl font-bold text-primary tabular-nums">{formatTime(currentTime)}</p>
          </div>

          {/* Atividades de Hoje */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-elegant text-white">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-6 h-6" />
              <span className="text-sm font-medium">Atividades de Hoje</span>
            </div>
            {loading ? (
              <p className="text-sm opacity-90">Carregando...</p>
            ) : (
              <>
                <p className="text-sm opacity-90 mb-1">Assinadas / Total</p>
                <p className="text-4xl font-bold">
                  {todayStats.signed} / {todayStats.total}
                </p>
              </>
            )}
          </div>

          {/* Assinar QR */}
          <button
            onClick={() => setShowQRScanner(true)}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-elegant hover:shadow-glow transition-all transform hover:scale-105 text-white col-span-2"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <QrCode className="w-8 h-8" />
              <div className="text-center">
                <p className="text-xl font-bold">Assinar Atividade</p>
                <p className="text-sm opacity-90">Escanear código QR</p>
              </div>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Quiz PAVULLA */}
          <button
            onClick={() => navigate("/quiz")}
            className="gradient-quiz rounded-2xl p-6 shadow-glow hover:shadow-xl transition-all transform hover:scale-105 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <Trophy className="w-12 h-12 text-white" />
                <Zap className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Quiz PAVULLA</h3>
              <p className="text-white text-sm mb-3 font-medium">Teste seus conhecimentos e ganhe prêmios!</p>
              <div className="flex items-center gap-2 text-white text-sm">
                <Gift className="w-5 h-5" />
                <span className="font-semibold">Boné, Agenda e muito mais!</span>
              </div>
            </div>
          </button>

          {/* Agenda do Dia */}
          <button
            onClick={() => navigate("/agenda")}
            className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-6 shadow-elegant hover:shadow-glow transition-all transform hover:scale-105 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <Calendar className="w-7 h-7 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-800">Agenda do Dia</h3>
                <p className="text-sm text-gray-600">Ver atividades</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </button>

          {isAdmin && (
            <>
              {/* Criar Atividade */}
              <button
                onClick={() => navigate("/create-activity")}
                className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 shadow-elegant hover:shadow-glow transition-all transform hover:scale-105 flex items-center justify-between group text-white"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                    <CalendarPlus className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold">Criar Atividade</h3>
                    <p className="text-sm opacity-90">Nova atividade</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-white opacity-70" />
              </button>

              {/* Registrar Usuário */}
              <button
                onClick={() => navigate("/register")}
                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-elegant hover:shadow-glow transition-all transform hover:scale-105 flex items-center justify-between group text-white"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                    <UserPlus className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold">Registrar Usuário</h3>
                    <p className="text-sm opacity-90">Criar nova conta</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-white opacity-70" />
              </button>

              {/* Gestão de Usuários */}
              <button
                onClick={() => navigate("/user-management")}
                className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 shadow-elegant hover:shadow-glow transition-all transform hover:scale-105 flex items-center justify-between group text-white"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold">Gestão de Usuários</h3>
                    <p className="text-sm opacity-90">Gerenciar grupos</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-white opacity-70" />
              </button>
              <button
                onClick={() => navigate("/documents")}
                className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-6 shadow-elegant hover:shadow-glow transition-all transform hover:scale-105 flex items-center justify-between group text-white"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                    <File className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold">Gestão de Documentos</h3>
                    <p className="text-sm opacity-90">Gerenciar Documentos</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-white opacity-70" />
              </button>
            </>
          )}
        </div>
      </div>

      <Footer />

      {showQRScanner && <QRScannerModal onQRCodeDetected={scanQRCode} onClose={() => setShowQRScanner(false)} />}
    </div>
  )
}

export default Home
