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
        className="relative w-56 h-56 flex items-center justify-center focus:outline-none group"
      >
        {/* Anillo exterior pulsante */}
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
          status === 'idle' ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10' :
          status === 'listening' ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 animate-pulse-slow' :
          status === 'processing' ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 animate-pulse-slow' :
          'bg-gradient-to-br from-green-500/20 to-emerald-500/20 animate-pulse-slow'
        }`}></div>

        {/* Ondas expansivas para listening */}
        {status === 'listening' && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-ping-slow"></div>
            <div className="absolute inset-0 rounded-full border-2 border-blue-400/20 animate-ping-slower"></div>
          </>
        )}

        {/* Ondas para speaking */}
        {status === 'speaking' && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-green-400/30 animate-pulse-ring"></div>
            <div className="absolute inset-0 rounded-full border-2 border-green-400/20 animate-pulse-ring-delayed"></div>
          </>
        )}

        {/* Círculo principal con blur */}
        <div className="relative z-10 w-44 h-44 rounded-full backdrop-blur-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-105">
          {/* Gradiente interior */}
          <div className={`absolute inset-4 rounded-full transition-all duration-500 ${
            status === 'idle' ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20' :
            status === 'listening' ? 'bg-gradient-to-br from-blue-500/30 to-cyan-500/30' :
            status === 'processing' ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30' :
            'bg-gradient-to-br from-green-500/30 to-emerald-500/30'
          }`}></div>

          {/* Círculo central con icono */}
          <div className="relative z-20 w-28 h-28 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-inner">
            {status === 'idle' && (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 shadow-lg"></div>
            )}
            
            {status === 'listening' && (
              <div className="flex items-center justify-center gap-1">
                <div className="w-1.5 h-8 bg-blue-400 rounded-full animate-wave-1"></div>
                <div className="w-1.5 h-12 bg-blue-400 rounded-full animate-wave-2"></div>
                <div className="w-1.5 h-6 bg-blue-400 rounded-full animate-wave-3"></div>
                <div className="w-1.5 h-10 bg-blue-400 rounded-full animate-wave-4"></div>
                <div className="w-1.5 h-8 bg-blue-400 rounded-full animate-wave-5"></div>
              </div>
            )}

            {status === 'processing' && (
              <div className="w-12 h-12 rounded-full border-4 border-purple-400 border-t-transparent animate-spin"></div>
            )}

            {status === 'speaking' && (
              <div className="flex items-center justify-center gap-1">
                <div className="w-1.5 h-10 bg-green-400 rounded-full animate-speak-1"></div>
                <div className="w-1.5 h-14 bg-green-400 rounded-full animate-speak-2"></div>
                <div className="w-1.5 h-8 bg-green-400 rounded-full animate-speak-3"></div>
                <div className="w-1.5 h-12 bg-green-400 rounded-full animate-speak-4"></div>
                <div className="w-1.5 h-10 bg-green-400 rounded-full animate-speak-5"></div>
              </div>
            )}
          </div>
        </div>

        {/* Texto de estado */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <p className="text-white/60 text-sm font-light tracking-wide">
            {status === 'idle' && 'Toca para hablar'}
            {status === 'listening' && 'Escuchando...'}
            {status === 'processing' && 'Pensando...'}
            {status === 'speaking' && 'Hablando...'}
          </p>
        </div>
      </button>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
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

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
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

        .animate-ping-slower {
          animation: ping-slower 2.5s cubic-bezier(0, 0, 0.2, 1) infinite 0.5s;
        }

        @keyframes pulse-ring {
          0%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.2;
          }
        }

        .animate-pulse-ring {
          animation: pulse-ring 1.5s ease-in-out infinite;
        }

        .animate-pulse-ring-delayed {
          animation: pulse-ring 1.5s ease-in-out infinite 0.3s;
        }

        @keyframes wave {
          0%, 100% {
            transform: scaleY(0.5);
          }
          50% {
            transform: scaleY(1);
          }
        }

        .animate-wave-1 {
          animation: wave 0.8s ease-in-out infinite;
        }

        .animate-wave-2 {
          animation: wave 0.8s ease-in-out infinite 0.1s;
        }

        .animate-wave-3 {
          animation: wave 0.8s ease-in-out infinite 0.2s;
        }

        .animate-wave-4 {
          animation: wave 0.8s ease-in-out infinite 0.3s;
        }

        .animate-wave-5 {
          animation: wave 0.8s ease-in-out infinite 0.4s;
        }

        @keyframes speak {
          0%, 100% {
            transform: scaleY(0.6);
          }
          25% {
            transform: scaleY(1);
          }
          75% {
            transform: scaleY(0.8);
          }
        }

        .animate-speak-1 {
          animation: speak 0.6s ease-in-out infinite;
        }

        .animate-speak-2 {
          animation: speak 0.6s ease-in-out infinite 0.1s;
        }

        .animate-speak-3 {
          animation: speak 0.6s ease-in-out infinite 0.2s;
        }

        .animate-speak-4 {
          animation: speak 0.6s ease-in-out infinite 0.3s;
        }

        .animate-speak-5 {
          animation: speak 0.6s ease-in-out infinite 0.4s;
        }
      `}</style>
    </>
  )
}