"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/site-header";
import { useUser } from "@/hooks/useUser";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  userName: z.string().optional(),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function MinhaContaPage() {
  const { user, isLoading, isError, errorMessage } = useUser();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        userName: user.userName || "",
        email: user.email,
        phone: user.phone || "",
      });
    }
  }, [user, reset]);

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Erro ao salvar.");
      }

      const updated = await res.json();
      reset(updated); // reseta dirty flag com os dados atualizados
    } catch (err: any) {
      alert(err.message || "Erro ao salvar");
    }
  }

  if (isError) return <p>Erro: {errorMessage}</p>;

  if (isLoading || !user) {
    return (
      <div className="flex flex-col p-6 gap-3">
        <Card className="p-6 mx-auto min-w-sm max-w-3xl">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </Card>
      </div>
    );
  }

  return (
    <>
      <SiteHeader title="Minha Conta" />
      <main className="p-6 max-w-3xl mx-auto">
        <Card className="w-full max-w-3xl mx-auto">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-10 bg-muted rounded-lg p-4">
              <div className="flex gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage
                    src={`/api/user/profileImage?file=${user.profileImage}`}
                    alt={user.name}
                  />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-bold">{user.name}</p>
                  <p className="text-sm text-gray-500 font-normal">
                    {user.userName}
                  </p>
                </div>
              </div>
              <Button>Alterar Foto</Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  {...register("name")}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="userName">Nome de usuário</Label>
                <Input
                  id="userName"
                  {...register("userName")}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  disabled={isSubmitting}
                />
              </div>

              {isSubmitSuccessful && (
                <p className="text-sm text-green-600">Salvo com sucesso!</p>
              )}

              <Button
                type="submit"
                disabled={!isDirty || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
