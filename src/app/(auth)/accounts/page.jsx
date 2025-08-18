'use client'
import { useAuth } from "@/hooks/useAuth"

export default function AccountsPage() {
  const { isLoading, isAuthenticated } = useAuth();

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

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        border: '2px dashed #ddd',
        borderRadius: '8px',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Hello World
      </div>
    </div>
  );
}
