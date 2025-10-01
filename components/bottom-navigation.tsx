"use client"

import type { ViewType } from "@/app/page"
import { StickyNote, Home, Calendar } from "lucide-react"

interface BottomNavigationProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

export function BottomNavigation({ currentView, onViewChange }: BottomNavigationProps) {
  const navItems = [
    { id: "notes" as ViewType, icon: StickyNote, label: "Notas" },
    { id: "home" as ViewType, icon: Home, label: "Home" },
    { id: "calendar" as ViewType, icon: Calendar, label: "Calendario" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#2d2e30] h-16 flex items-center justify-around z-50">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = currentView === item.id

        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`p-3 transition-colors ${isActive ? "text-blue-400" : "text-gray-400"}`}
          >
            <Icon size={20} />
          </button>
        )
      })}
    </nav>
  )
}