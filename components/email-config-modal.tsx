"use client"

import { useState } from "react"
import { X, Mail } from "lucide-react"

interface EmailConfigModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EmailConfigModal({ isOpen, onClose }: EmailConfigModalProps) {
  const [email, setEmail] = useState("")

  const handleSave = () => {
    if (email.trim()) {
      console.log("Email configurado:", email)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#2d2e30] rounded-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <div className="flex items-center gap-3">
            <Mail size={20} className="text-blue-400" />
            <h2 className="text-lg font-medium text-white">Correo</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="w-full bg-[#3c4043] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />

          <button
            onClick={handleSave}
            disabled={!email.trim()}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              email.trim()
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}