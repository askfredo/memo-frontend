"use client"

interface VoiceAssistantProps {
  onStartListening: () => void
  onStopListening: () => void
  isListening: boolean
}

export function VoiceAssistant({ onStartListening, onStopListening, isListening }: VoiceAssistantProps) {
  const handleClick = () => {
    if (isListening) {
      onStopListening()
    } else {
      onStartListening()
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`siri-orb w-20 h-20 relative cursor-pointer flex justify-center items-center ${
          isListening ? "listening" : ""
        }`}
      >
        <div className="wave absolute border-2 border-solid rounded-full animate-pulse-wave-1"></div>
        <div className="wave absolute border-2 border-solid rounded-full animate-pulse-wave-2"></div>
        <div className="wave absolute border-2 border-solid rounded-full animate-pulse-wave-3"></div>
        <div className="wave absolute border-2 border-solid rounded-full animate-pulse-wave-4"></div>
      </button>

      <style jsx>{`
        .wave {
          width: 100%;
          height: 100%;
        }
        
        .wave:nth-child(1) {
          border-color: #8ab4f8;
          animation-delay: 0s;
        }
        
        .wave:nth-child(2) {
          border-color: #f28b82;
          animation-delay: 1s;
        }
        
        .wave:nth-child(3) {
          border-color: #fdd663;
          animation-delay: 2s;
        }
        
        .wave:nth-child(4) {
          border-color: #81c995;
          animation-delay: 3s;
        }
        
        .siri-orb.listening .wave {
          animation: listen 1.2s infinite ease-in-out !important;
        }
        
        @keyframes pulse-wave {
          0%, 100% { 
            transform: scale(0.95); 
            opacity: 1; 
          }
          50% { 
            transform: scale(1.4); 
            opacity: 0; 
          }
          80% { 
            transform: scale(1.4); 
            opacity: 0; 
          }
        }
        
        @keyframes listen {
          0%, 100% { 
            transform: scale(1); 
          }
          50% { 
            transform: scale(1.2); 
          }
        }
        
        .animate-pulse-wave-1 {
          animation: pulse-wave 4s infinite;
        }
        
        .animate-pulse-wave-2 {
          animation: pulse-wave 4s infinite;
          animation-delay: 1s;
        }
        
        .animate-pulse-wave-3 {
          animation: pulse-wave 4s infinite;
          animation-delay: 2s;
        }
        
        .animate-pulse-wave-4 {
          animation: pulse-wave 4s infinite;
          animation-delay: 3s;
        }
      `}</style>
    </div>
  )
}
