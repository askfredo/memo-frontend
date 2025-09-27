"use client"

import { useState } from "react"
import { VoiceAssistant } from "@/components/voice-assistant"
import { ChatOverlay } from "@/components/chat-overlay"
import { UtilitiesMenu } from "@/components/utilities-menu"

export function HomeView() {
  const [showChat, setShowChat] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showUtilitiesMenu, setShowUtilitiesMenu] = useState(false)

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 relative">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">MemoVoz</h1>
        <p className="text-gray-400">Tu asistente de recordatorios</p>
      </div>

      <VoiceAssistant
        onStartListening={() => {
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
