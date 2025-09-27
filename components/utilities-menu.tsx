"use client"

import { useState } from "react"
import { Mail, Settings, Brain, MessageCircle, User, BarChart3, Send, Inbox, UserPlus } from "lucide-react"
import { api } from "@/lib/api"

interface UtilitiesMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function UtilitiesMenu({ isOpen, onClose }: UtilitiesMenuProps) {
  const [activeSection, setActiveSection] = useState<"main" | "mail" | "invitations" | "settings" | "interview">("main")
  const [showInterview, setShowInterview] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const interviewQuestions = [
    "¿Cuáles son tus principales objetivos diarios?",
    "¿En qué momentos del día te sientes más productivo?",
    "¿Qué tipo de recordatorios prefieres recibir?",
    "¿Cómo organizas normalmente tus tareas?",
    "¿Qué te motiva más: recompensas o evitar consecuencias?",
    "¿Prefieres planificar con anticipación o ser espontáneo?",
    "¿Qué actividades te ayudan a relajarte?",
    "¿Cómo prefieres recibir feedback sobre tu progreso?",
  ]

  const handleResponse = async (response: string) => {
    const newResponses = [...responses, response]
    setResponses(newResponses)

    if (currentQuestion < interviewQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setSaving(true)
      try {
        const userProfile = {
          goals: newResponses[0],
          productiveTime: newResponses[1],
          reminderType: newResponses[2],
          organization: newResponses[3],
          motivation: newResponses[4],
          planning: newResponses[5],
          relaxation: newResponses[6],
          feedback: newResponses[7]
        }

        await api.updateUserProfile({ userProfile })
        
        setShowInterview(false)
        setCurrentQuestion(0)
        setResponses([])
        setActiveSection("main")
        alert("¡Entrevista completada! Tu perfil ha sido actualizado.")
      } catch (error) {
        console.error('Error guardando perfil:', error)
        alert('Error al guardar el perfil')
      } finally {
        setSaving(false)
      }
    }
  }

  const resetMenu = () => {
    setActiveSection("main")
    setShowInterview(false)
    setCurrentQuestion(0)
    setResponses([])
  }

