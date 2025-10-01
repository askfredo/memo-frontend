"use client"

import { useState, useEffect } from "react"
import { X, Check, Trash2, CheckCheck, Info, AlertCircle, CheckCircle, XCircle, Bell } from "lucide-react"
import { api } from "@/lib/api"

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  is_read: boolean
  created_at: string
}

interface NotificationsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen, filter])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const result = await api.getNotifications(filter === 'unread')
      setNotifications(result.notifications || [])
    } catch (error) {
      console.error('Error cargando notificaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.markNotificationAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
    } catch (error) {
      console.error('Error marcando como leída:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (error) {
      console.error('Error marcando todas como leídas:', error)
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await api.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Error eliminando notificación:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-400" size={20} />
      case 'warning':
        return <AlertCircle className="text-yellow-400" size={20} />
      case 'error':
        return <XCircle className="text-red-400" size={20} />
      default:
        return <Info className="text-blue-400" size={20} />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `Hace ${diffMins}m`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-4 px-4" onClick={onClose}>
      <div
        className="bg-[#2d2e30] rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <h2 className="text-lg font-medium text-white">Notificaciones</h2>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.is_read) && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
              >
                <CheckCheck size={16} />
                <span className="hidden sm:inline">Marcar todo</span>
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 p-4 border-b border-gray-600">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-[#3c4043] text-gray-300 hover:bg-[#4a4d50]'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filter === 'unread'
                ? 'bg-blue-500 text-white'
                : 'bg-[#3c4043] text-gray-300 hover:bg-[#4a4d50]'
            }`}
          >
            No leídas
          </button>
        </div>

        {/* Lista de notificaciones */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-400">Cargando...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Bell size={48} className="text-gray-600 mb-3" />
              <p className="text-gray-400">No hay notificaciones</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg transition-colors ${
                    notification.is_read
                      ? 'bg-[#3c4043]'
                      : 'bg-[#3c4043] border-l-4 border-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-white font-medium text-sm">{notification.title}</h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mt-1">{notification.message}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 ml-8">
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <Check size={12} />
                        Marcar como leída
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}