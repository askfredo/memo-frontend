"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Star, Lock } from "lucide-react"
import { api } from "@/lib/api"
import { PasswordCard } from "@/components/password-card"
import { PasswordModal } from "@/components/password-modal"

interface Password {
  id: string
  title: string
  username?: string
  email?: string
  url?: string
  notes?: string
  category: string
  icon: string
  is_favorite: boolean
  created_at: string
}

export function VaultView() {
  const [passwords, setPasswords] = useState<Password[]>([])
  const [filteredPasswords, setFilteredPasswords] = useState<Password[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPassword, setEditingPassword] = useState<Password | null>(null)

  const categories = [
    { id: 'general', label: 'General', icon: '🔐' },
    { id: 'social', label: 'Social', icon: '💬' },
    { id: 'trabajo', label: 'Trabajo', icon: '💼' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'finanzas', label: 'Finanzas', icon: '💰' },
    { id: 'streaming', label: 'Streaming', icon: '🎬' },
  ]

  useEffect(() => {
    loadPasswords()
  }, [])

  useEffect(() => {
    filterPasswords()
  }, [passwords, searchQuery, selectedCategory])

  const loadPasswords = async () => {
    try {
      setLoading(true)
      const result = await api.getPasswords()
      setPasswords(result.passwords || [])
    } catch (error) {
      console.error('Error cargando contraseñas:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPasswords = () => {
    let filtered = [...passwords]

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.username?.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query) ||
        p.url?.toLowerCase().includes(query)
      )
    }

    filtered.sort((a, b) => Number(b.is_favorite) - Number(a.is_favorite))
    setFilteredPasswords(filtered)
  }

  const handleCreatePassword = () => {
    setEditingPassword(null)
    setIsModalOpen(true)
  }

  const handleEditPassword = (password: Password) => {
    setEditingPassword(password)
    setIsModalOpen(true)
  }

  const handleDeletePassword = async (passwordId: string) => {
    if (confirm('¿Estás seguro de eliminar esta contraseña?')) {
      try {
        await api.deletePassword(passwordId)
        setPasswords(prev => prev.filter(p => p.id !== passwordId))
      } catch (error) {
        console.error('Error eliminando contraseña:', error)
      }
    }
  }

  const handleToggleFavorite = async (passwordId: string, isFavorite: boolean) => {
    try {
      await api.updatePassword(passwordId, { isFavorite: !isFavorite })
      setPasswords(prev =>
        prev.map(p => p.id === passwordId ? { ...p, is_favorite: !isFavorite } : p)
      )
    } catch (error) {
      console.error('Error actualizando favorito:', error)
    }
  }

  const handleSavePassword = async (data: any) => {
    try {
      if (editingPassword) {
        await api.updatePassword(editingPassword.id, data)
        setPasswords(prev =>
          prev.map(p => p.id === editingPassword.id ? { ...p, ...data } : p)
        )
      } else {
        const result = await api.createPassword(data)
        setPasswords(prev => [result.password, ...prev])
      }
      setIsModalOpen(false)
      setEditingPassword(null)
    } catch (error) {
      console.error('Error guardando contraseña:', error)
      alert('Error al guardar la contraseña')
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-400">Cargando vault...</p>
      </div>
    )
  }

  return (
    <div className="h-full p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lock className="text-blue-400" size={24} />
          <h2 className="text-xl font-medium text-white">Password Vault</h2>
        </div>
        <button
          onClick={handleCreatePassword}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Búsqueda */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar contraseñas..."
          className="w-full bg-[#3c4043] text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Categorías */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-gray-400 text-sm">Categorías:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              !selectedCategory
                ? 'bg-blue-500 text-white'
                : 'bg-[#3c4043] text-gray-300 hover:bg-[#4a4d50]'
            }`}
          >
            Todas
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-xs transition-colors flex items-center gap-1 ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#3c4043] text-gray-300 hover:bg-[#4a4d50]'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de contraseñas */}
      {filteredPasswords.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Lock size={48} className="mb-3" />
          <p>No hay contraseñas guardadas</p>
          <p className="text-sm mt-2">Usa el botón + para crear una</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto">
          {filteredPasswords.map((password) => (
            <PasswordCard
              key={password.id}
              password={password}
              onEdit={handleEditPassword}
              onDelete={handleDeletePassword}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <PasswordModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingPassword(null)
        }}
        onSave={handleSavePassword}
        password={editingPassword}
        categories={categories}
      />
    </div>
  )
}