  const handleClose = () => {
    resetMenu()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2d2e30] rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <h2 className="text-lg font-medium text-white">
            {activeSection === "main" && "Opciones"}
            {activeSection === "mail" && "Correo"}
            {activeSection === "invitations" && "Invitaciones"}
            {activeSection === "settings" && "Configuración"}
            {showInterview && "Conocerte Mejor"}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {activeSection === "main" && (
            <div className="space-y-3">
              <button
                onClick={() => setActiveSection("mail")}
                className="w-full bg-[#3c4043] p-4 rounded-xl hover:bg-[#4a4d50] transition-colors flex items-center"
              >
                <Mail className="text-blue-400 mr-3" size={24} />
                <div className="text-left">
                  <h3 className="text-white font-medium">Correo</h3>
                  <p className="text-gray-400 text-sm">Gestiona tus emails</p>
                </div>
              </button>

              <button
                onClick={() => setActiveSection("invitations")}
                className="w-full bg-[#3c4043] p-4 rounded-xl hover:bg-[#4a4d50] transition-colors flex items-center"
              >
                <Send className="text-green-400 mr-3" size={24} />
                <div className="text-left">
                  <h3 className="text-white font-medium">Invitaciones</h3>
                  <p className="text-gray-400 text-sm">Envía y recibe invitaciones</p>
                </div>
              </button>

              <button
                onClick={() => setActiveSection("settings")}
                className="w-full bg-[#3c4043] p-4 rounded-xl hover:bg-[#4a4d50] transition-colors flex items-center"
              >
                <Settings className="text-purple-400 mr-3" size={24} />
                <div className="text-left">
                  <h3 className="text-white font-medium">Configuración</h3>
                  <p className="text-gray-400 text-sm">Personaliza tu experiencia</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowInterview(true)
                  setActiveSection("interview")
                }}
                className="w-full bg-[#3c4043] p-4 rounded-xl hover:bg-[#4a4d50] transition-colors flex items-center"
              >
                <Brain className="text-yellow-400 mr-3" size={24} />
                <div className="text-left">
                  <h3 className="text-white font-medium">Perfil de Usuario</h3>
                  <p className="text-gray-400 text-sm">Entrevista personalizada</p>
                </div>
              </button>
            </div>
          )}

          {activeSection === "mail" && (
            <div className="space-y-4">
              <div className="bg-[#3c4043] p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">Bandeja de Entrada</h3>
                  <Inbox className="text-blue-400" size={20} />
                </div>
                <div className="space-y-2">
                  <div className="bg-[#2d2e30] p-3 rounded-lg">
                    <p className="text-white text-sm">Recordatorio: Reunión mañana</p>
                    <p className="text-gray-400 text-xs">hace 2 horas</p>
                  </div>
                  <div className="bg-[#2d2e30] p-3 rounded-lg">
                    <p className="text-white text-sm">Invitación a cumpleaños de Ana</p>
                    <p className="text-gray-400 text-xs">hace 1 día</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveSection("main")}
                className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg text-white transition-colors"
              >
                Volver
              </button>
            </div>
          )}

          {activeSection === "invitations" && (
            <div className="space-y-4">
              <div className="bg-[#3c4043] p-4 rounded-xl">
                <h3 className="text-white font-medium mb-3">Invitaciones Pendientes</h3>
                <p className="text-gray-400 text-sm">No hay invitaciones pendientes</p>
              </div>

              <div className="bg-[#3c4043] p-4 rounded-xl">
                <h3 className="text-white font-medium mb-3">Crear Invitación</h3>
                <button className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-lg text-white flex items-center justify-center">
                  <UserPlus className="mr-2" size={16} />
                  Nueva Invitación
                </button>
              </div>

              <button
                onClick={() => setActiveSection("main")}
                className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg text-white transition-colors"
              >
                Volver
              </button>
            </div>
          )}

          {activeSection === "settings" && (
            <div className="space-y-3">
              <button className="w-full bg-[#3c4043] p-4 rounded-xl hover:bg-[#4a4d50] transition-colors flex items-center">
                <User className="text-purple-400 mr-3" size={24} />
                <div className="text-left">
                  <h3 className="text-white font-medium">Preferencias</h3>
                  <p className="text-gray-400 text-sm">Configura tu experiencia</p>
                </div>
              </button>

              <button className="w-full bg-[#3c4043] p-4 rounded-xl hover:bg-[#4a4d50] transition-colors flex items-center">
                <BarChart3 className="text-green-400 mr-3" size={24} />
                <div className="text-left">
                  <h3 className="text-white font-medium">Análisis</h3>
                  <p className="text-gray-400 text-sm">Revisa tus estadísticas</p>
                </div>
              </button>

              <button className="w-full bg-[#3c4043] p-4 rounded-xl hover:bg-[#4a4d50] transition-colors flex items-center">
                <MessageCircle className="text-yellow-400 mr-3" size={24} />
                <div className="text-left">
                  <h3 className="text-white font-medium">Feedback del Asistente</h3>
                  <p className="text-gray-400 text-sm">Mejora la comunicación</p>
                </div>
              </button>

              <button
                onClick={() => setActiveSection("main")}
                className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg text-white transition-colors"
              >
                Volver
              </button>
            </div>
          )}

          {showInterview && (
            <div className="space-y-4">
              <div className="bg-[#3c4043] p-4 rounded-xl">
                <div className="flex items-center mb-4">
                  <Brain className="text-blue-400 mr-3" size={24} />
                  <span className="text-gray-400 text-sm">
                    Pregunta {currentQuestion + 1} de {interviewQuestions.length}
                  </span>
                </div>

                <h3 className="text-white text-lg mb-4 leading-relaxed">{interviewQuestions[currentQuestion]}</h3>

                <div className="space-y-2">
                  {currentQuestion === 0 && (
                    <>
                      <button
                        onClick={() => handleResponse("Ser más productivo")}
                        className="w-full bg-[#2d2e30] hover:bg-[#4a4d50] p-3 rounded-lg text-left text-white transition-colors"
                        disabled={saving}
                      >
                        Ser más productivo
                      </button>
                      <button
                        onClick={() => handleResponse("Mantener mejor organización")}
                        className="w-full bg-[#2d2e30] hover:bg-[#4a4d50] p-3 rounded-lg text-left text-white transition-colors"
                        disabled={saving}
                      >
                        Mantener mejor organización
                      </button>
                      <button
                        onClick={() => handleResponse("Equilibrar trabajo y vida personal")}
                        className="w-full bg-[#2d2e30] hover:bg-[#4a4d50] p-3 rounded-lg text-left text-white transition-colors"
                        disabled={saving}
                      >
                        Equilibrar trabajo y vida personal
                      </button>
                    </>
                  )}

                  {currentQuestion >= 1 && (
                    <>
                      <button
                        onClick={() => handleResponse("Opción A")}
                        className="w-full bg-[#2d2e30] hover:bg-[#4a4d50] p-3 rounded-lg text-left text-white transition-colors"
                        disabled={saving}
                      >
                        Opción A
                      </button>
                      <button
                        onClick={() => handleResponse("Opción B")}
                        className="w-full bg-[#2d2e30] hover:bg-[#4a4d50] p-3 rounded-lg text-left text-white transition-colors"
                        disabled={saving}
                      >
                        Opción B
                      </button>
                      <button
                        onClick={() => handleResponse("Opción C")}
                        className="w-full bg-[#2d2e30] hover:bg-[#4a4d50] p-3 rounded-lg text-left text-white transition-colors"
                        disabled={saving}
                      >
                        Opción C
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-[#2d2e30] rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / interviewQuestions.length) * 100}%` }}
                ></div>
              </div>

              {saving && <p className="text-gray-400 text-center text-sm">Guardando perfil...</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}