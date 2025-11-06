"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Users, Shield, UserCheck, UserCog, ChevronLeft, Plus } from "lucide-react"
import BackgroundWithLogo from "@/components/BackgroundWithLogo"
import Header from "@/components/Header"
import { useApp } from "@/contexts/AppContext"

const UserManagement = () => {
  const navigate = useNavigate()
  const { users, updateUserRole, addUser, currentUser } = useApp()
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "cliente" as "admin" | "recepcao" | "cliente" })

  // Check if current user is admin
  if (currentUser?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-elegant">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h2>
          <p className="text-gray-700 mb-4">Você não tem permissão para acessar esta página.</p>
          <button
            onClick={() => navigate("/home")}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    )
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-5 h-5 text-red-500" />
      case "recepcao":
        return <UserCog className="w-5 h-5 text-blue-500" />
      case "cliente":
        return <UserCheck className="w-5 h-5 text-green-500" />
      default:
        return <Users className="w-5 h-5 text-gray-500" />
    }
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "recepcao":
        return "Recepção"
      case "cliente":
        return "Cliente"
      default:
        return "Desconhecido"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700 border-red-300"
      case "recepcao":
        return "bg-blue-100 text-blue-700 border-blue-300"
      case "cliente":
        return "bg-green-100 text-green-700 border-green-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  const handleAddUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      alert("Por favor, preencha todos os campos.")
      return
    }
    addUser(newUser)
    setNewUser({ name: "", email: "", role: "cliente" })
    setShowAddUser(false)
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <BackgroundWithLogo />
      <Header />

      <div className="max-w-4xl mx-auto p-4 pb-24 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/home")} className="text-black hover:text-secondary transition">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-black">Gestão de Usuários</h2>
          </div>
          <button
            onClick={() => setShowAddUser(!showAddUser)}
            className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Adicionar Usuário
          </button>
        </div>

        {/* Add User Form */}
        {showAddUser && (
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-6 shadow-elegant mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Novo Usuário</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grupo</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as "admin" | "recepcao" | "cliente" })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
                >
                  <option value="cliente">Cliente</option>
                  <option value="recepcao">Recepção</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddUser}
                  className="flex-1 bg-secondary text-white py-2 rounded-lg hover:bg-secondary/90 transition"
                >
                  Adicionar
                </button>
                <button
                  onClick={() => setShowAddUser(false)}
                  className="px-6 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-5 shadow-elegant">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg border-2 ${getRoleColor(user.role || "cliente")}`}
                  >
                    {getRoleIcon(user.role || "cliente")}
                    <span className="text-sm font-semibold">{getRoleName(user.role || "cliente")}</span>
                  </div>
                  <select
                    value={user.role || "cliente"}
                    onChange={(e) => updateUserRole(user.id!, e.target.value as "admin" | "recepcao" | "cliente")}
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none text-sm"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="recepcao">Recepção</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Role Descriptions */}
        <div className="mt-8 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-6 shadow-elegant">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Descrição dos Grupos</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-red-500 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800">Administrador</h4>
                <p className="text-sm text-gray-600">
                  Acesso completo ao sistema, incluindo gestão de usuários e todas as funcionalidades.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <UserCog className="w-5 h-5 text-blue-500 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800">Recepção</h4>
                <p className="text-sm text-gray-600">Acesso a documentos fiscalizados, mas não pode fazer check-in.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <UserCheck className="w-5 h-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800">Cliente</h4>
                <p className="text-sm text-gray-600">
                  Acesso normal ao sistema, incluindo check-in e funcionalidades básicas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserManagement
