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
  User,
  Phone,
  Building2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createUser } from "@/lib/services/auth";
import Image from "next/image";

type Inputs = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  userName?: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  async function handleRegister(data: Inputs) {
    try {
      const response = await createUser(data);
      if (response) {
        router.push("/login");
        toast.success(
          "Cadastro realizado com sucesso! Faça login para continuar."
        );
      }
    } catch {
      toast.error(
        <div className="text-red-500">Erro ao cadastrar usuário</div>
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sidebar-border p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image src="/logoHeader2.png" alt="Logo" width={160} height={160} />
          </div>
          <p className="mt-2 text-muted-foreground">
            Orçamentos prontos em segundos. <br />
            Profissionalismo em cada clique.
          </p>
        </div>

        <Card className="py-8 px-6">
          <CardHeader>
            <CardTitle>Cadastro</CardTitle>
            <CardDescription>
              Crie sua conta para acessar a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleRegister)}>
              <div className="grid gap-4">
                {/* Nome */}
                <div className="flex items-center border-2 rounded-md pl-4">
                  <User className="h-4 w-4 stroke-zinc-600" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nome"
                    className="border-none"
                    {...register("name", { required: "Nome é obrigatório" })}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs">{errors.name.message}</p>
                )}

                {/* Email */}
                <div className="flex items-center border-2 rounded-md pl-4">
                  <Mail className="h-4 w-4 stroke-zinc-600" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    className="border-none"
                    {...register("email", { required: "Email é obrigatório" })}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email.message}</p>
                )}

                {/* Senha */}
                <div className="flex items-center border-2 rounded-md pl-4">
                  <Lock className="h-4 w-4 stroke-zinc-600" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Senha"
                    className="border-none"
                    {...register("password", {
                      required: "Senha é obrigatória",
                    })}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs">
                    {errors.password.message}
                  </p>
                )}

                {/* Username */}
                <div className="flex items-center border-2 rounded-md pl-4">
                  <User className="h-4 w-4 stroke-zinc-600" />
                  <Input
                    id="userName"
                    type="text"
                    placeholder="Nome de usuário (opcional)"
                    className="border-none"
                    {...register("userName")}
                  />
                </div>

                {/* Telefone */}
                <div className="flex items-center border-2 rounded-md pl-4">
                  <Phone className="h-4 w-4 stroke-zinc-600" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Telefone (opcional)"
                    className="border-none"
                    {...register("phone")}
                  />
                </div>

                <Button type="submit" className="w-full cursor-pointer">
                  Cadastrar
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Já tem uma conta?{" "}
                  <a href="/login" className="text-blue-600 hover:underline">
                    Faça login
                  </a>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    // <div className="min-h-screen flex items-center justify-center bg-sidebar-border p-4">
    //   <Card className="py-8 px-6 max-w-md w-full text-center">
    //     <CardHeader>
    //       <CardTitle>Atenção</CardTitle>
    //       <CardDescription>
    //         Para realizar o cadastro, entre em contato com o desenvolvedor.
    //       </CardDescription>
    //     </CardHeader>
    //     <CardContent>
    //       <p className="text-muted-foreground mb-4">
    //         Caso precise de acesso, envie um e-mail para{" "}
    //         <span className="font-semibold">miguel.hort@gmail.com</span>
    //       </p>
    //       <Button onClick={() => router.push("/login")} className="w-full">
    //         Voltar para Login
    //       </Button>
    //     </CardContent>
    //   </Card>
    // </div>
  );
}
