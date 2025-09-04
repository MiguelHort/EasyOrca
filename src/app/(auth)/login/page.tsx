"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";

import { createUser, getUser } from "@/lib/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  NotepadTextDashed,
  Lock,
  Mail,
  User,
  Phone,
  Building2,
  Loader2,
  Eye,
  EyeOff,
  Facebook,
  Chrome,
  Linkedin,
} from "lucide-react";

// ================== ZOD SCHEMAS ==================
const emptyToUndefined = (val: unknown) =>
  typeof val === "string" && val.trim() === "" ? undefined : val;

const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Informe o e-mail.")
    .trim()
    .toLowerCase()
    .email("E-mail inválido."),
  passwordHash: z
    .string()
    .min(1, "Informe a senha.")
    .min(6, "A senha deve ter pelo menos 6 caracteres."),
});

const RegisterSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email é obrigatório.")
    .email("E-mail inválido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  userName: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .min(3, "Usuário deve ter ao menos 3 caracteres.")
      .max(30, "Usuário muito longo.")
      .regex(/^[a-zA-Z0-9._-]+$/, "Use letras, números, ponto, _ ou -.")
      .optional()
  ),
  phone: z.preprocess(
    emptyToUndefined,
    z.string().trim().regex(/^\+?\d{10,15}$/, "Telefone inválido.").optional()
  ),
  companyName: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .min(2, "Nome da empresa muito curto.")
      .max(80, "Nome da empresa muito longo.")
      .optional()
  ),
});

