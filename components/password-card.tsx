"use client"

import { useState } from "react"
import { Star, Eye, EyeOff, Copy, Edit, Trash2, ExternalLink } from "lucide-react"
import { api } from "@/lib/api"

interface PasswordCardProps {
  password: {
    id: string
    title: string
    username?: string
    email?: string
    url?: string
    notes?: string
    category: string
    icon: string
    is_favorite: boolean
  }
  onEdit: (password: any) => void
  onDelete: (passwordId: string) => void
  onToggleFavorite: (passwordId: string, isFavorite: boolean) => void
}

export function PasswordCard(props: PasswordCardProps) {
  const { password, onEdit, onDelete, onToggleFavorite } = props
  const [showPassword, setShowPassword] = useState(false)
  const [actualPassword, setActualPassword] = useState<string | null>(null)
  const [loadingPassword, setLoadingPassword] = useState(false)

  async function loadPassword() {
    if (actualPassword) {
      setShowPassword(!showPassword)
      return
    }

    try {
      setLoadingPassword(true)
      const result = await api.getPassword(password.id)
      setActualPassword(result.password.password)
      setShowPassword(true)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoadingPassword(false)
    }
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="bg-[#3c4043] p-4 rounded-xl relative">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-3xl">{password.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium truncate">{password.title}</h3>
            {password.url && (
              
                href={password.url.startsWith('http') ? password.url : `https://${password.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 text-xs hover:underline flex items-center gap-1 mt-1"
              >
                <span className="truncate">{password.url}</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
        
        <button
          onClick={() => onToggleFavorite(password.id, password.is_favorite)}
          className="text-gray-400 hover:text-yellow-400 transition-colors"
        >
          <Star size={18} className={password.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''} />
        </button>
      </div>

      <div className="space-y-2 mb-3">
        {password.username && (
          <div className="flex items-center justify-between bg-[#2d2e30] p-2 rounded">
            <div className="flex-1 min-w-0">
              <span className="text-gray-400 text-xs block">Usuario</span>
              <span className="text-white text-sm truncate block">{password.username}</span>
            </div>
            <button onClick={() => copyText(password.username!)} className="text-gray-400 hover:text-white ml-2">
              <Copy size={16} />
            </button>
          </div>
        )}

        {password.email && (
          <div className="flex items-center justify-between bg-[#2d2e30] p-2 rounded">
            <div className="flex-1 min-w-0">
              <span className="text-gray-400 text-xs block">Email</span>
              <span className="text-white text-sm truncate block">{password.email}</span>
            </div>
            <button onClick={() => copyText(password.email!)} className="text-gray-400 hover:text-white ml-2">
              <Copy size={16} />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between bg-[#2d2e30] p-2 rounded">
          <div className="flex-1 min-w-0">
            <span className="text-gray-400 text-xs block">Contraseña</span>
            <span className="text-white text-sm font-mono">
              {showPassword && actualPassword ? actualPassword : '••••••••••'}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <button onClick={loadPassword} disabled={loadingPassword} className="text-gray-400 hover:text-white">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button onClick={() => copyText(actualPassword || '')} className="text-gray-400 hover:text-white">
              <Copy size={16} />
            </button>
          </div>
        </div>

        {password.notes && (
          <div className="bg-[#2d2e30] p-2 rounded">
            <span className="text-gray-400 text-xs block mb-1">Notas</span>
            <p className="text-white text-sm">{password.notes}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-600">
        <span className="text-xs bg-[#2d2e30] text-blue-300 px-2 py-1 rounded-full">
          {password.category}
        </span>
        <div className="flex gap-2">
          <button onClick={() => onEdit(password)} className="text-blue-400 hover:text-blue-300 p-1">
            <Edit size={16} />
          </button>
          <button onClick={() => onDelete(password.id)} className="text-red-400 hover:text-red-300 p-1">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}