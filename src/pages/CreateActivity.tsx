"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  ChevronLeft,
  CheckCircle2,
  Download,
  QrCode,
} from "lucide-react";
import BackgroundWithLogo from "@/components/BackgroundWithLogo";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { createActivity, QRCODE_BASE_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const CreateActivity = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [createdActivity, setCreatedActivity] = useState<{
    id: string;
    name: string;
    description: string;
    activity_date: string;
    start_time: string;
    end_time: string;
    created_at: string;
    qr_code_id?: string;
  } | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [loadingQR, setLoadingQR] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    activity_date: "",
    start_time: "",
    end_time: "",
  });

  // Fetch QR code image when activity is created
  useEffect(() => {
    if (createdActivity?.qr_code_id) {
      fetchQRCode(createdActivity.qr_code_id);
    }
  }, [createdActivity]);

  const fetchQRCode = async (code_id: string) => {
    setLoadingQR(true);
    try {
      const url = new URL(`/v1/qrcodes/${code_id}/preview`, QRCODE_BASE_URL).toString();

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let base64Data = await response.text();

      // Remove quotes if they exist (API returns JSON string)
      if (base64Data.startsWith('"') && base64Data.endsWith('"')) {
        base64Data = base64Data.slice(1, -1);
      }

      console.log("Cleaned base64 preview:", base64Data.substring(0, 50));

      const imageDataUrl = `data:image/jpeg;base64,${base64Data}`;
      setQrCodeImage(imageDataUrl);
    } catch (error) {
      console.error("Error fetching QR code:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar código QR.",
        variant: "destructive",
      });
    } finally {
      setLoadingQR(false);
    }
  };
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5); // HH:MM
  };

  const downloadQRCode = () => {
    if (!qrCodeImage || !createdActivity) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size (A4-like proportions for printing)
    canvas.width = 800;
    canvas.height = 1000;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add border
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Title
    ctx.fillStyle = "#1f2937";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Código QR da Atividade", canvas.width / 2, 80);

    // Activity name
    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#111827";
    const nameWords = createdActivity.name.split(" ");
    let nameLine = "";
    let nameY = 140;
    nameWords.forEach((word, i) => {
      const testLine = nameLine + word + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > canvas.width - 100 && i > 0) {
        ctx.fillText(nameLine, canvas.width / 2, nameY);
        nameLine = word + " ";
        nameY += 35;
      } else {
        nameLine = testLine;
      }
    });
    ctx.fillText(nameLine, canvas.width / 2, nameY);

    // Date and time
    ctx.font = "20px Arial";
    ctx.fillStyle = "#4b5563";
    const dateStr = `📅 ${formatDate(createdActivity.activity_date)}`;
    const timeStr = `🕒 ${formatTime(
      createdActivity.start_time
    )} - ${formatTime(createdActivity.end_time)}`;
    ctx.fillText(dateStr, canvas.width / 2, nameY + 60);
    ctx.fillText(timeStr, canvas.width / 2, nameY + 90);

    // Description (if exists)
    if (createdActivity.description) {
      ctx.font = "18px Arial";
      ctx.fillStyle = "#6b7280";
      ctx.textAlign = "center"; // Already centered, but let's ensure it works properly
      const maxWidth = canvas.width - 100;
      const words = createdActivity.description.split(" ");
      let line = "";
      let descY = nameY + 140;

      words.forEach((word) => {
        const testLine = line + word + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth) {
          ctx.fillText(line, canvas.width / 2, descY); // Changed from 50 to canvas.width / 2
          line = word + " ";
          descY += 25;
          if (descY > nameY + 240) return; // Limit description height
        } else {
          line = testLine;
        }
      });
      if (line && descY <= nameY + 240) {
        ctx.fillText(line, canvas.width / 2, descY); // Changed from 50 to canvas.width / 2
      }
    }

    // Load and draw QR code
    const qrImg = new Image();
    qrImg.onload = () => {
      const qrSize = 400;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = canvas.height - qrSize - 100;

      // QR code background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);

      // QR code border
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 3;
      ctx.strokeRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);

      // Draw QR code
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // Instructions text
      ctx.font = "16px Arial";
      ctx.fillStyle = "#6b7280";
      ctx.textAlign = "center";
      ctx.fillText(
        "Escaneie este código para registrar presença",
        canvas.width / 2,
        canvas.height - 40
      );

      // Download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `qrcode-${createdActivity.name
            .replace(/\s+/g, "-")
            .toLowerCase()}.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    };
    qrImg.src = qrCodeImage;
  };

  // Check if current user is admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-elegant">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Acesso Negado
          </h2>
          <p className="text-gray-700 mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <button
            onClick={() => navigate("/home")}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.name.trim() ||
      !formData.activity_date ||
      !formData.start_time ||
      !formData.end_time
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const result = await createActivity(
        formData.name,
        formData.description,
        formData.activity_date,
        formData.start_time,
        formData.end_time
      );

      setCreatedActivity(result);

      toast({
        title: "Sucesso!",
        description: "Atividade criada com sucesso.",
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        activity_date: "",
        start_time: "",
        end_time: "",
      });
    } catch (error: any) {
      console.error("Error creating activity:", error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar atividade.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <BackgroundWithLogo />
      <Header />

      <div className="max-w-4xl mx-auto p-4 pb-24 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/home")}
              className="text-black hover:text-secondary transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-black">Criar Atividade</h2>
          </div>
        </div>

        {/* Create Activity Form */}
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-6 shadow-elegant mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Activity Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Atividade <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
                placeholder="Ex: Palestra sobre Tecnologia"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none resize-none"
                rows={4}
                placeholder="Descrição da atividade (opcional)"
              />
            </div>

            {/* Activity Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.activity_date}
                  onChange={(e) =>
                    setFormData({ ...formData, activity_date: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
                />
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Início <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Término <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-secondary text-white py-3 rounded-lg font-semibold hover:bg-secondary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Criando..." : "Criar Atividade"}
              </button>
            </div>
          </form>
        </div>

        {/* QR Code Display */}
        {createdActivity && (
          <>
            <div className="bg-white rounded-2xl p-6 shadow-elegant mb-6">
              <div className="flex items-center gap-3 mb-4">
                <QrCode className="w-6 h-6 text-secondary" />
                <h3 className="text-xl font-bold text-gray-800">
                  Código QR Gerado
                </h3>
              </div>

              {loadingQR ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
                </div>
              ) : qrCodeImage ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center bg-gray-50 rounded-xl p-6">
                    <img
                      src={qrCodeImage}
                      alt="QR Code"
                      className="w-64 h-64 border-4 border-white shadow-lg rounded-lg"
                    />
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">
                        Escaneie este código para registrar presença
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={downloadQRCode}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Baixar QR Code para Impressão
                  </button>

                  <p className="text-sm text-gray-600 text-center">
                    O QR Code baixado incluirá todas as informações da atividade
                    para impressão
                  </p>
                </div>
              ) : (
                <p className="text-center text-gray-600 py-4">
                  Erro ao carregar código QR
                </p>
              )}
            </div>

            {/* Success Message */}
            <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 shadow-elegant">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Atividade Criada!
                  </h3>
                  <p className="text-gray-700 mt-1">
                    A atividade foi criada com sucesso. Você pode visualizá-la
                    na agenda.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/agenda")}
                className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Ver na Agenda
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateActivity;
