"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, ChangeEvent, useRef } from "react";

import { useCompany } from "@/hooks/useCompany";

import { SiteHeader } from "@/components/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  image: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function EmpresaPage() {
  const { company, isLoading, isError } = useCompany();
  const [imgUrl, setImgUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (company) {
      reset({
        name: company.name,
        image: company.image || "",
      });
    }
  }, [company, reset]);

    // Carrega imagem quando usuário estiver disponível
  useEffect(() => {
    const fetchUrl = async () => {
      const res = await fetch(`/api/company/companyImage?nome=${company.image}`);
      const data = await res.json();
      if (data.url) setImgUrl(`${data.url}&t=${Date.now()}`); // evita cache
    };

    if (company?.image) fetchUrl();
  }, [company?.image]);

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/company", {
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

  // 🔼 Upload da imagem para API
    async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
      const file = event.target.files?.[0];
      if (!file || !company?.id) return;
  
      const formData = new FormData();
      formData.append("file", file);
      formData.append("companyId", company.id);

      const res = await fetch("/api/company/companyImage", {
        method: "POST",
        body: formData,
      });
  
      const result = await res.json();
  
      if (!res.ok) {
        alert(result.error || "Erro ao atualizar imagem");
        return;
      }
  
      // Atualiza imagem na tela
      const fetchUrl = async () => {
        const res = await fetch(`/api/user/profileImage?nome=${result.fileName}`);
        const data = await res.json();
        if (data.url) setImgUrl(`${data.url}&t=${Date.now()}`); // cache busting
      };
  
      await fetchUrl();
    }

  if (isError) {
    return <p className="text-destructive p-6">Erro ao carregar dados da empresa.</p>;
  }

  if (isLoading || !company) {
    return (
      <div className="flex flex-col p-6 gap-3">
        <Card className="p-6 mx-auto min-w-sm max-w-3xl">
          <Skeleton className="h-20 w-24 rounded-md" />
          <Skeleton className="h-6 w-1/2 mt-4" />
          <Skeleton className="h-4 w-1/3 mt-2" />
        </Card>
      </div>
    );
  }

  return (
    <>
      <SiteHeader title="Minha Empresa" />

      <main className="p-6 max-w-3xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6 flex gap-4 items-center">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-10 bg-muted rounded-lg p-4">
              <div className="flex gap-4 items-center">
                <div>
                  <img
                    src={imgUrl || `/api/company/companyImage?file=${company.image}`}
                    alt={company.name}
                    className="w-26 h-18 rounded-lg object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm sm:text-lg font-bold">{company.name}</p>
                  <p className="text-xs text-gray-500 font-normal">
                    {company.userName}
                  </p>
                </div>
              </div>

              <Button
                className="flex w-full sm:w-auto"
                onClick={() => fileInputRef.current?.click()}
              >
                Alterar Foto
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da empresa</Label>
                <Input
                  id="name"
                  {...register("name")}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              {isSubmitSuccessful && (
                <p className="text-sm text-green-600">Salvo com sucesso!</p>
              )}

              <Button
                type="submit"
                disabled={!isDirty || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
