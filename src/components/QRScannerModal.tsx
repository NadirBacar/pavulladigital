"use client"
import { QrCode, X, AlertCircle } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import jsQR from "jsqr"

interface QRScannerModalProps {
  onClose: () => void
  onQRCodeDetected: (url: string) => void
}

const QRScannerModal = ({ onClose, onQRCodeDetected }: QRScannerModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hasCamera, setHasCamera] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null

    const startCamera = async () => {
      try {
        // Request camera with specific constraints for better mobile support
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
        })
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          
          // Add these attributes to prevent sideways rendering
          videoRef.current.setAttribute('playsinline', 'true')
          videoRef.current.setAttribute('autoplay', 'true')
          
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
            setDebugInfo("Câmera iniciada com sucesso")
            startScanning()
          }
        }
      } catch (error) {
        console.error("Error accessing camera:", error)
        setHasCamera(false)
        setError(`Erro ao acessar câmera: ${error}`)
      }
    }

    const startScanning = () => {
      scanIntervalRef.current = setInterval(() => {
        scanQRCode()
      }, 500)
    }

    const scanQRCode = () => {
      if (!videoRef.current || !canvasRef.current) return
      
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")
      
      if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return

      // Use the video's actual dimensions
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw the current video frame
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      const code = detectQRCode(imageData)
      
      if (code) {
        setScannedData(code)
        setIsScanning(true)
        setDebugInfo(`QR Code detectado: ${code}`)
        
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current)
        }
        
        // Stop the camera
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }
        
        // Call your handler with the detected URL
        try {
          onQRCodeDetected(code)
          setDebugInfo(`Processando URL: ${code}`)
        } catch (err) {
          setError(`Erro ao processar QR: ${err}`)
          setDebugInfo(`Erro: ${err}`)
        }
      }
    }

    const detectQRCode = (imageData: ImageData): string | null => {
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      })
      return code?.data || null
    }

    startCamera()

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current)
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const videoStream = videoRef.current.srcObject as MediaStream
        videoStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [onClose, onQRCodeDetected])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Escanear QR Code</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        {hasCamera ? (
          <div className="relative">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-64 bg-gray-900 rounded-2xl object-cover"
              style={{ transform: 'scaleX(1)' }}
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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
                <span className="font-semibold">URL:</span> {scannedData}
              </p>
            )}
          </div>
        )}
        
        <p className="text-gray-600 text-center my-4 text-sm">
          Aponte a câmera para o código QR do quarto
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
  )
}

export default QRScannerModal