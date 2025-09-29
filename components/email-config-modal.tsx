"use client"

import { useState } from "react"
import { X, Mail } from "lucide-react"

interface EmailConfigModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EmailConfigModal({ isOpen, onClose }: EmailConfigModalProps) {
  const [email, setEmail] = useState("")
  const [isConfigured, setIsConfigured] = useState(false)

  const handleSave = () => {
    if (email.trim()) {
      // Aquí se guardará la configuración del correo
      console.log("Email configurado:", email)
      setIsConfigured(true)
      
      // Simular guardado
      setTimeout(() => {
        onClose()
      }, 1000)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2d2e30] rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <h2 className="text-lg font-medium text-white">Configuración de Correo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-500/20 p-4 rounded-full">
              <Mail size={32} className="text-blue-400" />
            </div>
          </div>

          <p className="text-gray-400 text-sm text-center mb-6">
            El asistente leerá tu correo diariamente para encontrar eventos y agregarlos a tu calendario automáticamente
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full bg-[#3c4043] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-[#3c4043] p-3 rounded-lg">
              <p className="text-gray-400 text-xs">
                📌 <strong className="text-white">Próximamente:</strong> Integración con Gmail para lectura automática. Por ahora, guarda tu email para futuras actualizaciones.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={!email.trim()}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                email.trim()
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isConfigured ? "✓ Guardado" : "Guardar configuración"}
            </button>
          </div>

          <div className="mt-6 space-y-2">
            <p className="text-gray-500 text-xs">
              <strong>¿Cómo funciona?</strong>
            </p>
            <ul className="text-gray-500 text-xs space-y-1 ml-4">
              <li>• El asistente revisará tu correo una vez al día</li>
              <li>• Detectará fechas, horas y eventos automáticamente</li>
              <li>• Agregará eventos a tu calendario sin intervención</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
