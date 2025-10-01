"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { api } from "@/lib/api"

interface NotificationBellProps {
  onClick: () => void
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadUnreadCount()
    
    // Actualizar cada 30 segundos
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadUnreadCount = async () => {
    try {
      const result = await api.getUnreadNotificationsCount()
      setUnreadCount(result.count || 0)
    } catch (error) {
      console.error('Error cargando contador de notificaciones:', error)
    }
  }

  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-[#3c4043] rounded-lg transition-colors"
    >
      <Bell size={20} className="text-gray-400" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}
