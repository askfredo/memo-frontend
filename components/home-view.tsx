"use client"

import { useState, useEffect } from "react"
import { VoiceAssistant } from "@/components/voice-assistant"
import { UtilitiesMenu } from "@/components/utilities-menu"
import { api } from "@/lib/api"
import { StickyNote, Calendar } from "lucide-react"

export function HomeView() {
  const [isListening, setIsListening] = useState(false)
  const [showUtilitiesMenu, setShowUtilitiesMenu] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'note' | 'calendar'>('note')

  const playNoteSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Sonido suave y agradable para nota (do-mi-sol)
    oscillator.frequency.value = 523; // C5
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);

    // Segunda nota
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.value = 659; // E5
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + 0.2);
    }, 100);
  }

  const playCalendarSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Sonido de confirmación más formal para calendario (sol-do-mi)
    const frequencies = [784, 523, 659]; // G5, C5, E5
    
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

  const processVoiceInput = async (text: string) => {
    try {
      const result = await api.createNote(text)
      
      // Determinar el tipo de feedback según la clasificación
      if (result.event || result.classification?.intent === 'calendar_event' || result.classification?.intent === 'reminder') {
        setFeedbackType('calendar')
        playCalendarSound()
      } else {
        setFeedbackType('note')
        playNoteSound()
      }

      // Mostrar animación de feedback
      setShowFeedback(true)
      setTimeout(() => {
        setShowFeedback(false)
      }, 1500)

    } catch (error) {
      console.error('Error procesando nota:', error)
    }
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
    <div className="h-full flex flex-col items-center justify-center p-4 relative">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">MemoVoz</h1>
        <p className="text-gray-400">Tu asistente de recordatorios</p>
      </div>

      {/* Asistente centrado */}
      <div className="relative flex items-center justify-center">
        <VoiceAssistant
          onStartListening={() => setIsListening(true)}
          onStopListening={() => setIsListening(false)}
          isListening={isListening}
          onLongPress={() => setShowUtilitiesMenu(true)}
        />

        {/* Animación de feedback */}
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

      {isListening && (
        <div className="mt-8 text-center">
          <p className="text-blue-400 text-lg font-medium">Escuchando...</p>
        </div>
      )}

      <UtilitiesMenu isOpen={showUtilitiesMenu} onClose={() => setShowUtilitiesMenu(false)} />

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