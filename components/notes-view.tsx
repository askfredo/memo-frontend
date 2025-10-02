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
    <div className="h-full p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium text-gray-400">Notas</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSecretNotes(true)}
            className={`${
              secretNotesUnlocked 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-yellow-500 hover:bg-yellow-600'
            } text-black p-2 rounded-full transition-colors`}
            title="Notas Secretas"
          >
            {secretNotesUnlocked ? <LockOpen size={20} /> : <Lock size={20} />}
          </button>
          <button
            onClick={handleCreateNote}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors"
            title="Nueva Nota"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Hash size={16} className="text-gray-400" />
          <span className="text-gray-400 text-sm">Filtrar por tema:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedHashtag(null)}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              !selectedHashtag ? "bg-blue-500 text-white" : "bg-[#3c4043] text-gray-300 hover:bg-[#4a4d50]"
            }`}
          >
            Todos
          </button>
          {allHashtags.map((hashtag) => (
            <button
              key={hashtag}
              onClick={() => setSelectedHashtag(hashtag)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                selectedHashtag === hashtag ? "bg-blue-500 text-white" : "bg-[#3c4043] text-gray-300 hover:bg-[#4a4d50]"
              }`}
            >
              {hashtag}
            </button>
          ))}
        </div>
      </div>

      {sortedNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p>No hay notas todavía</p>
          <p className="text-sm mt-2">Usa el botón + para crear una</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto">
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

      <p className="text-white mb-2 pr-8">
        {note.ai_classification?.emoji || ''} {note.content}
      </p>
      
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {mainHashtag && (
            <span className="text-xs bg-[#2d2e30] text-blue-300 px-2 py-1 rounded-full">
              {mainHashtag}
            </span>
          )}
          <span className="text-xs text-gray-500">
            {formatDate(note.created_at)}
          </span>
        </div>
        
        {note.is_favorite && <Star className="text-yellow-400 fill-current" size={16} />}
      </div>
    </div>
  )
}