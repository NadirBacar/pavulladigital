"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Upload,
  FileText,
  X,
  Eye,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import BackgroundWithLogo from "@/components/BackgroundWithLogo";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import {
  uploadDocument,
  getMyDocuments,
  getMyDocumentStats,
  getDocumentsByGroup,
  approveDocument,
  rejectDocument,
  deleteDocument,
  getDocumentFileUrl,
  type ApiDocument,
  type ApiDocumentStats,
} from "@/lib/api";

// Status do documento
type DocumentStatus = "pending" | "approved" | "rejected";

const Documents = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [stats, setStats] = useState<ApiDocumentStats | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<ApiDocument | null>(
    null
  );
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  // Verificar se o usuário pode aprovar/rejeitar
  const canReviewDocuments =
    isAdmin ||
    user?.group_name === "contabilista" ||
    user?.group_name === "contabilidade" ||
    user?.group_name === "recepcao";

  // Carregar documentos ao montar o componente
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (canReviewDocuments) {
        // Carregar documentos do grupo do usuário ou todos se for admin
        if (isAdmin) {
          // Admin pode ver todos os documentos
          const allDocs = await getDocumentsByGroup(user.group_name);
          console.log(allDocs);
          setDocuments(allDocs);
        } else if (user?.group_name) {
          // Carregar documentos do grupo específico
          const groupDocs = await getDocumentsByGroup(user.group_name);
          setDocuments(groupDocs);
        }

        // Carregar estatísticas
        const statsData = await getMyDocumentStats();
        setStats(statsData);
      } else {
        // Usuários regulares veem apenas seus documentos
        const myDocs = await getMyDocuments();
        setDocuments(myDocs);

        // Carregar estatísticas
        const statsData = await getMyDocumentStats();
        setStats(statsData);
      }
    } catch (err) {
      console.error("Error loading documents:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao carregar documentos"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoCapture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await handleFileUpload(file);
      }
    };

    input.click();
  };

  const handlePdfUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf,image/*";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await handleFileUpload(file);
      }
    };

    input.click();
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress("Enviando arquivo...");

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Upload do documento
      const response = await uploadDocument(
        file,
        user.full_name,
        user.phone,
        user.group_name || "admin"
      );

      setUploadProgress("Processando documento...");

      // Aguardar um pouco para o processamento
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Recarregar documentos
      await loadDocuments();

      setUploadProgress("Documento enviado com sucesso!");
      setTimeout(() => setUploadProgress(""), 3000);
    } catch (err) {
      console.error("Error uploading document:", err);
      setError(err instanceof Error ? err.message : "Erro ao enviar documento");
    } finally {
      setIsUploading(false);
    }
  };

  const handleApproveDocument = async (docId: string) => {
    try {
      setError(null);

      if (!user?.full_name) {
        throw new Error("Nome do revisor não encontrado");
      }

      await approveDocument(docId, user.full_name);

      // Recarregar documentos
      await loadDocuments();

      setSelectedDocument(null);
    } catch (err) {
      console.error("Error approving document:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao aprovar documento"
      );
    }
  };

  const handleRejectDocument = async () => {
    if (!selectedDocument || !rejectionReason.trim()) {
      alert("Por favor, forneça um motivo para a rejeição");
      return;
    }

    try {
      setError(null);

      if (!user?.full_name) {
        throw new Error("Nome do revisor não encontrado");
      }

      await rejectDocument(
        selectedDocument.id,
        user.full_name,
        rejectionReason
      );

      // Recarregar documentos
      await loadDocuments();

      setShowRejectModal(false);
      setRejectionReason("");
      setSelectedDocument(null);
    } catch (err) {
      console.error("Error rejecting document:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao rejeitar documento"
      );
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este documento?")) {
      return;
    }

    try {
      setError(null);
      await deleteDocument(id);

      // Recarregar documentos
      await loadDocuments();

      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao excluir documento"
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: DocumentStatus) => {
    const badges = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: Clock,
        label: "Pendente",
      },
      approved: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
        label: "Aprovado",
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: XCircle,
        label: "Rejeitado",
      },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}
      >
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const getGroupLabel = (group: string) => {
    const groups: Record<string, string> = {
      admin: "Administração",
      contabilista: "Contabilista",
      contabilidade: "Contabilidade",
      recepcao: "Recepção",
      outros: "Outros",
    };
    return groups[group] || group;
  };

  const isImageType = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext || "");
  };

  const isPdfType = (filename: string) => {
    return filename.toLowerCase().endsWith(".pdf");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando documentos...</p>
        </div>
      </div>
    );
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

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 flex-shrink-0 animate-spin" />
            <p className="text-sm text-blue-800">{uploadProgress}</p>
          </div>
        )}

        {/* Page Title with User Info */}
        <div className="mb-6">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-5 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Documentos Fiscalizados
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Gerencie seus documentos e fotos
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.full_name}
                </p>
                <p className="text-xs text-gray-500">
                  {getGroupLabel(user?.group_name || "")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {canReviewDocuments && stats && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-elegant text-center">
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-xs text-gray-600 mt-1">Total</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 shadow-elegant text-center">
              <p className="text-2xl font-bold text-yellow-700">
                {stats.pending}
              </p>
              <p className="text-xs text-yellow-600 mt-1">Pendentes</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 shadow-elegant text-center">
              <p className="text-2xl font-bold text-green-700">
                {stats.approved}
              </p>
              <p className="text-xs text-green-600 mt-1">Aprovados</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 shadow-elegant text-center">
              <p className="text-2xl font-bold text-red-700">
                {stats.rejected}
              </p>
              <p className="text-xs text-red-600 mt-1">Rejeitados</p>
            </div>
          </div>
        )}

        {/* Action Buttons - 2x2 Grid on mobile */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Camera Button */}
          <button
            onClick={handlePhotoCapture}
            disabled={isUploading}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-elegant hover:shadow-glow transition-all transform hover:scale-105 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                {isUploading ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <Camera className="w-7 h-7" />
                )}
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">Tirar Foto</p>
                <p className="text-xs opacity-90 mt-1">
                  {isUploading ? "Enviando..." : "Capturar documento"}
                </p>
              </div>
            </div>
          </button>

          {/* Upload PDF Button */}
          <button
            onClick={handlePdfUpload}
            disabled={isUploading}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-elegant hover:shadow-glow transition-all transform hover:scale-105 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                {isUploading ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <Upload className="w-7 h-7" />
                )}
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">Upload Arquivo</p>
                <p className="text-xs opacity-90 mt-1">
                  {isUploading ? "Enviando..." : "PDF ou Imagem"}
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Documents List */}
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-6 shadow-elegant">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {canReviewDocuments && !isAdmin
              ? "Documentos do Grupo"
              : "Meus Documentos"}{" "}
            ({documents.length})
          </h3>

          {documents.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">Nenhum documento adicionado</p>
              <p className="text-xs mt-1">
                Use os botões acima para adicionar documentos
              </p>
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
                        isImageType(doc.original_file_name)
                          ? "bg-blue-100"
                          : "bg-purple-100"
                      }`}
                    >
                      {isImageType(doc.original_file_name) ? (
                        <Camera className="w-6 h-6 text-blue-600" />
                      ) : (
                        <FileText className="w-6 h-6 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {doc.correspondent}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500">
                          {formatDate(doc.created)}
                        </p>
                        {/* {getStatusBadge(doc.)} */}
                      </div>
                      {/* {doc.correspondent && (
                        <p className="text-xs text-gray-500 mt-1">
                          Revisado por {doc.reviewer_name}
                        </p>
                      )} */}
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
                    {/* {doc. === user?.id && doc.status === "pending" && (
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition"
                        title="Excluir"
                      >
                        <X className="w-5 h-5 text-red-600" />
                      </button>
                    )} */}
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
                <h3 className="font-semibold text-gray-800 truncate">
                  {selectedDocument.correspondent}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {/* {getStatusBadge(selectedDocument.status)} */}
                  {/* {selectedDocument.reviewer_name && (
                    <span className="text-xs text-gray-500">
                      por {selectedDocument.reviewer_name}
                    </span>
                  )} */}
                </div>
              </div>
              <button
                onClick={() => setSelectedDocument(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content */}
            <div className="p-4 overflow-auto flex-1">
              {isImageType(selectedDocument.original_file_name) ? (
                <img
                  src={getDocumentFileUrl(selectedDocument.original_file_name)}
                  alt={selectedDocument.id}
                  className="w-full h-auto rounded-lg"
                  onError={(e) => {
                    console.error(
                      "Error loading image:",
                      selectedDocument.original_file_name
                    );
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              ) : isPdfType(selectedDocument.original_file_name) ? (
                <iframe
                  src={getDocumentFileUrl(selectedDocument.id)}
                  className="w-full h-[60vh] rounded-lg"
                  title={selectedDocument.correspondent}
                />
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">
                    Tipo de arquivo não suportado para visualização
                  </p>
                  <a
                    href={getDocumentFileUrl(selectedDocument.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                  >
                    Baixar arquivo
                  </a>
                </div>
              )}

              {/* Rejection Reason */}
              {/* {selectedDocument.status === "rejected" &&
                selectedDocument.rejection_reason && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-red-800 mb-2">
                      Motivo da Rejeição:
                    </p>
                    <p className="text-sm text-red-700">
                      {selectedDocument.rejection_reason}
                    </p>
                  </div>
                )} */}
            </div>

            {/* Action Buttons for Reviewers */}
            {/* {canReviewDocuments && selectedDocument.status === "pending" && (
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
            )} */}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Rejeitar Documento
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Por favor, informe o motivo da rejeição:
            </p>

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
                  setShowRejectModal(false);
                  setRejectionReason("");
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-xl font-semibold transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectDocument}
                disabled={!rejectionReason.trim()}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Rejeição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
