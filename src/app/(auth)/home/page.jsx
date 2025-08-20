'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from "@/hooks/useAuth"
import { Progress } from "@/components/ui/progress"

export default function HomePage() {
  const { getUserInfo, isLoading, isAuthenticated } = useAuth();

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading()) {
      const interval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          const diff = Math.random() * 10;
          return Math.min(oldProgress + diff, 100);
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  if (isLoading()) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: '1rem',
        fontSize: '1.2rem'
      }}>
        <span>Carregando...</span>
        <Progress value={progress} className="w-[20%]" />
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
      </div>
    </div>
  );
}