"use client"

import { useNavigate } from "react-router-dom"
import { Clock, Calendar, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import Header from "@/components/Header"
import { useApp } from "@/contexts/AppContext"

const Agenda = () => {
  const navigate = useNavigate()
  const { activities, autoCompleteActivity, currentUser } = useApp()
  const [selectedDay, setSelectedDay] = useState(5)
  const [currentTime, setCurrentTime] = useState(new Date())

  const [isAddingActivity, setIsAddingActivity] = useState(false)
  const [newActivity, setNewActivity] = useState({
    time: "",
    title: "",
    type: "activity" as "meal" | "visit" | "activity",
  })

  const [startDay, setStartDay] = useState(5)
  const [endDay, setEndDay] = useState(10)

  const isAdmin = currentUser?.role === "admin"

  // Atualiza o horário atual a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Atualiza a cada 1 minuto

    return () => clearInterval(timer)
  }, [])

  // Marca automaticamente atividades que passaram do horário
  useEffect(() => {
    const now = new Date()
    const currentDay = now.getDate()

    activities.forEach((activity) => {
      // Só auto-completar atividades do dia atual
      if (activity.day === currentDay && !activity.completed) {
        const [hours, minutes] = activity.time.split(":").map(Number)
        const activityTime = new Date()
        activityTime.setHours(hours, minutes, 0, 0)

        // Se passou do horário, marca automaticamente
        if (now > activityTime) {
          autoCompleteActivity(activity.id)
        }
      }
    })
  }, [currentTime, activities, autoCompleteActivity])

  // Gera os dias baseado no intervalo definido pelo admin
  const getDays = () => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const days = []

    for (let day = startDay; day <= endDay; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const dayName = date.toLocaleDateString("pt-PT", { weekday: "short" })
      days.push({
        day,
        dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        date,
        isToday: today.getDate() === day && today.getMonth() === currentMonth,
      })
    }

    return days
  }

  const days = getDays()

  // Verifica se uma atividade já passou do horário
  const isPastTime = (activityTime: string, activityDay: number) => {
    const now = new Date()
    const currentDay = now.getDate()

    // Se for um dia passado, já passou
    if (activityDay < currentDay) return true

    // Se for um dia futuro, ainda não passou
    if (activityDay > currentDay) return false

    // Se for o dia atual, verifica o horário
    const [hours, minutes] = activityTime.split(":").map(Number)
    const activityDate = new Date()
    activityDate.setHours(hours, minutes, 0, 0)

    return now > activityDate
  }

  // Filtra atividades do dia selecionado
  const filteredActivities = activities.filter((activity) => activity.day === selectedDay)

  const getActivityIcon = (type: string) => {
    if (type === "meal") return "🍽️"
    if (type === "visit") return "👥"
    return "🎯"
  }

  const handleAddActivity = () => {
    if (!newActivity.time || !newActivity.title) return

    // This would normally call a context function to add the activity
    console.log("[v0] Adding activity:", { ...newActivity, day: selectedDay })

    // Reset form
    setNewActivity({ time: "", title: "", type: "activity" })
    setIsAddingActivity(false)
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <Header />

      <div className="max-w-4xl mx-auto p-4 pb-24 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Agenda do Dia</h2>
          <button
            onClick={() => navigate("/home")}
            className="text-primary hover:text-primary/80 font-medium bg-white px-4 py-2 rounded-lg shadow-md transition"
          >
            Voltar
          </button>
        </div>

        {isAdmin && (
          <div className="bg-white rounded-2xl p-4 shadow-md mb-6">
            <h3 className="font-bold text-gray-800 mb-3">Configurar Intervalo de Dias</h3>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <label className="text-sm text-gray-600 block mb-1">Dia Inicial</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={startDay}
                  onChange={(e) => setStartDay(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-600 block mb-1">Dia Final</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={endDay}
                  onChange={(e) => setEndDay(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Seletor de Dias */}
        <div className="bg-white rounded-2xl p-4 shadow-md mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-gray-800">Selecione o Dia</h3>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {days.map((dayInfo) => (
              <button
                key={dayInfo.day}
                onClick={() => setSelectedDay(dayInfo.day)}
                className={`p-3 rounded-xl transition-all ${
                  selectedDay === dayInfo.day
                    ? "bg-primary text-white shadow-lg scale-105"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                } ${dayInfo.isToday ? "ring-2 ring-secondary" : ""}`}
              >
                <div className="text-xs font-semibold">{dayInfo.dayName}</div>
                <div className="text-lg font-bold">{dayInfo.day}</div>
                {dayInfo.isToday && <div className="text-xs mt-1">Hoje</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Horário Atual */}
        <div className="bg-white rounded-xl p-3 mb-4 shadow-md">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="font-semibold text-gray-700">
              Horário Atual:{" "}
              {currentTime.toLocaleTimeString("pt-PT", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {isAdmin && (
          <div className="mb-4">
            <button
              onClick={() => setIsAddingActivity(!isAddingActivity)}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Adicionar Atividade para o Dia {selectedDay}
            </button>
          </div>
        )}

        {isAdmin && isAddingActivity && (
          <div className="bg-white rounded-2xl p-5 shadow-md mb-4">
            <h3 className="font-bold text-gray-800 mb-4">Nova Atividade</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Horário</label>
                <input
                  type="time"
                  value={newActivity.time}
                  onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Título</label>
                <input
                  type="text"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                  placeholder="Ex: Almoço, Visita médica..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Tipo</label>
                <select
                  value={newActivity.type}
                  onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="activity">Atividade</option>
                  <option value="meal">Refeição</option>
                  <option value="visit">Visita</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddActivity}
                  className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90 transition"
                >
                  Adicionar
                </button>
                <button
                  onClick={() => setIsAddingActivity(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Atividades */}
        <div className="space-y-3">
          {filteredActivities.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-md">
              <p className="text-gray-500 text-lg">Nenhuma atividade agendada para o dia {selectedDay}</p>
            </div>
          ) : (
            filteredActivities.map((activity) => {
              const hasPassed = isPastTime(activity.time, activity.day)
              const isCompleted = activity.completed

              return (
                <div
                  key={activity.id}
                  className={`bg-white rounded-2xl p-4 shadow-md transition ${
                    isCompleted ? "opacity-70" : hasPassed ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span
                          className={`text-sm font-semibold ${
                            isCompleted ? "text-green-600" : hasPassed ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {activity.time}
                        </span>
                        {isCompleted && <span className="text-xs text-green-600 font-medium">✓ Concluído</span>}
                      </div>
                      <h3
                        className={`text-lg font-bold ${
                          isCompleted ? "text-green-700" : hasPassed ? "text-gray-400" : "text-gray-800"
                        }`}
                      >
                        {activity.title}
                      </h3>
                      {activity.completedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Concluído automaticamente às {activity.completedAt}
                        </p>
                      )}
                    </div>
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                        isCompleted
                          ? "bg-green-500 border-green-500"
                          : hasPassed
                            ? "bg-gray-300 border-gray-300"
                            : "border-gray-300"
                      }`}
                    >
                      {isCompleted && <span className="text-white text-xl">✓</span>}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default Agenda
