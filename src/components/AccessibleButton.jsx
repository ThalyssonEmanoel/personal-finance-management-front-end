import { memo, forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Componente Button otimizado com acessibilidade completa
 * Resolve: "Buttons do not have an accessible name"
 */
const AccessibleButton = memo(forwardRef(({ 
  children,
  className,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  ariaLabel,
  ariaDescribedBy,
  type = 'button',
  onClick,
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'underline-offset-4 hover:underline text-primary'
  };

  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md',
    lg: 'h-11 px-8 rounded-md'
  };

  // Determina o aria-label automaticamente se não fornecido
  const getAccessibleName = () => {
    if (ariaLabel) return ariaLabel;
    if (typeof children === 'string') return children;
    return 'Botão'; // Fallback para evitar botões sem nome acessível
  };

  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      aria-label={getAccessibleName()}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}));

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;
