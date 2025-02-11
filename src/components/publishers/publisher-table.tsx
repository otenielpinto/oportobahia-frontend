import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Publisher } from "@/types/publisher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";

interface PublisherTableProps {
  publishers: Publisher[];
  onEdit: (publisher: Publisher) => void;
}

export function PublisherTable({ publishers, onEdit }: PublisherTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nome Editora</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {publishers.map((publisher) => (
            <TableRow key={publisher.id}>
              <TableCell className="font-mono text-sm">
                {publisher.id}
              </TableCell>
              <TableCell className="font-medium">{publisher.name}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    publisher.status === "active" ? "default" : "secondary"
                  }
                >
                  {publisher.status}
                </Badge>
              </TableCell>

              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(publisher)}
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
