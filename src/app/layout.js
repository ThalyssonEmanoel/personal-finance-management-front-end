"use client";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import "../styles/globals.css";
import SessionAuthProvider from "@/providers/sessionProvider";
import { Toaster } from "sonner";
import ResourcePreloader from "@/components/ResourcePreloader";

export default function LayoutEventos({ children }) {
  return (
    <html lang="pt-br">
      <head>
        <ResourcePreloader />
        
        {/* Critical CSS inline to prevent render blocking */}
        <style 
          dangerouslySetInnerHTML={{
            __html: `
              .bg-secondary { background-color: var(--secondary); }
              .border-b-tertiary { border-bottom-color: var(--tertiary); }
              body { margin: 0; padding: 0; }
              .overflow-x-hidden { overflow-x: hidden; }
            `
          }}
          blocking="render"
        />
      </head>
      <SessionAuthProvider>
        <ReactQueryProvider>
          <body className="overflow-x-hidden">
            <>
              {children}
              <Toaster position="top-right" />
            </>
          </body>
        </ReactQueryProvider>
      </SessionAuthProvider>
    </html>
  );
}
