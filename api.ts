
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'An unexpected error occurred' }));
    throw new Error(error.message || `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

const getHeaders = () => {
  const token = localStorage.getItem('w4u_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  login: async (credentials: any) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },

  // Vehicles
  getVehicles: async () => {
    const res = await fetch(`${API_BASE}/vehicles`);
    return handleResponse(res);
  },
  
  getVehicleById: async (id: string) => {
    const res = await fetch(`${API_BASE}/vehicles/${id}`);
    return handleResponse(res);
  },

  createVehicle: async (data: any) => {
    const res = await fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  updateVehicle: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/vehicles/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  deleteVehicle: async (id: string) => {
    const res = await fetch(`${API_BASE}/vehicles/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Leads
  getLeads: async () => {
    const res = await fetch(`${API_BASE}/leads`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  createLead: async (data: any) => {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  updateLead: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Reviews
  getReviews: async () => {
    const res = await fetch(`${API_BASE}/reviews`);
    return handleResponse(res);
  },

  getAdminReviews: async () => {
    const res = await fetch(`${API_BASE}/reviews/admin`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  updateReview: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/reviews/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Config
  getConfig: async () => {
    const res = await fetch(`${API_BASE}/config`);
    return handleResponse(res);
  },

  updateConfig: async (data: any) => {
    const res = await fetch(`${API_BASE}/config`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = localStorage.getItem('w4u_admin_token');
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    });
    
    return handleResponse(res);
  },
};
