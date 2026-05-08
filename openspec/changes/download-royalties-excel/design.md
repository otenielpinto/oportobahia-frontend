# Technical Design: download-royalties-excel

## Architecture Decisions

### Decision 1: Client-side Excel Generation via `reportToExcel()`

**Decision**: Generate the Excel file on the client using the existing `reportToExcel()` utility with `json-as-xlsx`, NOT server-side generation.

**Rationale**:
- The project already uses this exact pattern in `RelatorioExcel.tsx` — consistency matters.
- Server-side generation would require storing files temporarily, adding cleanup logic, and increasing server memory pressure for large datasets.
- `json-as-xlsx` runs synchronously in the browser and triggers a direct download — simple, proven, zero infrastructure.
- Trade-off: large datasets (>10k rows) may cause brief browser tab freeze. Mitigated by loading state; if it becomes a real problem, server-side streaming can be a future enhancement.

### Decision 2: Server Action Follows Established Auth → Query → Serialize → Return Pattern

**Decision**: `exportarRoyaltiesMovto(cabId)` follows the exact same structure as `listarApuracoesRoyaltiesCab` and `excluirApuracaoRoyaltiesCab`:
1. `getUser()` — tenant auth check, return early if unauthenticated
2. `TMongo.connectToDatabase()` — open connection
3. MongoDB query with `id_royalty_cab` + `id_tenant` + `id_empresa` filters
4. `serializeMongoData()` — convert ObjectId to strings
5. `TMongo.mongoDisconnect(client)` — close connection
6. Return typed result

**Rationale**: This is the established convention. No deviation needed.

### Decision 3: Button Placed in Existing Actions `<div>`

**Decision**: Add the download button alongside the existing "Ver detalhes" link and "Trash2" delete button inside the actions `<div className="flex items-center gap-1">` in the grid.

**Rationale**: Maintains visual consistency with existing action buttons. Uses the same `ghost` variant + `sm` size. No layout changes needed.

### Decision 4: Disabled When `status !== "completada"`

**Decision**: The button is only enabled for apurações with `status === "completada"`.

**Rationale**: Exporting data from incomplete, errored, or processing apurações would return partial/empty results and confuse users.

## Component Design

### Server Action: `exportarRoyaltiesMovto`

**File**: `src/actions/apurarRoyaltiesCabAction.ts`

**Signature**:
```ts
export interface RoyaltiesMovtoExportItem {
  _id: string;
  id_royalty_cab: string;
  dataMovto?: string;       // ISO date
  cnpjCpf?: string;
  cliente?: string;
  notaFiscal?: string;
  codigoBarras?: string;
  descricao?: string;
  quantidade?: number;
  valorMercadoria?: number;
  valorRoyalties?: number;
}

export interface ExportarRoyaltiesMovtoResponse {
  success: boolean;
  data?: RoyaltiesMovtoExportItem[];
  periodo?: string;         // e.g. "01/03/2026 — 31/03/2026"
  error?: string;
}

export async function exportarRoyaltiesMovto(
  cabId: string
): Promise<ExportarRoyaltiesMovtoResponse>
```

**Logic flow**:
1. Call `getUser()` — if null, return `{ success: false, error: "Não autenticado" }`
2. Connect to MongoDB via `TMongo.connectToDatabase()`
3. Query `tmp_apuracao_royalties_cab` to get the header record (for period info):
   ```ts
   const cab = await clientdb.collection("tmp_apuracao_royalties_cab")
     .findOne({ id: cabId, id_tenant: session.id_tenant, id_empresa: session.id_empresa });
   ```
   - If not found → return `{ success: false, error: "Apuração não encontrada" }`
4. Query `tmp_apuracao_royalties_movto` with filter:
   ```ts
   { id_royalty_cab: cabId, id_tenant: session.id_tenant, id_empresa: session.id_empresa }
   ```
   - Project only needed fields (dataMovto, cnpjCpf, cliente, notaFiscal, codigoBarras, descricao, quantidade, valorMercadoria, valorRoyalties)
   - Sort by dataMovto ascending, then cliente
5. Serialize with `serializeMongoData(records)`
6. Build `periodo` string from cab record dates: `"dd/MM/yyyy — dd/MM/yyyy"`
7. Disconnect and return `{ success: true, data: serialized, periodo }`
8. Catch block: log error, return `{ success: false, error: message }`

### Client Button: Download Handler in `ApuracaoRoyaltiesCabGrid`

**File**: `src/components/relatorio/ApuracaoRoyaltiesCabGrid.tsx`

**New imports**:
```ts
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { exportarRoyaltiesMovto, type RoyaltiesMovtoExportItem } from "@/actions/apurarRoyaltiesCabAction";
import { reportToExcel } from "@/lib/reportToExcel";
import { format, parseISO } from "date-fns";
```

**New state**:
```ts
const [isExporting, setIsExporting] = useState<string | null>(null); // tracks which cabId is exporting
```

