"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/site-header";
import { useUser } from "@/hooks/useUser";

type UserInfo = {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
  userName: string;
  phone: string;
};

export default function MinhaContaPage() {
  const { user, isLoading, isError, errorMessage } = useUser();

  const [form, setForm] = useState<UserInfo | null>(null);
  const [initialForm, setInitialForm] = useState<UserInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setForm(user);
      setInitialForm(user);
    }
  }, [user]);

  if (isError) return <p>Erro: {errorMessage}</p>;

  if (isLoading || !form) {
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

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) =>
      prev ? { ...prev, [name]: value } : prev
    );
    setSuccess(false);
    setError(null);
  }

  function isEmailValid(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function hasChanges() {
    if (!form || !initialForm) return false;
    return (
      form.name !== initialForm.name ||
      form.email !== initialForm.email ||
      (form.phone ?? "") !== (initialForm.phone ?? "") ||
      form.userName !== initialForm.userName
    );
  }

  async function onSave() {
    if (!form) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    if (!form.name.trim()) {
      setError("O nome é obrigatório.");
      setSaving(false);
      return;
    }
    if (!form.email.trim() || !isEmailValid(form.email)) {
      setError("Informe um email válido.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone?.trim() || null,
          userName: form.userName?.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao salvar");
      }

      const updatedUserRaw = await res.json();

      // Normaliza o objeto para UserInfo, garantindo todos os campos obrigatórios
      const updatedUser: UserInfo = {
        id: updatedUserRaw.id ?? "",
        name: updatedUserRaw.name ?? "",
        email: updatedUserRaw.email ?? "",
        profileImage:
          updatedUserRaw.profileImage === undefined
            ? null
            : updatedUserRaw.profileImage,
        userName: updatedUserRaw.userName ?? "",
        phone: updatedUserRaw.phone ?? "",
      };

      setForm(updatedUser);
      setInitialForm(updatedUser);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SiteHeader title="Minha Conta" />
      <main className="p-6 max-w-3xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-center">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={`/api/user/profileImage?file=${form.profileImage}`}
                alt={form.name}
              />
              <AvatarFallback>{form.name[0]}</AvatarFallback>
            </Avatar>

            <div className="space-y-2 flex-grow">
              <label className="block text-sm font-medium text-muted-foreground">
                Nome
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                className="w-full rounded border px-3 py-2"
                disabled={saving}
              />

              <label className="block text-sm font-medium text-muted-foreground mt-4">
                Nome de usuário
              </label>
              <input
                type="text"
                name="userName"
                value={form.userName}
                onChange={onChange}
                className="w-full rounded border px-3 py-2"
                disabled={saving}
              />

              <label className="block text-sm font-medium text-muted-foreground mt-4">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                className="w-full rounded border px-3 py-2"
                disabled={saving}
              />

              <label className="block text-sm font-medium text-muted-foreground mt-4">
                Telefone
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone || ""}
                onChange={onChange}
                className="w-full rounded border px-3 py-2"
                disabled={saving}
              />

              {error && <p className="text-red-600 mt-2">{error}</p>}
              {success && <p className="text-green-600 mt-2">Salvo com sucesso!</p>}

              <button
                onClick={onSave}
                disabled={saving || !hasChanges()}
                className="mt-4 rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
