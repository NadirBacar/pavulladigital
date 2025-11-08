import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  Video,
  Mic,
  MessageCircle,
  Send,
} from "lucide-react";
import Header from "@/components/Header";
import {
  fetchActivities,
  fetchMemories,
  createMemory,
  ApiActivity,
  ApiMemory,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const ActivityDetails = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activity, setActivity] = useState<ApiActivity | null>(null);
  const [memories, setMemories] = useState<ApiMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [newMemoryText, setNewMemoryText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mediaBlobUrls, setMediaBlobUrls] = useState<Map<string, string>>(
    new Map()
  );
  const [commentTexts, setCommentTexts] = useState<Map<string, string>>(
    new Map()
  );
  const [showComments, setShowComments] = useState<Set<string>>(new Set());
  const [submittingComment, setSubmittingComment] = useState<string | null>(
    null
  );

  useEffect(() => {
    const loadData = async () => {
      if (!activityId) return;

      try {
        setLoading(true);

        const activities = await fetchActivities();
        const currentActivity = activities.find((a) => a.id === activityId);

        if (!currentActivity) {
          toast({
            title: "Atividade não encontrada",
            description: "A atividade solicitada não existe.",
            variant: "destructive",
          });
          navigate("/agenda");
          return;
        }

        if (!currentActivity.has_signed) {
          toast({
            title: "Acesso negado",
            description: "Você precisa assinar esta atividade primeiro.",
            variant: "destructive",
          });
          navigate("/agenda");
          return;
        }

        setActivity(currentActivity);

        const activityMemories = await fetchMemories(activityId);
        setMemories(activityMemories);
      } catch (error) {
        console.error("Error loading activity details:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar detalhes da atividade.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activityId, navigate, toast]);

  useEffect(() => {
    const fetchMediaFiles = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:8080/api";
      const baseHost = API_BASE_URL.replace(/\/api$/, "");
      const newBlobUrls = new Map<string, string>();

      for (const memory of memories) {
        if (memory.file_url && !mediaBlobUrls.has(memory.id)) {
          try {
            const response = await fetch(`${baseHost}${memory.file_url}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const blob = await response.blob();
              const blobUrl = URL.createObjectURL(blob);
              newBlobUrls.set(memory.id, blobUrl);
            }
          } catch (error) {
            console.error("Error fetching media file:", error);
          }
        }
      }

      if (newBlobUrls.size > 0) {
        setMediaBlobUrls((prev) => new Map([...prev, ...newBlobUrls]));
      }
    };

    fetchMediaFiles();

    return () => {
      mediaBlobUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [memories]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitMemory = async () => {
    if (!activityId || (!newMemoryText.trim() && !selectedFile)) {
      toast({
        title: "Campos vazios",
        description: "Adicione um texto ou arquivo para continuar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const newMemory = await createMemory(
        activityId,
        newMemoryText,
        selectedFile || undefined
      );

      setMemories((prev) => [newMemory, ...prev]);

      setNewMemoryText("");
      setSelectedFile(null);
      setFilePreview(null);
      setShowAddMemory(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: "Sucesso!",
        description: "Memória adicionada com sucesso.",
      });
    } catch (error: any) {
      console.error("Error creating memory:", error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao adicionar memória.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleComments = (memoryId: string) => {
    setShowComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(memoryId)) {
        newSet.delete(memoryId);
      } else {
        newSet.add(memoryId);
      }
      return newSet;
    });
  };

  const handleCommentChange = (memoryId: string, text: string) => {
    setCommentTexts((prev) => new Map(prev).set(memoryId, text));
  };

  const handleSubmitComment = async (memoryId: string) => {
    const commentText = commentTexts.get(memoryId)?.trim();

    if (!commentText) {
      toast({
        title: "Campo vazio",
        description: "Digite um comentário para continuar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingComment(memoryId);

      const token = localStorage.getItem("auth_token");
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:8080/api";

      const response = await fetch(
        `${API_BASE_URL}/memories/${memoryId}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ comment: commentText }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Falha ao adicionar comentário");
      }

      const newComment = await response.json();

      setMemories((prev) =>
        prev.map((memory) => {
          if (memory.id === memoryId) {
            return {
              ...memory,
              comments: [...(memory.comments || []), newComment],
            };
          }
          return memory;
        })
      );

      setCommentTexts((prev) => {
        const newMap = new Map(prev);
        newMap.delete(memoryId);
        return newMap;
      });

      toast({
        title: "Sucesso!",
        description: "Comentário adicionado com sucesso.",
      });
    } catch (error: any) {
      console.error("Error creating comment:", error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao adicionar comentário.",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(null);
    }
  };

  const renderMediaFile = (memory: ApiMemory) => {
    if (!memory.file_url) {
      return null;
    }

    const fileUrl = mediaBlobUrls.get(memory.id);

    if (!fileUrl) {
      return (
        <div className="bg-gray-100 rounded-xl p-4 mb-3 text-center text-gray-500">
          Carregando...
        </div>
      );
    }

    switch (memory.content_type) {
      case "image":
        return (
          <img
            src={fileUrl}
            alt="Memory"
            className="w-full rounded-xl mb-3 cursor-pointer hover:opacity-95 transition"
          />
        );

      case "document":
        return (
          <video controls className="w-full rounded-xl mb-3" preload="metadata">
            <source src={fileUrl} />
            Seu navegador não suporta vídeos.
          </video>
        );

      case "recording":
        return (
          <div className="bg-gray-100 rounded-xl p-4 mb-3">
            <audio controls className="w-full">
              <source src={fileUrl} />
              Seu navegador não suporta áudio.
            </audio>
          </div>
        );

      default:
        return null;
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="w-5 h-5" />;

    if (selectedFile.type.startsWith("image/"))
      return <ImageIcon className="w-5 h-5" />;
    if (selectedFile.type.startsWith("video/"))
      return <Video className="w-5 h-5" />;
    if (selectedFile.type.startsWith("audio/"))
      return <Mic className="w-5 h-5" />;

    return <Upload className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50">
        <Header />
        <div className="max-w-4xl mx-auto p-4 pb-24">
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!activity) {
    return null;
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <Header />

      <div className="max-w-4xl mx-auto p-4 pb-24">
        <button
          onClick={() => navigate("/agenda")}
          className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium mb-6 bg-white px-4 py-2 rounded-lg shadow-md transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para Agenda
        </button>

        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {activity.name}
          </h1>

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span>
                {new Date(activity.activity_date).toLocaleDateString("pt-PT")}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span>
                {activity.start_time} - {activity.end_time}
              </span>
            </div>
          </div>

          {activity.description && (
            <p className="text-gray-700 leading-relaxed">
              {activity.description}
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{activity.signature_count}</span>{" "}
              {activity.signature_count === 1
                ? "pessoa assinou"
                : "pessoas assinaram"}
            </p>
          </div>
        </div>

        {!showAddMemory && (
          <button
            onClick={() => setShowAddMemory(true)}
            className="w-full bg-secondary hover:bg-secondary/90 text-white py-4 rounded-2xl font-semibold transition shadow-md mb-6 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Adicionar Memória
          </button>
        )}

        {showAddMemory && (
          <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Nova Memória</h3>
              <button
                onClick={() => {
                  setShowAddMemory(false);
                  setNewMemoryText("");
                  handleRemoveFile();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              value={newMemoryText}
              onChange={(e) => setNewMemoryText(e.target.value)}
              placeholder="Compartilhe sua experiência..."
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none resize-none mb-3"
              rows={4}
            />

            {filePreview && selectedFile?.type.startsWith("image/") && (
              <div className="relative mb-3">
                <img
                  src={filePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <button
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {selectedFile && !selectedFile.type.startsWith("image/") && (
              <div className="bg-gray-100 rounded-xl p-4 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon()}
                  <div>
                    <p className="font-medium text-gray-800">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,audio/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex items-center gap-3">
              <button
                onClick={handleFileSelect}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-primary rounded-lg hover:bg-blue-100 transition"
              >
                {getFileIcon()}
                <span className="text-sm font-medium">
                  {selectedFile ? "Trocar Arquivo" : "Adicionar Arquivo"}
                </span>
              </button>

              <button
                onClick={handleSubmitMemory}
                disabled={
                  submitting || (!newMemoryText.trim() && !selectedFile)
                }
                className="flex-1 bg-secondary text-white py-2 rounded-lg font-semibold hover:bg-secondary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Memórias</h2>

          {memories.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-md">
              <p className="text-gray-500">
                Nenhuma memória compartilhada ainda.
              </p>
              <p className="text-gray-400 text-sm">
                Seja o primeiro a compartilhar!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {memories.map((memory) => (
                <div
                  key={memory.id}
                  className="bg-white rounded-2xl p-5 shadow-md"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                      {memory.user_name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">
                        {memory.user_name || "Usuário"}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {new Date(memory.created_at).toLocaleString("pt-PT")}
                      </p>
                    </div>
                  </div>

                  {memory.content_text && (
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      {memory.content_text}
                    </p>
                  )}

                  {renderMediaFile(memory)}

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => toggleComments(memory.id)}
                      className="flex items-center gap-2 text-gray-600 hover:text-primary transition text-sm font-medium"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>
                        {memory.comments?.length || 0}{" "}
                        {memory.comments?.length === 1
                          ? "comentário"
                          : "comentários"}
                      </span>
                    </button>

                    {showComments.has(memory.id) && (
                      <div className="mt-4 space-y-3">
                        {memory.comments && memory.comments.length > 0 && (
                          <div className="space-y-2">
                            {memory.comments.map((comment) => (
                              <div
                                key={comment.id}
                                className="bg-gray-50 rounded-lg p-3"
                              >
                                <div className="flex items-start gap-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {comment.user?.full_name
                                      ?.charAt(0)
                                      ?.toUpperCase() || "U"}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2 mb-1">
                                      <span className="font-semibold text-sm text-gray-800">
                                        {comment.user?.full_name || "Usuário"}
                                      </span>
                                      {/* <span className="text-xs text-gray-500">
                                        {new Date(
                                          comment.created_at
                                        ).toLocaleString("pt-PT", {
                                          day: "2-digit",
                                          month: "2-digit",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span> */}
                                    </div>
                                    <p className="text-sm text-gray-700">
                                      {comment.comment}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={commentTexts.get(memory.id) || ""}
                            onChange={(e) =>
                              handleCommentChange(memory.id, e.target.value)
                            }
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmitComment(memory.id);
                              }
                            }}
                            placeholder="Adicione um comentário..."
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-secondary focus:outline-none text-sm"
                            disabled={submittingComment === memory.id}
                          />
                          <button
                            onClick={() => handleSubmitComment(memory.id)}
                            disabled={
                              submittingComment === memory.id ||
                              !commentTexts.get(memory.id)?.trim()
                            }
                            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityDetails;
