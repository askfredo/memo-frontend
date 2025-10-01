"use client"

import { useState, useEffect } from "react"
import { X, Lock, Plus, Trash2 } from "lucide-react"
import { api } from "@/lib/api"

interface SecretNotesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SecretNotesModal({ isOpen, onClose }: SecretNotesModalProps) {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [pin, setPin] = useState("")
  const [savedPin, setSavedPin] = useState<string | null>(null)
  const [secretNotes, setSecretNotes] = useState<any[]>([])
  const [newNote, setNewNote] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem('secret_notes_pin')
    setSavedPin(stored)
  }, [])

  useEffect(() => {
    if (isUnlocked) {
      loadSecretNotes()
    }
  }, [isUnlocked])

  const loadSecretNotes = async () => {
    try {
      const result = await api.getNotes()
      const secrets = result.notes.filter((n: any) => n.hashtags?.includes('#secreto'))
      setSecretNotes(secrets)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleUnlock = () => {
    if (!savedPin) {
      if (pin.length >= 4) {
        localStorage.setItem('secret_notes_pin', pin)
        setSavedPin(pin)
        setIsUnlocked(true)
        setError("")
      } else {
        setError("El PIN debe tener al menos 4 dígitos")
      }
    } else {
      if (pin === savedPin) {
        setIsUnlocked(true)
        setError("")
      } else {
        setError("PIN incorrecto")
      }
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    try {
      await api.createNote(newNote)
      await loadSecretNotes()
      setNewNote("")
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      await api.deleteNote(noteId)
      setSecretNotes(prev => prev.filter(n => n.id !== noteId))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#2d2e30] rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <div className="flex items-center gap-2">
            <Lock className="text-yellow-400" size={20} />
            <h2 className="text-lg font-medium text-white">Notas Secretas</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {!isUnlocked ? (
          <div className="p-6">
            <p className="text-gray-400 text-center mb-4">
              {savedPin ? "Ingresa tu PIN" : "Crea un PIN (mínimo 4 dígitos)"}
            </p>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN"
              className="w-full bg-[#3c4043] text-white p-3 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-2"
              maxLength={6}
            />
            {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}
            <button
              onClick={handleUnlock}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg"
            >
              {savedPin ? "Desbloquear" : "Crear PIN"}
            </button>
          </div>
        ) : (
          <div className="p-4 max-h-[calc(80vh-70px)] overflow-y-auto">
            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Escribe tu nota secreta... (se guardará con #secreto)"
                className="w-full bg-[#3c4043] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[80px]"
              />
              <button
                onClick={handleAddNote}
                className="w-full mt-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Agregar Nota Secreta
              </button>
            </div>

            <div className="space-y-2">
              {secretNotes.map((note) => (
                <div key={note.id} className="bg-[#3c4043] p-3 rounded-lg">
                  <p className="text-white text-sm mb-2">{note.content}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}