"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, X, ChevronRight } from "lucide-react"

interface Document {
  id: string
  name: string
  type: "photo" | "pdf"
  url: string
  date: Date
}

const DocumentsSection = () => {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const navigate = useNavigate()

  const handlePhotoCapture = () => {
    // Create a file input for camera
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
    <div className="mt-6">
      <button
        onClick={() => navigate("/documents")}
        className="w-full bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-6 shadow-elegant hover:shadow-glow transition-all transform hover:scale-105 flex items-center justify-between group"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
            <FileText className="w-7 h-7 text-purple-600" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-800">Documentos Fiscalizados</h3>
            <p className="text-sm text-gray-600">Gerenciar documentos</p>
          </div>
        </div>
        <ChevronRight className="w-6 h-6 text-gray-400" />
      </button>

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

export default DocumentsSection
