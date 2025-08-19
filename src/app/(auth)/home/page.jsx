'use client'
import { useAuth } from "@/hooks/useAuth"

export default function HomePage() {
  const { getUserInfo, isLoading, isAuthenticated } = useAuth();

  if (isLoading()) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem'
      }}>
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem'
      }}>
        Acesso não autorizado
      </div>
    );
  }

  const user = getUserInfo();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: 'calc(100vh - 6rem)',
      gap: '2rem',
      padding: '2rem'
    }}>
      <div style={{
        textAlign: 'center',
        fontSize: '2rem',
        fontWeight: 'bold'
      }}>
        Hello World
      </div>
      <div>
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Avatar:</strong> <img src={user?.avatar} /></p>
      </div>

    </div>
  );
}
