import { memo, forwardRef } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Componente Select otimizado com acessibilidade completa
 * Resolve problemas de buttons sem nomes acessíveis nos selects
 */
const AccessibleSelect = memo(forwardRef(({ 
  value,
  onValueChange,
  placeholder = "Selecione uma opção",
  label,
  ariaLabel,
  items = [],
  loading = false,
  error = null,
  className = "w-56 h-10 border-2 border-neutral-300 rounded-sm",
  groupLabel,
  disabled = false,
  dataCy,
  ...props 
}, ref) => {
  
  // Gera aria-label automaticamente se não fornecido
  const getAccessibleLabel = () => {
    if (ariaLabel) return ariaLabel;
    if (label) return `Selecionar ${label.toLowerCase()}`;
    return `Selecionar opção`;
  };

  return (
    <div className="flex flex-col">
      {label && (
        <label className="mb-2 text-base font-medium text-gray-700">
          {label}
        </label>
      )}
      <Select 
        value={value} 
        onValueChange={onValueChange}
        disabled={disabled || loading}
        {...props}
      >
        <SelectTrigger 
          ref={ref}
          className={className}
          aria-label={getAccessibleLabel()}
          aria-describedby={error ? `${props.id || 'select'}-error` : undefined}
          data-cy={dataCy}
        >
          <SelectValue placeholder={loading ? "Carregando..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {groupLabel && <SelectLabel>{groupLabel}</SelectLabel>}
            
            {loading && (
              <SelectItem value="loading" disabled>
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                  Carregando...
                </div>
              </SelectItem>
            )}
            
            {error && !loading && (
              <SelectItem value="error" disabled>
                <div className="text-red-600">
                  Erro: {error?.message || 'Erro ao carregar opções'}
                </div>
              </SelectItem>
            )}
            
            {!loading && !error && items.length === 0 && (
              <SelectItem value="empty" disabled>
                Nenhuma opção encontrada
              </SelectItem>
            )}
            
            {!loading && items.map((item) => (
              <SelectItem 
                key={item.value} 
                value={item.value.toString()}
                disabled={item.disabled}
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      
      {error && (
        <div 
          id={`${props.id || 'select'}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error.message || 'Erro na seleção'}
        </div>
      )}
    </div>
  );
}));

AccessibleSelect.displayName = 'AccessibleSelect';

export default AccessibleSelect;
