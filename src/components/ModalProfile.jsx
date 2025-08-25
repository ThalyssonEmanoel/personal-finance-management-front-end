import ButtonC from './Custom-Button';
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useState } from 'react';
import { Eye, EyeOff } from "lucide-react"
import { updateUserSchema, changePasswordSchema } from "@/schemas/UserSchemas"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/hooks/useAuth"
import { useSession } from "next-auth/react"

export function ModalProfile({ isOpen, onClose }) {
  const [tab, setTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const { getUserInfo, updateUserInfo, authenticatedFetch } = useAuth();
  const { update } = useSession();
  const user = getUserInfo();

  const profileForm = useForm({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      avatar: null,
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    const fileName = avatarPath.replace('src/uploads/', '');
    const baseUrl = `https://personal-finance-api.app.fslab.dev/uploads/${fileName}`;
    // Adiciona timestamp para evitar cache de imagem
    return `${baseUrl}?t=${Date.now()}`;
  };

  if (!isOpen) return null;

  const handleProfileSubmit = async (data) => {
    setIsLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      if (data.avatar && data.avatar.size > 2 * 1024 * 1024) {
        profileForm.setError('avatar', {
          type: 'manual',
          message: 'O arquivo de imagem deve ter no máximo 2MB.',
        });
        return;
      }

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);

      if (data.avatar) {
        formData.append('avatar', data.avatar);
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`;
      const response = await authenticatedFetch(url, {
        method: 'PATCH',
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Erro na atualização do usuário');
      }

      // Log para debug - verificar estrutura da resposta
      console.log('Resposta do backend:', responseData);

      if (responseData && !responseData.error) {
        setProfileSuccess('Perfil atualizado com sucesso!');

        // Atualiza as informações do usuário na sessão
        const updatedUserInfo = {
          ...user,
          name: data.name,
          email: data.email,
        };

        // Atualiza o avatar apenas se uma nova imagem foi enviada e o backend retornou um novo caminho
        if (data.avatar && responseData.avatar) {
          updatedUserInfo.avatar = responseData.avatar;
        } else if (data.avatar && responseData.user?.avatar) {
          updatedUserInfo.avatar = responseData.user.avatar;
        } else if (data.avatar && responseData.data?.avatar) {
          updatedUserInfo.avatar = responseData.data.avatar;
        }

        await updateUserInfo(updatedUserInfo);

        // Força atualização da sessão para garantir que os dados sejam refletidos
        await update(updatedUserInfo);

        // Força a re-renderização do componente para mostrar a nova imagem
        if (data.avatar && updatedUserInfo.avatar) {
          // Adiciona um timestamp para forçar o reload da imagem
          const imageElement = document.querySelector('[alt="Avatar atual"]');
          if (imageElement) {
            const newSrc = getAvatarUrl(updatedUserInfo.avatar) + '?t=' + Date.now();
            imageElement.src = newSrc;
          }
        }

        if (data.avatar) {
          document.getElementById("profile-file-name").textContent = "Nenhum arquivo escolhido";
          profileForm.setValue('avatar', null);
        }

        setTimeout(() => {
          setProfileSuccess('');
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setProfileError(error.message || 'Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (data) => {
    setIsLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/change-password`;
      const response = await authenticatedFetch(url, {
        method: 'PATCH',
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Erro ao alterar senha');
      }

      if (responseData && !responseData.error) {
        setPasswordSuccess('Senha alterada com sucesso!');
        passwordForm.reset();

        setTimeout(() => {
          setPasswordSuccess('');
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setPasswordError(error.message || 'Erro ao alterar senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="relative mb-4">
          <h2 className="text-xl font-semibold text-center w-full">
            Perfil do Usuário
          </h2>
          <button
            onClick={onClose}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="flex w-full max-w-sm flex-col gap-6">
          <Tabs value={tab} onValueChange={setTab} defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">Dados do Perfil</TabsTrigger>
              <TabsTrigger value="password">Alterar Senha</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <Card>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
                    <CardContent className="grid gap-6">
                      {profileError && (
                        <div className="text-red-500 text-sm text-center">
                          {profileError}
                        </div>
                      )}
                      {profileSuccess && (
                        <div className="text-green-500 text-sm text-center">
                          {profileSuccess}
                        </div>
                      )}

                      {user?.avatar && (
                        <div className="flex flex-col items-center gap-2">
                          <Label>Foto atual</Label>
                          <img
                            src={getAvatarUrl(user.avatar)}
                            alt="Avatar atual"
                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                          />
                        </div>
                      )}

                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome *</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Ex.: João Silva"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Ex.: example@gmail.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="avatar"
                        render={({ field: { onChange, value, ...field } }) => (
                          <FormItem>
                            <FormLabel>Nova foto de perfil (opcional, máximo 2MB)</FormLabel>
                            <div className="grid gap-3 w-44">
                              <FormControl>
                                <input
                                  id="profile-user-image"
                                  type="file"
                                  accept="image/*"
                                  className="hidden rounded-sm"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    onChange(file);
                                    const fileName = file?.name || "Nenhum arquivo escolhido";
                                    document.getElementById("profile-file-name").textContent = fileName;
                                  }}
                                />
                              </FormControl>
                              <label
                                htmlFor="profile-user-image"
                                className="text-center  border-2 rounded-sm text-black text-sm hover:text-white hover:shadow-md hover:bg-brown duration-200 cursor-pointer"
                              >
                                Selecionar nova imagem
                              </label>
                              <span id="profile-file-name" className="text-sm text-gray-600">
                                Nenhum arquivo escolhido
                              </span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter>
                      <ButtonC
                        texto={isLoading ? "Atualizando..." : "Atualizar perfil"}
                        largura="334.4px"
                        altura="34px"
                        type="submit"
                        disabled={isLoading}
                      />
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            </TabsContent>
            <TabsContent value="password">
              <Card>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
                    <CardContent className="grid gap-6">
                      {passwordError && (
                        <div className="text-red-500 text-sm text-center">
                          {passwordError}
                        </div>
                      )}
                      {passwordSuccess && (
                        <div className="text-green-500 text-sm text-center">
                          {passwordSuccess}
                        </div>
                      )}
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem className="relative">
                            <FormLabel>Senha atual *</FormLabel>
                            <FormControl>
                              <Input
                                type={showCurrentPassword ? "text" : "password"}
                                className="pr-10"
                                {...field}
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                            >
                              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem className="relative">
                            <FormLabel>Nova senha *</FormLabel>
                            <FormControl>
                              <Input
                                type={showNewPassword ? "text" : "password"}
                                className="pr-10"
                                placeholder="Mínimo 8 caracteres com maiúscula, minúscula, número e caractere especial"
                                {...field}
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                            >
                              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem className="relative">
                            <FormLabel>Confirmar nova senha *</FormLabel>
                            <FormControl>
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                className="pr-10 mb-6"
                                {...field}
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                            >
                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter>
                      <ButtonC
                        texto={isLoading ? "Alterando senha..." : "Alterar senha"}
                        largura="334.4px"
                        altura="40px"
                        type="submit"
                        disabled={isLoading}
                      />
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
