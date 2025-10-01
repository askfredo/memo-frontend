"use client"

import { useState } from "react"
import { NotesView } from "@/components/notes-view"
import { HomeView } from "@/components/home-view"
import { CalendarView } from "@/components/calendar-view"
import { VaultView } from "@/components/vault-view"
import { BottomNavigation } from "@/components/bottom-navigation"
import { NotificationBell } from "@/components/notification-bell"
import { NotificationsPanel } from "@/components/notifications-panel"

export type ViewType = "notes" | "home" | "calendar" | "vault"

export default function MemoVozApp() {
  const [currentView, setCurrentView] = useState<ViewType>("home")
  const [showNotifications, setShowNotifications] = useState(false)

  const renderCurrentView = () => {
    switch (currentView) {
      case "notes":
        return <NotesView />
      case "home":
        return <HomeView />
      case "calendar":
        return <CalendarView />
      case "vault":
        return <VaultView />
      default:
        return <HomeView />
    }
  }

  return (
    <div className="min-h-screen bg-[#202124] text-[#e8eaed] flex flex-col">
      {/* Header con campana de notificaciones */}
      <header className="fixed top-0 left-0 right-0 bg-[#2d2e30] h-14 flex items-center justify-between px-4 z-40">
        <h1 className="text-lg font-semibold text-white">MemoVoz</h1>
        <NotificationBell onClick={() => setShowNotifications(true)} />
      </header>

      <main className="flex-1 overflow-hidden pb-20 pt-14">{renderCurrentView()}</main>
      
      <BottomNavigation currentView={currentView} onViewChange={setCurrentView} />
      
      <NotificationsPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </div>
  )
}