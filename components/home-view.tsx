"use client"

import { useState, useEffect, useRef } from "react"
import { VoiceAssistant } from "@/components/voice-assistant"
import { EmailConfigModal } from "@/components/email-config-modal"
import { api } from "@/lib/api"
import { StickyNote, Calendar, Camera, Save, X } from "lucide-react"

interface ConversationMessage {
  id: string
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
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([])
  const [showSavePrompt, setShowSavePrompt] = useState(false)
  const [assistantStatus, setAssistantStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle')

  const playSound = (type: 'note' | 'event') => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const frequencies = type === 'note' ? [523, 659] : [784, 523, 659];
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      }, index * 80);
    });
  }

  const addMessage = (type: 'user' | 'assistant', text: string) => {
    if (!text || text.trim() === '') return;
    
    const newMessage: ConversationMessage = {
      id: Date.now().toString() + Math.random(),
      type,
      text: text.trim(),
      timestamp: new Date()
    }
    
    setConversationMessages(prev => [newMessage, ...prev])
    
    setTimeout(() => {
      setConversationMessages(prev => prev.slice(0, 6))
    }, 100)
  }

  // ✅ Función para reproducir audio de Gemini
  const playGeminiAudio = async (audioData: string, mimeType: string) => {
    try {
      console.log('🎵 Reproduciendo audio de Gemini:', {
        audioDataLength: audioData.length,
        mimeType: mimeType,
        first50Chars: audioData.substring(0, 50)
      });

      // Detener audio anterior si existe
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      // Convertir base64 a Blob
      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      console.log('✅ Audio convertido a bytes:', bytes.length);
      
      const blob = new Blob([bytes], { type: mimeType });
      console.log('✅ Blob creado:', blob.size, blob.type);
      
      // Crear URL del Blob
      const audioUrl = URL.createObjectURL(blob);
      console.log('✅ URL creada:', audioUrl);
      
      // Crear elemento de audio
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      
      // Configurar eventos
      audio.onplay = () => {
        console.log('▶️ Audio comenzó a reproducirse');
        setAssistantStatus('speaking');
      };
      
      audio.onended = () => {
        console.log('⏹️ Audio terminó');
        URL.revokeObjectURL(audioUrl);
        setAssistantStatus('idle');
        currentAudioRef.current = null;
        
        // Reiniciar escucha después de hablar
        setTimeout(() => {
          setIsListening(true);
          setAssistantStatus('listening');
        }, 500);
      };

      audio.onerror = (error) => {
        console.error('❌ Error reproduciendo audio:', error);
        console.error('Audio error details:', audio.error);
        URL.revokeObjectURL(audioUrl);
        setAssistantStatus('idle');
        currentAudioRef.current = null;
      };
      
      // Reproducir
      console.log('🎬 Iniciando reproducción...');
      await audio.play();
      console.log('✅ Play() ejecutado');
      
    } catch (error) {
      console.error('❌ Error en playGeminiAudio:', error);
      setAssistantStatus('idle');
    }
  };

  const processVoiceInput = async (text: string) => {
    try {
      setAssistantStatus('processing')
      addMessage('user', text)

      const response = await fetch('https://memo-backend-production.up.railway.app/api/assistant/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          conversationHistory: conversationMessages.map(m => ({ 
            type: m.type, 
            text: m.text, 
            timestamp: m.timestamp 
          })),
          useNativeVoice: true // ✅ Usar Gemini Live
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json()

      // 🔍 DEBUG: Ver qué devuelve el backend
      console.log('🎯 Respuesta del backend:', {
        type: result.type,
        hasAudioData: !!result.audioData,
        audioDataLength: result.audioData?.length || 0,
        mimeType: result.mimeType,
        responseText: result.response
      });

      // ✅ Verificar si hay audio de Gemini
      const hasGeminiAudio = result.audioData && result.mimeType;

      if (result.type === 'conversation') {
        if (!result.response || result.response.trim() === '') {
          throw new Error('Respuesta vacía del servidor');
        }

        addMessage('assistant', result.response)
        
        // ✅ Reproducir audio de Gemini
        if (hasGeminiAudio) {
          await playGeminiAudio(result.audioData, result.mimeType);
        } else {
          console.warn('⚠️ No hay audio de Gemini, backend podría no estar usando Gemini Live');
          setAssistantStatus('idle');
        }

        if (result.shouldOfferSave) {
          setTimeout(() => setShowSavePrompt(true), 2000);
        }
      } else if (result.type === 'event_created') {
        setFeedbackType('calendar')
        playSound('event')
        addMessage('assistant', result.response)
        setShowFeedback(true)
        
        setTimeout(async () => {
          setShowFeedback(false)
          if (hasGeminiAudio) {
            await playGeminiAudio(result.audioData, result.mimeType);
          } else {
            setAssistantStatus('idle');
          }
        }, 800)
        
      } else if (result.type === 'conversation_saved') {
        setConversationMessages([])
        setShowSavePrompt(false)
        addMessage('assistant', result.response)
        setFeedbackType('note')
        playSound('note')
        setShowFeedback(true)
        
        setTimeout(async () => {
          setShowFeedback(false)
          if (hasGeminiAudio) {
            await playGeminiAudio(result.audioData, result.mimeType);
          } else {
            setAssistantStatus('idle');
          }
        }, 800)
        
      } else if (result.type === 'note_created') {
        setFeedbackType('note')
        playSound('note')
        addMessage('assistant', result.response)
        setShowFeedback(true)
        
        setTimeout(async () => {
          setShowFeedback(false)
          if (hasGeminiAudio) {
            await playGeminiAudio(result.audioData, result.mimeType);
          } else {
            setAssistantStatus('idle');
          }
        }, 800)
      } else {
        setFeedbackType('note')
        playSound('note')
        addMessage('assistant', result.response || 'Listo')
        setShowFeedback(true)
        
        setTimeout(async () => {
          setShowFeedback(false)
          if (hasGeminiAudio) {
            await playGeminiAudio(result.audioData, result.mimeType);
          } else {
            setAssistantStatus('idle');
          }
        }, 800)
      }
    } catch (error) {
      console.error('❌ Error en processVoiceInput:', error)
      addMessage('assistant', 'Lo siento, hubo un error.')
      setAssistantStatus('idle')
      setTimeout(() => {
        setIsListening(true)
        setAssistantStatus('listening')
      }, 1500)
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
      
      addMessage('assistant', 'Conversación guardada')
      setTimeout(() => setConversationMessages([]), 2000)
    } catch (error) {
      console.error('Error guardando conversación:', error)
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
          playSound('event')
        } else {
          setFeedbackType('note')
          playSound('note')
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

    setAssistantStatus('listening')

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
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

    recognition.onerror = () => {
      setIsListening(false)
      setAssistantStatus('idle')
    }

    recognition.start()

    return () => {
      recognition.stop()
    }
  }, [isListening])

  // Cleanup: Detener audio al desmontar
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="h-screen flex flex-col relative bg-gradient-to-b from-gray-900 via-gray-900 to-black overflow-hidden">
      <div className="flex-1 flex flex-col items-center pt-20 px-4 overflow-y-auto overflow-x-hidden">
        <div className="relative mb-8">
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
              <div className="animate-ping-scale">
                {feedbackType === 'note' ? (
                  <StickyNote size={60} strokeWidth={1.5} className="text-yellow-400" />
                ) : (
                  <Calendar size={60} strokeWidth={1.5} className="text-green-400" />
                )}
              </div>
            </div>
          )}
        </div>

        {conversationMessages.length > 0 && (
          <div className="w-full max-w-xl mt-8 relative">
            <div className="space-y-3 px-4">
              {conversationMessages.slice(0, 6).map((msg, idx) => (
                <div
                  key={msg.id}
                  className={`message-fade-in ${
                    msg.type === 'user' ? 'text-right' : 'text-left'
                  }`}
                  style={{ 
                    animationDelay: `${idx * 0.05}s`,
                    opacity: 1 - (idx * 0.15)
                  }}
                >
                  <p className={`inline-block px-4 py-2 rounded-2xl text-sm transition-all ${
                    msg.type === 'user' 
                      ? 'bg-blue-500/20 text-blue-200' 
                      : 'bg-white/10 text-gray-200'
                  }`}>
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none"></div>
          </div>
        )}

        {showSavePrompt && (
          <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-2xl z-50 flex gap-3 bounce-in border border-white/20">
            <button
              onClick={handleSaveConversation}
              className="bg-green-500/80 hover:bg-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
            >
              <Save size={16} />
              Guardar
            </button>
            <button
              onClick={() => setShowSavePrompt(false)}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl transition-all"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

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
        className="fixed bottom-28 right-6 bg-purple-500/80 backdrop-blur-xl p-4 rounded-full shadow-lg hover:bg-purple-500 transition-all disabled:opacity-50 z-40 border border-purple-400/30"
        title="Subir imagen"
      >
        <Camera size={22} className="text-white" />
      </button>

      {isProcessingImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-white text-sm">Analizando imagen...</p>
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
        
        .animate-ping-scale {
          animation: ping-scale 1.5s ease-out;
        }

        @keyframes message-fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-fade-in {
          animation: message-fade-in 0.3s ease-out forwards;
        }

        @keyframes bounce-in {
          0% {
            transform: translate(-50%, 100px) scale(0.5);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -10px) scale(1.05);
          }
          100% {
            transform: translate(-50%, 0) scale(1);
            opacity: 1;
          }
        }

        .bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
      `}</style>
    </div>
  )
}