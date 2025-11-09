"use client";
import { QrCode, X, AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

interface QRScannerModalProps {
  onClose: () => void;
  // onQRCodeDetected: (url: string) => Promise<any>;
}
const API_BASE_URL = "https://api.cursoapp.pavulla.com/api";

const QRCODE_BASE_URL = "https://qrcode.pavulla.com/v1";

const QRCODE_CLIENTAPP_ID = "5ccc98c1-002c-417d-9df6-8977a997dcbd";

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("auth_token");
};

// Common headers
const getHeaders = (includeAuth = true) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

  const scan = async (id: string, addLog: (log: string) => void) => {
    const url = new URL(`/qrcodes/${id}/scan`, QRCODE_BASE_URL).toString();
    addLog(`URL from constructor: ${url}`);
    const response = await fetch(url, {
      headers: {
        client_app_id: QRCODE_CLIENTAPP_ID,
      },
    });

    addLog("qrcode scanned successfully");
    if (!response.ok) {
      throw new Error("Failed to fetch activities");
    }
    addLog("qrcode scanned with no errors");

    const { activity_id } = await response.json();

    const response2 = await fetch(
      `${API_BASE_URL}/activities/${activity_id}/sign`,
      {
        headers: getHeaders(),
      }
    );

    addLog("well you didn't get here");

    if (!response2.ok) {
      throw new Error("Failed to fetch activities");
    }

    const data = await response2.json();
    console.log(data);
    return data;
  };

const QRScannerModal = ({ onClose }: QRScannerModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [processingResult, setProcessingResult] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setDebugLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        // Try to get camera with portrait orientation
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 720 }, // Swapped for portrait
            height: { ideal: 1280 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.playsInline = true;

          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            addLog("Câmera iniciada");
            setDebugInfo("Câmera iniciada com sucesso");
            startScanning();
          };
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCamera(false);
        setError(`Erro ao acessar câmera: ${error}`);
      }
    };

    const startScanning = () => {
      scanIntervalRef.current = setInterval(() => {
        scanQRCode();
      }, 500);
    };

    const scanQRCode = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

      // Swap dimensions because video is rotated 90 degrees
      canvas.width = video.videoHeight;
      canvas.height = video.videoWidth;

      // Rotate the canvas context to match the rotated video
      context.save();
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate((90 * Math.PI) / 180);
      context.drawImage(
        video,
        -video.videoWidth / 2,
        -video.videoHeight / 2,
        video.videoWidth,
        video.videoHeight
      );
      context.restore();

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const link = detectQRCode(imageData);

      // safe function
      const extractQrUuid = (code: string) => {
        if (!code) return null;
        try {
          const url = new URL(code); // throws if invalid
          const parts = url.pathname.split("/").filter(Boolean); // ['v1', '<uuid>', 'scan']
          addLog("" + parts);
          const candidate = parts[2] ?? null;
          return candidate;
        } catch (e) {
          return null;
        }
      };

      // usage
      const id = extractQrUuid(link);
      addLog("qrcode id =" + id);

      if (id) {
        setScannedData(id);
        setIsScanning(true);
        addLog(`QR detectado: ${id.substring(0, 50)}...`);
        setDebugInfo(`QR Code detectado`);
        console.log("QR Code URL:", id);

        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
        }

        // Stop the camera
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        // Process the QR code
        setIsProcessing(true);
        addLog("Chamando onQRCodeDetected...");
        setDebugInfo(`Iniciando processamento da URL...`);
        try {
          const result = await scan(id, addLog);
          addLog("Sucesso! Resultado recebido");
          setProcessingResult(result);
          setDebugInfo(`Processamento concluído!`);
          setError(null);
        } catch (err: any) {
          console.error("Full error:", err);
          const errorMsg = err.message || err.toString();
          addLog(`ERRO: ${errorMsg}`);
          setError(`Erro: ${errorMsg}`);
          setDebugInfo(`Falha: ${errorMsg}`);

          // Try to get more details
          if (err.cause) {
            setError((prev) => `${prev}\nCausa: ${err.cause}`);
          }
        } finally {
          setIsProcessing(false);
        }
      }
    };

    const detectQRCode = (imageData: ImageData): string | null => {
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      return code?.data || null;
    };

    startCamera();

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const videoStream = videoRef.current.srcObject as MediaStream;
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [scan]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Escanear QR Code</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {hasCamera ? (
          <div className="relative w-full h-64 bg-gray-900 rounded-2xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto"
              style={{
                transform: "translate(-50%, -50%) rotate(90deg)",
                objectFit: "cover",
              }}
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="w-48 h-48 border-4 border-green-500 rounded-2xl animate-pulse"></div>
            </div>
            {isScanning && (
              <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded-2xl flex items-center justify-center">
                <div className="bg-white px-4 py-2 rounded-lg">
                  <p className="text-green-600 font-semibold">✓ Detectado!</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-64 bg-gray-100 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Câmera não disponível</p>
            </div>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <p className="text-blue-600 font-semibold">Processando...</p>
          </div>
        )}

        {/* Debug Logs Section */}
        {debugLogs.length > 0 && (
          <div className="mt-4 p-3 bg-gray-900 rounded-xl max-h-40 overflow-y-auto">
            <p className="text-xs font-semibold text-gray-300 mb-2">📋 Logs:</p>
            {debugLogs.map((log, idx) => (
              <p
                key={idx}
                className="text-xs text-gray-400 font-mono break-all"
              >
                {log}
              </p>
            ))}
          </div>
        )}

        {/* Debug Info Section */}
        {(debugInfo || error || scannedData) && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs space-y-2">
            {error && (
              <div className="flex items-start gap-2 text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="break-all">{error}</p>
              </div>
            )}
            {debugInfo && (
              <p className="text-gray-600 break-all">
                <span className="font-semibold">Status:</span> {debugInfo}
              </p>
            )}
            {scannedData && (
              <p className="text-green-600 break-all">
                <span className="font-semibold">URL Escaneada:</span>{" "}
                {scannedData}
              </p>
            )}
          </div>
        )}

        {/* Processing Result */}
        {processingResult && (
          <div className="mt-4 p-3 bg-green-50 rounded-xl">
            <p className="text-sm font-semibold text-green-800 mb-2">
              ✓ Resultado:
            </p>
            <pre className="text-xs text-green-700 overflow-x-auto whitespace-pre-wrap break-all">
              {JSON.stringify(processingResult, null, 2)}
            </pre>
          </div>
        )}

        <p className="text-gray-600 text-center my-4 text-sm">
          {scannedData
            ? "Dados do escaneamento:"
            : "Aponte a câmera para o código QR"}
        </p>

        <div className="space-y-3">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            {scannedData ? "Fechar" : "Cancelar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;
