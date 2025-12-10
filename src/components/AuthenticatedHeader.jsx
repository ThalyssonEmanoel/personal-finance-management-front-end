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
import { LogOut, User, Menu, X } from "lucide-react"
import { ModalProfile } from "./ModalProfile"
import '../styles/globals.css'

const AuthenticatedHeader = () => {
  const { getUserInfo, isAuthenticated, logout } = useAuth();
  const user = getUserInfo();
  const pathname = usePathname();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    const fileName = avatarPath.replace(/src[\\/]uploads[\\/]|src[\\/]seed[\\/]images[\\/]|src[\/]uploads[\/]/g, '');
    return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${fileName}`;

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

  const navLinks = [
    { href: "/home", label: "Página inicial" },
    { href: "/accounts", label: "Contas" },
    { href: "/goals", label: "Metas" },
  ];

  return (
    <>
      <nav className="bg-secondary border-b-2 border-solid border-b-tertiary w-full">
        <div className="mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex justify-between items-center h-16 sm:h-20 lg:h-24">
            {/* Logo */}
            <div className="flex items-center text-black text-xl sm:text-2xl lg:text-3xl font-semibold flex-shrink-0">
              Financial Record
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center transition-colors no-underline pb-1 ${
                    pathname === href
                      ? "border-b-3 border-gray-600 font-bold text-black mt-1"
                      : "text-black hover:text-gray-600"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Desktop Avatar */}
            <div className="hidden md:flex">
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar className="size-12 lg:size-14 cursor-pointer hover:ring-2 hover:ring-gray-300 transition-all border-2 border-solid border-tertiary">
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

            {/* Mobile menu button and avatar */}
            <div className="md:hidden flex items-center gap-4">
              <Avatar className="size-10 cursor-pointer border-2 border-solid border-tertiary">
                <AvatarImage src={getAvatarUrl(user?.avatar)} alt={user?.name || "Avatar"} />
                <AvatarFallback className="bg-gray-200 text-gray-700 font-medium text-sm">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-secondary">
            <div className="px-4 pt-2 pb-3 space-y-1">
              {/* User info */}
              <div className="px-3 py-3 border-b border-gray-200 mb-2">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {user?.email}
                </p>
              </div>

              {/* Navigation links */}
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium no-underline ${
                    pathname === href
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {label}
                </Link>
              ))}

              {/* Menu actions */}
              <div className="pt-2 border-t border-gray-200 mt-2">
                <button
                  onClick={() => {
                    handleOpenProfile();
                    closeMobileMenu();
                  }}
                  className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  <User className="mr-3 h-5 w-5" />
                  <span>Perfil</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <ModalProfile
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfile}
      />
    </>
  );
};

export default AuthenticatedHeader;
