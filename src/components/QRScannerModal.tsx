"use client"

import { QrCode, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface QRScannerModalProps {
  onClose: () => void
}

const QRScannerModal = ({ onClose }: QRScannerModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasCamera, setHasCamera] = useState(true)
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    // Request camera access
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // Use back camera on mobile
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error("Error accessing camera:", error)
        setHasCamera(false)
      }
    }

    startCamera()

    // Cleanup: stop camera when modal closes
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const handleScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      alert("Check-in realizado com sucesso no Quarto 101!")
      onClose()
    }, 500)
  }

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
            <video ref={videoRef} autoPlay playsInline className="w-full h-64 bg-gray-900 rounded-2xl object-cover" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-4 border-green-500 rounded-2xl"></div>
            </div>
          </div>
        ) : (
          <div className="w-full h-64 bg-gray-100 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Câmera não disponível</p>
            </div>
          </div>
        )}

        <p className="text-gray-600 text-center my-4 text-sm">Aponte a câmera para o código QR do quarto</p>

        <div className="space-y-3">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold transition"
          >
            {isScanning ? "Processando..." : "Simular Check-in"}
          </button>
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