**Excel column mapping constant**:
```ts
const ROYALTIES_MOVTO_COLUMNS = [
  { header: "Data Movto", key: "dataMovto", value: "dataMovto" },
  { header: "CNPJ/CPF", key: "cnpjCpf", value: "cnpjCpf" },
  { header: "Cliente", key: "cliente", value: "cliente" },
  { header: "Nota Fiscal", key: "notaFiscal", value: "notaFiscal" },
  { header: "Cód. Barras", key: "codigoBarras", value: "codigoBarras" },
  { header: "Descrição", key: "descricao", value: "descricao" },
  { header: "Qtd. Faturada", key: "quantidade", value: "quantidade" },
  { header: "Valor Mercadoria", key: "valorMercadoria", value: "valorMercadoria" },
  { header: "Valor Royalties", key: "valorRoyalties", value: "valorRoyalties" },
];
```

**Handler function**:
```ts
const handleExportExcel = async (item: ApuracaoRoyaltiesCab) => {
  setIsExporting(item.id);
  try {
    const result = await exportarRoyaltiesMovto(item.id);
    if (!result.success || !result.data) {
      toast.error(result.error || "Erro ao exportar dados");
      return;
    }
    if (result.data.length === 0) {
      toast.warning("Nenhum movimento encontrado para esta apuração");
      return;
    }

    // Format dates and provide fallbacks before sending to Excel
    const formattedData = result.data.map((row: RoyaltiesMovtoExportItem) => ({
      dataMovto: row.dataMovto ? format(parseDateLocal(row.dataMovto), "dd/MM/yyyy") : "",
      cnpjCpf: row.cnpjCpf || "",
      cliente: row.cliente || "",
      notaFiscal: row.notaFiscal || "",
      codigoBarras: row.codigoBarras || "",
      descricao: row.descricao || "",
      quantidade: row.quantidade ?? 0,
      valorMercadoria: row.valorMercadoria ?? 0,
      valorRoyalties: row.valorRoyalties ?? 0,
    }));

    const dataAtual = format(new Date(), "yyyy-MM-dd");
    const periodoSlug = result.periodo
      ? result.periodo.replace(/\//g, "-").replace(/ /g, "")
      : "sem-periodo";
    const fileName = `Royalties_${periodoSlug}_${dataAtual}`;

    reportToExcel({
      data: formattedData,
      columns: ROYALTIES_MOVTO_COLUMNS,
      sheetName: "Movimentos Royalties",
      fileName,
    });

    toast.success("Arquivo Excel gerado com sucesso!");
  } catch {
    toast.error("Erro inesperado ao exportar Excel");
  } finally {
    setIsExporting(null);
  }
};
```

**Button JSX** (inside the actions `<div>`, before the Trash2 button):
```tsx
<Button
  variant="ghost"
  size="sm"
  disabled={item.status !== "completada" || isExporting === item.id}
  onClick={() => handleExportExcel(item)}
  title={
    item.status !== "completada"
      ? "Exportação disponível apenas para apurações concluídas"
      : "Exportar movimentos para Excel"
  }
>
  {isExporting === item.id ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <FileSpreadsheet className="h-4 w-4 text-green-600 dark:text-green-400" />
  )}
</Button>
```

**Final actions `<div>` order**:
```
[Ver detalhes] [FileSpreadsheet] [Trash2]
```

### Excel Column Mapping

| MongoDB Field | Excel Header | Type | Fallback | Format |
|---|---|---|---|---|
| `dataMovto` | Data Movto | ISO string → formatted | `""` | `dd/MM/yyyy` |
| `cnpjCpf` | CNPJ/CPF | string | `""` | raw |
| `cliente` | Cliente | string | `""` | raw |
| `notaFiscal` | Nota Fiscal | string | `""` | raw |
| `codigoBarras` | Cód. Barras | string | `""` | raw |
| `descricao` | Descrição | string | `""` | raw |
| `quantidade` | Qtd. Faturada | number | `0` | raw number |
| `valorMercadoria` | Valor Mercadoria | number | `0` | raw number |
| `valorRoyalties` | Valor Royalties | number | `0` | raw number |

## Data Model

### MongoDB Query

**Collection**: `tmp_apuracao_royalties_movto`

**Filter**:
```ts
{
  id_royalty_cab: cabId,
  id_tenant: session.id_tenant,
  id_empresa: session.id_empresa
}
```

**Sort**: `{ dataMovto: 1, cliente: 1 }` — chronological order, then alphabetical by client.

**Projection**: Only the 9 fields listed above + `_id`. No embedded documents expected.

### Serialization

`serializeMongoData()` converts MongoDB `ObjectId` instances to strings. All other fields pass through as-is (dates remain ISO strings, numbers remain numbers).

### Client-side Pre-formatting

