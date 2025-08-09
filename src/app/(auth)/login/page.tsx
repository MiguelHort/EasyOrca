"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import {
  NotepadTextDashed,
  Lock,
  Mail,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { getUser } from "@/lib/services/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import Image from "next/image";
import { mutate } from "swr";
import Link from "next/link";

type Inputs = {
  email: string;
  passwordHash: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  async function handleLogin(data: Inputs) {
    try {
      const response = await getUser(data); // faz login e recebe cookies HttpOnly

      if (response) {
        setIsLoading(true);
        toast.success("Login realizado com sucesso!");

        // ✅ Atualiza o cache do SWR para /api/infoUser
        await mutate("/api/infoUser");

        // Redireciona para /home após 3s
        setTimeout(() => {
          localStorage.setItem("showPremiumDialog", "true");
          router.push("/home");
        }, 3000);
      }
    } catch {
      toast.error(<div className="text-red-500">Erro ao fazer login</div>);
    }
  }

  // Tela de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sidebar-border p-4">
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-4">
            <NotepadTextDashed className="h-16 w-16 stroke-2 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-sz-1">
            EasyOrça
          </h1>
          <div className="space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <p className="text-muted-foreground text-lg">
              Carregando dashboard...
            </p>
            <p className="text-muted-foreground text-sm">
              Preparando tudo para você!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sidebar-border p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link className="flex justify-center mb-4" href="/">
            <Image src="/logoHeader2.png" alt="Logo" width={160} height={160} />
          </Link>
          <p className="mt-2 text-muted-foreground">
            Orçamentos prontos em segundos. <br />
            Profissionalismo em cada clique.
          </p>
        </div>

        <Card className="py-8 px-6">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleLogin)}>
              <div className="grid gap-4">
                <div className="flex flex-col gap-1">
                  {/* Campo Email */}
                  <div className="flex items-center border-2 rounded-md pl-4">
                    <Mail className="h-4 w-4 stroke-zinc-600" />
                    <Input
                      id="email"
                      type="text"
                      placeholder="Email"
                      className="border-none"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs"></p>}

                  {/* Campo Senha com botão de ver senha */}
                  <div className="flex items-center border-2 rounded-md pl-4 pr-2">
                    <Lock className="h-4 w-4 stroke-zinc-600" />
                    <Input
                      id="senha"
                      type={showPassword ? "text" : "password"}
                      placeholder="Senha"
                      className="border-none flex-1"
                      {...register("passwordHash")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.passwordHash && (
                    <p className="text-red-500 text-xs"></p>
                  )}
                </div>

                <Button type="submit" className="w-full cursor-pointer">
                  Entrar
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  Não tem uma conta?{" "}
                  <a href="/register" className="text-blue-600 hover:underline">
                    Cadastre-se
                  </a>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
