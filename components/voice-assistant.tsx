"use client"

import { useEffect, useState } from "react"

interface VoiceAssistantProps {
  onStartListening: () => void
  onStopListening: () => void
  isListening: boolean
  onLongPress?: () => void
  status?: "idle" | "listening" | "processing" | "speaking"
  theme?: "google" | "siri" | "samantha"
}

const themeConfig = {
  google: {
    idle: {
      glow: "bg-gradient-to-br from-blue-500/20 via-red-500/15 to-yellow-500/20",
      orb: "bg-gradient-to-br from-blue-500/60 via-red-500/50 to-yellow-500/60",
      center: "bg-gradient-to-br from-blue-400 via-red-400 to-yellow-400",
    },
    listening: {
      glow: "bg-gradient-to-br from-blue-500/40 via-red-500/30 to-yellow-500/40",
      orb: "bg-gradient-to-br from-blue-500/80 via-red-500/70 to-yellow-500/80",
      bars: [
        "from-blue-400 to-blue-500 shadow-blue-500/50",
        "from-red-400 to-red-500 shadow-red-500/50",
        "from-yellow-400 to-yellow-500 shadow-yellow-500/50",
        "from-green-400 to-green-500 shadow-green-500/50",
        "from-blue-400 to-blue-500 shadow-blue-500/50",
      ],
    },
    processing: {
      glow: "bg-gradient-to-br from-blue-500/40 via-green-500/30 to-yellow-500/40",
      orb: "bg-gradient-to-br from-blue-500/80 via-green-500/70 to-yellow-500/80",
      spinner: [
        "border-blue-500/30 border-t-blue-500 shadow-blue-500/50",
        "border-red-500/30 border-t-red-500 shadow-red-500/50",
      ],
    },
    speaking: {
      glow: "bg-gradient-to-br from-green-500/40 via-blue-500/30 to-red-500/40",
      orb: "bg-gradient-to-br from-green-500/80 via-blue-500/70 to-red-500/80",
      bars: [
        "from-green-400 to-green-500 shadow-green-500/50",
        "from-blue-400 to-blue-500 shadow-blue-500/50",
        "from-green-400 to-green-500 shadow-green-500/50",
        "from-blue-400 to-blue-500 shadow-blue-500/50",
        "from-green-400 to-green-500 shadow-green-500/50",
      ],
    },
    backdrop: "bg-zinc-900/40 border-white/20",
    center: "bg-zinc-900/60 border-white/30",
    text: "text-white",
    textGradient: "from-white via-white/80 to-transparent",
    background: "bg-black",
  },
  siri: {
    idle: {
      glow: "bg-gradient-to-br from-blue-400/30 via-purple-400/25 to-cyan-400/30",
      orb: "bg-gradient-to-br from-blue-500/70 via-purple-500/60 to-cyan-500/70",
      center: "bg-gradient-to-br from-blue-400 via-purple-400 to-cyan-400",
    },
    listening: {
      glow: "bg-gradient-to-br from-blue-400/50 via-purple-400/40 to-cyan-400/50",
      orb: "bg-gradient-to-br from-blue-500/90 via-purple-500/80 to-cyan-500/90",
      bars: [
        "from-blue-400 to-blue-500 shadow-blue-500/50",
        "from-purple-400 to-purple-500 shadow-purple-500/50",
        "from-cyan-400 to-cyan-500 shadow-cyan-500/50",
        "from-blue-400 to-blue-500 shadow-blue-500/50",
        "from-purple-400 to-purple-500 shadow-purple-500/50",
      ],
    },
    processing: {
      glow: "bg-gradient-to-br from-blue-400/50 via-indigo-400/40 to-purple-400/50",
      orb: "bg-gradient-to-br from-blue-500/90 via-indigo-500/80 to-purple-500/90",
      spinner: [
        "border-blue-500/30 border-t-blue-500 shadow-blue-500/50",
        "border-purple-500/30 border-t-purple-500 shadow-purple-500/50",
      ],
    },
    speaking: {
      glow: "bg-gradient-to-br from-cyan-400/50 via-blue-400/40 to-purple-400/50",
      orb: "bg-gradient-to-br from-cyan-500/90 via-blue-500/80 to-purple-500/90",
      bars: [
        "from-cyan-400 to-cyan-500 shadow-cyan-500/50",
        "from-blue-400 to-blue-500 shadow-blue-500/50",
        "from-cyan-400 to-cyan-500 shadow-cyan-500/50",
        "from-blue-400 to-blue-500 shadow-blue-500/50",
        "from-purple-400 to-purple-500 shadow-purple-500/50",
      ],
    },
    backdrop: "bg-white/40 border-blue-200/40",
    center: "bg-white/60 border-blue-300/50",
    text: "text-blue-600",
    textGradient: "from-blue-600 via-blue-500/80 to-transparent",
    background: "bg-gradient-to-b from-slate-50 to-blue-50",
  },
  samantha: {
    idle: {
      glow: "bg-gradient-to-br from-rose-400/30 via-orange-400/25 to-amber-400/30",
      orb: "bg-gradient-to-br from-rose-500/70 via-orange-500/60 to-amber-500/70",
      center: "bg-gradient-to-br from-rose-400 via-orange-400 to-amber-400",
    },
    listening: {
      glow: "bg-gradient-to-br from-rose-400/50 via-orange-400/40 to-amber-400/50",
      orb: "bg-gradient-to-br from-rose-500/90 via-orange-500/80 to-amber-500/90",
      bars: [
        "from-rose-400 to-rose-500 shadow-rose-500/50",
        "from-orange-400 to-orange-500 shadow-orange-500/50",
        "from-amber-400 to-amber-500 shadow-amber-500/50",
        "from-rose-400 to-rose-500 shadow-rose-500/50",
        "from-orange-400 to-orange-500 shadow-orange-500/50",
      ],
    },
    processing: {
      glow: "bg-gradient-to-br from-rose-400/50 via-pink-400/40 to-orange-400/50",
      orb: "bg-gradient-to-br from-rose-500/90 via-pink-500/80 to-orange-500/90",
      spinner: [
        "border-rose-500/30 border-t-rose-500 shadow-rose-500/50",
        "border-orange-500/30 border-t-orange-500 shadow-orange-500/50",
      ],
    },
    speaking: {
      glow: "bg-gradient-to-br from-amber-400/50 via-orange-400/40 to-rose-400/50",
      orb: "bg-gradient-to-br from-amber-500/90 via-orange-500/80 to-rose-500/90",
      bars: [
        "from-amber-400 to-amber-500 shadow-amber-500/50",
        "from-orange-400 to-orange-500 shadow-orange-500/50",
        "from-amber-400 to-amber-500 shadow-amber-500/50",
        "from-orange-400 to-orange-500 shadow-orange-500/50",
        "from-rose-400 to-rose-500 shadow-rose-500/50",
      ],
    },
    backdrop: "bg-white/40 border-rose-200/40",
    center: "bg-white/60 border-rose-300/50",
    text: "text-rose-600",
    textGradient: "from-rose-600 via-rose-500/80 to-transparent",
    background: "bg-gradient-to-b from-rose-50 to-orange-50",
  },
}

