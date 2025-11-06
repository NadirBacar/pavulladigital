"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Camera, Upload, FileText, X, Eye, ArrowLeft } from "lucide-react"
import BackgroundWithLogo from "@/components/BackgroundWithLogo"
import Header from "@/components/Header"

interface Document {
  id: string
  name: string
  type: "photo" | "pdf"
  url: string
  date: Date
}

const Documents = () => {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

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
        }
        setDocuments((prev) => [newDoc, ...prev])
      }
    }

    input.click()
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

        {/* Page Title */}
        <div className="mb-6">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-5 shadow-elegant">
            <h2 className="text-2xl font-bold text-gray-800">Documentos Fiscalizados</h2>
            <p className="text-gray-600 text-sm mt-1">Gerencie seus documentos e fotos</p>
          </div>
        </div>

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
                      <p className="text-xs text-gray-500 mt-0.5">{formatDate(doc.date)}</p>
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
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{selectedDocument.name}</h3>
              <button onClick={() => setSelectedDocument(null)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              {selectedDocument.type === "photo" ? (
                <img
                  src={selectedDocument.url || "/placeholder.svg"}
                  alt={selectedDocument.name}
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                <iframe
                  src={selectedDocument.url}
                  className="w-full h-[70vh] rounded-lg"
                  title={selectedDocument.name}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Documents
