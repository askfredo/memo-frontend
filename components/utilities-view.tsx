"use client"

import { useState } from "react"
import { Brain, MessageCircle, User, BarChart3 } from "lucide-react"
import { api } from "@/lib/api"

export function UtilitiesView() {
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
        alert("¡Entrevista completada! Tu perfil ha sido actualizado.")
      } catch (error) {
        console.error('Error guardando perfil:', error)
        alert('Error al guardar el perfil')
      } finally {
        setSaving(false)
      }
    }
  }

  if (showInterview) {
    return (
      <div className="h-full p-4 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-gray-400">Conocerte Mejor</h2>
          <button onClick={() => setShowInterview(false)} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="bg-[#3c4043] p-6 rounded-xl mb-6">
            <div className="flex items-center mb-4">
              <Brain className="text-blue-400 mr-3" size={24} />
              <span className="text-gray-400 text-sm">
                Pregunta {currentQuestion + 1} de {interviewQuestions.length}
              </span>
            </div>

            <h3 className="text-white text-lg mb-6 leading-relaxed">{interviewQuestions[currentQuestion]}</h3>

            <div className="space-y-3">
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

              {currentQuestion === 1 && (
                <>
                  <button
                    onClick={() => handleResponse("Por la mañana temprano")}
                    className="w-full bg-[#2d2e30] hover:bg-[#4a4d50] p-3 rounded-lg text-left text-white transition-colors"
                    disabled={saving}
                  >
                    Por la mañana temprano
                  </button>
                  <button
                    onClick={() => handleResponse("Durante la tarde")}
                    className="w-full bg-[#2d2e30] hover:bg-[#4a4d50] p-3 rounded-lg text-left text-white transition-colors"
                    disabled={saving}
                  >
                    Durante la tarde
                  </button>
                  <button
                    onClick={() => handleResponse("Por la noche")}
                    className="w-full bg-[#2d2e30] hover:bg-[#4a4d50] p-3 rounded-lg text-left text-white transition-colors"
                    disabled={saving}
                  >
                    Por la noche
                  </button>
                </>
              )}

              {currentQuestion === 2 && (
                <>
                  <button
                    onClick={() => handleResponse("Notificaciones suaves")}
                    className="w-full bg-[#2d2e30] hover:bg-[#4a4d50] p-3 rounded-lg text-left text-white transition-colors"
                    disabled={saving}
                  >
                    Notificaciones suaves
                  </button>
                  <button
                    onClick={() => handleResponse("Recordatorios persistentes")}
                    className="w-full bg-[#2d2e30] hover:bg-[#4a4d50] p-3 rounded-lg text-left text-white transition-colors"
                    disabled={saving}
                  >
                    Recordatorios persistentes
                  </button>
                  <button
                    onClick={() => handleResponse("Solo recordatorios importantes")}
                    className="w-full bg-[#2d2e30] hover:bg-[#4a4d50] p-3 rounded-lg text-left text-white transition-colors"
                    disabled={saving}
                  >
                    Solo recordatorios importantes
                  </button>
                </>
              )}

              {currentQuestion >= 3 && (
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

          {saving && <p className="text-gray-400 text-center text-sm mt-4">Guardando perfil...</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full p-4">
      <h2 className="text-xl font-medium text-gray-400 mb-6">Utilities</h2>

      <div className="space-y-4">
        <button
          onClick={() => setShowInterview(true)}
          className="w-full bg-[#3c4043] p-6 rounded-xl shadow-lg hover:bg-[#4a4d50] transition-colors"
        >
          <div className="flex items-center">
            <Brain className="text-blue-400 mr-4" size={32} />
            <div className="text-left">
              <h3 className="text-white font-medium mb-1">Perfil de Usuario</h3>
              <p className="text-gray-400 text-sm">Entrevista personalizada para conocerte mejor</p>
            </div>
          </div>
        </button>

        <button className="w-full bg-[#3c4043] p-6 rounded-xl shadow-lg hover:bg-[#4a4d50] transition-colors">
          <div className="flex items-center">
            <BarChart3 className="text-green-400 mr-4" size={32} />
            <div className="text-left">
              <h3 className="text-white font-medium mb-1">Análisis de Comportamiento</h3>
              <p className="text-gray-400 text-sm">Revisa tus patrones y estadísticas</p>
            </div>
          </div>
        </button>

        <button className="w-full bg-[#3c4043] p-6 rounded-xl shadow-lg hover:bg-[#4a4d50] transition-colors">
          <div className="flex items-center">
            <User className="text-purple-400 mr-4" size={32} />
            <div className="text-left">
              <h3 className="text-white font-medium mb-1">Preferencias</h3>
              <p className="text-gray-400 text-sm">Configura tu experiencia personalizada</p>
            </div>
          </div>
        </button>

        <button className="w-full bg-[#3c4043] p-6 rounded-xl shadow-lg hover:bg-[#4a4d50] transition-colors">
          <div className="flex items-center">
            <MessageCircle className="text-yellow-400 mr-4" size={32} />
            <div className="text-left">
              <h3 className="text-white font-medium mb-1">Feedback del Asistente</h3>
              <p className="text-gray-400 text-sm">Mejora la comunicación con tu AI</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
