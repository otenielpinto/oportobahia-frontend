"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

export interface ApuracaoRoyaltiesCabStatusBadgeProps {
  status: "pendente" | "processando" | "completada" | "erro";
  erroMessage?: string;
}

const STATUS_CONFIG = {
  pendente: {
    label: "Pendente",
    description: "Aguardando processamento",
    variant: "secondary" as const,
    icon: Clock,
    iconClassName: "",
  },
  processando: {
    label: "Processando",
    description: "Em processamento",
    variant: "default" as const,
    icon: Loader2,
    iconClassName: "animate-spin",
  },
  completada: {
    label: "Completada",
    description: "Processamento concluído",
    variant: "default" as const,
    icon: CheckCircle,
    iconClassName: "text-emerald-500",
  },
  erro: {
    label: "Erro",
    description: "Erro no processamento",
    variant: "destructive" as const,
    icon: XCircle,
    iconClassName: "",
  },
} as const;

export function ApuracaoRoyaltiesCabStatusBadge({
  status,
  erroMessage,
}: ApuracaoRoyaltiesCabStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const badgeContent = (
    <Badge variant={config.variant} className="gap-1.5">
      <Icon className={cn("h-3.5 w-3.5", config.iconClassName)} />
      {config.label}
    </Badge>
  );

  if (status === "erro" && erroMessage) {
    return (
      <div
        className="cursor-help"
        title={erroMessage}
      >
        {badgeContent}
      </div>
    );
  }

  return badgeContent;
}
