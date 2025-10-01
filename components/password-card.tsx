"use client"

import { Star, Eye, EyeOff, Copy, Edit, Trash2 } from "lucide-react"

interface PasswordCardProps {
  password: {
    id: string
    title: string
    username?: string
    email?: string
    category: string
    icon: string
    is_favorite: boolean
  }
  onEdit: (password: any) => void
  onDelete: (passwordId: string) => void
  onToggleFavorite: (passwordId: string, isFavorite: boolean) => void
}

export function PasswordCard({ password, onEdit, onDelete, onToggleFavorite }: PasswordCardProps) {
  return (
    <div className="bg-[#3c4043] p-4 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{password.icon}</span>
          <h3 className="text-white font-medium">{password.title}</h3>
        </div>
        <button onClick={() => onToggleFavorite(password.id, password.is_favorite)}>
          <Star size={18} className={password.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'} />
        </button>
      </div>

      {password.username && (
        <div className="mb-2">
          <span className="text-gray-400 text-xs">Usuario: </span>
          <span className="text-white text-sm">{password.username}</span>
        </div>
      )}

      {password.email && (
        <div className="mb-2">
          <span className="text-gray-400 text-xs">Email: </span>
          <span className="text-white text-sm">{password.email}</span>
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <button onClick={() => onEdit(password)} className="text-blue-400 text-sm">
          Editar
        </button>
        <button onClick={() => onDelete(password.id)} className="text-red-400 text-sm">
          Eliminar
        </button>
      </div>
    </div>
  )
}