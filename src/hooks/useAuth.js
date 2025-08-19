'use client'
import { useSession } from "next-auth/react"
import { refreshUserToken, logoutUser } from "@/utils/apiClient"

export function useAuth() {
  const { data: session, status, update } = useSession();

  const getAccessToken = () => {
    return session?.user?.accessToken;
  };

  const getRefreshToken = () => {
    return session?.user?.refreshToken;
  };

  const isAuthenticated = () => {
    return status === "authenticated" && !!session?.user;
  };

  const isLoading = () => {
    return status === "loading";
  };

  const getUserInfo = () => {
    return session?.user;
  };

  const updateUserInfo = async (newUserInfo) => {
    try {
      await update({
        ...session,
        user: {
          ...session.user,
          ...newUserInfo,
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar informações do usuário:', error);
      throw error;
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error('Refresh token não encontrado');
      }

      const response = await refreshUserToken(refreshToken);
      
      if (response.data?.accessToken) {
        await update({
          ...session,
          user: {
            ...session.user,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken || refreshToken,
          }
        });
        
        return response.data.accessToken;
      } else {
        throw new Error('Erro na resposta do refresh token');
      }
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const userId = getUserInfo()?.id;
      if (userId) {
        await logoutUser(userId);
        console.log('RefreshToken removido do banco de dados');
      }
    } catch (error) {
      console.error('Erro ao fazer logout no backend:', error);
    }
  };

  const authenticatedFetch = async (url, options = {}) => {
    let token = getAccessToken();
    
    if (!token) {
      throw new Error('Token de acesso não encontrado');
    }

    const makeRequest = async (authToken) => {
      const headers = {
        'Authorization': `Bearer ${authToken}`,
        ...options.headers,
      };

      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      return fetch(url, {
        ...options,
        headers,
      });
    };

    try {
      let response = await makeRequest(token);
      
      if (response.status === 401) {
        console.log('Token expirado, tentando renovar...');
        token = await refreshAccessToken();
        response = await makeRequest(token);
      }
      
      return response;
    } catch (error) {
      console.error('Erro na requisição autenticada:', error);
      throw error;
    }
  };

  return {
    session,
    status,
    getAccessToken,
    getRefreshToken,
    isAuthenticated,
    isLoading,
    getUserInfo,
    updateUserInfo,
    authenticatedFetch,
    refreshAccessToken,
    logout,
  };
}
