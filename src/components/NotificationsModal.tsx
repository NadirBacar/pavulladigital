"use client"

import { X, Bell, Clock } from "lucide-react"

interface NotificationsModalProps {
  onClose: () => void
}

interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
}

const NotificationsModal = ({ onClose }: NotificationsModalProps) => {
  const notifications: Notification[] = [
    {
      id: "1",
      title: "Bem-vindo ao PAVULLA!",
      message: "Aproveite todas as atividades e experiências que preparamos para você.",
      time: "Há 2 horas",
      read: false,
    },
    {
      id: "2",
      title: "Próxima Atividade",
      message: "Exercícios Matinais começam em 30 minutos. Não perca!",
      time: "Há 3 horas",
      read: false,
    },
    {
      id: "3",
      title: "Quiz Disponível",
      message: "Novo quiz PAVULLA disponível. Participe e ganhe prêmios!",
      time: "Ontem",
      read: true,
    },
    {
      id: "4",
      title: "Check-in Realizado",
      message: "Seu check-in no Quarto 101 foi confirmado com sucesso.",
      time: "Há 2 dias",
      read: true,
    },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Notificações</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition ${!notification.read ? "bg-blue-50" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        !notification.read ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 mb-1">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{notification.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationsModal
