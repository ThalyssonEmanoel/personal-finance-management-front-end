import { redirect } from "next/navigation";
import { auth } from "../../auth.js";

import { Suspense } from 'react';

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
  </div>
);

export default function NoAuthLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </div>
  );
}