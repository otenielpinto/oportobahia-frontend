import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { exportarRoyaltiesMovto } from "@/actions/apurarRoyaltiesCabAction";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { royaltiesSummary } from "@/lib/royaltiesSummary";

const quantity = new Intl.NumberFormat("pt-BR");
const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default async function RoyaltiesSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await exportarRoyaltiesMovto(id);
  const records = result.success ? result.data : undefined;

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      <Link
        href="/relatorio/apuracao-royalties"
        className="inline-flex items-center gap-2 rounded-sm text-sm text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar para apurações
      </Link>

      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Apuração de royalties
        </p>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Resumo da apuração</h1>
        <p className="text-sm text-muted-foreground">Quantidades e valores consolidados por tipo de venda.</p>
      </header>

      {!records ? (
        <Card className="border-destructive/40">
          <CardContent className="space-y-2 pt-6" role="alert">
            <h2 className="font-semibold text-destructive">Não foi possível carregar o resumo</h2>
            <p className="text-sm text-muted-foreground">
              {result.error || "Os dados da apuração não estão disponíveis. Tente novamente mais tarde."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="border-b bg-muted/20">
            <h2 className="text-lg font-semibold">Totais por tipo de venda</h2>
            <CardDescription>
              Soma dos valores registrados, sem recálculo. Registros sem tipo de venda são incluídos em Venda.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {records.length === 0 ? (
              <p className="mb-6 rounded-md border border-dashed p-4 text-sm text-muted-foreground" role="status">
                Nenhum movimento encontrado para esta apuração.
              </p>
            ) : null}
            <Table aria-label="Resumo de royalties por tipo de venda" className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Tipo de venda</TableHead>
                  <TableHead scope="col" className="text-right">Quantidade</TableHead>
                  <TableHead scope="col" className="text-right">Base de Cálculo Royalties</TableHead>
                  <TableHead scope="col" className="text-right">Valor dos Royalties</TableHead>
                  <TableHead scope="col" className="text-right">Copyright Normal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {royaltiesSummary(records).map((group) => (
                  <TableRow key={group.tipoVenda}>
                    <TableHead scope="row" className="font-medium text-foreground">
                      {group.tipoVenda === "B" ? "Amostra grátis" : "Venda"}
                    </TableHead>
                    <TableCell className="text-right tabular-nums">{quantity.format(group.quantFaturada)}</TableCell>
                    <TableCell className="text-right tabular-nums">{currency.format(group.baseCalculoRoyalties)}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{currency.format(group.valorRoyalties)}</TableCell>
                    <TableCell className="text-right tabular-nums">{currency.format(group.copyrightNormal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
