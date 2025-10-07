"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Star, Hash, Plus, Edit, Lock, LockOpen } from "lucide-react"
import { api } from "@/lib/api"
import { NoteEditorModal } from "@/components/note-editor-modal"
import { ChecklistNoteCard } from "@/components/checklist-note-card"
import { SecretNotesModal } from "@/components/secret-notes-modal"

interface Note {
  id: string
  content: string
  is_favorite: boolean
  hashtags: string[]
  ai_classification?: any
  image_data?: string
  checklist_data?: string
  created_at: string
}

export function NotesView() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [showSecretNotes, setShowSecretNotes] = useState(false)
  const [secretNotesUnlocked, setSecretNotesUnlocked] = useState(false)

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    try {
      setLoading(true)
      const result = await api.getNotes()
      const publicNotes = (result.notes || []).filter((note: Note) => 
        !note.hashtags?.includes('#secreto')
      )
      setNotes(publicNotes)
    } catch (error) {
      console.error('Error cargando notas:', error)
    } finally {
      setLoading(false)
    }
  }

  const sortedNotes = [...notes]
    .filter((note) => !selectedHashtag || note.hashtags.includes(selectedHashtag))
    .sort((a, b) => Number(b.is_favorite) - Number(a.is_favorite))

  const allHashtags = Array.from(new Set(notes.flatMap((note) => note.hashtags)))

  const handleSwipe = async (noteId: string, direction: "left" | "right") => {
    if (direction === "left") {
      try {
        await api.deleteNote(noteId)
        setNotes((prev) => prev.filter((note) => note.id !== noteId))
      } catch (error) {
        console.error('Error eliminando nota:', error)
      }
    } else if (direction === "right") {
      try {
        const note = notes.find(n => n.id === noteId)
        if (note) {
          await api.updateNote(noteId, { isFavorite: !note.is_favorite })
          setNotes((prev) => 
            prev.map((n) => 
              n.id === noteId ? { ...n, is_favorite: !n.is_favorite } : n
            )
          )
        }
      } catch (error) {
        console.error('Error actualizando nota:', error)
      }
    }
  }

  const handleCreateNote = () => {
    setEditingNote(null)
    setIsEditorOpen(true)
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setIsEditorOpen(true)
  }

  const handleSaveNote = async (content: string, hashtags: string[]) => {
    try {
      if (editingNote) {
        await api.updateNote(editingNote.id, { content, hashtags })
        setNotes((prev) =>
          prev.map((n) =>
            n.id === editingNote.id ? { ...n, content, hashtags } : n
          )
        )
      } else {
        const result = await api.createNote(content)
        if (result.note) {
          if (hashtags.length > 0) {
            await api.updateNote(result.note.id, { hashtags })
            result.note.hashtags = hashtags
          }
          setNotes((prev) => [result.note, ...prev])
        }
      }
    } catch (error) {
      console.error('Error guardando nota:', error)
    }
  }

  const handleUpdateChecklist = async (noteId: string, items: any[]) => {
    try {
      await api.updateNote(noteId, { checklistData: JSON.stringify(items) })
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, checklist_data: JSON.stringify(items) } : n
        )
      )
    } catch (error) {
      console.error('Error actualizando checklist:', error)
    }
  }

  const isChecklist = (note: Note): boolean => {
    return note.content.includes('•')
  }

  if (loading) {
    return (
      <div className="h-full p-4 flex items-center justify-center">
        <p className="text-gray-400">Cargando notas...</p>
      </div>
    )
  }

  return (
    <div className="h-full p-6 pb-20 bg-gradient-to-br from-[#1a1b1e] to-[#2d2e30]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Mis Notas</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSecretNotes(true)}
            className={`${
              secretNotesUnlocked 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                : 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700'
            } text-white p-3 rounded-xl shadow-lg transition-all transform hover:scale-105`}
            title="Notas Secretas"
          >
            {secretNotesUnlocked ? <LockOpen size={20} /> : <Lock size={20} />}
          </button>
          <button
            onClick={handleCreateNote}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-3 rounded-xl shadow-lg transition-all transform hover:scale-105"
            title="Nueva Nota"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="mb-6 bg-[#2d2e30] rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Hash size={18} className="text-blue-400" />
          <span className="text-gray-300 text-sm font-medium">Filtrar por tema</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedHashtag(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              !selectedHashtag 
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105" 
                : "bg-[#3c4043] text-gray-300 hover:bg-[#4a4d50] hover:shadow-md"
            }`}
          >
            Todos
          </button>
          {allHashtags.map((hashtag) => (
            <button
              key={hashtag}
              onClick={() => setSelectedHashtag(hashtag)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedHashtag === hashtag 
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105" 
                  : "bg-[#3c4043] text-gray-300 hover:bg-[#4a4d50] hover:shadow-md"
              }`}
            >
              {hashtag}
            </button>
          ))}
        </div>
      </div>

      {sortedNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-[#2d2e30] rounded-2xl shadow-xl">
          <p className="text-lg font-medium">No hay notas todavía</p>
          <p className="text-sm mt-2">Usa el botón + para crear una</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
          {sortedNotes.map((note) => (
            isChecklist(note) ? (
              <ChecklistNoteCard
                key={note.id}
                note={note}
                onSwipe={handleSwipe}
                onEdit={handleEditNote}
                onUpdateChecklist={handleUpdateChecklist}
              />
            ) : (
              <NoteCard 
                key={note.id} 
                note={note} 
                onSwipe={handleSwipe}
                onEdit={handleEditNote}
              />
            )
          ))}
        </div>
      )}

      <NoteEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveNote}
        initialContent={editingNote?.content || ""}
        initialHashtags={editingNote?.hashtags || []}
        title={editingNote ? "Editar Nota" : "Nueva Nota"}
      />

      <SecretNotesModal 
        isOpen={showSecretNotes} 
        onClose={() => setShowSecretNotes(false)}
        onUnlock={() => setSecretNotesUnlocked(true)}
      />
    </div>
  )
}