Before passing data to `reportToExcel()`:
- **Dates**: Parse ISO string with `parseDateLocal()` (existing helper in the component), then format to `dd/MM/yyyy` using `date-fns`. This avoids ISO strings like `"2026-03-01T03:00:00.000Z"` appearing in Excel cells.
- **Numbers**: Use nullish coalescing (`?? 0`) to replace `null`/`undefined` with `0`.
- **Strings**: Use `|| ""` to replace `null`/`undefined` with empty string.

### Data Flow (Text Diagram)

```
┌─────────────────────────────────────────────────────────────────┐
│  ApuracaoRoyaltiesCabGrid (Client Component)                     │
│                                                                  │
│  User clicks [FileSpreadsheet] button                            │
│         │                                                        │
│         ▼                                                        │
│  setIsExporting(cabId) → shows spinner                          │
│         │                                                        │
│         ▼                                                        │
│  await exportarRoyaltiesMovto(cabId)  ─────────────────┐         │
│         │                                              │         │
│         │  ┌─────────────────────────────────────────┐ │         │
│         │  │ Server Action (Server Component)         │ │         │
│         │  │  1. getUser() → auth check               │ │         │
│         │  │  2. TMongo.connectToDatabase()           │ │         │
│         │  │  3. Find cab record → periodo string     │ │         │
│         │  │  4. Query movto (id_royalty_cab + tenant)│ │         │
│         │  │  5. serializeMongoData(records)          │ │         │
│         │  │  6. TMongo.mongoDisconnect()             │ │         │
│         │  │  7. Return { success, data, periodo }    │ │         │
│         │  └─────────────────────────────────────────┘ │         │
│         │                                              │         │
│         ▼                                              │         │
│  Format data (dates, fallbacks)                        │         │
│         │                                              │         │
│         ▼                                              │         │
│  reportToExcel({ data, columns, sheetName, fileName }) │         │
│         │                                              │         │
│         ▼                                              │         │
│  json-as-xlsx → triggers browser download              │         │
│         │                                              │         │
│         ▼                                              │         │
│  toast.success / toast.error                           │         │
│         │                                              │         │
│         ▼                                              │         │
│  setIsExporting(null) → reset button state             │         │
└─────────────────────────────────────────────────────────────────┘
```

## Integration Points

### Existing `reportToExcel()` Utility

- **Location**: `src/lib/reportToExcel.tsx`
- **Usage**: Called with `{ data, columns, sheetName, fileName }`
- **No changes needed** — the utility already handles column mapping (`{ header, key }` → `{ label, value }`), sheet name sanitization, and file download.

### Existing Server Action Pattern

- Follows the exact same auth → connect → query → serialize → disconnect → return pattern as:
  - `criarApuracaoRoyaltiesCab()`
  - `listarApuracoesRoyaltiesCab()`
  - `excluirApuracaoRoyaltiesCab()`
- Same error handling structure: `{ success: false, error: string }` on failure.

### Existing Tenant Auth Pattern

- Uses `getUser()` from `@/actions/sessionAction`
- Filters by `id_tenant: session.id_tenant` and `id_empresa: session.id_empresa`
- Matches the delete action pattern (which also queries the cab record for existence check).

### Existing `parseDateLocal()` Helper

- Already defined in `ApuracaoRoyaltiesCabGrid.tsx` — reuse for date formatting in Excel export.
- Handles both `"2026-03-01"` and `"2026-03-01T03:00:00.000Z"` formats correctly.

### Existing `FileSpreadsheet` Icon

- Already available in `lucide-react` — used in `RelatorioExcel.tsx`.
- Color: `text-green-600 dark:text-green-400` to distinguish from destructive (red) and neutral (gray) actions.

## Performance Considerations

### Bundle Size

- **No new dependencies**: All libraries (`json-as-xlsx`, `lucide-react`, `date-fns`, `sonner`) are already installed.
- `json-as-xlsx` is already tree-shaken by Next.js — the import in `reportToExcel.tsx` is the only reference.
- Estimated bundle impact: **~0 KB** (all deps already in the graph).

### Network Payload

- Server action returns only the movto records for a single `cabId`.
- Typical apuração: hundreds to low thousands of rows.
- Each row ≈ 200-400 bytes (9 string/number fields).
- Estimated payload for 1,000 rows: **200-400 KB** JSON.
- For 10,000 rows: **2-4 MB** JSON — acceptable for a single download action.
- No pagination on the server action — the entire movto set for one apuração is fetched. If datasets grow beyond 10k rows, consider adding server-side pagination or streaming.

### Client Memory Usage

- `json-as-xlsx` processes all data synchronously in the browser.
- For 10k rows: ~10-20 MB temporary memory for the sheet generation.
- Browser handles the download blob — memory released after download completes.
- Mitigation: loading state (`isExporting`) prevents double-clicks; toast feedback informs user of progress.

### Server Action Efficiency

- Two MongoDB queries: one for cab (header), one for movto (rows).
- Both are simple indexed lookups (`id` field on cab, `id_royalty_cab` on movto).
- Connection opened and closed per-call — follows existing pattern.
- Could be optimized in the future with a single connection pool, but unnecessary complexity for current scale.
