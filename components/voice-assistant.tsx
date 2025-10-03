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

  const getStatusColor = () => {
    switch (status) {
      case 'listening':
        return 'from-blue-500 to-cyan-500'
      case 'processing':
        return 'from-purple-500 to-pink-500'
      case 'speaking':
        return 'from-green-500 to-emerald-500'
      default:
        return 'from-purple-500 to-pink-500'
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
        className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${getStatusColor()} flex items-center justify-center shadow-2xl transition-all duration-300 overflow-hidden`}
      >
        {/* Ondas animadas estilo Siri */}
        {status === 'listening' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="siri-wave wave-1"></div>
            <div className="siri-wave wave-2"></div>
            <div className="siri-wave wave-3"></div>
            <div className="siri-wave wave-4"></div>
            <div className="siri-wave wave-5"></div>
          </div>
        )}

        {status === 'speaking' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="siri-wave-speak wave-1"></div>
            <div className="siri-wave-speak wave-2"></div>
            <div className="siri-wave-speak wave-3"></div>
            <div className="siri-wave-speak wave-4"></div>
            <div className="siri-wave-speak wave-5"></div>
          </div>
        )}

        {status === 'processing' && (
          <div className="absolute inset-0">
            <div className="processing-ring"></div>
          </div>
        )}

        {/* Círculo central */}
        <div className={`relative z-10 w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ${status !== 'idle' ? 'pulse-ring' : ''}`}>
          <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
            <div className={`w-3 h-3 rounded-full bg-white ${status === 'listening' ? 'animate-ping' : ''}`}></div>
          </div>
        </div>
      </button>

      <style jsx>{`
        @keyframes siri-wave {
          0%, 100% {
            transform: scaleY(0.5);
            opacity: 0.3;
          }
          50% {
            transform: scaleY(1.5);
            opacity: 0.8;
          }
        }

        @keyframes siri-wave-speak {
          0%, 100% {
            transform: scaleY(0.3);
            opacity: 0.4;
          }
          50% {
            transform: scaleY(1.8);
            opacity: 1;
          }
        }

        .siri-wave {
          position: absolute;
          width: 4px;
          height: 60%;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 2px;
          animation: siri-wave 1.2s ease-in-out infinite;
        }

        .siri-wave-speak {
          position: absolute;
          width: 4px;
          height: 60%;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 2px;
          animation: siri-wave-speak 0.6s ease-in-out infinite;
        }

        .wave-1 {
          left: 25%;
          animation-delay: 0s;
        }

        .wave-2 {
          left: 37.5%;
          animation-delay: 0.1s;
        }

        .wave-3 {
          left: 50%;
          animation-delay: 0.2s;
        }

        .wave-4 {
          left: 62.5%;
          animation-delay: 0.3s;
        }

        .wave-5 {
          left: 75%;
          animation-delay: 0.4s;
        }

        @keyframes processing-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .processing-ring {
          position: absolute;
          inset: 10px;
          border: 3px solid transparent;
          border-top-color: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          animation: processing-rotate 1s linear infinite;
        }

        @keyframes pulse-ring {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        .pulse-ring {
          animation: pulse-ring 2s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}