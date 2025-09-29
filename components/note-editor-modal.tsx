"use client"

import { useState, useEffect } from "react"
import { X, Save } from "lucide-react"

interface NoteEditorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (content: string, hashtags: string[]) => void
  initialContent?: string
  initialHashtags?: string[]
  title: string
}

export function NoteEditorModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialContent = "", 
  initialHashtags = [],
  title 
}: NoteEditorModalProps) {
  const [content, setContent] = useState(initialContent)
  const [hashtagInput, setHashtagInput] = useState("")
  const [hashtags, setHashtags] = useState<string[]>(initialHashtags)

  useEffect(() => {
    setContent(initialContent)
    setHashtags(initialHashtags)
  }, [initialContent, initialHashtags])

  const handleAddHashtag = () => {
    if (hashtagInput.trim() && !hashtags.includes(`#${hashtagInput.trim()}`)) {
      const newTag = hashtagInput.startsWith('#') ? hashtagInput.trim() : `#${hashtagInput.trim()}`
      setHashtags([...hashtags, newTag])
      setHashtagInput("")
    }
  }

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter(h => h !== tag))
  }

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim(), hashtags)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#2d2e30] rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <h2 className="text-lg font-medium text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Contenido</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe tu nota aquí..."
              className="w-full bg-[#3c4043] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-y"
              autoFocus
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Hashtags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddHashtag()}
                placeholder="#etiqueta"
                className="flex-1 bg-[#3c4043] text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddHashtag}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#3c4043] text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveHashtag(tag)}
                    className="text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-600 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
              content.trim()
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Save size={18} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}