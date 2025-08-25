'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from "next-auth/react"
import { useAuth } from "@/hooks/useAuth"
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User } from "lucide-react"
import { ModalProfile } from "./ModalProfile"
import '../styles/globals.css'

const AuthenticatedHeader = () => {
  const { getUserInfo, isAuthenticated, logout } = useAuth();
  const user = getUserInfo();
  const pathname = usePathname();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    signOut({ callbackUrl: "/introduction" });
  };

  const handleOpenProfile = () => {
    setIsProfileModalOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileModalOpen(false);
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    const fileName = avatarPath.replace('src/uploads/', '');
    const baseUrl = `https://personal-finance-api.app.fslab.dev/uploads/${fileName}`;
    // Adiciona timestamp para evitar cache de imagem
    return `${baseUrl}?t=${Date.now()}`;
  };

  //https://pt.stackoverflow.com/questions/109415/como-pegar-nome-e-inicias-do-sobrenome-em-javascript
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <nav className="bg-secondary border-b-2 border-solid border-b-tertiary flex justify-between items-center w-full py-4 px-20">
      <div className="flex items-center">
        <Link href="/introduction" className="text-black text-3xl font-semibold">
          Financial Record
        </Link>
      </div>

      <div className="flex items-center space-x-8">
        {[
          { href: "/home", label: "Página inicial" },
          { href: "/accounts", label: "Contas" },
          { href: "/goals", label: "Metas" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center transition-colors no-underline pb-1 ${pathname === href
              ? "border-b-3 border-gray-600 font-bold text-black mt-1"
              : "text-black hover:text-gray-600"
              }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div>
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="size-14 cursor-pointer hover:ring-2 hover:ring-gray-300 transition-all">
              <AvatarImage src={getAvatarUrl(user?.avatar)} alt={user?.name || "Avatar"} />
              <AvatarFallback className="bg-gray-200 text-gray-700 font-medium">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-64" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer" onClick={handleOpenProfile}>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ModalProfile
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfile}
      />
    </nav>
  );
};

export default AuthenticatedHeader;