type LoginInputs = z.infer<typeof LoginSchema>;
type RegisterInputs = z.infer<typeof RegisterSchema>;

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forms separados
  const loginForm = useForm<LoginInputs>({
    resolver: zodResolver(LoginSchema),
    mode: "onSubmit",
  });

  const registerForm = useForm<RegisterInputs>({
    resolver: zodResolver(RegisterSchema),
    mode: "onSubmit",
  });

  // Login handler
  async function handleLogin(data: LoginInputs) {
    try {
      const response = await getUser(data);
      if (response) {
        setIsLoading(true);
        toast.success("Login realizado com sucesso!");
        await mutate("/api/infoUser");
        setTimeout(() => {
          localStorage.setItem("showPremiumDialog", "true");
          router.push("/home");
        }, 1200);
      } else {
        loginForm.setError("root", { message: "Credenciais inválidas." });
      }
    } catch (err) {
      loginForm.setError("root", {
        message: "Erro ao fazer login. Verifique os dados.",
      });
      toast.error("Erro ao fazer login");
    }
  }

  // Register handler
  async function handleRegister(data: RegisterInputs) {
    try {
      const response = await createUser(data);
      if (response) {
        toast.success("Cadastro realizado com sucesso!");
        setIsLogin(true);
        registerForm.reset();
      } else {
        toast.error("Não foi possível concluir o cadastro.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao cadastrar usuário");
    }
  }

  // Loading screen pós-login
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="text-center space-y-8 p-8">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <NotepadTextDashed className="relative h-20 w-20 stroke-2 text-primary mx-auto" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              EasyOrça
            </h1>
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
            <p className="text-muted-foreground">Carregando dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-5xl mx-auto">
        {/* Card */}
        <div className="overflow-hidden rounded-2xl bg-background shadow-xl ring-1 ring-black/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[620px]">
            {/* Painel lateral (desktop) */}
            <div className={`hidden lg:flex flex-col items-center justify-center gap-6 px-12 py-14 text-white relative bg-gradient-to-br from-primary to-primary/80`}>
              {/* Decor */}
              <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-white/10 blur-xl" />

              {/* Painel lateral com fade/slide entre estados */}
              <AnimatePresence mode="wait" initial={false}>
                {isLogin ? (
                  <motion.div
                    key="aside-login"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 10, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 24 }}
                    className="contents"
                  >
                    <>
                      <h2 className="text-4xl font-semibold tracking-tight text-white">
                        Bem-vindo de volta!
                      </h2>
                      <p className="text-white/90 text-center leading-relaxed max-w-sm">
                        Para se manter conectado conosco, faça login com suas informações
                        pessoais.
                      </p>
                      <Button
                        variant="secondary"
                        onClick={() => setIsLogin(false)}
                        className="rounded-full px-8 h-11 font-medium bg-white text-primary hover:bg-white/90"
                      >
                        Cadastrar-se
                      </Button>
                    </>
                  </motion.div>
                ) : (
                  <motion.div
                    key="aside-register"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 10, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 24 }}
                    className="contents"
                  >
                    <>
                      <h2 className="text-4xl font-semibold tracking-tight text-white">
                        Olá, Amigo!
                      </h2>
                      <p className="text-white/90 text-center leading-relaxed max-w-sm">
                        Insira seus dados pessoais e comece sua jornada conosco.
                      </p>
                      <Button
                        variant="secondary"
                        onClick={() => setIsLogin(true)}
                        className="rounded-full px-8 h-11 font-medium bg-white text-primary hover:bg-white/90"
                      >
                        Entrar
                      </Button>
                    </>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Área de formulários */}
            <div className="flex flex-col justify-center px-6 sm:px-10 py-10">
              {/* Header Mobile */}
              <div className="lg:hidden text-center mb-7">
                <Link href="/" className="inline-block mb-3">
                  <Image
                    src="/logoHeader2.png"
                    alt="Logo"
                    width={72}
                    height={72}
                    className="mx-auto"
                  />
                </Link>
                <h1 className="text-2xl font-bold text-primary">EasyOrça</h1>
              </div>

              {/* Toggle Mobile */}
              <div className="lg:hidden mx-auto mb-8 w-full max-w-sm">
                <div className="flex bg-muted rounded-full p-1">
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 h-10 rounded-full text-sm font-medium transition-all ${
                      isLogin ? "bg-primary text-white shadow" : "text-foreground/70"
                    }`}
                    aria-pressed={isLogin}
                    aria-label="Selecionar Entrar"
                  >
                    Entrar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 h-10 rounded-full text-sm font-medium transition-all ${
                      !isLogin ? "bg-primary text-white shadow" : "text-foreground/70"
                    }`}
                    aria-pressed={!isLogin}
                    aria-label="Selecionar Cadastrar"
                  >
                    Cadastrar
                  </button>
                </div>
              </div>

              {/* Wrapper com animação de deslizamento (login/register) */}
              <div className="relative mx-auto w-full max-w-sm overflow-hidden" aria-live="polite">
                <AnimatePresence mode="wait" initial={false}>
                  {isLogin ? (
                    <motion.div
                      key="login"
                      initial={{ x: 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -40, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 26 }}
                      className="w-full"
                      aria-hidden={!isLogin}
                    >
                      {/* LOGIN FORM */}
                      <div>
                        <div className="text-center mb-6">
                          <h2 className="text-3xl font-semibold text-foreground mb-2">
                            Entrar na Conta
                          </h2>
                          {/* Social */}
                          <div className="flex justify-center gap-3 mt-4">
                            <button
                              type="button"
                              title="Entrar com Facebook"
                              className="w-10 h-10 border border-border rounded-full grid place-items-center hover:bg-muted transition-colors"
                            >
                              <Facebook className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              title="Entrar com Google"
                              className="w-10 h-10 border border-border rounded-full grid place-items-center hover:bg-muted transition-colors"
                            >
                              <Chrome className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              title="Entrar com LinkedIn"
                              className="w-10 h-10 border border-border rounded-full grid place-items-center hover:bg-muted transition-colors"
                            >
                              <Linkedin className="w-5 h-5" />
                            </button>
                          </div>
                          <p className="text-muted-foreground text-sm mt-3">
                            ou use seu email para login
                          </p>
                        </div>

                        <form
                          onSubmit={loginForm.handleSubmit(handleLogin)}
                          className="space-y-5"
                        >
                          <div className="relative">
                            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                              <Mail className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <Input
                              type="email"
                              placeholder="Email"
                              className="h-12 w-full pl-11 pr-3 rounded-xl"
                              {...loginForm.register("email")}
                            />
                            {loginForm.formState.errors.email && (
                              <p className="text-destructive text-xs mt-1">
                                {loginForm.formState.errors.email.message}
                              </p>
                            )}
                          </div>

                          <div className="relative">
                            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                              <Lock className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Senha"
                              className="h-12 w-full pl-11 pr-11 rounded-xl"
                              {...loginForm.register("passwordHash")}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((s) => !s)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                            {loginForm.formState.errors.passwordHash && (
                              <p className="text-destructive text-xs mt-1">
                                {loginForm.formState.errors.passwordHash.message}
                              </p>
                            )}
                          </div>

                          {loginForm.formState.errors.root && (
                            <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-3 py-2">
                              <p className="text-destructive text-sm">
                                {loginForm.formState.errors.root.message}
                              </p>
                            </div>
                          )}

                          <Button
                            type="submit"
                            disabled={loginForm.formState.isSubmitting}
                            className="w-full h-12 text-base rounded-xl"
                          >
                            {loginForm.formState.isSubmitting ? (
                              <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Entrando…
                              </span>
                            ) : (
                              "Entrar"
                            )}
                          </Button>
                        </form>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="register"
                      initial={{ x: 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -40, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 26 }}
                      className="w-full"
                      aria-hidden={isLogin}
                    >
                      {/* REGISTER FORM */}
                      <div>
                        <div className="text-center mb-6">
                          <h2 className="text-3xl font-semibold text-foreground mb-2">
                            Criar Conta
                          </h2>
                          {/* Social */}
                          <div className="flex justify-center gap-3 mt-4">
                            <button
                              type="button"
                              title="Cadastrar com Facebook"
                              className="w-10 h-10 border border-border rounded-full grid place-items-center hover:bg-muted transition-colors"
                            >
                              <Facebook className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              title="Cadastrar com Google"
                              className="w-10 h-10 border border-border rounded-full grid place-items-center hover:bg-muted transition-colors"
                            >
                              <Chrome className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              title="Cadastrar com LinkedIn"
                              className="w-10 h-10 border border-border rounded-full grid place-items-center hover:bg-muted transition-colors"
                            >
                              <Linkedin className="w-5 h-5" />
                            </button>
                          </div>
                          <p className="text-muted-foreground text-sm mt-3">
                            ou use seu email para cadastro
                          </p>
                        </div>

                        <form
                          onSubmit={registerForm.handleSubmit(handleRegister)}
                          className="space-y-5"
                        >
                          <div className="relative">
                            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                              <User className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <Input
                              type="text"
                              placeholder="Nome"
                              className="h-12 w-full pl-11 pr-3 rounded-xl"
                              {...registerForm.register("name")}
                            />
                            {registerForm.formState.errors.name && (
                              <p className="text-destructive text-xs mt-1">
                                {registerForm.formState.errors.name.message}
                              </p>
                            )}
                          </div>

                          <div className="relative">
                            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                              <Mail className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <Input
                              type="email"
                              placeholder="Email"
                              className="h-12 w-full pl-11 pr-3 rounded-xl"
                              {...registerForm.register("email")}
                            />
                            {registerForm.formState.errors.email && (
                              <p className="text-destructive text-xs mt-1">
                                {registerForm.formState.errors.email.message}
                              </p>
                            )}
                          </div>

                          <div className="relative">
                            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                              <Lock className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Senha"
                              className="h-12 w-full pl-11 pr-11 rounded-xl"
                              {...registerForm.register("password")}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((s) => !s)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                            {registerForm.formState.errors.password && (
                              <p className="text-destructive text-xs mt-1">
                                {registerForm.formState.errors.password.message}
                              </p>
                            )}
                          </div>

                          {/* Campos opcionais em grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative">
                              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <Input
                                type="text"
                                placeholder="Empresa (opcional)"
                                className="h-11 w-full pl-10 pr-3 rounded-xl text-sm"
                                {...registerForm.register("companyName")}
                              />
                              {registerForm.formState.errors.companyName && (
                                <p className="text-destructive text-xs mt-1">
                                  {registerForm.formState.errors.companyName.message}
                                </p>
                              )}
                            </div>

                            <div className="relative">
                              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <Input
                                type="tel"
                                placeholder="Telefone (opcional)"
                                className="h-11 w-full pl-10 pr-3 rounded-xl text-sm"
                                {...registerForm.register("phone")}
                              />
                              {registerForm.formState.errors.phone && (
                                <p className="text-destructive text-xs mt-1">
                                  {registerForm.formState.errors.phone.message}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="relative">
                            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                              <User className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <Input
                              type="text"
                              placeholder="Nome de usuário (opcional)"
                              className="h-12 w-full pl-11 pr-3 rounded-xl"
                              {...registerForm.register("userName")}
                            />
                            {registerForm.formState.errors.userName && (
                              <p className="text-destructive text-xs mt-1">
                                {registerForm.formState.errors.userName.message}
                              </p>
                            )}
                          </div>

                          <Button
                            type="submit"
                            disabled={registerForm.formState.isSubmitting}
                            className="w-full h-12 text-base rounded-xl"
                          >
                            {registerForm.formState.isSubmitting ? (
                              <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Cadastrando…
                              </span>
                            ) : (
                              "Cadastrar"
                            )}
                          </Button>
                        </form>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Footer discreto */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} EasyOrça — Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}
