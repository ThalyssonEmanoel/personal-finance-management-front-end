"use client";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import "../styles/globals.css";
import SessionAuthProvider from "@/providers/sessionProvider";
import { Toaster } from "sonner";

export default function LayoutEventos({ children }) {
  return (
    <html lang="pt-br">
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
