"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Users, Shield, UserCheck, UserCog, ChevronLeft, Plus, Edit2, Save, X } from "lucide-react"
import BackgroundWithLogo from "@/components/BackgroundWithLogo"
import Header from "@/components/Header"
import { useAuth } from "@/contexts/AuthContext"
import { fetchUsers, updateUser, ApiUser } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface EditUserForm {
  full_name: string
  group_name: string
  is_admin: boolean
  password: string
}

const UserManagement = () => {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<ApiUser[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditUserForm>({
    full_name: "",
    group_name: "",
    is_admin: false,
    password: "",
  })
  const [saving, setSaving] = useState(false)

  // Fetch users on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        const data = await fetchUsers()
        setUsers(data)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Erro",
          description: "Falha ao carregar usuários.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (isAdmin) {
      loadUsers()
    }
  }, [isAdmin, toast])

  // Check if current user is admin
  if (!isAdmin) {
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
    // Navigate to register page
    navigate("/register")
  }

  const startEdit = (user: ApiUser) => {
    setEditingUserId(user.id)
    setEditForm({
      full_name: user.full_name,
      group_name: user.group_name,
      is_admin: user.is_admin,
      password: "",
    })
  }

  const cancelEdit = () => {
    setEditingUserId(null)
    setEditForm({
      full_name: "",
      group_name: "",
      is_admin: false,
      password: "",
    })
  }

  const saveEdit = async (userId: string) => {
    try {
      if (!editForm.full_name.trim()) {
        toast({
          title: "Erro",
          description: "Nome é obrigatório.",
          variant: "destructive",
        })
        return
      }

      setSaving(true)

      const updatedUser = await updateUser(
        userId,
        editForm.full_name,
        editForm.group_name,
        editForm.is_admin,
        true,
        editForm.password
      )

      // Update local state
      setUsers(users.map(u => (u.id === userId ? updatedUser : u)))

      toast({
        title: "Sucesso!",
        description: "Usuário atualizado com sucesso.",
      })

      cancelEdit()
    } catch (error: any) {
      console.error("Error updating user:", error)
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar usuário.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Helper to get current role from user
  const getUserRole = (user: ApiUser): string => {
    if (user.is_admin) return "admin"
    if (user.group_name === "recepcao") return "recepcao"
    return "cliente"
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
            onClick={handleAddUser}
            className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Adicionar Usuário
          </button>
        </div>


        {/* Users List */}
        {loading ? (
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-8 text-center shadow-elegant">
            <p className="text-gray-500">Carregando usuários...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-8 text-center shadow-elegant">
            <p className="text-gray-500">Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => {
              const isEditing = editingUserId === user.id
              const currentRole = getUserRole(user)

              if (isEditing) {
                // Edit mode
                return (
                  <div key={user.id} className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-5 shadow-elegant">
                    <div className="space-y-4">
                      {/* Phone (read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                        <input
                          type="text"
                          value={user.phone}
                          disabled
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                      </div>

                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                        <input
                          type="text"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
                          placeholder="Nome completo"
                        />
                      </div>

                      {/* Group Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
                        <input
                          type="text"
                          value={editForm.group_name}
                          onChange={(e) => setEditForm({ ...editForm, group_name: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
                          placeholder="Nome do grupo"
                        />
                      </div>

                      {/* Admin Checkbox */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`admin-${user.id}`}
                          checked={editForm.is_admin}
                          onChange={(e) => setEditForm({ ...editForm, is_admin: e.target.checked })}
                          className="w-5 h-5 text-secondary border-gray-300 rounded focus:ring-secondary"
                        />
                        <label htmlFor={`admin-${user.id}`} className="text-sm font-medium text-gray-700">
                          Administrador
                        </label>
                      </div>

                      {/* Password (optional) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nova Senha <span className="text-gray-500 font-normal">(opcional)</span>
                        </label>
                        <input
                          type="password"
                          value={editForm.password}
                          onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
                          placeholder="Deixe em branco para manter a senha atual"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => saveEdit(user.id)}
                          disabled={saving}
                          className="flex-1 bg-secondary text-white py-2 rounded-lg hover:bg-secondary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="px-6 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }

              // View mode
              return (
                <div key={user.id} className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-5 shadow-elegant">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{user.full_name}</h3>
                        <p className="text-sm text-gray-600">{user.phone}</p>
                        {user.group_name && (
                          <p className="text-xs text-gray-500 mt-1">Grupo: {user.group_name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg border-2 ${getRoleColor(currentRole)}`}
                      >
                        {getRoleIcon(currentRole)}
                        <span className="text-sm font-semibold">{getRoleName(currentRole)}</span>
                      </div>
                      <button
                        onClick={() => startEdit(user)}
                        className="px-4 py-2 bg-blue-50 text-primary rounded-lg hover:bg-blue-100 transition flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

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
