"use client"

import { useState } from "react"
import { VoiceAssistant } from "@/components/voice-assistant"
import { ChatOverlay } from "@/components/chat-overlay"
import { UtilitiesMenu } from "@/components/utilities-menu"

export function HomeView() {
  const [showChat, setShowChat] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showUtilitiesMenu, setShowUtilitiesMenu] = useState(false)

  const playConfirmationSound = () => {
    // Crear un sonido de confirmación simple
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // Frecuencia del sonido
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 relative">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">MemoVoz</h1>
        <p className="text-gray-400">Tu asistente de recordatorios</p>
      </div>

      <VoiceAssistant
        onStartListening={() => {
          playConfirmationSound()
          setShowChat(true)
          setIsListening(true)
        }}
        onStopListening={() => setIsListening(false)}
        isListening={isListening}
        onLongPress={() => setShowUtilitiesMenu(true)}
      />

      <div className="mt-8 text-center">
        <p className="text-gray-400 text-sm">Toca el asistente para comenzar</p>
        <p className="text-gray-400 text-xs mt-1">Mantén presionado para opciones</p>
      </div>

      <ChatOverlay
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        isListening={isListening}
        onStopListening={() => setIsListening(false)}
      />

      <UtilitiesMenu isOpen={showUtilitiesMenu} onClose={() => setShowUtilitiesMenu(false)} />
    </div>
  )
}