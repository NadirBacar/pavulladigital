"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// Interface do Usuário (ATUALIZADA)
export interface User {
  id?: string
  name: string
  email?: string
  phone?: string
  avatar?: string
  role?: "admin" | "recepcao" | "cliente"
}

// Interface de Atividade
export interface Activity {
  id: string
  time: string
  title: string
  type: "meal" | "visit" | "activity"
  completed: boolean
  completedAt?: string
  day: number
}

// Interface de Memória
export interface Memory {
  id: number
  user: string
  comment: string
  image?: string
  timestamp: string
  likes: number
}

// Interface do Contexto
interface AppContextType {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  activities: Activity[]
  toggleActivity: (id: string) => void
  autoCompleteActivity: (id: string) => void
  memories: Memory[]
  addMemory: (memory: { comment: string; image?: string }) => void
  likeMemory: (id: number) => void
  users: User[]
  updateUserRole: (userId: string, role: "admin" | "recepcao" | "cliente") => void
  addUser: (user: User) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  // Estado do usuário atual
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: "1",
    name: "Admin",
    email: "admin@example.com",
    phone: "841234567",
    avatar: "",
    role: "cliente",
  })

  // Estado das atividades
  const [activities, setActivities] = useState<Activity[]>([
    // DIA 5
    { id: "d5-1", time: "08:00", title: "Pequeno-almoço", type: "meal", completed: false, day: 5 },
    { id: "d5-2", time: "10:00", title: "Visita da família", type: "visit", completed: false, day: 5 },
    { id: "d5-3", time: "12:30", title: "Almoço", type: "meal", completed: false, day: 5 },
    { id: "d5-4", time: "15:00", title: "Sessão de fisioterapia", type: "activity", completed: false, day: 5 },
    { id: "d5-5", time: "19:00", title: "Jantar", type: "meal", completed: false, day: 5 },

    // DIA 6
    { id: "d6-1", time: "08:00", title: "Pequeno-almoço", type: "meal", completed: false, day: 6 },
    { id: "d6-2", time: "09:30", title: "Consulta médica", type: "activity", completed: false, day: 6 },
    { id: "d6-3", time: "11:00", title: "Visita dos netos", type: "visit", completed: false, day: 6 },
    { id: "d6-4", time: "12:30", title: "Almoço", type: "meal", completed: false, day: 6 },
    { id: "d6-5", time: "14:30", title: "Atividade recreativa", type: "activity", completed: false, day: 6 },
    { id: "d6-6", time: "19:00", title: "Jantar", type: "meal", completed: false, day: 6 },

    // DIA 7
    { id: "d7-1", time: "08:00", title: "Pequeno-almoço", type: "meal", completed: false, day: 7 },
    { id: "d7-2", time: "10:00", title: "Caminhada no jardim", type: "activity", completed: false, day: 7 },
    { id: "d7-3", time: "11:30", title: "Visita do médico", type: "visit", completed: false, day: 7 },
    { id: "d7-4", time: "12:30", title: "Almoço", type: "meal", completed: false, day: 7 },
    { id: "d7-5", time: "14:00", title: "Sessão de leitura", type: "activity", completed: false, day: 7 },
    { id: "d7-6", time: "19:00", title: "Jantar", type: "meal", completed: false, day: 7 },

    // DIA 8
    { id: "d8-1", time: "08:00", title: "Pequeno-almoço", type: "meal", completed: false, day: 8 },
    { id: "d8-2", time: "09:00", title: "Exercícios matinais", type: "activity", completed: false, day: 8 },
    { id: "d8-3", time: "10:30", title: "Visita de amigos", type: "visit", completed: false, day: 8 },
    { id: "d8-4", time: "12:30", title: "Almoço", type: "meal", completed: false, day: 8 },
    { id: "d8-5", time: "15:30", title: "Aula de artesanato", type: "activity", completed: false, day: 8 },
    { id: "d8-6", time: "19:00", title: "Jantar", type: "meal", completed: false, day: 8 },

    // DIA 9
    { id: "d9-1", time: "08:00", title: "Pequeno-almoço", type: "meal", completed: false, day: 9 },
    { id: "d9-2", time: "09:30", title: "Análises clínicas", type: "activity", completed: false, day: 9 },
    { id: "d9-3", time: "11:00", title: "Visita da enfermeira", type: "visit", completed: false, day: 9 },
    { id: "d9-4", time: "12:30", title: "Almoço", type: "meal", completed: false, day: 9 },
    { id: "d9-5", time: "14:30", title: "Terapia ocupacional", type: "activity", completed: false, day: 9 },
    { id: "d9-6", time: "19:00", title: "Jantar", type: "meal", completed: false, day: 9 },

    // DIA 10
    { id: "d10-1", time: "08:00", title: "Pequeno-almoço", type: "meal", completed: false, day: 10 },
    { id: "d10-2", time: "10:00", title: "Missa/Culto religioso", type: "activity", completed: false, day: 10 },
    { id: "d10-3", time: "11:30", title: "Visita da família", type: "visit", completed: false, day: 10 },
    { id: "d10-4", time: "12:30", title: "Almoço especial", type: "meal", completed: false, day: 10 },
    { id: "d10-5", time: "14:00", title: "Filme ou documentário", type: "activity", completed: false, day: 10 },
    { id: "d10-6", time: "19:00", title: "Jantar", type: "meal", completed: false, day: 10 },
  ])

  // Estado das memórias
  const [memories, setMemories] = useState<Memory[]>([
    {
      id: 1,
      user: "João Silva",
      comment: "Que dia maravilhoso! Adorei a caminhada no jardim.",
      image: "/elderly-people-walking-in-garden.jpg",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      likes: 5,
    },
    {
      id: 2,
      user: "Maria Santos",
      comment: "A visita da família foi incrível! Obrigada a todos.",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      likes: 8,
    },
  ])

  // Estado da lista de usuários para gerenciamento por admin
  const [users, setUsers] = useState<User[]>([
    { id: "1", name: "Admin User", email: "admin@pavulla.com", role: "admin" },
    { id: "2", name: "Recepção User", email: "recepcao@pavulla.com", role: "recepcao" },
    { id: "3", name: "Cliente User", email: "cliente@pavulla.com", role: "cliente" },
  ])

  const toggleActivity = (id: string) => {
    setActivities((prev) =>
      prev.map((activity) => {
        if (activity.id === id) {
          const newCompleted = !activity.completed
          return {
            ...activity,
            completed: newCompleted,
            completedAt: newCompleted
              ? new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })
              : undefined,
          }
        }
        return activity
      }),
    )
  }

  const autoCompleteActivity = (id: string) => {
    setActivities((prev) =>
      prev.map((activity) => {
        if (activity.id === id && !activity.completed) {
          return {
            ...activity,
            completed: true,
            completedAt: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
          }
        }
        return activity
      }),
    )
  }

  // Funções de gerenciamento de memórias
  const addMemory = (memory: { comment: string; image?: string }) => {
    const newMemory: Memory = {
      id: Date.now(),
      user: currentUser?.name || "Usuário",
      comment: memory.comment,
      image: memory.image,
      timestamp: new Date().toISOString(),
      likes: 0,
    }
    setMemories((prev) => [newMemory, ...prev])
  }

  const likeMemory = (id: number) => {
    setMemories((prev) => prev.map((memory) => (memory.id === id ? { ...memory, likes: memory.likes + 1 } : memory)))
  }

  // Funções de gerenciamento de usuários para admin
  const updateUserRole = (userId: string, role: "admin" | "recepcao" | "cliente") => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } : user)))
    // Atualiza o usuário atual se for o mesmo
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, role })
    }
  }

  const addUser = (user: User) => {
    setUsers((prev) => [...prev, { ...user, id: Date.now().toString() }])
  }

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        activities,
        toggleActivity,
        autoCompleteActivity,
        memories,
        addMemory,
        likeMemory,
        users,
        updateUserRole,
        addUser,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp deve ser usado dentro de AppProvider")
  }
  return context
}
