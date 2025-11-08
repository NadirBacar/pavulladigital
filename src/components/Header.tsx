"use client"

import { LogOut, Bell, QrCode } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"
import NotificationsModal from "./NotificationsModal"
import QRScannerModal from "./QRScannerModal"

const Header = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <>
      <header className="bg-white bg-opacity-95 backdrop-blur-sm shadow-elegant sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/pavulla-logo.svg" alt="PAVULLA" className="h-10 w-[150px]" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNotifications(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition relative"
              title="Notificações"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <button
              onClick={() => setShowQRScanner(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="Check-in QR"
            >
              <QrCode className="w-5 h-5 text-gray-600" />
            </button>

            <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-full transition" title="Sair">
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} />}
      {showQRScanner && <QRScannerModal onClose={() => setShowQRScanner(false)} />}
    </>
  )
}

export default Header
