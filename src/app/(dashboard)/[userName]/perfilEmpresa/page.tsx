"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useCompany } from "@/hooks/useCompany";

import { SiteHeader } from "@/components/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  image: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function EmpresaPage() {
  const { company, isLoading, isError } = useCompany();

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
            {company.image ? (
              <img
                src={`/api/company/companyImage?file=${company.image}`}
                alt="Logo da empresa"
                className="w-24 h-20 rounded-lg object-cover"
              />
            ) : (
              <div className="w-24 h-20 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                Sem logo
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium">{company.name}</h3>
              <Badge className="mt-2">Empresa Ativa</Badge>
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
