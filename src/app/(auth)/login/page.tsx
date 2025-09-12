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
    z
      .string()
      .trim()
      .regex(/^\+?\d{10,15}$/, "Telefone inválido.")
      .optional()
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

  // Helpers
  function allFilled<T extends Record<string, any>>(
    obj: T,
    keys: ReadonlyArray<keyof T>
  ) {
    return keys.every((k) => {
      const v = obj[k];
      return typeof v === "string" ? v.trim().length > 0 : Boolean(v);
    });
  }

  // Watches (react-hook-form)
  const loginValues = loginForm.watch();
  const registerValues = registerForm.watch();

  // Todos completos?
  const isLoginComplete = allFilled(loginValues, [
    "email",
    "passwordHash",
  ] as const);

  // Se quiser exigir TODOS no cadastro:
  const isRegisterComplete = allFilled(registerValues, [
    "name",
    "email",
    "password",
    "companyName",
    "phone",
    "userName",
  ] as const);

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
        }, 6000);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="text-center space-y-10">
          {/* Logo moderno com glassmorphism */}
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10 rounded-3xl blur-2xl animate-pulse" />
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-5 shadow-2xl border border-white/50">
              <NotepadTextDashed className="h-14 w-14 stroke-[1.5] text-primary drop-shadow-sm" />
            </div>
          </div>

          {/* Nome com tipografia moderna */}
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              EasyOrça
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Criando seu orçamento
            </p>
          </div>

          {/* Interface moderna de orçamento sendo construída */}
          <div className="relative">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 w-[360px] md:w-[400px] mx-auto shadow-2xl border border-white/50">
              <div className="space-y-6">
                {/* Header com info do cliente */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full opacity-0 animate-fade-in" />
                      <span
                        className="text-sm font-semibold text-gray-700 opacity-0 animate-fade-in"
                        style={{ animationDelay: "0.2s" }}
                      >
                        Cliente conectado
                      </span>
                    </div>
                    <div
                      className="h-3 bg-gradient-to-r from-primary/60 to-transparent rounded-full animate-expand-width w-0"
                      style={{ animationDelay: "0.5s" }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-2 h-2 bg-blue-400 rounded-full opacity-0 animate-fade-in"
                        style={{ animationDelay: "1s" }}
                      />
                      <span
                        className="text-sm font-semibold text-gray-700 opacity-0 animate-fade-in"
                        style={{ animationDelay: "1.2s" }}
                      >
                        Dados carregados
                      </span>
                    </div>
                    <div
                      className="h-3 bg-gradient-to-r from-blue-400/60 to-transparent rounded-full animate-expand-width w-0"
                      style={{ animationDelay: "1.5s" }}
                    />
                  </div>
                </div>

                {/* Seção de produtos com cards modernos */}
                <div className="space-y-4">
                  <h3
                    className="text-lg font-bold text-gray-800 opacity-0 animate-fade-in"
                    style={{ animationDelay: "2s" }}
                  >
                    Produtos & Serviços
                  </h3>

                  <div className="space-y-3">
                    {/* Card 1 */}
                    <div
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-xl border border-primary/10 opacity-0 animate-slide-up"
                      style={{ animationDelay: "2.5s" }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                          <div className="w-3 h-3 bg-primary rounded" />
                        </div>
                        <div className="space-y-1">
                          <div className="h-3 bg-gray-300 rounded animate-shimmer w-24" />
                          <div className="h-2 bg-gray-200 rounded animate-shimmer w-16" />
                        </div>
                      </div>
                      <div className="h-4 bg-gradient-to-r from-primary to-primary/70 rounded animate-shimmer w-16" />
                    </div>

                    {/* Card 2 */}
                    <div
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/5 to-transparent rounded-xl border border-blue-500/10 opacity-0 animate-slide-up"
                      style={{ animationDelay: "3s" }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <div className="w-3 h-3 bg-blue-500 rounded" />
                        </div>
                        <div className="space-y-1">
                          <div
                            className="h-3 bg-gray-300 rounded animate-shimmer w-28"
                            style={{ animationDelay: "0.3s" }}
                          />
                          <div
                            className="h-2 bg-gray-200 rounded animate-shimmer w-20"
                            style={{ animationDelay: "0.6s" }}
                          />
                        </div>
                      </div>
                      <div
                        className="h-4 bg-gradient-to-r from-blue-500 to-blue-400 rounded animate-shimmer w-20"
                        style={{ animationDelay: "0.5s" }}
                      />
                    </div>

                    {/* Card 3 */}
                    <div
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/5 to-transparent rounded-xl border border-green-500/10 opacity-0 animate-slide-up"
                      style={{ animationDelay: "3.5s" }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <div className="w-3 h-3 bg-green-500 rounded" />
                        </div>
                        <div className="space-y-1">
                          <div
                            className="h-3 bg-gray-300 rounded animate-shimmer w-32"
                            style={{ animationDelay: "0.2s" }}
                          />
                          <div
                            className="h-2 bg-gray-200 rounded animate-shimmer w-18"
                            style={{ animationDelay: "0.4s" }}
                          />
                        </div>
                      </div>
                      <div
                        className="h-4 bg-gradient-to-r from-green-500 to-green-400 rounded animate-shimmer w-18"
                        style={{ animationDelay: "0.3s" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Total com destaque especial */}
                <div className="pt-4 border-t border-gray-200">
                  <div
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20 opacity-0 animate-slide-up"
                    style={{ animationDelay: "4s" }}
                  >
                    <span className="text-lg font-bold text-gray-800">
                      Total do Orçamento
                    </span>
                    <div className="h-6 bg-gradient-to-r from-primary to-primary/80 rounded-lg animate-pulse-glow w-32" />
                  </div>
                </div>
              </div>
            </div>

            {/* Cursor animado */}
            <div className="absolute top-8 right-8 w-6 h-6 bg-primary rounded-full shadow-lg animate-float opacity-75">
              <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-50" />
            </div>
          </div>

          {/* Status moderno */}
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2 opacity-0 animate-fade-in">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-600 font-medium">Conectando</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div
              className="flex items-center space-x-2 opacity-0 animate-fade-in"
              style={{ animationDelay: "2s" }}
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-gray-600 font-medium">Processando</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div
              className="flex items-center space-x-2 opacity-0 animate-fade-in"
              style={{ animationDelay: "4s" }}
            >
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-gray-600 font-medium">Finalizando</span>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fade-in {
            0% {
              opacity: 0;
              transform: translateY(10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes expand-width {
            0% {
              width: 0;
            }
            100% {
              width: 80px;
            }
          }
          @keyframes slide-up {
            0% {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @keyframes shimmer {
            0%,
            100% {
              opacity: 0.3;
            }
            50% {
              opacity: 0.8;
            }
          }
          @keyframes pulse-glow {
            0%,
            100% {
              box-shadow: 0 0 0 rgba(var(--primary), 0);
            }
            50% {
              box-shadow: 0 0 20px rgba(var(--primary), 0.3);
            }
          }
          @keyframes float {
            0%,
            100% {
              transform: translateY(0) rotate(0deg);
            }
            33% {
              transform: translateY(-10px) rotate(120deg);
            }
            66% {
              transform: translateY(5px) rotate(240deg);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.8s ease-out forwards;
          }
          .animate-expand-width {
            animation: expand-width 1s ease-out forwards;
          }
          .animate-slide-up {
            animation: slide-up 0.6s ease-out forwards;
          }
          .animate-shimmer {
            animation: shimmer 1.5s ease-in-out infinite;
          }
          .animate-pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>
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
            <div
              className={`hidden lg:flex flex-col items-center justify-center gap-6 px-12 py-14 text-white relative bg-gradient-to-br from-primary to-primary/80`}
            >
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
                        Para se manter conectado conosco, faça login com suas
                        informações pessoais.
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
                      isLogin
                        ? "bg-primary text-white shadow"
                        : "text-foreground/70"
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
                      !isLogin
                        ? "bg-primary text-white shadow"
                        : "text-foreground/70"
                    }`}
                    aria-pressed={!isLogin}
                    aria-label="Selecionar Cadastrar"
                  >
                    Cadastrar
                  </button>
                </div>
              </div>

              {/* Wrapper com animação de deslizamento (login/register) */}
              <div
                className="relative mx-auto w-full max-w-sm overflow-hidden"
                aria-live="polite"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isLogin ? (
                    <motion.div
                      key="login"
                      initial={{ x: 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -40, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 26,
                      }}
                      className="w-full"
                      aria-hidden={!isLogin}
                    >
                      {/* LOGIN FORM */}
                      <div>
                        <div className="text-center mb-6">
                          <h2 className="text-3xl font-semibold text-foreground mb-2">
                            Entrar na Conta
                          </h2>
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
                              aria-label={
                                showPassword ? "Ocultar senha" : "Mostrar senha"
                              }
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                            {loginForm.formState.errors.passwordHash && (
                              <p className="text-destructive text-xs mt-1">
                                {
                                  loginForm.formState.errors.passwordHash
                                    .message
                                }
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
                            disabled={
                              loginForm.formState.isSubmitting ||
                              !isLoginComplete
                            }
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

                          {!isLoginComplete && (
                            <p className="mt-2 text-xs text-red-500">
                              Preencha{" "}
                              <span className="font-medium">e-mail</span> e{" "}
                              <span className="font-medium">senha</span> para
                              continuar.
                            </p>
                          )}
                        </form>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="register"
                      initial={{ x: 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -40, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 26,
                      }}
                      className="w-full"
                      aria-hidden={isLogin}
                    >
                      {/* REGISTER FORM */}
                      <div>
                        <div className="text-center mb-6">
                          <h2 className="text-3xl font-semibold text-foreground mb-2">
                            Criar Conta
                          </h2>
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
                              aria-label={
                                showPassword ? "Ocultar senha" : "Mostrar senha"
                              }
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
                                placeholder="Empresa"
                                className="h-11 w-full pl-10 pr-3 rounded-xl text-sm"
                                {...registerForm.register("companyName")}
                              />
                              {registerForm.formState.errors.companyName && (
                                <p className="text-destructive text-xs mt-1">
                                  {
                                    registerForm.formState.errors.companyName
                                      .message
                                  }
                                </p>
                              )}
                            </div>

                            <div className="relative">
                              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <Input
                                type="tel"
                                placeholder="Telefone"
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
                              placeholder="Nome de usuário"
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
                            disabled={
                              registerForm.formState.isSubmitting ||
                              !isRegisterComplete
                            }
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

                          {!isRegisterComplete && (
                            <p className="mt-2 text-xs text-red-500">
                              Preencha todos os campos para criar sua conta.
                            </p>
                          )}
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
