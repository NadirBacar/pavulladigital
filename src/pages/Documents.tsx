"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Camera, Upload, FileText, X, Eye, ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react"
import BackgroundWithLogo from "@/components/BackgroundWithLogo"
import Header from "@/components/Header"

// Tipos de usuário
type UserRole = "contabilista" | "contabilidade" | "recepcao" | "outros"

// Status do documento
type DocumentStatus = "pendente" | "aprovado" | "rejeitado"

interface Document {
  id: string
  name: string
  type: "photo" | "pdf"
  url: string
  date: Date
  status: DocumentStatus
  reviewedBy?: string
  reviewedAt?: Date
  rejectionReason?: string
}

const Documents = () => {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  
  // Simulação do usuário atual - em produção, isso viria de um contexto de autenticação
  const [currentUser] = useState<{ name: string; role: UserRole }>({
    name: "João Silva",
    role: "contabilista" // Altere para "recepcao" ou "outros" para testar
  })

  // Verificar se o usuário pode aprovar/rejeitar
  const canReviewDocuments = currentUser.role === "contabilista" || currentUser.role === "contabilidade" || currentUser.role === "recepcao"

  const handlePhotoCapture = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.capture = "environment"

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const url = URL.createObjectURL(file)
        const newDoc: Document = {
          id: Date.now().toString(),
          name: file.name,
          type: "photo",
          url,
          date: new Date(),
          status: "pendente",
        }
        setDocuments((prev) => [newDoc, ...prev])
      }
    }

    input.click()
  }

  const handlePdfUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "application/pdf"

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const url = URL.createObjectURL(file)
        const newDoc: Document = {
          id: Date.now().toString(),
          name: file.name,
          type: "pdf",
          url,
          date: new Date(),
          status: "pendente",
        }
        setDocuments((prev) => [newDoc, ...prev])
      }
    }

    input.click()
  }

  const handleApproveDocument = (docId: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId
          ? {
              ...doc,
              status: "aprovado",
              reviewedBy: currentUser.name,
              reviewedAt: new Date(),
            }
          : doc
      )
    )
    setSelectedDocument(null)
  }

  const handleRejectDocument = () => {
    if (!selectedDocument || !rejectionReason.trim()) {
      alert("Por favor, forneça um motivo para a rejeição")
      return
    }

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === selectedDocument.id
          ? {
              ...doc,
              status: "rejeitado",
              reviewedBy: currentUser.name,
              reviewedAt: new Date(),
              rejectionReason: rejectionReason,
            }
          : doc
      )
    )
    
    setShowRejectModal(false)
    setRejectionReason("")
    setSelectedDocument(null)
  }

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
    if (selectedDocument?.id === id) {
      setSelectedDocument(null)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: DocumentStatus) => {
    const badges = {
      pendente: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: Clock,
        label: "Pendente",
      },
      aprovado: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
        label: "Aprovado",
      },
      rejeitado: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: XCircle,
        label: "Rejeitado",
      },
    }

    const badge = badges[status]
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    )
  }

  const getRoleLabel = (role: UserRole) => {
    const roles = {
      contabilista: "Contabilista",
      contabilidade: "Contabilidade",
      recepcao: "Recepção",
      outros: "Outros",
    }
    return roles[role]
  }

  // Estatísticas dos documentos
  const stats = {
    total: documents.length,
    pendente: documents.filter((d) => d.status === "pendente").length,
    aprovado: documents.filter((d) => d.status === "aprovado").length,
    rejeitado: documents.filter((d) => d.status === "rejeitado").length,
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <BackgroundWithLogo />
      <Header />

      <div className="max-w-6xl mx-auto p-4 pb-24 relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Voltar</span>
        </button>

        {/* Page Title with User Role */}
        <div className="mb-6">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-5 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Documentos Fiscalizados</h2>
                <p className="text-gray-600 text-sm mt-1">Gerencie seus documentos e fotos</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{getRoleLabel(currentUser.role)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {canReviewDocuments && documents.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-elegant text-center">
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-xs text-gray-600 mt-1">Total</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 shadow-elegant text-center">
              <p className="text-2xl font-bold text-yellow-700">{stats.pendente}</p>
              <p className="text-xs text-yellow-600 mt-1">Pendentes</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 shadow-elegant text-center">
              <p className="text-2xl font-bold text-green-700">{stats.aprovado}</p>
              <p className="text-xs text-green-600 mt-1">Aprovados</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 shadow-elegant text-center">
              <p className="text-2xl font-bold text-red-700">{stats.rejeitado}</p>
              <p className="text-xs text-red-600 mt-1">Rejeitados</p>
            </div>
          </div>
        )}

        {/* Action Buttons - 2x2 Grid on mobile */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Camera Button */}
          <button
            onClick={handlePhotoCapture}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-elegant hover:shadow-glow transition-all transform hover:scale-105 text-white"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Camera className="w-7 h-7" />
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">Tirar Foto</p>
                <p className="text-xs opacity-90 mt-1">Capturar documento</p>
              </div>
            </div>
          </button>

          {/* Upload PDF Button */}
          <button
            onClick={handlePdfUpload}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-elegant hover:shadow-glow transition-all transform hover:scale-105 text-white"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Upload className="w-7 h-7" />
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">Upload PDF</p>
                <p className="text-xs opacity-90 mt-1">Enviar documento</p>
              </div>
            </div>
          </button>
        </div>

        {/* Documents List */}
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-6 shadow-elegant">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Meus Documentos ({documents.length})</h3>

          {documents.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">Nenhum documento adicionado</p>
              <p className="text-xs mt-1">Use os botões acima para adicionar documentos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-gray-50 rounded-xl p-4 flex items-center justify-between hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        doc.type === "photo" ? "bg-blue-100" : "bg-purple-100"
                      }`}
                    >
                      {doc.type === "photo" ? (
                        <Camera className="w-6 h-6 text-blue-600" />
                      ) : (
                        <FileText className="w-6 h-6 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500">{formatDate(doc.date)}</p>
                        {getStatusBadge(doc.status)}
                      </div>
                      {doc.reviewedBy && (
                        <p className="text-xs text-gray-500 mt-1">
                          Revisado por {doc.reviewedBy}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setSelectedDocument(doc)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition"
                      title="Visualizar"
                    >
                      <Eye className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition"
                      title="Excluir"
                    >
                      <X className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document Preview Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
              <div className="flex-1 min-w-0 mr-4">
                <h3 className="font-semibold text-gray-800 truncate">{selectedDocument.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(selectedDocument.status)}
                  {selectedDocument.reviewedBy && (
                    <span className="text-xs text-gray-500">
                      por {selectedDocument.reviewedBy}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedDocument(null)} className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content */}
            <div className="p-4 overflow-auto flex-1">
              {selectedDocument.type === "photo" ? (
                <img
                  src={selectedDocument.url || "/placeholder.svg"}
                  alt={selectedDocument.name}
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                <iframe
                  src={selectedDocument.url}
                  className="w-full h-[60vh] rounded-lg"
                  title={selectedDocument.name}
                />
              )}

              {/* Rejection Reason */}
              {selectedDocument.status === "rejeitado" && selectedDocument.rejectionReason && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-800 mb-2">Motivo da Rejeição:</p>
                  <p className="text-sm text-red-700">{selectedDocument.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Action Buttons for Contabilista/Contabilidade */}
            {canReviewDocuments && selectedDocument.status === "pendente" && (
              <div className="p-4 border-t bg-gray-50 flex gap-3 flex-shrink-0">
                <button
                  onClick={() => handleApproveDocument(selectedDocument.id)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Aprovar
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Rejeitar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Rejeitar Documento</h3>
            <p className="text-sm text-gray-600 mb-4">Por favor, informe o motivo da rejeição:</p>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={4}
              placeholder="Digite o motivo da rejeição..."
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason("")
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-xl font-semibold transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectDocument}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-semibold transition"
              >
                Confirmar Rejeição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Documents