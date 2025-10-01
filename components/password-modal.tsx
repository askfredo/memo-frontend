"use client"

import { useState, useEffect } from "react"
import { X, Save, Eye, EyeOff } from "lucide-react"

interface PasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  password?: any | null
  categories: { id: string; label: string; icon: string }[]
}

export function PasswordModal({ isOpen, onClose, onSave, password, categories }: PasswordModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    username: '',
    email: '',
    password: '',
    url: '',
    notes: '',
    category: 'general',
    icon: '🔐'
  })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (password) {
      setFormData({
        title: password.title || '',
        username: password.username || '',
        email: password.email || '',
        password: '',
        url: password.url || '',
        notes: password.notes || '',
        category: password.category || 'general',
        icon: password.icon || '🔐'
      })
    } else {
      setFormData({
        title: '',
        username: '',
        email: '',
        password: '',
        url: '',
        notes: '',
        category: 'general',
        icon: '🔐'
      })
    }
  }, [password, isOpen])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      icon: category?.icon || '🔐'
    }))
  }

  const generatePassword = () => {
    const length = 16
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setFormData(prev => ({ ...prev, password }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.password.trim()) {
      alert('Título y contraseña son requeridos')
      return
    }
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-[#2d2e30] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <h2 className="text-lg font-medium text-white">
            {password ? 'Editar Contraseña' : 'Nueva Contraseña'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Título */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ej: Gmail, Facebook, Banco..."
              className="w-full bg-[#3c4043] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Categoría</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryChange(category.id)}
                  className={`p-3 rounded-lg transition-colors ${
                    formData.category === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-[#3c4043] text-gray-300 hover:bg-[#4a4d50]'
                  }`}
                >
                  <div className="text-2xl mb-1">{category.icon}</div>
                  <div className="text-xs">{category.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Usuario */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Usuario</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              placeholder="nombre_usuario"
              className="w-full bg-[#3c4043] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full bg-[#3c4043] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">
              Contraseña <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder={password ? 'Dejar vacío para no cambiar' : 'Contraseña segura'}
                  className="w-full bg-[#3c4043] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  required={!password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button
                type="button"
                onClick={generatePassword}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 rounded-lg transition-colors"
              >
                Generar
              </button>
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">URL del sitio</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="https://ejemplo.com"
              className="w-full bg-[#3c4043] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Notas</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Información adicional..."
              className="w-full bg-[#3c4043] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-y"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-gray-600 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            <Save size={18} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}