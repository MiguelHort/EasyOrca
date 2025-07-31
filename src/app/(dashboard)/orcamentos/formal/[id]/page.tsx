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
    {
      tipo: "Produto",
      titulo: "Carcaça da termostática",
      quantidade: 1,
      precoUnit: 170,
      total: 170,
    },
    {
      tipo: "Produto",
      titulo: "Rolamento guia",
      quantidade: 1,
      precoUnit: 100,
      total: 100,
    },
    {
      tipo: "Produto",
      titulo: "Óleo lubrificante (4L)",
      quantidade: 1,
      precoUnit: 200,
      total: 200,
    },
    {
      tipo: "Produto",
      titulo: "Filtro de óleo",
      quantidade: 1,
      precoUnit: 25,
      total: 25,
    },
    {
      tipo: "Produto",
      titulo: "Aditivo rosa (2 unidades)",
      quantidade: 2,
      precoUnit: 40,
      total: 80,
    },
    {
      tipo: "Serviço",
      titulo: "Mão de obra",
      quantidade: 1,
      precoUnit: 150,
      total: 150,
    },
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
      {/* Cabeçalho Clássico */}
      <div className="max-w-3xl mx-auto py-10 print:font-serif print:text-black">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold uppercase">Orçamento Nº {id}</h1>
          <p className="text-sm">
            Emitido em: 31/07/2025 — Validade: 01/08/2025
          </p>
        </div>

        {/* Dados da Empresa e Cliente */}
        <div className="grid grid-cols-2 gap-6 text-sm mb-8">
          <div>
            <h2 className="font-bold text-base mb-1">Empresa</h2>
            <p>{empresa.nome}</p>
            <p>{empresa.telefone}</p>
            <p>{empresa.email}</p>
            <p>{empresa.cnpj}</p>
            <p>{empresa.endereco}</p>
          </div>
          <div>
            <h2 className="font-bold text-base mb-1">Cliente</h2>
            <p>{cliente.nome}</p>
            <p>{cliente.telefone}</p>
            <p>{cliente.email}</p>
            <p>{cliente.endereco}</p>
          </div>
        </div>

        {/* Tabela de Itens */}
        <table className="w-full text-sm border border-black mb-8">
          <thead className="bg-gray-100 border-b border-black">
            <tr>
              <th className="p-2 text-left border-r border-black">Tipo</th>
              <th className="p-2 text-left border-r border-black">Item</th>
              <th className="p-2 text-center border-r border-black">Qtd</th>
              <th className="p-2 text-right border-r border-black">
                Preço Unitário
              </th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item, i) => (
              <tr key={i} className="border-t border-black">
                <td className="p-2 border-r border-black">{item.tipo}</td>
                <td className="p-2 border-r border-black">{item.titulo}</td>
                <td className="p-2 text-center border-r border-black">
                  {item.quantidade}
                </td>
                <td className="p-2 text-right border-r border-black">
                  R$ {item.precoUnit.toFixed(2)}
                </td>
                <td className="p-2 text-right">R$ {item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totais */}
        <div className="text-sm mb-8 w-full max-w-sm ml-auto space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Desconto:</span>
            <span>- R$ {desconto.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-black pt-1">
            <span>Total:</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Sinal (50%):</span>
            <span>R$ {sinal.toFixed(2)}</span>
          </div>
        </div>

        {/* Pagamento e Condições */}
        <div className="text-sm mb-8">
          <h2 className="font-bold mb-1">Formas de Pagamento</h2>
          <ul className="list-disc pl-5">
            <li>PIX</li>
            <li>Cartão de Débito</li>
            <li>Cartão de Crédito</li>
            <li>Dinheiro</li>
          </ul>
        </div>

        <div className="text-sm">
          <h2 className="font-bold mb-1">Condições e Garantias</h2>
          <p>
            Garantia de 6 meses para instalações. Cancelamentos com 24h de
            antecedência. Sinal de 50% no início do serviço.
          </p>
        </div>

        {/* Botões (apenas fora da impressão) */}
        <div className="mt-10 no-print flex flex-wrap gap-3 justify-center">
          <Button type="button" onClick={handlePrint}>
            Imprimir
          </Button>
          <Button type="button" onClick={handleServerPDF} variant="outline">
            Baixar PDF (servidor)
          </Button>
        </div>
      </div>
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
      <span className={strong ? "font-bold text-primary" : "text-sm"}>
        {value}
      </span>
    </div>
  );
}
