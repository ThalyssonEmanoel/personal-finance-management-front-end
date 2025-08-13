"use client";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import "../styles/globals.css";
import SessionAuthProvider from "@/providers/sessionProvider";

export default function LayoutEventos({ children }) {
  return (
    <html lang="pt-br">
      <SessionAuthProvider>
        <ReactQueryProvider>
          <body className="overflow-x-hidden">
            <>
              {children}
            </>
          </body>
        </ReactQueryProvider>
      </SessionAuthProvider>
    </html>
  );
}
