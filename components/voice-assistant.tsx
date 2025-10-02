"use client"

import { useEffect, useState } from "react"
import { Mic } from "lucide-react"

interface VoiceAssistantProps {
  onStartListening: () => void
  onStopListening: () => void
  isListening: boolean
  onLongPress?: () => void
  status?: 'idle' | 'listening' | 'processing' | 'speaking'
}

export function VoiceAssistant({ 
  onStartListening, 
  onStopListening, 
  isListening, 
  onLongPress,
  status = 'idle'
}: VoiceAssistantProps) {
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null)

  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      if (onLongPress) {
        onLongPress()
      }
    }, 2000)
    setPressTimer(timer)
  }

  const handleMouseUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer)
      setPressTimer(null)
    }
  }

  const handleClick = () => {
    if (isListening) {
      onStopListening()
    } else {
      onStartListening()
    }
  }

  useEffect(() => {
    return () => {
      if (pressTimer) {
        clearTimeout(pressTimer)
      }
    }
  }, [pressTimer])

  const getAnimationClass = () => {
    switch (status) {
      case 'listening':
        return 'animate-pulse-listening'
      case 'processing':
        return 'animate-pulse-processing'
      case 'speaking':
        return 'animate-pulse-speaking'
      default:
        return 'hover:scale-105'
    }
  }

  const getGlowColor = () => {
    switch (status) {
      case 'listening':
        return 'shadow-blue-500/50'
      case 'processing':
        return 'shadow-purple-500/50'
      case 'speaking':
        return 'shadow-green-500/50'
      default:
        return 'shadow-purple-500/20'
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        className={`relative w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl ${getGlowColor()} transition-all duration-300 ${getAnimationClass()}`}
        style={{
          boxShadow: status !== 'idle' 
            ? `0 0 ${status === 'listening' ? '40px' : status === 'processing' ? '30px' : '35px'} rgba(168, 85, 247, 0.4)`
            : undefined
        }}
      >
        <Mic size={48} className="text-white" />
        
        {/* Ondas de audio para listening */}
        {status === 'listening' && (
          <>
            <div className="absolute w-36 h-36 rounded-full border-2 border-blue-400 animate-ping-slow opacity-50"></div>
            <div className="absolute w-40 h-40 rounded-full border-2 border-blue-300 animate-ping-slower opacity-30"></div>
          </>
        )}

        {/* Ondas de procesamiento */}
        {status === 'processing' && (
          <>
            <div className="absolute w-36 h-36 rounded-full border-2 border-purple-400 animate-spin-slow opacity-50"></div>
            <div className="absolute w-32 h-32 rounded-full border-2 border-purple-300 animate-spin-slower opacity-30"></div>
          </>
        )}

        {/* Ondas de habla */}
        {status === 'speaking' && (
          <>
            <div className="absolute w-36 h-36 rounded-full border-2 border-green-400 animate-pulse opacity-50"></div>
            <div className="absolute w-40 h-40 rounded-full border-2 border-green-300 animate-pulse-delay opacity-30"></div>
          </>
        )}
      </button>

      <style jsx>{`
        @keyframes pulse-listening {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }

        @keyframes pulse-processing {
          0%, 100% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.03) rotate(180deg);
          }
        }

        @keyframes pulse-speaking {
          0%, 100% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.05);
          }
          50% {
            transform: scale(0.98);
          }
          75% {
            transform: scale(1.05);
          }
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        @keyframes ping-slower {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-slower {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes pulse-delay {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.5;
          }
        }

        .animate-pulse-listening {
          animation: pulse-listening 1.5s ease-in-out infinite;
        }

        .animate-pulse-processing {
          animation: pulse-processing 2s ease-in-out infinite;
        }

        .animate-pulse-speaking {
          animation: pulse-speaking 0.8s ease-in-out infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-ping-slower {
          animation: ping-slower 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-spin-slower {
          animation: spin-slower 4s linear infinite;
        }

        .animate-pulse-delay {
          animation: pulse-delay 1.5s ease-in-out infinite 0.3s;
        }
      `}</style>
    </>
  )
}