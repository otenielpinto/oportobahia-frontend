# Proposal: Download Royalties Excel

## Intent

Enable users to export the movement data (movto) of a completed royalties apuração as an Excel file directly from the grid view. Currently users can only view details — there's no way to download/export the data for offline analysis or reporting.

## Scope

### In Scope
- New server action `exportarRoyaltiesMovto(cabId)` to fetch movement data
- Download button in `ApuracaoRoyaltiesCabGrid` actions column
- Client-side Excel generation via existing `reportToExcel()` utility
- File naming: `Royalties_{periodo}_{data}.xlsx`

### Out of Scope
- PDF export (separate change)
- Bulk export of multiple apurações at once
- Custom column selection by user
- Server-side Excel generation

## Capabilities

### New Capabilities
- `royalties-excel-export`: Export apuração royalties movements to Excel spreadsheet

### Modified Capabilities
- None

## Approach

1. **Server action** in `src/actions/apurarRoyaltiesCabAction.ts`:
   - `exportarRoyaltiesMovto(cabId: string)` — queries `tmp_apuracao_royalties_movto` filtered by `id_royalty_cab` + tenant filters
   - Returns `{ success: true, data: serialized[], period: string }` or `{ success: false, error: string }`
   - Follows existing pattern: `getUser()` auth → `TMongo.connectToDatabase()` → query → `serializeMongoData()` → disconnect

2. **Client-side button** in `ApuracaoRoyaltiesCabGrid.tsx`:
   - Add `FileSpreadsheet` icon button in actions `<div>` (alongside existing "Ver detalhes" and "Trash2")
   - Disabled when `status !== "completada"`
   - On click: call server action → format data → call `reportToExcel()` with predefined columns
   - Shows toast feedback (loading, success, error)

3. **Excel columns** defined as a constant:
   - Data Movto, CNPJ/CPF, Cliente, Nota Fiscal, Cód. Barras, Descrição, Qtd. Faturada, Valor Mercadoria, Valor Royalties
   - Dates formatted client-side using `date-fns` to avoid ISO strings in cells

4. **Why client-side generation**: The project already uses `reportToExcel()` with `json-as-xlsx` for similar exports (see `RelatorioExcel.tsx`). Server-side generation would add unnecessary complexity and memory pressure for large datasets.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/actions/apurarRoyaltiesCabAction.ts` | Modified | Add `exportarRoyaltiesMovto` server action |
| `src/components/relatorio/ApuracaoRoyaltiesCabGrid.tsx` | Modified | Add Excel download button with click handler |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Large datasets cause browser memory issues | Medium | Add loading state; consider server-side streaming if data > 10k rows |
| Null/undefined fields render as empty cells | High | Pre-format data with fallback values (empty string, 0) before `reportToExcel()` |
| Dates arrive as ISO strings | High | Format dates client-side before passing to `reportToExcel()` |
| User clicks export while status still "processando" | Low | Button disabled by status check |

## Rollback Plan

Revert the commit — no database schema changes, no migration needed. The feature is purely additive (new action + new button). If issues arise, simply removing the button and server action restores previous behavior.

## Dependencies

- `json-as-xlsx` already installed (v2.5.6)
- `reportToExcel` utility already exists at `src/lib/reportToExcel.tsx`
- `FileSpreadsheet` icon available in `lucide-react`

## Success Criteria

- [ ] Button appears in grid actions column for each apuração row
- [ ] Button is disabled for non-"completada" status
- [ ] Clicking button downloads `.xlsx` file with correct column headers and data
- [ ] File is named `Royalties_{periodo}_{YYYY-MM-DD}.xlsx`
- [ ] Error toast shown if export fails
- [ ] Loading state shown during export
- [ ] Exported data respects tenant isolation (user only sees their data)
