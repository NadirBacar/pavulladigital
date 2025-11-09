"use client"
import { QrCode, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import jsQR from "jsqr"

interface QRScannerModalProps {
  onClose: () => void
  onQRCodeDetected: (url: string) => void // Add your handler function here
}

const QRScannerModal = ({ onClose, onQRCodeDetected }: QRScannerModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hasCamera, setHasCamera] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
            startScanning()
          }
        }
      } catch (error) {
        console.error("Error accessing camera:", error)
        setHasCamera(false)
      }
    }

    const startScanning = () => {
      scanIntervalRef.current = setInterval(() => {
        scanQRCode()
      }, 500) // Scan every 500ms
    }

    const scanQRCode = () => {
      if (!videoRef.current || !canvasRef.current) return
      
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")
      
      if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      const code = detectQRCode(imageData)
      
      if (code) {
        setScannedData(code)
        setIsScanning(true)
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current)
        }
        
        // Stop the camera
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }
        
        // ⭐ YOUR FUNCTION GETS CALLED HERE ⭐
        onQRCodeDetected(code) // This calls your handler with the detected URL
        
        // Close modal after a short delay
        setTimeout(() => {
          onClose()
        }, 500)
      }
    }

    // Production-ready QR code detection using jsQR
    const detectQRCode = (imageData: ImageData): string | null => {
      // IMPORTANT: Install jsQR first: npm install jsqr
      // Then uncomment the code below and add this import at the top:
      // import jsQR from "jsqr"
      
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
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-4 border-green-500 rounded-2xl animate-pulse"></div>
            </div>
            {isScanning && (
              <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded-2xl flex items-center justify-center">
                <div className="bg-white px-4 py-2 rounded-lg">
                  <p className="text-green-600 font-semibold">Escaneando...</p>
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
        
        <p className="text-gray-600 text-center my-4 text-sm">
          Aponte a câmera para o código QR do quarto
        </p>
        
        <div className="space-y-3">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default QRScannerModal