interface NoteCardProps {
  note: Note
  onSwipe: (noteId: string, direction: "left" | "right") => void
  onEdit: (note: Note) => void
}

function NoteCard({ note, onSwipe, onEdit }: NoteCardProps) {
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
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      onSwipe(note.id, "left")
    } else if (isRightSwipe) {
      onSwipe(note.id, "right")
    }
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

  return (
    <div
      className={`group relative bg-gradient-to-br from-[#3c4043] to-[#2d2e30] rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-grab overflow-hidden ${
        note.is_favorite ? "ring-2 ring-yellow-400" : ""
      }`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {note.is_favorite && (
        <div className="absolute top-0 right-0 w-16 h-16">
          <div className="absolute transform rotate-45 bg-gradient-to-br from-yellow-400 to-yellow-500 text-white text-xs font-bold py-1 right-[-35px] top-[20px] w-[100px] text-center shadow-lg">
            ★
          </div>
        </div>
      )}

      <button
        onClick={() => onEdit(note)}
        className="absolute top-3 right-3 bg-[#1a1b1e] hover:bg-blue-600 p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100 z-10 shadow-lg"
      >
        <Edit size={16} className="text-gray-300" />
      </button>

      {note.image_data && (
        <div className="rounded-t-2xl overflow-hidden">
          <img 
            src={`data:image/jpeg;base64,${note.image_data}`}
            alt="Nota"
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      <div className="p-5">
        <p className="text-white text-base leading-relaxed mb-3 pr-8">
          {note.ai_classification?.emoji && (
            <span className="text-2xl mr-2">{note.ai_classification.emoji}</span>
          )}
          {note.content}
        </p>
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#4a4d50]">
          <div className="flex items-center gap-2">
            {mainHashtag && (
              <span className="text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-full font-medium shadow-md">
                {mainHashtag}
              </span>
            )}
            <span className="text-xs text-gray-400 font-medium">
              {formatDate(note.created_at)}
            </span>
          </div>
          
          {note.is_favorite && (
            <Star className="text-yellow-400 fill-current animate-pulse" size={18} />
          )}
        </div>
      </div>
    </div>
  )
}