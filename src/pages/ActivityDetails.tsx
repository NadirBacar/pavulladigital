import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, Plus, X, Upload, Image as ImageIcon, Video, Mic } from 'lucide-react';
import Header from '@/components/Header';
import { fetchActivities, fetchMemories, createMemory, getFileUrl, ApiActivity, ApiMemory } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const ActivityDetails = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activity, setActivity] = useState<ApiActivity | null>(null);
  const [memories, setMemories] = useState<ApiMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [newMemoryText, setNewMemoryText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mediaBlobUrls, setMediaBlobUrls] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const loadData = async () => {
      if (!activityId) return;

      try {
        setLoading(true);

        // Fetch activities to get the specific activity
        const activities = await fetchActivities();
        const currentActivity = activities.find(a => a.id === activityId);

        if (!currentActivity) {
          toast({
            title: 'Atividade não encontrada',
            description: 'A atividade solicitada não existe.',
            variant: 'destructive',
          });
          navigate('/agenda');
          return;
        }

        // Check if user has signed
        if (!currentActivity.has_signed) {
          toast({
            title: 'Acesso negado',
            description: 'Você precisa assinar esta atividade primeiro.',
            variant: 'destructive',
          });
          navigate('/agenda');
          return;
        }

        setActivity(currentActivity);

        // Fetch memories for this activity
        const activityMemories = await fetchMemories(activityId);
        setMemories(activityMemories);
      } catch (error) {
        console.error('Error loading activity details:', error);
        toast({
          title: 'Erro',
          description: 'Falha ao carregar detalhes da atividade.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activityId, navigate, toast]);

  // Fetch media files with authentication headers and create blob URLs
  useEffect(() => {
    const fetchMediaFiles = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
      const baseHost = API_BASE_URL.replace(/\/api$/, '');
      const newBlobUrls = new Map<string, string>();

      for (const memory of memories) {
        if (memory.file_url && !mediaBlobUrls.has(memory.id)) {
          try {
            const response = await fetch(`${baseHost}${memory.file_url}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (response.ok) {
              const blob = await response.blob();
              const blobUrl = URL.createObjectURL(blob);
              newBlobUrls.set(memory.id, blobUrl);
            }
          } catch (error) {
            console.error('Error fetching media file:', error);
          }
        }
      }

      if (newBlobUrls.size > 0) {
        setMediaBlobUrls(prev => new Map([...prev, ...newBlobUrls]));
      }
    };

    fetchMediaFiles();

    // Cleanup blob URLs on unmount
    return () => {
      mediaBlobUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [memories]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
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
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitMemory = async () => {
    if (!activityId || (!newMemoryText.trim() && !selectedFile)) {
      toast({
        title: 'Campos vazios',
        description: 'Adicione um texto ou arquivo para continuar.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      const newMemory = await createMemory(activityId, newMemoryText, selectedFile || undefined);

      // Add to memories list
      setMemories(prev => [newMemory, ...prev]);

      // Reset form
      setNewMemoryText('');
      setSelectedFile(null);
      setFilePreview(null);
      setShowAddMemory(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: 'Sucesso!',
        description: 'Memória adicionada com sucesso.',
      });
    } catch (error: any) {
      console.error('Error creating memory:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao adicionar memória.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderMediaFile = (memory: ApiMemory) => {
    if (!memory.file_url) {
      return null;
    }

    // Get the blob URL for this memory
    const fileUrl = mediaBlobUrls.get(memory.id);

    if (!fileUrl) {
      // Still loading
      return <div className="bg-gray-100 rounded-xl p-4 mb-3 text-center text-gray-500">Carregando...</div>;
    }

    switch (memory.content_type) {
      case 'image':
        return (
          <img
            src={fileUrl}
            alt="Memory"
            className="w-full rounded-xl mb-3 cursor-pointer hover:opacity-95 transition"
          />
        );

      case 'document':
        return (
          <video
            controls
            className="w-full rounded-xl mb-3"
            preload="metadata"
          >
            <source src={fileUrl} />
            Seu navegador não suporta vídeos.
          </video>
        );

      case 'recording':
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

    if (selectedFile.type.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (selectedFile.type.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (selectedFile.type.startsWith('audio/')) return <Mic className="w-5 h-5" />;

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
        {/* Back Button */}
        <button
          onClick={() => navigate('/agenda')}
          className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium mb-6 bg-white px-4 py-2 rounded-lg shadow-md transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para Agenda
        </button>

        {/* Activity Details Card */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{activity.name}</h1>

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span>{new Date(activity.activity_date).toLocaleDateString('pt-PT')}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span>
                {activity.start_time} - {activity.end_time}
              </span>
            </div>
          </div>

          {activity.description && (
            <p className="text-gray-700 leading-relaxed">{activity.description}</p>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{activity.signature_count}</span> {activity.signature_count === 1 ? 'pessoa assinou' : 'pessoas assinaram'}
            </p>
          </div>
        </div>

        {/* Add Memory Button */}
        {!showAddMemory && (
          <button
            onClick={() => setShowAddMemory(true)}
            className="w-full bg-secondary hover:bg-secondary/90 text-white py-4 rounded-2xl font-semibold transition shadow-md mb-6 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Adicionar Memória
          </button>
        )}

        {/* Add Memory Form */}
        {showAddMemory && (
          <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Nova Memória</h3>
              <button
                onClick={() => {
                  setShowAddMemory(false);
                  setNewMemoryText('');
                  handleRemoveFile();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Text Area */}
            <textarea
              value={newMemoryText}
              onChange={(e) => setNewMemoryText(e.target.value)}
              placeholder="Compartilhe sua experiência..."
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none resize-none mb-3"
              rows={4}
            />

            {/* File Preview */}
            {filePreview && selectedFile?.type.startsWith('image/') && (
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

            {/* Selected File Info (for non-images) */}
            {selectedFile && !selectedFile.type.startsWith('image/') && (
              <div className="bg-gray-100 rounded-xl p-4 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon()}
                  <div>
                    <p className="font-medium text-gray-800">{selectedFile.name}</p>
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

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,audio/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleFileSelect}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-primary rounded-lg hover:bg-blue-100 transition"
              >
                {getFileIcon()}
                <span className="text-sm font-medium">
                  {selectedFile ? 'Trocar Arquivo' : 'Adicionar Arquivo'}
                </span>
              </button>

              <button
                onClick={handleSubmitMemory}
                disabled={submitting || (!newMemoryText.trim() && !selectedFile)}
                className="flex-1 bg-secondary text-white py-2 rounded-lg font-semibold hover:bg-secondary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
        )}

        {/* Memories List */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Memórias</h2>

          {memories.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-md">
              <p className="text-gray-500">Nenhuma memória compartilhada ainda.</p>
              <p className="text-gray-400 text-sm">Seja o primeiro a compartilhar!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {memories.map((memory) => (
                <div key={memory.id} className="bg-white rounded-2xl p-5 shadow-md">
                  {/* User Info */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                      {memory.user_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{memory.user_name || 'Usuário'}</h4>
                      <p className="text-xs text-gray-500">
                        {new Date(memory.created_at).toLocaleString('pt-PT')}
                      </p>
                    </div>
                  </div>

                  {/* Text Content */}
                  {memory.content_text && (
                    <p className="text-gray-700 mb-3 leading-relaxed">{memory.content_text}</p>
                  )}

                  {/* Media File */}
                  {renderMediaFile(memory)}
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
