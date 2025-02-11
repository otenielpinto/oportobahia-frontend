import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Formato } from "@/types/formato";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";

interface FormatoTableProps {
  formatos: Formato[];
  onEdit: (formato: Formato) => void;
}

export function FormatoTable({ formatos, onEdit }: FormatoTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nome Formato</TableHead>
            <TableHead>Limite de Faixas</TableHead>
            <TableHead>% Percentual por Faixa</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {formatos.map((formato) => (
            <TableRow key={formato.id}>
              <TableCell className="font-mono text-sm">{formato.id}</TableCell>
              <TableCell className="font-medium">{formato.name}</TableCell>
              <TableCell className="font-medium">
                {formato.limite_faixas}
              </TableCell>

              <TableCell className="font-medium">
                {formato.percentual_faixa}%
              </TableCell>

              <TableCell>
                <Badge
                  variant={
                    formato.status === "active" ? "default" : "secondary"
                  }
                >
                  {formato.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(formato)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
