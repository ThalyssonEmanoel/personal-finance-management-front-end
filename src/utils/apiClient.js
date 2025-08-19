export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  },

  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  },

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, { method: 'POST', body, ...options });
  },

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, { method: 'PUT', body, ...options });
  },

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  },
};


export const loginUser = async (email, password) => {
  return apiClient.post('/login', { email, password });
};
 
export const refreshUserToken = async (refreshToken) => {
  return apiClient.post('/refresh-token', { refreshToken });
};

export const logoutUser = async (id) => {
  return apiClient.post('/logout', { id });
};

export const createUser = async (formData) => {
  const url = `${API_BASE_URL}/users`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData, 
    });
    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro na criação do usuário');
    }

    return data;
  } catch (error) {
    console.error('Erro na criação do usuário:', error);
    throw error;
  }
};
