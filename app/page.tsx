"use client"

import { useState } from "react"
import { NotesView } from "@/components/notes-view"
import { HomeView } from "@/components/home-view"
import { CalendarView } from "@/components/calendar-view"
import { BottomNavigation } from "@/components/bottom-navigation"
import { NotificationsPanel } from "@/components/notifications-panel"

export type ViewType = "notes" | "home" | "calendar"

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
      default:
        return <HomeView />
    }
  }

  return (
    <div className="min-h-screen bg-[#202124] text-[#e8eaed] flex flex-col">
      <main className="flex-1 overflow-hidden pb-20">{renderCurrentView()}</main>
      
      <BottomNavigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onNotificationClick={() => setShowNotifications(true)}
      />
      
      <NotificationsPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </div>
  )
}