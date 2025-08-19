'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from "next-auth/react"
import { useAuth } from "@/hooks/useAuth"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut } from "lucide-react"
import '../styles/globals.css'

const AuthenticatedHeader = () => {
    const { getUserInfo, isAuthenticated, logout } = useAuth();
    const user = getUserInfo();
    const pathname = usePathname();

    const handleLogout = async () => {
        await logout();
        signOut({ callbackUrl: "/introduction" });
    };

    const getAvatarUrl = (avatarPath) => {
        if (!avatarPath) return null;

        // Se o avatarPath contém o caminho completo "src/uploads/", extrair apenas o nome do arquivo
        if (avatarPath.includes('src/uploads/')) {
            const fileName = avatarPath.replace('src/uploads/', '');
            return `https://personal-finance-api.app.fslab.dev/uploads/${fileName}`;
        }

        // Caso contrário, assumir que é apenas o nome do arquivo
        const cleanPath = avatarPath.startsWith('/') ? avatarPath.slice(1) : avatarPath;
        return `https://personal-finance-api.app.fslab.dev/uploads/${cleanPath}`;
    };

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
        <nav className='bg-secondary border-b-2 border-solid border-b-tertiary flex justify-between items-center w-full h-24 px-6'>
            <div className="flex items-center space-x-8">
                <Link href="/introduction" className="no-underline text-black text-3xl font-bold">
                    Financial Record
                </Link>
            </div>
            <div className="flex items-center space-x-6">
                <Link
                    href="/home"
                    className={`flex items-center space-x-2 transition-colors no-underline ${pathname === '/home' ? 'border-b-2 border-black font-bold text-black' : 'text-black hover:text-gray-600'}`}
                >
                    <span>Página inicial</span>
                </Link>

                <Link
                    href="/accounts"
                    className={`flex items-center space-x-2 transition-colors no-underline ${pathname === '/accounts' ? 'border-b-2 border-black font-bold text-black' : 'text-black hover:text-gray-600'}`}
                >
                    <span>Contas</span>
                </Link>

                <Link
                    href="/goals"
                    className={`flex items-center space-x-2 transition-colors no-underline mr-60 ${pathname === '/goals' ? 'border-b-2 border-black font-bold text-black' : 'text-black hover:text-gray-600'}`}
                >
                    <span>Metas</span>
                </Link>
            </div>

            <div className="flex items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none">
                        <Avatar className="size-10 cursor-pointer hover:ring-2 hover:ring-gray-300 transition-all">
                            <AvatarImage
                                src={getAvatarUrl(user?.avatar)}
                                alt={user?.name || 'Avatar do usuário'}
                            />
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

                        <DropdownMenuItem className="cursor-pointer">
                            <span>Perfil</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem className="cursor-pointer">
                            <span>Alterar senha</span>
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
        </nav>
    );
};

export default AuthenticatedHeader;
