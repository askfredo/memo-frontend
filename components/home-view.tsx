"use client"

import { useState, useEffect, useRef } from "react"
import { VoiceAssistant } from "@/components/voice-assistant"
import { EmailConfigModal } from "@/components/email-config-modal"
import { api } from "@/lib/api"
import { StickyNote, Calendar, Camera, Save, X, Brain, Sparkles, MessageCircle } from "lucide-react"

interface ConversationMessage {
  type: 'user' | 'assistant'
  text: string
  timestamp: Date
}

interface FloatingIcon {
  id: string
  icon: 'brain' | 'sparkles' | 'message'
  x: number
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
  const [floatingIcons, setFloatingIcons] = useState<FloatingIcon[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const iconIntervalRef = useRef<NodeJS.Timeout | null>(null)

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

  const spawnFloatingIcon = () => {
    const icons: Array<'brain' | 'sparkles' | 'message'> = ['brain', 'sparkles', 'message'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    const randomX = Math.random() * 80 + 10;
    
    const newIcon: FloatingIcon = {
      id: Date.now().toString() + Math.random(),
      icon: randomIcon,
      x: randomX
    };

    setFloatingIcons(prev => [...prev, newIcon]);

    setTimeout(() => {
      setFloatingIcons(prev => prev.filter(icon => icon.id !== newIcon.id));
    }, 3000);
  };

  const stopFloatingIcons = () => {
    if (iconIntervalRef.current) {
      clearInterval(iconIntervalRef.current);
      iconIntervalRef.current = null;
    }
  };

  const startFloatingIcons = () => {
    stopFloatingIcons();
    iconIntervalRef.current = setInterval(() => {
      spawnFloatingIcon();
    }, 400);
  };

  const addMessage = (type: 'user' | 'assistant', text: string) => {
    if (!text || text.trim() === '') return; // Evitar mensajes vacíos
    
    setConversationMessages(prev => [...prev, {
      type,
      text: text.trim(),
      timestamp: new Date()
    }])
  }

  const playNativeAudio = (audioData: string, mimeType: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔊 Reproduciendo audio nativo...');
        
        const binaryString = atob(audioData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: mimeType });
        const url = URL.createObjectURL(blob);

        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onplay = () => {
          console.log('▶️ Audio iniciado');
          setAssistantStatus('speaking');
          startFloatingIcons();
        };

        audio.onended = () => {
          console.log('⏹️ Audio finalizado');
          setAssistantStatus('idle');
          stopFloatingIcons();
          URL.revokeObjectURL(url);
          setTimeout(() => {
            setIsListening(true);
            setAssistantStatus('listening');
          }, 500);
          resolve();
        };

        audio.onerror = (e) => {
          console.error('❌ Error reproduciendo audio:', e);
          setAssistantStatus('idle');
          stopFloatingIcons();
          URL.revokeObjectURL(url);
          reject(new Error('Error reproduciendo audio'));
        };

        audio.play().catch(err => {
          console.error('❌ Error en play():', err);
          reject(err);
        });
      } catch (error) {
        console.error('❌ Error creando audio:', error);
        setAssistantStatus('idle');
        stopFloatingIcons();
        reject(error);
      }
    });
  };

  const processVoiceInput = async (text: string) => {
    try {
      console.log('🎤 Procesando:', text);
      setAssistantStatus('processing')
      addMessage('user', text)

      const response = await fetch('https://memo-backend-production.up.railway.app/api/assistant/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          conversationHistory: conversationMessages,
          useNativeVoice: true
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json()
      console.log('📦 Resultado:', result);

      if (result.type === 'conversation') {
        if (!result.response || result.response.trim() === '') {
          throw new Error('Respuesta vacía del servidor');
        }

        addMessage('assistant', result.response)
        
        // Si tiene audio nativo
        if (result.hasNativeAudio && result.audioData) {
          console.log('🎵 Audio nativo disponible');
          try {
            await playNativeAudio(result.audioData, result.audioMimeType);
          } catch (audioError) {
            console.error('⚠️ Fallback a TTS del navegador:', audioError);
            // Fallback a TTS tradicional
            fallbackToTTS(result.response);
          }
        } else {
          console.log('🔤 Usando TTS del navegador');
          fallbackToTTS(result.response);
        }

        if (result.shouldOfferSave) {
          setTimeout(() => {
            setShowSavePrompt(true);
          }, 2000);
        }
      } else if (result.type === 'event_created') {
        setFeedbackType('calendar')
        playCalendarSound()
        addMessage('assistant', result.response)
        setShowFeedback(true)
        setTimeout(() => {
          setShowFeedback(false)
          setAssistantStatus('idle')
          setTimeout(() => {
            setIsListening(true)
            setAssistantStatus('listening')
          }, 500)
        }, 1500)
      } else if (result.type === 'conversation_saved') {
        setConversationMessages([])
        setShowSavePrompt(false)
        addMessage('assistant', result.response)
        setFeedbackType('note')
        playNoteSound()
        setShowFeedback(true)
        setTimeout(() => {
          setShowFeedback(false)
          setAssistantStatus('idle')
          setConversationMessages([])
        }, 1500)
      } else {
        setFeedbackType('note')
        playNoteSound()
        addMessage('assistant', result.response || 'Nota guardada')
        setShowFeedback(true)
        setTimeout(() => {
          setShowFeedback(false)
          setAssistantStatus('idle')
          setTimeout(() => {
            setIsListening(true)
            setAssistantStatus('listening')
          }, 500)
        }, 1500)
      }
    } catch (error) {
      console.error('❌ Error procesando voz:', error)
      addMessage('assistant', 'Lo siento, hubo un error. Intenta de nuevo.')
      setAssistantStatus('idle')
      stopFloatingIcons()
      // Reactivar después de error
      setTimeout(() => {
        setIsListening(true)
        setAssistantStatus('listening')
      }, 1500)
    }
  }

  const fallbackToTTS = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.rate = 1.1;
      
      utterance.onstart = () => {
        setAssistantStatus('speaking');
        startFloatingIcons();
      };
      
      utterance.onend = () => {
        setAssistantStatus('idle');
        stopFloatingIcons();
        setTimeout(() => {
          setIsListening(true);
          setAssistantStatus('listening');
        }, 500);
      };

      utterance.onerror = () => {
        setAssistantStatus('idle');
        stopFloatingIcons();
      };
      
      speechSynthesis.speak(utterance);
    } else {
      setAssistantStatus('idle');
      stopFloatingIcons();
    }
  };

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
      console.log('📝 Transcrito:', transcript);
      processVoiceInput(transcript)
      setIsListening(false)
    }

    recognition.onerror = (event: any) => {
      console.error("❌ Error recognition:", event.error)
      setIsListening(false)
      setAssistantStatus('idle')
    }

    recognition.start()

    return () => {
      recognition.stop()
    }
  }, [isListening])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stopFloatingIcons()
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Iconos flotantes animados */}
      {floatingIcons.map((icon) => (
        <div
          key={icon.id}
          className="floating-icon"
          style={{ left: `${icon.x}%` }}
        >
          {icon.icon === 'brain' && <Brain size={24} className="text-purple-400" />}
          {icon.icon === 'sparkles' && <Sparkles size={24} className="text-yellow-400" />}
          {icon.icon === 'message' && <MessageCircle size={24} className="text-blue-400" />}
        </div>
      ))}

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

        {/* Conversación */}
        {conversationMessages.length > 0 && (
          <div className="w-full max-w-2xl mt-6">
            <div className="space-y-3 flex flex-col-reverse max-h-80 overflow-y-auto px-4 custom-scrollbar">
              {[...conversationMessages].reverse().map((msg, idx) => (
                <div
                  key={conversationMessages.length - 1 - idx}
                  className={`message-slide-up ${
                    msg.type === 'user' 
                      ? 'text-blue-300 text-right' 
                      : 'text-gray-200 text-left'
                  }`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
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

        {/* Prompt para guardar conversación */}
        {showSavePrompt && (
          <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 bg-[#2d2e30] rounded-xl p-4 shadow-2xl z-50 flex gap-3 bounce-in">
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

      {/* Botón flotante de cámara */}
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
        className="fixed bottom-24 right-4 bg-purple-500 p-4 rounded-full shadow-lg hover:bg-purple-600 transition-colors disabled:opacity-50 z-40"
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
        
        .animate-ping-scale {
          animation: ping-scale 1.5s ease-out;
        }

        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-100px) scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-200px) scale(0.8);
            opacity: 0;
          }
        }

        .floating-icon {
          position: fixed;
          bottom: 50%;
          animation: float-up 3s ease-out forwards;
          pointer-events: none;
          z-index: 30;
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-slide-up {
          animation: slide-up 0.4s ease-out forwards;
          opacity: 0;
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

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2d2e30;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a4d50;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #5a5d60;
        }
      `}</style>
    </div>
  )
}