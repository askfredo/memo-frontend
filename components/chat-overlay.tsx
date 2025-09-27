"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"

interface Message {
  id: string
  sender: "user" | "assistant"
  text: string
}

interface ChatOverlayProps {
  isOpen: boolean
  onClose: () => void
  isListening: boolean
  onStopListening: () => void
}

export function ChatOverlay({ isOpen, onClose, isListening, onStopListening }: ChatOverlayProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [showActions, setShowActions] = useState(false)
  const [currentNote, setCurrentNote] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addMessage("assistant", "Hola, ¿en qué puedo ayudarte?")
    }
  }, [isOpen])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const addMessage = (sender: "user" | "assistant", text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender,
      text,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const processVoiceInput = async (text: string) => {
    addMessage("user", text)
    setIsProcessing(true)

    try {
      const result = await api.createNote(text)
      
      let response: string
      
      if (result.event) {
  // Si se creó un evento (calendar_event, social_event o reminder)
  const eventDate = new Date(result.event.start_datetime).toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
  response = `${result.classification.emoji || '📅'} Evento creado para ${eventDate}: "${result.event.title}"`;
  
  if (result.classification.entities.participants?.length > 0) {
    response += ` | Participantes: ${result.classification.entities.participants.join(', ')}`;
  }
  setCurrentNote(result)
  setShowActions(true)
} else if (result.classification.intent === 'simple_note') {
        response = `Detecté un evento: "${result.event.title}". Se ha guardado en tu calendario.`
        if (result.classification.entities.participants?.length > 0) {
          response += ` Participantes: ${result.classification.entities.participants.join(', ')}.`
        }
        setCurrentNote(result)
        setShowActions(true)
      } else if (result.classification.intent === 'simple_note') {
        response = `Guardé tu nota: "${result.note.content}"`
        setCurrentNote(result)
      } else {
        response = `Nota guardada correctamente.`
        setCurrentNote(result)
      }

      addMessage("assistant", response)

      // Text-to-speech
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(response)
        utterance.lang = "es-ES"
        speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error('Error procesando nota:', error)
      addMessage("assistant", "Hubo un error al procesar tu nota. Intenta de nuevo.")
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (!isListening) return

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.error("Speech Recognition API no es soportada.")
      addMessage("assistant", "Tu navegador no soporta reconocimiento de voz. Puedes escribir tu nota abajo.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "es-ES"
    recognition.interimResults = false
    recognition.continuous = false

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      processVoiceInput(transcript)
      onStopListening()
    }

    recognition.onerror = (event: any) => {
      console.error("Error de reconocimiento:", event.error)
      addMessage("assistant", "Hubo un error al escucharte. Puedes escribir tu nota abajo.")
      onStopListening()
    }

    recognition.start()

    return () => {
      recognition.stop()
    }
  }, [isListening])

  const handleConfirm = () => {
    addMessage("assistant", "¡Perfecto! Todo guardado.")
    setShowActions(false)
    setCurrentNote(null)
    setTimeout(() => onClose(), 2000)
  }

  const handleCancel = async () => {
    if (currentNote?.note?.id) {
      try {
        await api.deleteNote(currentNote.note.id)
        addMessage("assistant", "Nota cancelada.")
      } catch (error) {
        console.error('Error eliminando nota:', error)
      }
    }
    setShowActions(false)
    setCurrentNote(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex flex-col items-center p-4" onClick={onClose}>
      <div className="flex-grow"></div>

      <div
        ref={chatContainerRef}
        className="w-full max-w-2xl space-y-4 mb-4 max-h-96 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-2xl max-w-xs md:max-w-md opacity-0 translate-y-5 animate-fade-in ${
              message.sender === "user" ? "bg-blue-600 ml-auto" : "bg-[#3c4043]"
            }`}
          >
            {message.text}
          </div>
        ))}
        {isProcessing && (
          <div className="bg-[#3c4043] p-3 rounded-2xl max-w-xs">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Input de texto para escribir notas */}
      <div className="w-full max-w-2xl mb-4 px-4" onClick={(e) => e.stopPropagation()}>
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement
            if (input.value.trim()) {
              processVoiceInput(input.value)
              input.value = ''
            }
          }}
          className="flex gap-2"
        >
          <input
            name="message"
            type="text"
            placeholder="Escribe tu nota aquí..."
            className="flex-1 bg-[#3c4043] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
          />
          <button type="submit" className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors">
            Enviar
          </button>
        </form>
      </div>

      {showActions && (
        <div className="flex justify-center gap-4 w-full max-w-2xl mb-24" onClick={(e) => e.stopPropagation()}>
          <Button onClick={handleConfirm} className="bg-green-500 hover:bg-green-600 text-white font-bold">
            Confirmar
          </Button>
          <Button onClick={handleCancel} className="bg-red-500 hover:bg-red-600 text-white font-bold">
            Cancelar
          </Button>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s forwards;
        }
      `}</style>
    </div>
  )
}