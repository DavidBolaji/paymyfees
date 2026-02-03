import useAuthStore from '@/src/authStore';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function authFetch(url: string, options: FetchOptions = {}) {
  const { token } = useAuthStore.getState();
  const { skipAuth, ...fetchOptions } = options;
  
  // If no token and auth is required, don't make the request
  if (!token && !skipAuth) {
    console.warn('No auth token available, skipping request to:', url);
    throw new Error('No authentication token available');
  }
  
  // Merge headers, adding Authorization if token exists and skipAuth is not true
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token && !skipAuth) {
    //@ts-ignore
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // Handle token refresh on 401
  if (response.status === 401 && !skipAuth) {
    const { rToken, login, logout } = useAuthStore.getState();
    
    if (rToken) {
      try {
        // Try to refresh token
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: rToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          
          // Update store with new tokens
          login(
            refreshData.data.user, 
            refreshData.data.token, 
            refreshData.data.refreshToken
          );
          
          // Retry original request with new token
          //@ts-ignore
          headers['Authorization'] = `Bearer ${refreshData.data.token}`;
          return fetch(url, {
            ...fetchOptions,
            headers,
          });
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    // If refresh fails or no refresh token, logout
    logout();
    window.location.replace('/auth/login');
    throw new Error('Authentication failed');
  }

  return response;
}

// Helper function for common request patterns
export const api = {
  get: (url: string, options?: FetchOptions) =>
    authFetch(url, { ...options, method: 'GET' }),
  
  post: (url: string, body?: any, options?: FetchOptions) =>
    authFetch(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  put: (url: string, body?: any, options?: FetchOptions) =>
    authFetch(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  patch: (url: string, body?: any, options?: FetchOptions) =>
    authFetch(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  delete: (url: string, options?: FetchOptions) =>
    authFetch(url, { ...options, method: 'DELETE' }),
};