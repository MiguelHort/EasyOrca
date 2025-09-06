// app/(legal)/suporte/page.tsx
export default function SuportePage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📧 Contato / Suporte</h2>
      <p className="mb-3">
        Tem dúvidas ou precisa de ajuda? Entre em contato com nossa equipe:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>E-mail:</strong> suporte@easyorca.com
        </li>
        <li>
          <strong>Horário:</strong> Segunda a sexta, das 9h às 18h (Brasília)
        </li>
        <li>
          <strong>Tempo médio de resposta:</strong> até 48h úteis
        </li>
      </ul>
    </div>
  );
}
