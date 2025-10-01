const API_URL = 'https://memo-backend-production.up.railway.app/api';

export const api = {
  // Notas
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
    content?: string;
    checklistData?: string;
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

  async createNoteFromImage(imageBase64: string) {
    const response = await fetch(`${API_URL}/notes/from-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 })
    });
    return response.json();
  },

  // Calendario
  async getEvents(startDate?: string, endDate?: string) {
    let url = `${API_URL}/calendar/events`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await fetch(url);
    return response.json();
  },

  async deleteEvent(eventId: string) {
    const response = await fetch(`${API_URL}/calendar/events/${eventId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Password Vault
  async createPassword(data: {
    title: string;
    username?: string;
    email?: string;
    password: string;
    url?: string;
    notes?: string;
    category?: string;
    icon?: string;
  }) {
    const response = await fetch(`${API_URL}/vault/passwords`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async getPasswords(category?: string) {
    let url = `${API_URL}/vault/passwords`;
    if (category) {
      url += `?category=${category}`;
    }
    const response = await fetch(url);
    return response.json();
  },

  async getPassword(passwordId: string) {
    const response = await fetch(`${API_URL}/vault/passwords/${passwordId}`);
    return response.json();
  },

  async updatePassword(passwordId: string, updates: {
    title?: string;
    username?: string;
    email?: string;
    password?: string;
    url?: string;
    notes?: string;
    category?: string;
    icon?: string;
    isFavorite?: boolean;
  }) {
    const response = await fetch(`${API_URL}/vault/passwords/${passwordId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  },

  async deletePassword(passwordId: string) {
    const response = await fetch(`${API_URL}/vault/passwords/${passwordId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Notificaciones
  async createNotification(data: {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    relatedEntityType?: string;
    relatedEntityId?: string;
  }) {
    const response = await fetch(`${API_URL}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async getNotifications(unreadOnly?: boolean) {
    let url = `${API_URL}/notifications`;
    if (unreadOnly) {
      url += '?unreadOnly=true';
    }
    const response = await fetch(url);
    return response.json();
  },

  async getUnreadNotificationsCount() {
    const response = await fetch(`${API_URL}/notifications/unread-count`);
    return response.json();
  },

  async markNotificationAsRead(notificationId: string) {
    const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
    return response.json();
  },

  async markAllNotificationsAsRead() {
    const response = await fetch(`${API_URL}/notifications/mark-all-read`, {
      method: 'PATCH',
    });
    return response.json();
  },

  async deleteNotification(notificationId: string) {
    const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Usuario
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