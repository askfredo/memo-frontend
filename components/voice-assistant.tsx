"use client"

import { useEffect, useState } from "react"

interface VoiceAssistantProps {
  onStartListening: () => void
  onStopListening: () => void
  isListening: boolean
  onLongPress?: () => void
  status?: "idle" | "listening" | "processing" | "speaking"
}

export function VoiceAssistant({
  onStartListening,
  onStopListening,
  isListening,
  onLongPress,
  status = "idle",
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
        className="relative w-64 h-64 flex items-center justify-center focus:outline-none group"
      >
        {/* Glow Background */}
        <div
          className={`absolute inset-0 rounded-full blur-3xl transition-all duration-1000 ${
            status === "idle"
              ? "bg-gradient-to-br from-blue-500/20 via-red-500/15 to-yellow-500/20 scale-90"
              : status === "listening"
                ? "bg-gradient-to-br from-blue-500/40 via-red-500/30 to-yellow-500/40 scale-100 animate-breathe"
                : status === "processing"
                  ? "bg-gradient-to-br from-blue-500/40 via-green-500/30 to-yellow-500/40 scale-95 animate-pulse-gentle"
                  : "bg-gradient-to-br from-green-500/40 via-blue-500/30 to-red-500/40 scale-100 animate-breathe"
          }`}
        ></div>

        {/* Ripple Effects */}
        {(status === "listening" || status === "speaking") && (
          <>
            <div className="absolute inset-0 rounded-full border border-white/20 animate-ripple-1"></div>
            <div className="absolute inset-0 rounded-full border border-white/10 animate-ripple-2"></div>
            <div className="absolute inset-0 rounded-full border border-white/5 animate-ripple-3"></div>
          </>
        )}

        {/* Main Orb Container */}
        <div className="relative z-10 w-48 h-48 rounded-full flex items-center justify-center transition-all duration-700 group-hover:scale-105">
          <div className="absolute inset-0 rounded-full backdrop-blur-xl bg-zinc-900/40 border border-white/20 shadow-2xl"></div>

          {/* Inner Gradient Glow */}
          <div
            className={`absolute inset-6 rounded-full transition-all duration-1000 ${
              status === "idle"
                ? "bg-gradient-to-br from-blue-500/60 via-red-500/50 to-yellow-500/60"
                : status === "listening"
                  ? "bg-gradient-to-br from-blue-500/80 via-red-500/70 to-yellow-500/80 animate-gradient-shift"
                  : status === "processing"
                    ? "bg-gradient-to-br from-blue-500/80 via-green-500/70 to-yellow-500/80 animate-gradient-rotate"
                    : "bg-gradient-to-br from-green-500/80 via-blue-500/70 to-red-500/80 animate-gradient-shift"
            } blur-xl`}
          ></div>

          {/* Center Circle with States */}
          <div className="relative z-20 w-32 h-32 rounded-full bg-zinc-900/60 backdrop-blur-2xl border border-white/30 flex items-center justify-center shadow-inner">
            {status === "idle" && (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 via-red-400 to-yellow-400 shadow-lg animate-float"></div>
            )}

            {status === "listening" && (
              <div className="flex items-center justify-center gap-1.5">
                <div className="w-2 h-10 bg-gradient-to-t from-blue-400 to-blue-500 rounded-full animate-wave-organic-1 shadow-lg shadow-blue-500/50"></div>
                <div className="w-2 h-16 bg-gradient-to-t from-red-400 to-red-500 rounded-full animate-wave-organic-2 shadow-lg shadow-red-500/50"></div>
                <div className="w-2 h-8 bg-gradient-to-t from-yellow-400 to-yellow-500 rounded-full animate-wave-organic-3 shadow-lg shadow-yellow-500/50"></div>
                <div className="w-2 h-14 bg-gradient-to-t from-green-400 to-green-500 rounded-full animate-wave-organic-4 shadow-lg shadow-green-500/50"></div>
                <div className="w-2 h-10 bg-gradient-to-t from-blue-400 to-blue-500 rounded-full animate-wave-organic-5 shadow-lg shadow-blue-500/50"></div>
              </div>
            )}

            {status === "processing" && (
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin-smooth shadow-lg shadow-blue-500/50"></div>
                <div className="absolute inset-2 rounded-full border-4 border-red-500/30 border-t-red-500 animate-spin-smooth-reverse shadow-lg shadow-red-500/50"></div>
              </div>
            )}

            {status === "speaking" && (
              <div className="flex items-center justify-center gap-1.5">
                <div className="w-2 h-12 bg-gradient-to-t from-green-400 to-green-500 rounded-full animate-speak-organic-1 shadow-lg shadow-green-500/50"></div>
                <div className="w-2 h-18 bg-gradient-to-t from-blue-400 to-blue-500 rounded-full animate-speak-organic-2 shadow-lg shadow-blue-500/50"></div>
                <div className="w-2 h-10 bg-gradient-to-t from-green-400 to-green-500 rounded-full animate-speak-organic-3 shadow-lg shadow-green-500/50"></div>
                <div className="w-2 h-16 bg-gradient-to-t from-blue-400 to-blue-500 rounded-full animate-speak-organic-4 shadow-lg shadow-blue-500/50"></div>
                <div className="w-2 h-12 bg-gradient-to-t from-green-400 to-green-500 rounded-full animate-speak-organic-5 shadow-lg shadow-green-500/50"></div>
              </div>
            )}
          </div>
        </div>

        {/* Status Text */}
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <p className="text-white/90 text-base font-normal tracking-wide transition-all duration-500">
            {status === "idle" && "Toca para comenzar"}
            {status === "listening" && "Te escucho..."}
            {status === "processing" && "Procesando..."}
            {status === "speaking" && "Respondiendo..."}
          </p>
        </div>
      </button>

      <style jsx>{`
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }

        .animate-breathe {
          animation: breathe 4s ease-in-out infinite;
        }

        @keyframes pulse-gentle {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.9;
          }
        }

        .animate-pulse-gentle {
          animation: pulse-gentle 2s ease-in-out infinite;
        }

        @keyframes ripple {
          0% {
            transform: scale(0.95);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }

        .animate-ripple-1 {
          animation: ripple 3s ease-out infinite;
        }

        .animate-ripple-2 {
          animation: ripple 3s ease-out infinite 1s;
        }

        .animate-ripple-3 {
          animation: ripple 3s ease-out infinite 2s;
        }

        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }

        @keyframes gradient-rotate {
          0% {
            filter: hue-rotate(0deg);
          }
          100% {
            filter: hue-rotate(360deg);
          }
        }

        .animate-gradient-rotate {
          animation: gradient-rotate 4s linear infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-4px) scale(1.02);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes wave-organic {
          0%, 100% {
            transform: scaleY(0.4);
            opacity: 0.7;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        .animate-wave-organic-1 {
          animation: wave-organic 1.2s ease-in-out infinite;
        }

        .animate-wave-organic-2 {
          animation: wave-organic 1.2s ease-in-out infinite 0.15s;
        }

        .animate-wave-organic-3 {
          animation: wave-organic 1.2s ease-in-out infinite 0.3s;
        }

        .animate-wave-organic-4 {
          animation: wave-organic 1.2s ease-in-out infinite 0.45s;
        }

        .animate-wave-organic-5 {
          animation: wave-organic 1.2s ease-in-out infinite 0.6s;
        }

        @keyframes speak-organic {
          0%, 100% {
            transform: scaleY(0.5);
            opacity: 0.8;
          }
          25% {
            transform: scaleY(1);
            opacity: 1;
          }
          50% {
            transform: scaleY(0.7);
            opacity: 0.9;
          }
          75% {
            transform: scaleY(0.9);
            opacity: 1;
          }
        }

        .animate-speak-organic-1 {
          animation: speak-organic 0.8s ease-in-out infinite;
        }

        .animate-speak-organic-2 {
          animation: speak-organic 0.8s ease-in-out infinite 0.1s;
        }

        .animate-speak-organic-3 {
          animation: speak-organic 0.8s ease-in-out infinite 0.2s;
        }

        .animate-speak-organic-4 {
          animation: speak-organic 0.8s ease-in-out infinite 0.3s;
        }

        .animate-speak-organic-5 {
          animation: speak-organic 0.8s ease-in-out infinite 0.4s;
        }

        @keyframes spin-smooth {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .animate-spin-smooth {
          animation: spin-smooth 2s linear infinite;
        }

        .animate-spin-smooth-reverse {
          animation: spin-smooth 1.5s linear infinite reverse;
        }
      `}</style>
    </>
  )
}