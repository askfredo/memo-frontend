"use client"

import { useState, useEffect, useRef } from "react"
import { VoiceAssistant } from "@/components/voice-assistant"
import { UtilitiesMenu } from "@/components/utilities-menu"
import { api } from "@/lib/api"

export function HomeView() {
  const [isListening, setIsListening] = useState(false)
  const [showUtilitiesMenu, setShowUtilitiesMenu] = useState(false)

  const playConfirmSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 1000;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  }

  const processVoiceInput = async (text: string) => {
    try {
      await api.createNote(text)
      playConfirmSound()
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

      <VoiceAssistant
        onStartListening={() => setIsListening(true)}
        onStopListening={() => setIsListening(false)}
        isListening={isListening}
        onLongPress={() => setShowUtilitiesMenu(true)}
      />

      {isListening && (
        <div className="mt-8 text-center">
          <p className="text-blue-400 text-lg font-medium">Escuchando...</p>
        </div>
      )}

      <UtilitiesMenu isOpen={showUtilitiesMenu} onClose={() => setShowUtilitiesMenu(false)} />
    </div>
  )
}