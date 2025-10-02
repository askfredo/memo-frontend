"use client"

import { useState, useEffect, useRef } from "react"
import { VoiceAssistant } from "@/components/voice-assistant"
import { EmailConfigModal } from "@/components/email-config-modal"
import { AIChatModal } from "@/components/ai-chat-modal"
import { api } from "@/lib/api"
import { StickyNote, Calendar, Camera, MessageSquare, Save } from "lucide-react"

interface ConversationMessage {
  type: 'user' | 'assistant'
  text: string
  timestamp: Date
}

export function HomeView() {
  const [isListening, setIsListening] = useState(false)
  const [showEmailConfig, setShowEmailConfig] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'note' | 'calendar'>('note')
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Nuevos estados para modo conversacional
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([])
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null)
  const [showSaveButton, setShowSaveButton] = useState(false)

  const playNoteSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 523;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);

    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.value = 659;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + 0.2);
    }, 100);
  }

  const playCalendarSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const frequencies = [784, 523, 659];
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      }, index * 80);
    });
  }

  const addMessage = (type: 'user' | 'assistant', text: string) => {
    setConversationMessages(prev => [...prev, {
      type,
      text,
      timestamp: new Date()
    }])
  }

  const resetInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
    }
    
    const timer = setTimeout(() => {
      if (conversationMessages.length > 0) {
        setShowSaveButton(true)
      }
    }, 10000) // 10 segundos de inactividad
    
    setInactivityTimer(timer)
  }

  const processVoiceInput = async (text: string) => {
    try {
      addMessage('user', text)
      resetInactivityTimer()

      const response = await fetch('https://memo-backend-production.up.railway.app/api/assistant/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      })

      const result = await response.json()

      if (result.type === 'conversation') {
        // Es una respación - mostrar respuesta
        addMessage('assistant', result.response)
        
        // Text to speech
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(result.response)
          utterance.lang = "es-ES"
          utterance.rate = 1.1
          speechSynthesis.speak(utterance)
        }
      } else if (result.type === 'event_created') {
        setFeedbackType('calendar')
        playCalendarSound()
        addMessage('assistant', result.response)
        setShowFeedback(true)
        setTimeout(() => setShowFeedback(false), 1500)
      } else {
        setFeedbackType('note')
        playNoteSound()
        addMessage('assistant', result.response)
        setShowFeedback(true)
        setTimeout(() => setShowFeedback(false), 1500)
      }

      resetInactivityTimer()
    } catch (error) {
      console.error('Error procesando voz:', error)
      addMessage('assistant', 'Lo siento, hubo un error.')
    }
  }

  const handleSaveConversation = async () => {
    try {
      const formattedMessages = conversationMessages.map(msg => ({
        sender: msg.type,
        text: msg.text
      }))

      await api.saveConversation(formattedMessages)
      
      setConversationMessages([])
      setShowSaveButton(false)
      alert('Conversación guardada como nota')
    } catch (error) {
      console.error('Error guardando conversación:', error)
    }
  }

  const handleClearConversation = () => {
    setConversationMessages([])
    setShowSaveButton(false)
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessingImage(true)

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result?.toString().split(',')[1]
      if (!base64) return

      try {
        const result = await api.createNoteFromImage(base64)
        
        if (result.type === 'event') {
          setFeedbackType('calendar')
          playCalendarSound()
        } else {
          setFeedbackType('note')
          playNoteSound()
        }

        setShowFeedback(true)
        setTimeout(() => setShowFeedback(false), 1500)
      } catch (error) {
        console.error('Error procesando imagen:', error)
      } finally {
        setIsProcessingImage(false)
      }
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (!isListening) return

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.error("Speech Recognition no soportado")
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "es-ES"
    recognition.interimResults = false
    recognition.continuous = false

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      processVoiceInput(transcript)
      setIsListening(false)
    }

    recognition.onerror = (event: any) => {
      console.error("Error:", event.error)
      setIsListening(false)
    }

    recognition.start()

    return () => {
      recognition.stop()
    }
  }, [isListening])

  return (
    <div className="h-full flex flex-col relative">
      <div className="text-center pt-8 pb-4">
        <h1 className="text-3xl font-bold text-white mb-2">MemoVoz</h1>
        <p className="text-gray-400">Tu asistente de recordatorios</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="relative mb-4">
          <VoiceAssistant
            onStartListening={() => setIsListening(true)}
            onStopListening={() => setIsListening(false)}
            isListening={isListening}
            onLongPress={() => setShowEmailConfig(true)}
          />

          {showFeedback && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`animate-ping-scale ${feedbackType === 'note' ? 'text-yellow-400' : 'text-green-400'}`}>
                {feedbackType === 'note' ? (
                  <StickyNote size={60} strokeWidth={2} />
                ) : (
                  <Calendar size={60} strokeWidth={2} />
                )}
              </div>
            </div>
          )}

          {isListening && (
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-max">
              <p className="text-blue-400 text-lg font-medium">Escuchando...</p>
            </div>
          )}
        </div>

        {/* Conversación */}
        {conversationMessages.length > 0 && (
          <div className="w-full max-w-2xl bg-[#2d2e30] rounded-xl p-4 max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {conversationMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`text-sm ${
                    msg.type === 'user' 
                      ? 'text-blue-300 text-right' 
                      : 'text-gray-200 text-left'
                  }`}
                >
                  <span className="font-semibold">
                    {msg.type === 'user' ? 'Tú: ' : 'AI: '}
                  </span>
                  {msg.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón guardar conversación */}
        {showSaveButton && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSaveConversation}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Save size={18} />
              Guardar conversación
            </button>
            <button
              onClick={handleClearConversation}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              Limpiar
            </button>
          </div>
        )}
      </div>

      {/* Botones flotantes */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageUpload}
        className="hidden"
      />
      
      <div className="fixed bottom-24 right-4 flex flex-col gap-3 z-40">
        <button
          onClick={() => setShowAIChat(true)}
          className="bg-purple-500 p-4 rounded-full shadow-lg hover:bg-purple-600 transition-colors"
          title="Chat con AI"
        >
          <MessageSquare size={24} className="text-white" />
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessingImage}
          className="bg-purple-500 p-4 rounded-full shadow-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
          title="Subir imagen"
        >
          <Camera size={24} className="text-white" />
        </button>
      </div>

      {isProcessingImage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-white">Analizando imagen...</p>
          </div>
        </div>
      )}

      <EmailConfigModal 
        isOpen={showEmailConfig} 
        onClose={() => setShowEmailConfig(false)} 
      />

      <AIChatModal 
        isOpen={showAIChat} 
        onClose={() => setShowAIChat(false)} 
      />

      <style jsx>{`
        @keyframes ping-scale {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.7;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        .animate-ping-scale {
          animation: ping-scale 1.5s ease-out;
        }
      `}</style>
    </div>
  )
}