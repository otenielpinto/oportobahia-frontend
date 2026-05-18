"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, FileText, Truck, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NotaFiscalItemsTable from "./NotaFiscalItemsTable";
import { NotaFiscalDetail } from "@/types/notaFiscalTypes";

interface NotaFiscalViewProps {
  nota: NotaFiscalDetail;
}

function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  if (dateStr.includes("T")) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR");
  }
  return dateStr;
}

function formatCnpj(cnpj: string): string {
  if (!cnpj || cnpj.length !== 14) return cnpj || "-";
  return cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}

const ICMSTOT_FIELDS: { key: keyof NotaFiscalDetail["ICMSTot"]; label: string }[] = [
  { key: "vNF", label: "Valor NF" },
  { key: "vProd", label: "Valor Produtos" },
  { key: "vFrete", label: "Valor Frete" },
  { key: "vSeg", label: "Valor Seguro" },
  { key: "vDesc", label: "Desconto" },
  { key: "vBC", label: "Base ICMS" },
  { key: "vICMS", label: "Valor ICMS" },
  { key: "vST", label: "Valor ST" },
  { key: "vPIS", label: "Valor PIS" },
  { key: "vCOFINS", label: "Valor COFINS" },
  { key: "vIPI", label: "Valor IPI" },
  { key: "vTotTrib", label: "Total Tributos" },
];

export default function NotaFiscalView({ nota }: NotaFiscalViewProps) {
  const router = useRouter();

  const statusVariant =
    nota.descricao_situacao === "Autorizada"
      ? "default"
      : nota.descricao_situacao === "Cancelada"
      ? "destructive"
      : "secondary";

  const tipoLabel = nota.tipo === "E" ? "Entrada" : nota.tipo === "S" ? "Saída" : nota.tipo;

  // Build endereço from cliente
  const clienteEndereco = nota.cliente
    ? [
        nota.cliente.endereco,
        nota.cliente.numero,
        nota.cliente.complemento,
        nota.cliente.bairro,
        `${nota.cliente.cidade} - ${nota.cliente.uf}`,
        nota.cliente.cep ? `CEP: ${nota.cliente.cep}` : "",
      ]
        .filter(Boolean)
        .join(", ")
    : "-";

  // Build endereço de entrega
  const enderecoEntrega = nota.endereco_entrega
    ? [
        nota.endereco_entrega.endereco,
        nota.endereco_entrega.numero,
        nota.endereco_entrega.complemento,
        nota.endereco_entrega.bairro,
        nota.endereco_entrega.cidade
          ? `${nota.endereco_entrega.cidade} - ${nota.endereco_entrega.uf || ""}`
          : "",
        nota.endereco_entrega.cep ? `CEP: ${nota.endereco_entrega.cep}` : "",
      ]
        .filter(Boolean)
        .join(", ")
    : "-";

  return (
    <div className="flex flex-col gap-6">
      {/* Header + Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/notas-fiscais")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            Nota Fiscal Nº {nota.numero}
          </h1>
        </div>
        <Badge variant={statusVariant} className="text-sm px-3 py-1">
          {nota.descricao_situacao}
        </Badge>
      </div>

      {/* Card: Dados da Nota */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Dados da Nota
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-muted-foreground">Número</span>
              <p className="font-mono text-sm">{nota.numero}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Série</span>
              <p className="font-mono text-sm">{nota.serie}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Tipo</span>
              <div className="text-sm">
                <Badge variant="outline">{tipoLabel}</Badge>
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Data Emissão</span>
              <p className="text-sm">{formatDate(nota.data_emissao)}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Natureza da Operação
              </span>
              <p className="text-sm">{nota.natOp || "-"}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Tipo de Venda
              </span>
              <p className="text-sm">
                {nota.tipoVenda === "V" ? "Venda" : nota.tipoVenda || "-"}
              </p>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <span className="text-xs text-muted-foreground">
                Chave de Acesso
              </span>
              <p className="font-mono text-xs break-all">
                {nota.chave_acesso || "-"}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Valor Produtos
              </span>
              <p className="text-sm font-medium">
                {formatCurrency(nota.valor_produtos)}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Valor Frete</span>
              <p className="text-sm font-medium">
                {formatCurrency(nota.valor_frete)}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Valor Total</span>
              <p className="text-sm font-bold">
                {formatCurrency(nota.valor)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card: Cliente / Destinatário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5" />
            Cliente / Destinatário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-muted-foreground">Nome</span>
              <p className="text-sm font-medium">
                {nota.cliente?.nome || nota.nome || "-"}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">CNPJ</span>
              <p className="font-mono text-sm">
                {nota.cliente?.cpf_cnpj
                  ? formatCnpj(nota.cliente.cpf_cnpj.replace(/\D/g, ""))
                  : "-"}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Inscrição Estadual
              </span>
              <p className="font-mono text-sm">{nota.cliente?.ie || "-"}</p>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <span className="text-xs text-muted-foreground">Endereço</span>
              <p className="text-sm">{clienteEndereco}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card: Resumo Fiscal (ICMSTot) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="h-5 w-5" />
            Resumo Fiscal (ICMSTot)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nota.ICMSTot ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {ICMSTOT_FIELDS.map(({ key, label }) => {
                const value = nota.ICMSTot[key];
                if (value === undefined || value === null) return null;
                return (
                  <div
                    key={key}
                    className="flex flex-col p-2 rounded-md bg-muted/50"
                  >
                    <span className="text-xs text-muted-foreground">
                      {label}
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(value)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Dados de ICMSTot não disponíveis.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Card: Itens da Nota */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="h-5 w-5" />
            Itens da Nota ({nota.itens?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NotaFiscalItemsTable itens={nota.itens ?? []} />
        </CardContent>
      </Card>

      {/* Card: Transporte / Entrega */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Truck className="h-5 w-5" />
            Transporte / Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-muted-foreground">Transportador</span>
              <p className="text-sm">
                {nota.transportador?.nome || "Não informado"}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Nome do Destinatário
              </span>
              <p className="text-sm">
                {nota.endereco_entrega?.nome_destinatario || nota.nome || "-"}
              </p>
            </div>
            <div className="md:col-span-2">
              <span className="text-xs text-muted-foreground">
                Endereço de Entrega
              </span>
              <p className="text-sm">{enderecoEntrega}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
