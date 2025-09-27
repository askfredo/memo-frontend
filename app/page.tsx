"use client"

import { useState } from "react"
import { NotesView } from "@/components/notes-view"
import { HomeView } from "@/components/home-view"
import { CalendarView } from "@/components/calendar-view"
import { FriendsView } from "@/components/friends-view"
import { BottomNavigation } from "@/components/bottom-navigation"

export type ViewType = "notes" | "home" | "calendar" | "friends"

export default function MemoVozApp() {
  const [currentView, setCurrentView] = useState<ViewType>("home")

  const renderCurrentView = () => {
    switch (currentView) {
      case "notes":
        return <NotesView />
      case "home":
        return <HomeView />
      case "calendar":
        return <CalendarView />
      case "friends":
        return <FriendsView />
      default:
        return <HomeView />
    }
  }

  return (
    <div className="min-h-screen bg-[#202124] text-[#e8eaed] flex flex-col">
      <main className="flex-1 overflow-hidden pb-20">{renderCurrentView()}</main>
      <BottomNavigation currentView={currentView} onViewChange={setCurrentView} />
    </div>
  )
}
