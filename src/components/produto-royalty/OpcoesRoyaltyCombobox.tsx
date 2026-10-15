"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { buscarOpcoesProdutoRoyalty } from "@/actions/produtoRoyaltyAction";
import type { OpcaoRoyaltyFonte } from "@/types/produtoRoyaltyTypes";
import { cn } from "@/lib/utils";

const SUGESTOES_LIMITE = 5;
const PESQUISA_LIMITE = 50;
const DEBOUNCE_MS = 250;

const ROTULOS: Record<
  OpcaoRoyaltyFonte,
  { placeholder: string; titulo: string; descricao: string; botao: string }
> = {
  listaPreco: {
    placeholder: "Digite ou pesquise a lista de preço",
    titulo: "Pesquisar Lista de Preço",
    descricao: "Digite parte do nome para filtrar as listas disponíveis.",
    botao: "Pesquisar lista de preço",
  },
  fornecedor: {
    placeholder: "Digite ou pesquise o fornecedor",
    titulo: "Pesquisar Fornecedor",
    descricao: "Digite parte do nome para filtrar os fornecedores disponíveis.",
    botao: "Pesquisar fornecedor",
  },
  marca: {
    placeholder: "Digite ou pesquise a marca",
    titulo: "Pesquisar Marca",
    descricao: "Digite parte do nome para filtrar as marcas disponíveis.",
    botao: "Pesquisar marca",
  },
  gravadora: {
    placeholder: "Digite ou pesquise a gravadora",
    titulo: "Pesquisar Gravadora",
    descricao: "Digite parte do nome para filtrar as gravadoras disponíveis.",
    botao: "Pesquisar gravadora",
  },
};

interface OpcoesRoyaltyComboboxProps {
  fonte: OpcaoRoyaltyFonte;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function OpcoesRoyaltyCombobox({
  fonte,
  value,
  onChange,
  disabled = false,
}: OpcoesRoyaltyComboboxProps) {
  const rotulos = ROTULOS[fonte];

  // Sugestões inline (digitação)
  const [sugestoesAbertas, setSugestoesAbertas] = useState(false);
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [destaque, setDestaque] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sugestaoReqRef = useRef(0);

  // Painel de pesquisa completa
  const [painelAberto, setPainelAberto] = useState(false);
  const [termoPainel, setTermoPainel] = useState("");
  const [resultadosPainel, setResultadosPainel] = useState<string[]>([]);
  const [carregandoPainel, setCarregandoPainel] = useState(false);
  const painelReqRef = useRef(0);

  const textoDigitado = value.trim();
  const mostrarSugestoes = sugestoesAbertas && textoDigitado !== "";

  // Busca sugestões com debounce; ignora respostas antigas
  useEffect(() => {
    // Sem texto, a exibição já fica oculta via `mostrarSugestoes`
    if (!sugestoesAbertas || !textoDigitado) return;

    const req = ++sugestaoReqRef.current;
    const timer = setTimeout(async () => {
      const result = await buscarOpcoesProdutoRoyalty(
        fonte,
        textoDigitado,
        SUGESTOES_LIMITE,
      );
      if (req !== sugestaoReqRef.current) return;
      setSugestoes(result.success && result.data ? result.data : []);
      setDestaque(-1);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [fonte, textoDigitado, sugestoesAbertas]);

  // Fecha as sugestões ao clicar fora do campo
  useEffect(() => {
    if (!sugestoesAbertas) return;
    const handler = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setSugestoesAbertas(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sugestoesAbertas]);

  // Busca no painel (lista completa filtrada pelo termo)
  useEffect(() => {
    if (!painelAberto) return;

    const req = ++painelReqRef.current;
    const timer = setTimeout(async () => {
      const result = await buscarOpcoesProdutoRoyalty(
        fonte,
        termoPainel,
        PESQUISA_LIMITE,
      );
      if (req !== painelReqRef.current) return;
      setCarregandoPainel(false);
      if (result.success && result.data) {
        setResultadosPainel(result.data);
      } else {
        setResultadosPainel([]);
        toast.error(result.error || "Erro ao realizar a pesquisa.");
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [fonte, termoPainel, painelAberto]);

  const selecionar = (nome: string) => {
    onChange(nome);
    setSugestoesAbertas(false);
    setDestaque(-1);
    setPainelAberto(false);
  };

  const abrirPainel = () => {
    setTermoPainel("");
    setResultadosPainel([]);
    setCarregandoPainel(true);
    setPainelAberto(true);
  };

  const alterarTermoPainel = (termo: string) => {
    setTermoPainel(termo);
    setCarregandoPainel(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setSugestoesAbertas(false);
      return;
    }
    if (!mostrarSugestoes || sugestoes.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setDestaque((i) => (i + 1) % sugestoes.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setDestaque((i) => (i <= 0 ? sugestoes.length - 1 : i - 1));
    } else if (event.key === "Enter" && destaque >= 0) {
      event.preventDefault();
      selecionar(sugestoes[destaque]);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex gap-2">
        <Input
          value={value}
          disabled={disabled}
          placeholder={rotulos.placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={mostrarSugestoes}
          aria-autocomplete="list"
          onChange={(event) => {
            onChange(event.target.value);
            setSugestoesAbertas(true);
            setDestaque(-1);
          }}
          onKeyDown={handleKeyDown}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={abrirPainel}
          disabled={disabled}
          aria-label={rotulos.botao}
          title={rotulos.botao}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {mostrarSugestoes && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {sugestoes.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              Nenhum resultado encontrado.
            </li>
          ) : (
            sugestoes.map((nome, index) => (
              <li
                key={nome}
                role="option"
                aria-selected={index === destaque}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selecionar(nome);
                }}
                onMouseEnter={() => setDestaque(index)}
                className={cn(
                  "cursor-pointer rounded-sm px-3 py-2 text-sm",
                  index === destaque && "bg-accent text-accent-foreground",
                )}
              >
                {nome}
              </li>
            ))
          )}
        </ul>
      )}

      <Sheet open={painelAberto} onOpenChange={setPainelAberto}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{rotulos.titulo}</SheetTitle>
            <SheetDescription>{rotulos.descricao}</SheetDescription>
          </SheetHeader>

          <div className="mt-4">
            <Input
              autoFocus
              placeholder="Pesquise pelo nome"
              autoComplete="off"
              value={termoPainel}
              onChange={(event) => alterarTermoPainel(event.target.value)}
            />
          </div>

          <ul className="mt-4 flex-1 space-y-1 overflow-y-auto">
            {carregandoPainel && (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                Carregando...
              </li>
            )}
            {!carregandoPainel && resultadosPainel.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                Nenhum resultado encontrado.
              </li>
            )}
            {!carregandoPainel &&
              resultadosPainel.map((nome) => (
                <li key={nome}>
                  <button
                    type="button"
                    onClick={() => selecionar(nome)}
                    className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    {nome}
                  </button>
                </li>
              ))}
          </ul>
        </SheetContent>
      </Sheet>
    </div>
  );
}
