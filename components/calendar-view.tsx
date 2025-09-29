"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { api } from "@/lib/api"

interface Event {
  id: string
  title: string
  description?: string
  start_datetime: string
  location?: string
  color: string
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedDayEvents, setSelectedDayEvents] = useState<Event[]>([])

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ]

  useEffect(() => {
    loadEvents()
  }, [currentDate])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      
      const result = await api.getEvents(
        startDate.toISOString(),
        endDate.toISOString()
      )
      setEvents(result.events || [])
    } catch (error) {
      console.error('Error cargando eventos:', error)
    } finally {
      setLoading(false)
    }
  }

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(currentDate.getMonth() - 1)
    } else {
      newDate.setMonth(currentDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
    setSelectedDay(null)
  }

  const getDayEvents = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    
    return events.filter((event) => {
      if (!event.start_datetime) return false;
      
      const eventDate = new Date(event.start_datetime);
      const eventDateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, "0")}-${String(eventDate.getDate()).padStart(2, "0")}`;
      
      return eventDateStr === dateStr;
    });
  }

  const handleDayClick = (day: number) => {
    const dayEvents = getDayEvents(day)
    setSelectedDay(day)
    setSelectedDayEvents(dayEvents)
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await api.deleteEvent(eventId)
      setEvents(prev => prev.filter(e => e.id !== eventId))
      setSelectedDayEvents(prev => prev.filter(e => e.id !== eventId))
    } catch (error) {
      console.error('Error eliminando evento:', error)
    }
  }

  const isAllDayEvent = (datetime: string) => {
    const date = new Date(datetime);
    return date.getUTCHours() === 0 && date.getUTCMinutes() === 0;
  }

  const getEventTime = (datetime: string) => {
    if (isAllDayEvent(datetime)) {
      return 'Todo el día';
    }
    const date = new Date(datetime);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="h-full p-4 relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-gray-400">Calendario</h2>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigateMonth("prev")} className="p-2 hover:bg-[#3c4043] rounded-lg">
          <ChevronLeft size={20} className="text-gray-400" />
        </button>
        <h3 className="text-lg font-medium text-white">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button onClick={() => navigateMonth("next")} className="p-2 hover:bg-[#3c4043] rounded-lg">
          <ChevronRight size={20} className="text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {["D", "L", "M", "M", "J", "V", "S"].map((day, idx) => (
          <div key={`${day}-${idx}`} className="text-center text-gray-400 text-sm p-2 font-medium">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <div key={`empty-${i}`} className="p-2"></div>
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const dayEvents = getDayEvents(day)
          const isToday =
            new Date().getDate() === day &&
            new Date().getMonth() === currentDate.getMonth() &&
            new Date().getFullYear() === currentDate.getFullYear()
          const isSelected = selectedDay === day

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`p-2 text-center relative rounded-lg transition-colors cursor-pointer hover:bg-[#3c4043] ${
                isToday ? "bg-blue-500" : ""
              } ${isSelected ? "ring-2 ring-yellow-400" : ""}`}
            >
              <span className={`text-sm ${isToday ? "text-white font-bold" : "text-gray-300"}`}>{day}</span>
              {dayEvents.length > 0 && (
                <div className="flex justify-center mt-1">
                  <span className="text-xs">
                    {dayEvents[0].title.match(/^[\p{Emoji}]/u)?.[0] || '📅'}
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {selectedDay && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4">
          <div className="bg-[#2d2e30] rounded-t-2xl w-full max-w-lg max-h-[70vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <h3 className="text-lg text-white font-medium">
                {selectedDay} de {monthNames[currentDate.getMonth()]}
              </h3>
              <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(70vh-80px)]">
              {selectedDayEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay eventos este día</p>
              ) : (
                <div className="space-y-3">
                  {selectedDayEvents.map((event) => (
                    <EventCard key={event.id} event={event} onDelete={handleDeleteEvent} getEventTime={getEventTime} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <h4 className="text-gray-400 text-sm font-medium mb-3">Próximos eventos</h4>
        {loading ? (
          <p className="text-gray-500 text-sm">Cargando eventos...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay eventos este mes</p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {events.slice(0, 3).map((event) => (
              <EventItem 
                key={event.id} 
                event={event} 
                onDelete={handleDeleteEvent}
                getEventTime={getEventTime}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface EventCardProps {
  event: Event;
  onDelete: (eventId: string) => void;
  getEventTime: (datetime: string) => string;
}

function EventCard({ event, onDelete, getEventTime }: EventCardProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    
    if (isLeftSwipe) {
      onDelete(event.id)
    }
  }

  return (
    <div 
      className="bg-[#3c4043] p-4 rounded-lg cursor-grab active:cursor-grabbing"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="text-white font-medium">{event.title}</h4>
          {event.description && (
            <p className="text-gray-400 text-sm mt-1">{event.description}</p>
          )}
        </div>
        <div className={`w-3 h-3 rounded-full bg-${event.color || 'blue'}-500 ml-3`}></div>
      </div>
      <div className="flex items-center text-gray-400 text-xs space-x-3">
        <span>🕒 {getEventTime(event.start_datetime)}</span>
        {event.location && <span>📍 {event.location}</span>}
      </div>
    </div>
  )
}

interface EventItemProps {
  event: Event;
  onDelete: (eventId: string) => void;
  getEventTime: (datetime: string) => string;
}

function EventItem({ event, onDelete, getEventTime }: EventItemProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    
    if (isLeftSwipe) {
      onDelete(event.id)
    }
  }

  return (
    <div 
      className="bg-[#3c4043] p-3 rounded-lg flex items-center cursor-grab active:cursor-grabbing"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className={`w-3 h-3 rounded-full bg-${event.color || 'blue'}-500 mr-3`}></div>
      <div className="flex-1">
        <p className="text-white text-sm font-medium">{event.title}</p>
        <p className="text-gray-400 text-xs">{getEventTime(event.start_datetime)}</p>
      </div>
    </div>
  )
}