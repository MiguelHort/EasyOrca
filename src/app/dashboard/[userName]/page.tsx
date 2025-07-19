"use client";

import { useEffect, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiteHeader } from "@/components/site-header";

export default function EditProfilePage() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    userName: "",
    phone: "",
    bio: "",
    gender: "Masculino",
    showThreadsBadge: true,
    showSuggestions: false,
    profileImage: "",
  });

  const [company, setCompany] = useState({
    companyName: "",
    cnpj: "",
    companyImage: "",
  });

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user"); // ajuste para sua API real
        const data = await res.json();

        setUser({
          name: data.name || "",
          email: data.email || "",
          userName: data.userName || "",
          phone: data.phone || "",
          bio: data.bio || "",
          gender: data.gender || "Masculino",
          showThreadsBadge: data.showThreadsBadge ?? true,
          showSuggestions: data.showSuggestions ?? false,
          profileImage: data.profileImage || "",
        });

        setCompany({
          companyName: data.companyName || "",
          cnpj: data.cnpj || "",
          companyImage: data.companyImage || "",
        });
      } catch (error) {
        console.error("Erro ao carregar dados do usuário/empresa", error);
      }
    }

    fetchUser();
  }, []);

  return (
    <>
      <SiteHeader title="Editar perfil" />
      <main className="max-w-2xl mx-auto px-4 py-10 space-y-10">

        {/* SEÇÃO: INFORMAÇÕES PESSOAIS */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={`/api/user/profileImage?file=${user.profileImage}`}
                alt={user.name}
              />
              <AvatarFallback className="text-lg uppercase">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-base font-medium">{user.userName}</h2>
              <p className="text-sm text-muted-foreground">{user.name}</p>
            </div>
            <Button variant="secondary" size="sm">
              Alterar foto
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Usuário</Label>
            <Input
              id="username"
              value={user.userName}
              onChange={(e) => setUser({ ...user, userName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={user.phone}
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              maxLength={150}
              value={user.bio}
              onChange={(e) => setUser({ ...user, bio: e.target.value })}
              className="resize-none"
            />
            <div className="text-sm text-muted-foreground text-right">
              {user.bio.length} / 150
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gênero</Label>
            <Select
              value={user.gender}
              onValueChange={(value) => setUser({ ...user, gender: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Feminino">Feminino</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
                <SelectItem value="Prefiro não informar">
                  Prefiro não informar
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between border p-4 rounded-lg">
            <div className="space-y-1">
              <Label>Mostrar selo do Threads</Label>
              <p className="text-sm text-muted-foreground">
                Ativar ou não o selo no seu perfil
              </p>
            </div>
            <Switch
              checked={user.showThreadsBadge}
              onCheckedChange={(val) =>
                setUser({ ...user, showThreadsBadge: val })
              }
            />
          </div>

          <div className="flex items-center justify-between border p-4 rounded-lg">
            <div className="space-y-1">
              <Label>Mostrar sugestões de contas</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar contas similares no seu perfil
              </p>
            </div>
            <Switch
              checked={user.showSuggestions}
              onCheckedChange={(val) =>
                setUser({ ...user, showSuggestions: val })
              }
            />
          </div>
        </section>

        {/* SEÇÃO: INFORMAÇÕES DA EMPRESA */}
        <section className="space-y-6">
          <h3 className="text-lg font-semibold">Informações da Empresa</h3>

          <div className="space-y-2">
            <Label htmlFor="companyName">Nome da empresa</Label>
            <Input
              id="companyName"
              value={company.companyName}
              onChange={(e) =>
                setCompany({ ...company, companyName: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={company.cnpj}
              onChange={(e) =>
                setCompany({ ...company, cnpj: e.target.value })
              }
            />
          </div>

          {company.companyImage && (
            <div className="space-y-2">
              <Label>Logo da empresa</Label>
              <img
                src={`/api/user/companyImage?file=${company.companyImage}`}
                alt="Logo da empresa"
                className="w-32 h-32 object-contain bg-muted p-2 rounded-lg border"
              />
              <Button variant="secondary" size="sm">
                Alterar logo
              </Button>
            </div>
          )}
        </section>

        {/* Botão final */}
        <Button type="submit" className="w-full mt-8">
          Salvar alterações
        </Button>
      </main>
    </>
  );
}
