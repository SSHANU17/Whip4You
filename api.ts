
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

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

// Session Storage caching helper functions
const getSessionCache = <T>(key: string): CacheEntry<T> | null => {
  try {
    const val = sessionStorage.getItem(key);
    if (!val) return null;
    return JSON.parse(val);
  } catch {
    return null;
  }
};

const setSessionCache = <T>(key: string, data: T) => {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch (e) {
    console.error('Failed to set sessionStorage cache', e);
  }
};

const removeSessionCache = (key: string) => {
  try {
    sessionStorage.removeItem(key);
  } catch {}
};

// Active Promises for request deduplication
let vehiclesPromise: Promise<any> | null = null;
let configPromise: Promise<any> | null = null;
let reviewsPromise: Promise<any> | null = null;
const vehicleDetailsPromises = new Map<string, Promise<any>>();

const isCacheValid = (cache: CacheEntry<any> | null | undefined) => {
  if (!cache) return false;
  return Date.now() - cache.timestamp < CACHE_TTL;
};

const clearVehiclesCache = () => {
  removeSessionCache('w4u_vehicles_cache');
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('w4u_vehicle_detail_cache_')) {
        sessionStorage.removeItem(key);
        i--; // Adjust index since we removed an item
      }
    }
  } catch {}
};

const clearConfigCache = () => {
  removeSessionCache('w4u_config_cache');
};

const clearReviewsCache = () => {
  removeSessionCache('w4u_reviews_cache');
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
    const cached = getSessionCache<any>('w4u_vehicles_cache');
    if (isCacheValid(cached)) {
      return cached!.data;
    }
    if (vehiclesPromise) {
      return vehiclesPromise;
    }
    vehiclesPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE}/vehicles`);
        const data = await handleResponse(res);
        setSessionCache('w4u_vehicles_cache', data);
        return data;
      } finally {
        vehiclesPromise = null;
      }
    })();
    return vehiclesPromise;
  },
  
  getVehicleById: async (id: string) => {
    const cached = getSessionCache<any>(`w4u_vehicle_detail_cache_${id}`);
    if (isCacheValid(cached)) {
      return cached!.data;
    }
    // Fallback: Check if we have the vehicle in the main list cache
    const listCached = getSessionCache<any[]>('w4u_vehicles_cache');
    if (isCacheValid(listCached)) {
      const vehicle = listCached!.data.find((v: any) => (v._id || v.id) === id);
      if (vehicle) {
        return vehicle;
      }
    }
    
    // Check in-flight promise for this specific vehicle details
    if (vehicleDetailsPromises.has(id)) {
      return vehicleDetailsPromises.get(id)!;
    }
    
    // Check if there is an in-flight vehicles list query. If so, wait for it and then look up the vehicle.
    if (vehiclesPromise) {
      const listData = await vehiclesPromise;
      const vehicle = listData.find((v: any) => (v._id || v.id) === id);
      if (vehicle) {
        return vehicle;
      }
    }

    const promise = (async () => {
      try {
        const res = await fetch(`${API_BASE}/vehicles/${id}`);
        const data = await handleResponse(res);
        setSessionCache(`w4u_vehicle_detail_cache_${id}`, data);
        return data;
      } finally {
        vehicleDetailsPromises.delete(id);
      }
    })();
    vehicleDetailsPromises.set(id, promise);
    return promise;
  },

  createVehicle: async (data: any) => {
    const res = await fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await handleResponse(res);
    clearVehiclesCache();
    return result;
  },

  updateVehicle: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/vehicles/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await handleResponse(res);
    clearVehiclesCache();
    return result;
  },

  deleteVehicle: async (id: string) => {
    const res = await fetch(`${API_BASE}/vehicles/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const result = await handleResponse(res);
    clearVehiclesCache();
    return result;
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
    const cached = getSessionCache<any>('w4u_reviews_cache');
    if (isCacheValid(cached)) {
      return cached!.data;
    }
    if (reviewsPromise) {
      return reviewsPromise;
    }
    reviewsPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE}/reviews`);
        const data = await handleResponse(res);
        setSessionCache('w4u_reviews_cache', data);
        return data;
      } finally {
        reviewsPromise = null;
      }
    })();
    return reviewsPromise;
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
    const result = await handleResponse(res);
    clearReviewsCache();
    return result;
  },

  // Config
  getConfig: async () => {
    const cached = getSessionCache<any>('w4u_config_cache');
    if (isCacheValid(cached)) {
      return cached!.data;
    }
    if (configPromise) {
      return configPromise;
    }
    configPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE}/config`);
        const data = await handleResponse(res);
        setSessionCache('w4u_config_cache', data);
        return data;
      } finally {
        configPromise = null;
      }
    })();
    return configPromise;
  },

  updateConfig: async (data: any) => {
    const res = await fetch(`${API_BASE}/config`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await handleResponse(res);
    clearConfigCache();
    return result;
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
