"use client";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";

export default function OrcamentoPage() {
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleServerPDF = useCallback(() => {
    const url = window.location.href;
    const pdfUrl = `/api/pdf?url=${encodeURIComponent(url)}`;
    window.open(pdfUrl, "_blank");
  }, []);

  const id = 1000;

  const empresa = {
    nome: "Oficina Haak Garage",
    telefone: "(11) 98877-6655",
    email: "contato@oficinahaakgarage.com.br",
    cnpj: "12.345.678/0001-90",
    endereco: "Av. das Nações, 1500 - São Paulo/SP",
  };

  const cliente = {
    nome: "Miguel Hort",
    telefone: "(11) 98765-4321",
    email: "miguel.hort@gmail.com",
    endereco: "Rua das Palmeiras, 45 - Santo André/SP",
  };

  const itens = [
    { tipo: "Produto", titulo: "Carcaça da termostática", quantidade: 1, precoUnit: 170, total: 170 },
    { tipo: "Produto", titulo: "Rolamento guia", quantidade: 1, precoUnit: 100, total: 100 },
    { tipo: "Produto", titulo: "Óleo lubrificante (4L)", quantidade: 1, precoUnit: 200, total: 200 },
    { tipo: "Produto", titulo: "Filtro de óleo", quantidade: 1, precoUnit: 25, total: 25 },
    { tipo: "Produto", titulo: "Aditivo rosa (2 unidades)", quantidade: 2, precoUnit: 40, total: 80 },
    { tipo: "Serviço", titulo: "Mão de obra", quantidade: 1, precoUnit: 150, total: 150 },
  ];

  const subtotal = 725;
  const desconto = 0;
  const total = 725;
  const sinal = 362.5;

  const [company, setCompany] = useState({
    companyName: "",
    cnpj: "",
    companyImage: "",
  });

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/infoUser");
        const data = await res.json();
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
      <div className="no-print">
        <SiteHeader title="Orçamento" />
      </div>

      {/* Cabeçalho */}
      <header className="border-b border-muted bg-muted/40 print:bg-transparent">
        <div className="max-w-5xl mx-auto p-6 flex items-center gap-4">
          <div className="h-20 w-28 rounded-2xl bg-muted flex items-center justify-center overflow-hidden">
            {company.companyImage && (
              <Image
                src={`/api/user/companyImage?file=${company.companyImage}`}
                alt="Logo"
                width={112}
                height={80}
                className="object-cover w-full h-full"
                unoptimized
              />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary">Orçamento #{id}</h1>
            <p className="text-sm text-muted-foreground">
              Emitido em: 31/07/2025 • Validade: 01/08/2025
            </p>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Empresa e Cliente */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card title="Empresa">
            <p className="font-medium">{empresa.nome}</p>
            <p>{empresa.telefone}</p>
            <p>{empresa.email}</p>
            <p>{empresa.cnpj}</p>
            <p>{empresa.endereco}</p>
          </Card>

          <Card title="Cliente">
            <p className="font-medium">{cliente.nome}</p>
            <p>{cliente.telefone}</p>
            <p>{cliente.email}</p>
            <p>{cliente.endereco}</p>
          </Card>
        </div>

        {/* Itens */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">Itens do Orçamento</h2>
          <div className="overflow-hidden rounded-xl border border-muted bg-background">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-4 text-left">Tipo</th>
                  <th className="p-4 text-left">Item</th>
                  <th className="p-4 text-center">Qtd</th>
                  <th className="p-4 text-right">Preço (un)</th>
                  <th className="p-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item, i) => (
                  <tr key={i} className="border-t border-muted">
                    <td className="p-4">{item.tipo}</td>
                    <td className="p-4">{item.titulo}</td>
                    <td className="p-4 text-center">{item.quantidade}</td>
                    <td className="p-4 text-right">R$ {item.precoUnit.toFixed(2)}</td>
                    <td className="p-4 text-right font-medium text-primary">R$ {item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Totais e Pagamento */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card title="Formas de Pagamento">
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>PIX</li>
              <li>Cartão de Débito</li>
              <li>Cartão de Crédito</li>
              <li>Dinheiro</li>
            </ul>
          </Card>

          <Card title="Totais">
            <div className="text-sm space-y-1">
              <Row label="Subtotal" value={`R$ ${subtotal.toFixed(2)}`} />
              <Row label="Desconto (10%)" value={`- R$ ${desconto.toFixed(2)}`} />
              <Row label="Total" value={`R$ ${total.toFixed(2)}`} strong />
              <Row label="Sinal (50%)" value={`R$ ${sinal.toFixed(2)}`} />
            </div>
          </Card>
        </div>

        {/* Condições */}
        <Card title="Condições e Garantias">
          <p className="text-sm text-muted-foreground">
            Garantia de 6 meses para instalações. Cancelamentos com 24h de antecedência. Sinal de 50% no início do serviço.
          </p>
        </Card>
      </div>

      {/* Botões */}
      <div className="mt-10 no-print flex flex-wrap gap-3 justify-center">
        <Button type="button" onClick={handlePrint}>
          Imprimir
        </Button>
        <Button type="button" onClick={handleServerPDF} variant="outline">
          Baixar PDF (servidor)
        </Button>
      </div>

      {/* Rodapé */}
      <footer className="border-t border-muted mt-10 print:hidden">
        <div className="max-w-5xl mx-auto p-6 text-center text-xs text-muted-foreground">
          © 2025 Gelo Frio. Todos os direitos reservados.
        </div>
      </footer>
    </>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-muted bg-background p-6 shadow-sm">
      <h3 className="text-base font-semibold text-primary mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={strong ? "font-bold text-primary" : "text-sm"}>{value}</span>
    </div>
  );
}
