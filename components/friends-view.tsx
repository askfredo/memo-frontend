"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, MapPin, Send, Check, X, UserPlus, Bell, BellRing } from "lucide-react"
import { api } from "@/lib/api"

interface Friend {
  id: string
  name: string
  username: string
  avatar: string
  status: "online" | "offline"
}

interface Invitation {
  id: string
  event_title: string
  event_id: string
  invited_by_name: string
  start_datetime: string
  location?: string
  status: string
}

export function FriendsView() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [friendsResult, invitationsResult] = await Promise.all([
        api.getFriends(),
        api.getInvitations()
      ])
      
      setFriends(friendsResult.friends || [])
      setInvitations(invitationsResult.invitations || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvitationResponse = async (invitationId: string, status: 'accepted' | 'declined') => {
    try {
      await api.respondToInvitation(invitationId, status)
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId))
    } catch (error) {
      console.error('Error respondiendo invitación:', error)
    }
  }

  const formatDate = (datetime: string) => {
    const date = new Date(datetime)
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const formatTime = (datetime: string) => {
    const date = new Date(datetime)
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="h-full p-4 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="h-full p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-gray-400">Amigos</h2>
        <button className="bg-blue-500 p-2 rounded-full">
          <UserPlus size={20} className="text-white" />
        </button>
      </div>

      {friends.length > 0 && (
        <div className="mb-6">
          <h3 className="text-gray-400 text-sm font-medium mb-3">Amigos</h3>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {friends.map((friend) => (
              <div key={friend.id} className="flex-shrink-0 text-center">
                <div className="relative">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mb-1">
                    {friend.avatar || friend.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#202124] ${
                      friend.status === "online" ? "bg-green-500" : "bg-gray-500"
                    }`}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 max-w-[60px] truncate">{friend.name.split(" ")[0]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {invitations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-gray-400 text-sm font-medium mb-3 flex items-center">
            <BellRing size={16} className="mr-2" />
            Invitaciones recibidas
          </h3>
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="bg-[#3c4043] p-4 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-white font-medium">{invitation.event_title}</p>
                    <p className="text-gray-400 text-sm">Invitación de {invitation.invited_by_name}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-400 text-sm mb-3 space-x-4">
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {formatDate(invitation.start_datetime)}
                  </div>
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    {formatTime(invitation.start_datetime)}
                  </div>
                  {invitation.location && (
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-1" />
                      {invitation.location}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleInvitationResponse(invitation.id, "accepted")}
                    className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg flex items-center justify-center text-sm"
                  >
                    <Check size={16} className="mr-1" />
                    Aceptar
                  </button>
                  <button
                    onClick={() => handleInvitationResponse(invitation.id, "declined")}
                    className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg flex items-center justify-center text-sm"
                  >
                    <X size={16} className="mr-1" />
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {friends.length === 0 && invitations.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p>No tienes amigos todavía</p>
          <p className="text-sm mt-2">Agrega amigos para compartir eventos</p>
        </div>
      )}
    </div>
  )
}
