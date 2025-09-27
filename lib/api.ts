const API_URL = 'https://memo-backend-production.up.railway.app/api';

export const api = {
  // ==================== NOTAS ====================
  async createNote(content: string, userId?: string) {
    const response = await fetch(`${API_URL}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        content, 
        userId: userId || '00000000-0000-0000-0000-000000000001' 
      })
    });
    return response.json();
  },

  async getNotes() {
    const response = await fetch(`${API_URL}/notes`);
    return response.json();
  },

  async updateNote(noteId: string, updates: { 
    isFavorite?: boolean; 
    hashtags?: string[]; 
    content?: string 
  }) {
    const response = await fetch(`${API_URL}/notes/${noteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  },

  async deleteNote(noteId: string) {
    const response = await fetch(`${API_URL}/notes/${noteId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // ==================== CALENDARIO/EVENTOS ====================
  async getEvents(startDate?: string, endDate?: string) {
    let url = `${API_URL}/calendar/events`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await fetch(url);
    return response.json();
  },

  // ==================== AMIGOS ====================
  async getFriends() {
    const response = await fetch(`${API_URL}/friends`);
    return response.json();
  },

  async sendFriendRequest(friendUsername: string) {
    const response = await fetch(`${API_URL}/friends/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendUsername })
    });
    return response.json();
  },

  // ==================== INVITACIONES ====================
  async getInvitations() {
    const response = await fetch(`${API_URL}/invitations`);
    return response.json();
  },

  async respondToInvitation(
    invitationId: string, 
    status: 'accepted' | 'declined' | 'maybe',
    message?: string
  ) {
    const response = await fetch(`${API_URL}/invitations/${invitationId}/respond`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, message })
    });
    return response.json();
  },

  // ==================== NOTIFICACIONES ====================
  async getNotifications() {
    const response = await fetch(`${API_URL}/notifications`);
    return response.json();
  },

  async markNotificationAsRead(notificationId: string) {
    const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
    return response.json();
  },

  // ==================== PERFIL DE USUARIO ====================
  async getUserProfile() {
    const response = await fetch(`${API_URL}/user/profile`);
    return response.json();
  },

  async updateUserProfile(data: { 
    userProfile?: any; 
    preferences?: any 
  }) {
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};