export function VoiceAssistant({
  onStartListening,
  onStopListening,
  isListening,
  onLongPress,
  status = "idle",
  theme = "google",
}: VoiceAssistantProps) {
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null)

  const currentTheme = themeConfig[theme]

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
    <div className="flex flex-col items-center h-full">
      <button
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        className="relative w-64 h-64 flex items-center justify-center focus:outline-none group"
      >
        <div
          className={`absolute inset-0 rounded-full blur-3xl transition-all duration-1000 ${
            status === "idle"
              ? `${currentTheme.idle.glow} scale-90`
              : status === "listening"
                ? `${currentTheme.listening.glow} scale-100 animate-breathe`
                : status === "processing"
                  ? `${currentTheme.processing.glow} scale-95 animate-pulse-gentle`
                  : `${currentTheme.speaking.glow} scale-100 animate-breathe`
          }`}
        ></div>

        {(status === "listening" || status === "speaking") && (
          <>
            <div
              className={`absolute inset-0 rounded-full border ${theme === "google" ? "border-white/20" : theme === "siri" ? "border-blue-300/30" : "border-rose-300/30"} animate-ripple-1`}
            ></div>
            <div
              className={`absolute inset-0 rounded-full border ${theme === "google" ? "border-white/10" : theme === "siri" ? "border-blue-300/20" : "border-rose-300/20"} animate-ripple-2`}
            ></div>
            <div
              className={`absolute inset-0 rounded-full border ${theme === "google" ? "border-white/5" : theme === "siri" ? "border-blue-300/10" : "border-rose-300/10"} animate-ripple-3`}
            ></div>
          </>
        )}

        <div className="relative z-10 w-48 h-48 rounded-full flex items-center justify-center transition-all duration-700 group-hover:scale-105">
          <div
            className={`absolute inset-0 rounded-full backdrop-blur-xl ${currentTheme.backdrop} border shadow-2xl`}
          ></div>

          <div
            className={`absolute inset-6 rounded-full transition-all duration-1000 ${
              status === "idle"
                ? currentTheme.idle.orb
                : status === "listening"
                  ? `${currentTheme.listening.orb} animate-gradient-shift`
                  : status === "processing"
                    ? `${currentTheme.processing.orb} animate-gradient-rotate`
                    : `${currentTheme.speaking.orb} animate-gradient-shift`
            } blur-xl`}
          ></div>

          <div
            className={`relative z-20 w-32 h-32 rounded-full ${currentTheme.center} backdrop-blur-2xl border flex items-center justify-center shadow-inner`}
          >
            {status === "idle" && (
              <div className={`w-16 h-16 rounded-full ${currentTheme.idle.center} shadow-lg animate-float`}></div>
            )}

            {status === "listening" && (
              <div className="flex items-center justify-center gap-1.5">
                {currentTheme.listening.bars.map((barClass, i) => (
                  <div
                    key={i}
                    className={`w-2 ${i === 0 ? "h-10" : i === 1 ? "h-16" : i === 2 ? "h-8" : i === 3 ? "h-14" : "h-10"} bg-gradient-to-t ${barClass} rounded-full animate-wave-organic-${i + 1} shadow-lg`}
                  ></div>
                ))}
              </div>
            )}

            {status === "processing" && (
              <div className="relative w-16 h-16">
                <div
                  className={`absolute inset-0 rounded-full border-4 ${currentTheme.processing.spinner[0]} animate-spin-smooth shadow-lg`}
                ></div>
                <div
                  className={`absolute inset-2 rounded-full border-4 ${currentTheme.processing.spinner[1]} animate-spin-smooth-reverse shadow-lg`}
                ></div>
              </div>
            )}

            {status === "speaking" && (
              <div className="flex items-center justify-center gap-1.5">
                {currentTheme.speaking.bars.map((barClass, i) => (
                  <div
                    key={i}
                    className={`w-2 ${i === 0 ? "h-12" : i === 1 ? "h-18" : i === 2 ? "h-10" : i === 3 ? "h-16" : "h-12"} bg-gradient-to-t ${barClass} rounded-full animate-speak-organic-${i + 1} shadow-lg`}
                  ></div>
                ))}
              </div>
            )}
          </div>
        </div>
      </button>

      <div className="mt-4 relative flex items-start justify-center">
        <p className={`${currentTheme.text} text-lg font-medium tracking-wide transition-all duration-500 text-center`}>
          {status === "idle" && "Toca para comenzar"}
          {status === "listening" && "Te escucho..."}
          {status === "processing" && "Procesando..."}
          {status === "speaking" && "Respondiendo..."}
        </p>
      </div>

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
    </div>
  )
}