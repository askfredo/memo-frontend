const API_URL = 'https://memo-backend-production.up.railway.app/api';

export const api = {
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