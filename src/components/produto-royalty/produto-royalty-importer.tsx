"use client";

import React, { useCallback, useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  X,
  FileX2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  validateExcelColumns,
  validateFileSize,
  importProdutoRoyalties,
  deleteProdutoRoyaltiesByLote,
} from "@/actions/produtoRoyaltyAction";
import {
  EXCEL_REQUIRED_COLUMNS,
  MAX_FILE_SIZE_MB,
  type ImportResult,
  type ValidationResult,
} from "@/types/produtoRoyaltyTypes";

interface ImportState {
  step: "idle" | "validating" | "confirmed" | "importing" | "done" | "error";
  fileName: string;
  fileSize: number;
  totalRows: number;
  validationResult?: ValidationResult;
  importResult?: ImportResult;
  progress: number;
}

const INITIAL_STATE: ImportState = {
  step: "idle",
  fileName: "",
  fileSize: 0,
  totalRows: 0,
  progress: 0,
};

export function ProdutoRoyaltyImporter() {
  const [state, setState] = useState<ImportState>(INITIAL_STATE);
  const [parsedData, setParsedData] = useState<{
    headers: string[];
    rows: (string | number | boolean | Date | null | undefined)[][];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mutation de importação
  const importMutation = useMutation({
    mutationFn: async () => {
      if (!parsedData) throw new Error("Nenhum dado para importar");
      return importProdutoRoyalties(parsedData.rows, parsedData.headers);
    },
    onSuccess: (result: ImportResult) => {
      setState((prev) => ({
        ...prev,
        step: "done",
        importResult: result,
        progress: 100,
      }));
      if (result.success) {
        toast.success(
          `${result.insertedRows} de ${result.totalRows} registros importados com sucesso!`,
        );
      }
    },
    onError: (error: Error) => {
      setState((prev) => ({
        ...prev,
        step: "error",
      }));
      toast.error(`Erro na importação: ${error.message}`);
    },
  });

  // Mutation de exclusão de lote
  const deleteMutation = useMutation({
    mutationFn: deleteProdutoRoyaltiesByLote,
    onSuccess: (result) => {
      toast.success(`${result.deletedCount} registros removidos.`);
      handleReset();
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover: ${error.message}`);
    },
  });

  /**
   * Processa o arquivo Excel no client-side (performance)
   * Usa a lib xlsx para parse local, sem enviar o arquivo ao servidor
   */
  const processFile = useCallback(async (file: File) => {
    // Validar tamanho
    const sizeCheck = await validateFileSize(file.size);
    if (!sizeCheck.valid) {
      toast.error(sizeCheck.message);
      return;
    }

    setState((prev) => ({
      ...prev,
      step: "validating",
      fileName: file.name,
      fileSize: file.size,
      progress: 10,
    }));

    try {
      // Import dinâmico do xlsx (só carrega quando necessário)
      const XLSX = await import("xlsx");
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, {
        type: "array",
        cellDates: false, // Performance: não converte datas
        cellStyles: false, // Performance: não lê estilos
        cellHTML: false, // Performance: não gera HTML
        sheetStubs: false, // Performance: ignora células vazias
      });

      setState((prev) => ({ ...prev, progress: 40 }));

      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        toast.error("O arquivo não contém nenhuma planilha.");
        setState(INITIAL_STATE);
        return;
      }

      const worksheet = workbook.Sheets[sheetName];

      // Converter para array de arrays (mais performático que array de objetos)
      const rawData: (string | number | boolean | Date | null | undefined)[][] =
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
          blankrows: false, // Performance: ignora linhas em branco
        });

      if (rawData.length < 2) {
        toast.error("O arquivo está vazio ou contém apenas o cabeçalho.");
        setState(INITIAL_STATE);
        return;
      }

      setState((prev) => ({ ...prev, progress: 60 }));

      // Primeira linha = cabeçalho, resto = dados
      const headers = (rawData[0] as (string | number)[]).map((h) =>
        String(h ?? "").trim(),
      );
      const rows = rawData.slice(1);

      // Validar colunas obrigatórias
      const validation = await validateExcelColumns(headers);

      setState((prev) => ({
        ...prev,
        progress: 80,
        totalRows: rows.length,
        validationResult: validation,
      }));

      if (!validation.isValid) {
        setState((prev) => ({ ...prev, step: "error" }));
        toast.error(
          `Colunas obrigatórias ausentes: ${validation.missingColumns.join(", ")}`,
        );
        return;
      }

      // Armazenar dados parseados para importação posterior
      setParsedData({ headers, rows });

      setState((prev) => ({
        ...prev,
        step: "confirmed",
        progress: 100,
      }));
    } catch (error: any) {
      console.error("Erro ao processar arquivo:", error);
      setState((prev) => ({ ...prev, step: "error" }));
      toast.error(
        `Erro ao ler o arquivo: ${error?.message || "Erro desconhecido"}`,
      );
    }
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext !== "xlsx" && ext !== "xls" && ext !== "csv") {
          toast.error("Formato inválido. Use .xlsx, .xls ou .csv");
          return;
        }
        processFile(file);
      }
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleImport = useCallback(() => {
    setState((prev) => ({ ...prev, step: "importing", progress: 0 }));
    importMutation.mutate();
  }, [importMutation]);

  const handleReset = useCallback(() => {
    setState(INITIAL_STATE);
    setParsedData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const formatFileSize = (bytes: number) => {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Área de Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar Produtos Royalties
          </CardTitle>
          <CardDescription>
            Importe produtos royalties via arquivo Excel (.xlsx, .xls, .csv).
            Limite máximo: {MAX_FILE_SIZE_MB}MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.step === "idle" && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 cursor-pointer rounded-lg p-12 text-center transition-colors"
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                Arraste o arquivo aqui ou{" "}
                <span className="font-medium text-primary">
                  clique para selecionar
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Formatos aceitos: .xlsx, .xls, .csv — Máximo {MAX_FILE_SIZE_MB}
                MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* Validação em andamento */}
          {state.step === "validating" && (
            <div className="space-y-4 py-8 text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Validando arquivo...
              </p>
              <Progress value={state.progress} className="mx-auto max-w-sm" />
            </div>
          )}

          {/* Arquivo validado - confirmação */}
          {state.step === "confirmed" && state.validationResult && (
            <div className="space-y-4">
              {/* Info do arquivo */}
              <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium">{state.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(state.fileSize)} •{" "}
                      {state.totalRows.toLocaleString("pt-BR")} registros
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleReset}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Validação OK */}
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Validação concluída com sucesso!
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    {state.validationResult.extraInfo}
                  </p>
                </div>
              </div>

              {/* Colunas esperadas */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Colunas obrigatórias:</p>
                <div className="flex flex-wrap gap-1.5">
                  {EXCEL_REQUIRED_COLUMNS.map((col) => (
                    <Badge key={col} variant="secondary" className="text-xs">
                      {col}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3 pt-2">
                <Button onClick={handleImport} className="flex-1">
                  <Upload className="mr-2 h-4 w-4" />
                  Importar {state.totalRows.toLocaleString("pt-BR")} registros
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Importação em andamento */}
          {state.step === "importing" && (
            <div className="space-y-4 py-8 text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium">
                Importando {state.totalRows.toLocaleString("pt-BR")}{" "}
                registros...
              </p>
              <p className="text-xs text-muted-foreground">
                Isso pode levar alguns minutos para arquivos grandes.
              </p>
              <Progress value={50} className="mx-auto max-w-sm" />
            </div>
          )}

          {/* Resultado da importação */}
          {state.step === "done" && state.importResult && (
            <div className="space-y-4">
              <div
                className={`flex items-start gap-3 rounded-lg border p-4 ${
                  state.importResult.success
                    ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
                    : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
                }`}
              >
                {state.importResult.success ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                )}
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      state.importResult.success
                        ? "text-green-800 dark:text-green-200"
                        : "text-red-800 dark:text-red-200"
                    }`}
                  >
                    {state.importResult.success
                      ? "Importação concluída!"
                      : "Importação com erros"}
                  </p>
                  <div className="mt-1 space-y-1 text-sm">
                    <p>
                      Total de linhas:{" "}
                      <strong>
                        {state.importResult.totalRows.toLocaleString("pt-BR")}
                      </strong>
                    </p>
                    <p>
                      Registros inseridos:{" "}
                      <strong>
                        {state.importResult.insertedRows.toLocaleString(
                          "pt-BR",
                        )}
                      </strong>
                    </p>
                    <p>
                      Lote:{" "}
                      <code className="rounded bg-muted px-1 text-xs">
                        {state.importResult.loteImportacao}
                      </code>
                    </p>
                  </div>
                </div>
              </div>

              {state.importResult.errors.length > 0 && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-950">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Avisos ({state.importResult.errors.length}):
                  </p>
                  <ul className="mt-1 max-h-32 space-y-0.5 overflow-y-auto text-xs text-yellow-700 dark:text-yellow-300">
                    {state.importResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Desfazer importação
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja remover todos os{" "}
                        {state.importResult.insertedRows.toLocaleString(
                          "pt-BR",
                        )}{" "}
                        registros do lote {state.importResult.loteImportacao}?
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          deleteMutation.mutate(
                            state.importResult!.loteImportacao,
                          )
                        }
                      >
                        Confirmar exclusão
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button variant="outline" onClick={handleReset}>
                  Nova importação
                </Button>
              </div>
            </div>
          )}

          {/* Erro de validação */}
          {state.step === "error" && state.validationResult && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                <FileX2 className="mt-0.5 h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">
                    Validação falhou
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {state.validationResult.extraInfo}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Colunas ausentes:</p>
                <div className="flex flex-wrap gap-1.5">
                  {state.validationResult.missingColumns.map((col) => (
                    <Badge key={col} variant="destructive" className="text-xs">
                      {col}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button variant="outline" onClick={handleReset}>
                Tentar novamente
              </Button>
            </div>
          )}

          {/* Erro genérico */}
          {state.step === "error" && !state.validationResult && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">
                    Erro ao processar o arquivo
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Verifique se o arquivo está no formato correto e tente
                    novamente.
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleReset}>
                Tentar novamente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
