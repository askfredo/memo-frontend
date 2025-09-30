"use client"

import { useState } from "react"
import { Star, Edit, Check } from "lucide-react"

interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

interface ChecklistNoteCardProps {
  note: any
  onSwipe: (noteId: string, direction: "left" | "right") => void
  onEdit: (note: any) => void
  onUpdateChecklist: (noteId: string, items: ChecklistItem[]) => void
}

export function ChecklistNoteCard({ note, onSwipe, onEdit, onUpdateChecklist }: ChecklistNoteCardProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  
  const parseChecklistItems = (content: string): ChecklistItem[] => {
    const lines = content.split('\n').filter(line => line.trim().startsWith('•'))
    return lines.map((line, index) => ({
      id: `${note.id}-${index}`,
      text: line.replace('•', '').trim(),
      completed: false
    }))
  }

  const [items, setItems] = useState<ChecklistItem[]>(
    note.checklist_data ? JSON.parse(note.checklist_data) : parseChecklistItems(note.content)
  )

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
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      onSwipe(note.id, "left")
    } else if (isRightSwipe) {
      onSwipe(note.id, "right")
    }
  }

  const toggleItem = (itemId: string) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    )
    setItems(updatedItems)
    onUpdateChecklist(note.id, updatedItems)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  const mainHashtag = note.hashtags.length > 0 ? note.hashtags[0] : null
  const completedCount = items.filter(i => i.completed).length

  return (
    <div
      className={`note p-4 rounded-xl shadow-lg cursor-grab bg-[#3c4043] relative transition-all ${
        note.is_favorite ? "border-l-4 border-yellow-400" : ""
      }`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <button
        onClick={() => onEdit(note)}
        className="absolute top-2 right-2 bg-[#2d2e30] hover:bg-[#4a4d50] p-2 rounded-lg transition-colors z-10"
      >
        <Edit size={14} className="text-gray-400" />
      </button>

      {note.image_data && (
        <div className="mb-3 rounded-lg overflow-hidden">
          <img 
            src={`data:image/jpeg;base64,${note.image_data}`}
            alt="Nota"
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      <div className="space-y-2 mb-3 pr-8">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#4a4d50] transition-colors"
            onClick={() => toggleItem(item.id)}
          >
            <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              item.completed 
                ? 'bg-green-500 border-green-500' 
                : 'border-gray-400'
            }`}>
              {item.completed && <Check size={14} className="text-white" />}
            </div>
            <span className={`text-white flex-1 ${item.completed ? 'line-through opacity-60' : ''}`}>
              {item.text}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-600">
        <div className="flex items-center gap-2">
          {mainHashtag && (
            <span className="text-xs bg-[#2d2e30] text-blue-300 px-2 py-1 rounded-full">
              {mainHashtag}
            </span>
          )}
          <span className="text-xs text-gray-500">
            {completedCount}/{items.length} completado
          </span>
          <span className="text-xs text-gray-500">
            {formatDate(note.created_at)}
          </span>
        </div>
        
        {note.is_favorite && <Star className="text-yellow-400 fill-current" size={16} />}
      </div>
    </div>
  )
}