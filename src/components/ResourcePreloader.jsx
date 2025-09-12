import { memo } from 'react';

/**
 * Componente para preload de recursos críticos
 * Melhora o LCP ao fazer preload das imagens importantes
 */
const ResourcePreloader = memo(() => {
  return (
    <>
      {/* Preload da imagem LCP (primeira imagem visível) */}
      <link rel="preload" href="/Imagem1Introdução.jpg" as="image" type="image/jpeg" />
      
      {/* Prefetch da segunda imagem que será vista depois */}
      <link rel="prefetch" href="/AnotandoGastos.jpg" as="image" type="image/jpeg" />
      
      {/* DNS prefetch para melhorar conexões de rede */}
      <link rel="dns-prefetch" href="//personal-finance-api.app.fslab.dev" />
      <link rel="preconnect" href="//personal-finance-api.app.fslab.dev" crossOrigin="anonymous" />
      
      {/* Preload de fontes críticas se houver */}
      <link rel="preload" href="/_next/static/css/app.css" as="style" />
    </>
  );
});

ResourcePreloader.displayName = 'ResourcePreloader';

export default ResourcePreloader;
