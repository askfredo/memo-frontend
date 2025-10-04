"use client"

import { useState, useEffect } from "react"
import { StickyNote, Home, Calendar, Bell } from "lucide-react"
import { api } from "@/lib/api"

type ViewType = "notes" | "home" | "calendar"

interface BottomNavigationProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  onNotificationClick?: () => void
}

export function BottomNavigation({ 
  currentView, 
  onViewChange,
  onNotificationClick
}: BottomNavigationProps) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadUnreadCount()
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadUnreadCount = async () => {
    try {
      const result = await api.getUnreadNotificationsCount()
      setUnreadCount(result.count || 0)
    } catch (error) {
      console.error('Error cargando contador:', error)
    }
  }

  const navItems: Array<{ id: ViewType; icon: any; label: string }> = [
    { id: "notes", icon: StickyNote, label: "Notas" },
    { id: "home", icon: Home, label: "Home" },
    { id: "calendar", icon: Calendar, label: "Calendario" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#2d2e30] h-16 flex items-center justify-around z-50 border-t border-gray-700/50">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = currentView === item.id

        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`p-3 transition-colors relative ${isActive ? "text-blue-400" : "text-gray-400 hover:text-gray-300"}`}
          >
            <Icon size={22} />
          </button>
        )
      })}
      
      <button
        onClick={onNotificationClick}
        className="p-3 text-gray-400 hover:text-gray-300 transition-colors relative"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </nav>
  )
}