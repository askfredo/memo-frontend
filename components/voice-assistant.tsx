"use client"

import { useEffect, useState } from "react"

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

  return (
    <>
      <button
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        className="relative w-40 h-40 rounded-full focus:outline-none"
      >
        {/* Fondo base */}
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
          status === 'idle' ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30' :
          status === 'listening' ? 'bg-gradient-to-br from-blue-500/40 to-cyan-500/40' :
          status === 'processing' ? 'bg-gradient-to-br from-purple-500/40 to-pink-500/40' :
          'bg-gradient-to-br from-green-500/40 to-emerald-500/40'
        }`}></div>

        {/* Ondas animadas */}
        {status === 'listening' && (
          <>
            <div className="wave-ring wave-1"></div>
            <div className="wave-ring wave-2"></div>
            <div className="wave-ring wave-3"></div>
          </>
        )}

        {status === 'speaking' && (
          <>
            <div className="speak-ring speak-1"></div>
            <div className="speak-ring speak-2"></div>
            <div className="speak-ring speak-3"></div>
          </>
        )}

        {/* Círculo central */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-24 h-24 rounded-full backdrop-blur-xl transition-all duration-300 ${
            status === 'idle' ? 'bg-white/10 scale-100' :
            status === 'listening' ? 'bg-blue-500/20 scale-110' :
            status === 'processing' ? 'bg-purple-500/20 scale-105 animate-pulse' :
            'bg-green-500/20 scale-110'
          }`}>
            <div className="w-full h-full rounded-full flex items-center justify-center">
              {/* Punto central */}
              <div className={`rounded-full transition-all duration-300 ${
                status === 'idle' ? 'w-4 h-4 bg-white/60' :
                status === 'listening' ? 'w-5 h-5 bg-blue-400 animate-pulse' :
                status === 'processing' ? 'w-4 h-4 bg-purple-400 animate-spin-slow' :
                'w-5 h-5 bg-green-400'
              }`}></div>
            </div>
          </div>
        </div>
      </button>

      <style jsx>{`
        @keyframes wave-expand {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .wave-ring {
          position: absolute;
          inset: -20px;
          border: 2px solid rgba(59, 130, 246, 0.5);
          border-radius: 50%;
          animation: wave-expand 2s ease-out infinite;
        }

        .wave-1 {
          animation-delay: 0s;
        }

        .wave-2 {
          animation-delay: 0.5s;
        }

        .wave-3 {
          animation-delay: 1s;
        }

        @keyframes speak-pulse {
          0%, 100% {
            transform: scale(0.95);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.3;
          }
        }

        .speak-ring {
          position: absolute;
          inset: -10px;
          border: 3px solid rgba(34, 197, 94, 0.4);
          border-radius: 50%;
          animation: speak-pulse 1.5s ease-in-out infinite;
        }

        .speak-1 {
          animation-delay: 0s;
        }

        .speak-2 {
          animation-delay: 0.3s;
        }

        .speak-3 {
          animation-delay: 0.6s;
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>
    </>
  )
}