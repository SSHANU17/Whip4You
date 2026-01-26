
import { mockVehicles } from './data/mockVehicles.ts';
import { MOCK_REVIEWS } from './constants.tsx';

/**
 * Mock API service that uses local data to prevent 404s when a backend is not present.
 */
export const api = {
  // Auth
  login: async (credentials: any) => {
    if (credentials.email === 'admin@whip4you.ca' && credentials.password === 'admin123') {
      return { token: 'mock-jwt-token', user: { email: credentials.email, name: 'Admin' } };
    }
    throw new Error('Invalid credentials');
  },

  // Vehicles
  getVehicles: async () => {
    return mockVehicles;
  },
  
  getVehicleById: async (id: string) => {
    const vehicle = mockVehicles.find(v => v.id === id);
    if (!vehicle) throw new Error('Vehicle not found');
    return vehicle;
  },

  createVehicle: async (data: any) => {
    console.log('Mock Create Vehicle:', data);
    return { ...data, id: Math.random().toString(36).substr(2, 9) };
  },

  deleteVehicle: async (id: string) => {
    console.log('Mock Delete Vehicle:', id);
    return true;
  },

  // Leads
  getLeads: async () => {
    return JSON.parse(localStorage.getItem('w4y_leads') || '[]');
  },

  createLead: async (data: any) => {
    const leads = JSON.parse(localStorage.getItem('w4y_leads') || '[]');
    const newLead = { ...data, _id: Date.now().toString(), createdAt: new Date().toISOString(), status: 'open', priority: 'Medium' };
    localStorage.setItem('w4y_leads', JSON.stringify([...leads, newLead]));
    return newLead;
  },

  updateLead: async (id: string, data: any) => {
    const leads = JSON.parse(localStorage.getItem('w4y_leads') || '[]');
    const updated = leads.map((l: any) => l._id === id ? { ...l, ...data } : l);
    localStorage.setItem('w4y_leads', JSON.stringify(updated));
    return updated.find((l: any) => l._id === id);
  },

  // Reviews
  getReviews: async () => {
    return MOCK_REVIEWS;
  },

  getAdminReviews: async () => {
    return MOCK_REVIEWS;
  },

  updateReview: async (id: string, data: any) => {
    console.log('Mock Update Review:', id, data);
    return { id, ...data };
  },

  // Config
  getConfig: async () => {
    const config = JSON.parse(localStorage.getItem('w4y_config') || 'null');
    return config || {
      heroHeadline: 'DRIVING DREAMS',
      promoRate: '5.99',
      specialistStatus: 'Online'
    };
  },

  updateConfig: async (data: any) => {
    localStorage.setItem('w4y_config', JSON.stringify(data));
    return data;
  },
};
