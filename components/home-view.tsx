"use client"

import { useState, useEffect, useRef } from "react"
import { VoiceAssistant } from "@/components/voice-assistant"
import { EmailConfigModal } from "@/components/email-config-modal"
import { api } from "@/lib/api"
import { StickyNote, Calendar, Camera, Save, X } from "lucide-react"

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([])
  const [showSavePrompt, setShowSavePrompt] = useState(false)
  const [assistantStatus, setAssistantStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle')

  // Para el feedback flotante
  const [showFloatingIcon, setShowFloatingIcon] = useState(false)
  const [floatingIconType, setFloatingIconType] = useState<'note' | 'calendar'>('note')

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

  const playAudioResponse = async (audioBase64: string) => {
    try {
      const audioBlob = base64ToBlob(audioBase64, 'audio/pcm');
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onplay = () => setAssistantStatus('speaking');
      audio.onended = () => {
        setAssistantStatus('idle');
        URL.revokeObjectURL(audioUrl);
        setTimeout(() => {
          setIsListening(true);
          setAssistantStatus('listening');
        }, 500);
      };
      
      await audio.play();
    } catch (error) {
      console.error('Error reproduciendo audio:', error);
      setAssistantStatus('idle');
      setTimeout(() => {
        setIsListening(true);
        setAssistantStatus('listening');
      }, 500);
    }
  }

  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    return new Blob(byteArrays, { type: mimeType });
  }

  const showFloatingFeedback = (type: 'note' | 'calendar') => {
    setFloatingIconType(type);
    setShowFloatingIcon(true);
    setTimeout(() => setShowFloatingIcon(false), 2000);
  }

  const addMessage = (type: 'user' | 'assistant', text: string) => {
    setConversationMessages(prev => [...prev, {
      type,
      text,
      timestamp: new Date()
    }])
  }

  const processVoiceInput = async (text: string) => {
    try {
      setAssistantStatus('processing')
      addMessage('user', text)

      const response = await fetch('https://memo-backend-production.up.railway.app/api/assistant/process-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          conversationHistory: conversationMessages
        })
      })

      const result = await response.json()

      if (result.type === 'conversation_saved') {
        addMessage('assistant', result.response)
        playNoteSound()
        showFloatingFeedback('note')
        
        if (result.audioData) {
          await playAudioResponse(result.audioData);
        }
        
        setTimeout(() => {
          setConversationMessages([])
          setShowSavePrompt(false)
          setAssistantStatus('idle')
        }, 2000)
      } else if (result.type === 'conversation') {
        addMessage('assistant', result.response)
        
        if (result.audioData) {
          await playAudioResponse(result.audioData);
        } else {
          setAssistantStatus('idle')
          setTimeout(() => {
            setIsListening(true)
            setAssistantStatus('listening')
          }, 500)
        }

        if (result.shouldOfferSave) {
          setTimeout(() => {
            setShowSavePrompt(true)
          }, 2000)
        }
      } else if (result.type === 'event_created') {
        playCalendarSound()
        showFloatingFeedback('calendar')
        addMessage('assistant', result.response)
        
        if (result.audioData) {
          await playAudioResponse(result.audioData);
        } else {
          setAssistantStatus('idle')
          setTimeout(() => {
            setIsListening(true)
            setAssistantStatus('listening')
          }, 500)
        }
      } else {
        playNoteSound()
        showFloatingFeedback('note')
        addMessage('assistant', result.response)
        
        if (result.audioData) {
          await playAudioResponse(result.audioData);
        } else {
          setAssistantStatus('idle')
          setTimeout(() => {
            setIsListening(true)
            setAssistantStatus('listening')
          }, 500)
        }
      }
    } catch (error) {
      console.error('Error procesando voz:', error)
      addMessage('assistant', 'Lo siento, hubo un error.')
      setAssistantStatus('idle')
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
      setShowSavePrompt(false)
      
      const tempMsg = 'Conversación guardada'
      addMessage('assistant', tempMsg)
      setTimeout(() => {
        setConversationMessages([])
      }, 2000)
    } catch (error) {
      console.error('Error guardando conversación:', error)
    }
  }

  const handleDismissSave = () => {
    setShowSavePrompt(false)
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
          playCalendarSound()
          showFloatingFeedback('calendar')
        } else {
          playNoteSound()
          showFloatingFeedback('note')
        }
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

    setAssistantStatus('listening')

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.error("Speech Recognition no soportado")
      setIsListening(false)
      setAssistantStatus('idle')
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
      setAssistantStatus('idle')
    }

    recognition.start()

    return () => {
      recognition.stop()
    }
  }, [isListening])

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      <div className="text-center pt-8 pb-4">
        <h1 className="text-3xl font-bold text-white mb-2">MemoVoz</h1>
        <p className="text-gray-400">Tu asistente de recordatorios</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="relative mb-4">
          <VoiceAssistant
            onStartListening={() => {
              if (assistantStatus === 'idle') {
                setIsListening(true)
              }
            }}
            onStopListening={() => setIsListening(false)}
            isListening={isListening}
            onLongPress={() => setShowEmailConfig(true)}
            status={assistantStatus}
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
        </div>

        {/* Icono flotante de pensamiento */}
        {showFloatingIcon && (
          <div className="absolute top-20 right-10 animate-float-up-fade">
            <div className={`bg-gradient-to-br ${floatingIconType === 'note' ? 'from-yellow-400 to-orange-500' : 'from-green-400 to-blue-500'} p-4 rounded-2xl shadow-2xl`}>
              {floatingIconType === 'note' ? (
                <StickyNote size={32} className="text-white" />
              ) : (
                <Calendar size={32} className="text-white" />
              )}
            </div>
          </div>
        )}

        {/* Conversación */}
        {conversationMessages.length > 0 && (
          <div className="w-full max-w-2xl mt-6">
            <div className="space-y-3 flex flex-col-reverse max-h-80 overflow-y-auto px-4">
              {[...conversationMessages].reverse().map((msg, idx) => (
                <div
                  key={conversationMessages.length - 1 - idx}
                  className={`animate-slide-up ${
                    msg.type === 'user' 
                      ? 'text-blue-300 text-right' 
                      : 'text-gray-200 text-left'
                  }`}
                >
                  <p className="text-sm">
                    <span className="font-semibold">
                      {msg.type === 'user' ? 'Tú: ' : 'AI: '}
                    </span>
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prompt para guardar */}
        {showSavePrompt && (
          <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 bg-[#2d2e30] rounded-xl p-4 shadow-2xl z-50 flex gap-3 animate-bounce-in">
            <button
              onClick={handleSaveConversation}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              <Save size={18} />
              Guardar conversación
            </button>
            <button
              onClick={handleDismissSave}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-all hover:scale-105"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Botón de cámara */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageUpload}
        className="hidden"
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessingImage}
        className="fixed bottom-24 right-4 bg-purple-500 p-4 rounded-full shadow-lg hover:bg-purple-600 transition-all hover:scale-110 disabled:opacity-50 z-40"
        title="Subir imagen"
      >
        <Camera size={24} className="text-white" />
      </button>

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

        @keyframes float-up-fade {
          0% {
            transform: translateY(20px) scale(0.8);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(1.2);
            opacity: 0;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes bounce-in {
          0% {
            transform: translateX(-50%) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: translateX(-50%) scale(1.05);
          }
          100% {
            transform: translateX(-50%) scale(1);
            opacity: 1;
          }
        }
        
        .animate-ping-scale {
          animation: ping-scale 1.5s ease-out;
        }

        .animate-float-up-fade {
          animation: float-up-fade 2s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
  )
}