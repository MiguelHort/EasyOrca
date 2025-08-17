// app/(auth)/register/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createUser } from "@/lib/services/auth";

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
  Lock,
  Mail,
  User,
  Phone,
  Building2,
} from "lucide-react";

// --------- Helpers para transformar string vazia em undefined ---------
const emptyToUndefined = (val: unknown) =>
  typeof val === "string" && val.trim() === "" ? undefined : val;

// --------- ZOD SCHEMA (Zod v4) ---------
const RegisterSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório."),
  email: z.string().trim().toLowerCase().min(1, "Email é obrigatório.").email("E-mail inválido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  // opcionais
  userName: z.preprocess(
    emptyToUndefined,
    z.string()
      .trim()
      .min(3, "Usuário deve ter ao menos 3 caracteres.")
      .max(30, "Usuário muito longo.")
      .regex(/^[a-zA-Z0-9._-]+$/, "Use letras, números, ponto, _ ou -.")
      .optional()
  ),
  phone: z.preprocess(
    emptyToUndefined,
    z.string()
      .trim()
      .regex(/^\+?\d{10,15}$/, "Telefone inválido.")
      .optional()
  ),
  companyName: z.preprocess(
    emptyToUndefined,
    z.string()
      .trim()
      .min(2, "Nome da empresa muito curto.")
      .max(80, "Nome da empresa muito longo.")
      .optional()
  ),
});

type Inputs = z.infer<typeof RegisterSchema>;

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    resolver: zodResolver(RegisterSchema),
    mode: "onSubmit",
  });

  async function handleRegister(data: Inputs) {
    try {
      // Envia somente campos preenchidos (os undefined não vão no body final,
      // depende de como seu createUser implementa o fetch; mantenha do lado do serviço se preferir)
      const response = await createUser(data);

      if (response) {
        toast.success("Cadastro realizado com sucesso! Faça login para continuar.");
        router.push("/login");
      } else {
        toast.error("Não foi possível concluir o cadastro.");
      }
    } catch (err) {
      console.error(err);
      toast.error(<div className="text-red-500">Erro ao cadastrar usuário</div>);
    }
  }

  const borderClass = (hasError?: boolean) =>
    ["flex items-center rounded-md pl-4 border-2", hasError ? "border-red-500" : "border-zinc-200"].join(" ");

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
            <CardTitle>Cadastro</CardTitle>
            <CardDescription>Crie sua conta para acessar a plataforma</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(handleRegister)} noValidate>
              <div className="grid gap-4">
                {/* Nome */}
                <div className="flex flex-col gap-1">
                  <div className={borderClass(!!errors.name)}>
                    <User className="h-4 w-4 stroke-zinc-600" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Nome"
                      className="border-none"
                      aria-invalid={!!errors.name}
                      aria-describedby="name-error"
                      {...register("name")}
                    />
                  </div>
                  {errors.name && (
                    <p id="name-error" className="text-red-500 text-xs">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <div className={borderClass(!!errors.email)}>
                    <Mail className="h-4 w-4 stroke-zinc-600" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email"
                      className="border-none"
                      inputMode="email"
                      aria-invalid={!!errors.email}
                      aria-describedby="email-error"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p id="email-error" className="text-red-500 text-xs">{errors.email.message}</p>
                  )}
                </div>

                {/* Senha */}
                <div className="flex flex-col gap-1">
                  <div className={borderClass(!!errors.password)}>
                    <Lock className="h-4 w-4 stroke-zinc-600" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Senha"
                      className="border-none"
                      aria-invalid={!!errors.password}
                      aria-describedby="password-error"
                      {...register("password")}
                    />
                  </div>
                  {errors.password && (
                    <p id="password-error" className="text-red-500 text-xs">{errors.password.message}</p>
                  )}
                </div>

                {/* Nome da empresa (opcional) */}
                <div className="flex flex-col gap-1">
                  <div className={borderClass(!!errors.companyName)}>
                    <Building2 className="h-4 w-4 stroke-zinc-600" />
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="Nome da empresa (opcional)"
                      className="border-none"
                      aria-invalid={!!errors.companyName}
                      aria-describedby="companyName-error"
                      {...register("companyName")}
                    />
                  </div>
                  {errors.companyName && (
                    <p id="companyName-error" className="text-red-500 text-xs">
                      {errors.companyName.message}
                    </p>
                  )}
                </div>

                {/* Username (opcional) */}
                <div className="flex flex-col gap-1">
                  <div className={borderClass(!!errors.userName)}>
                    <User className="h-4 w-4 stroke-zinc-600" />
                    <Input
                      id="userName"
                      type="text"
                      placeholder="Nome de usuário (opcional)"
                      className="border-none"
                      aria-invalid={!!errors.userName}
                      aria-describedby="userName-error"
                      {...register("userName")}
                    />
                  </div>
                  {errors.userName && (
                    <p id="userName-error" className="text-red-500 text-xs">{errors.userName.message}</p>
                  )}
                </div>

                {/* Telefone (opcional) */}
                <div className="flex flex-col gap-1">
                  <div className={borderClass(!!errors.phone)}>
                    <Phone className="h-4 w-4 stroke-zinc-600" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Telefone (opcional)"
                      className="border-none"
                      aria-invalid={!!errors.phone}
                      aria-describedby="phone-error"
                      {...register("phone")}
                    />
                  </div>
                  {errors.phone && (
                    <p id="phone-error" className="text-red-500 text-xs">{errors.phone.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Cadastrando..." : "Cadastrar"}
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
  );
}
