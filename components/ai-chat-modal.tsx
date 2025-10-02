"use client"

import { useState, useEffect, useRef } from "react"
import { X, Send, Save, MessageSquare, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

interface Message {
  id: string
  sender: "user" | "assistant"
  text: string
  timestamp: Date
}

interface AIChatModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AIChatModal({ isOpen, onClose }: AIChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addMessage("assistant", "Hola, soy tu asistente personal. Puedo ayudarte con tus notas, eventos y tareas. ¿En qué puedo ayudarte?")
    }
  }, [isOpen])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const addMessage = (sender: "user" | "assistant", text: string) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random(),
      sender,
      text,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage("")
    addMessage("user", userMessage)

    try {
      setIsLoading(true)
      const result = await api.aiChat(userMessage)
      addMessage("assistant", result.response)
    } catch (error) {
      console.error('Error:', error)
      addMessage("assistant", "Lo siento, hubo un error al procesar tu mensaje. ¿Puedes intentarlo de nuevo?")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveConversation = async () => {
    if (messages.length === 0) return

    try {
      setIsSaving(true)
      await api.saveConversation(messages)
      alert("Conversación guardada como nota")
      handleClose()
    } catch (error) {
      console.error('Error guardando conversación:', error)
      alert("Error al guardar la conversación")
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setMessages([])
    setInputMessage("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div 
        className="bg-[#2d2e30] rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-purple-400" size={20} />
            <h2 className="text-lg font-medium text-white">Asistente AI</h2>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 1 && (
              <button
                onClick={handleSaveConversation}
                disabled={isSaving}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                <span className="hidden sm:inline">Guardar</span>
              </button>
            )}
            <button onClick={handleClose} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.sender === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-[#3c4043] text-gray-100"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#3c4043] p-3 rounded-2xl">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-600">
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Pregúntame algo..."
              className="flex-1 bg-[#3c4043] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
