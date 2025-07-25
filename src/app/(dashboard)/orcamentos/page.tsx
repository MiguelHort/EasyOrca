"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";

type Orcamento = {
  id: string;
  cliente: string;
  valor: number;
  data: string;
  status: string;
};

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrcamentos() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/orcamentos");
        if (!res.ok) {
          throw new Error(`Erro ${res.status}`);
        }
        const data = await res.json();
        setOrcamentos(data);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar orçamentos");
      } finally {
        setLoading(false);
      }
    }

    fetchOrcamentos();
  }, []);

  if (loading) {
    return <p>Carregando orçamentos...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>Erro: {error}</p>;
  }

  if (orcamentos.length === 0) {
    return <p>Nenhum orçamento encontrado.</p>;
  }

  return (
    <>
    <SiteHeader title="Serviços" />

    <div className="p-6 max-w-3xl">
      {orcamentos.map(({ id, cliente, valor, data, status }) => (
        <Card
          key={id}
          className="p-5 mb-4 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            {cliente}
          </h3>
          <p className="text-gray-700 mb-1">
            <span className="font-semibold">Valor:</span> R$ {valor.toFixed(2)}
          </p>
          <p className="text-gray-700 mb-1">
            <span className="font-semibold">Data:</span> {data}
          </p>
          <p
            className={`mb-1 font-semibold ${
              status === "enviado"
                ? "text-blue-600"
                : status === "aprovado"
                ? "text-green-600"
                : status === "cancelado"
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            Status: {status}
          </p>
        </Card>
      ))}
    </div>
    </>
  );
}
