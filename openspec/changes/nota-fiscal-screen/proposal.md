# Proposal: Tela de Notas Fiscais

## Intent

Build a complete Nota Fiscal management screen. Currently there is no UI to view, filter, or export notas fiscais — only a partial server action with no auth, no status/tipo/natOp filtering, and no detail view. Users need to consult issued invoices, filter by period/status/type, see line-item detail, and export data to Excel.

## Scope

### In Scope
- List screen: server-side pagination (100/page), filters (date range, status, tipo E/S, natOp with default "VENDA DE MERCADORIA"), text search by `numero`
- Server action with auth (`getUser()`), tenant filters (`id_tenant`/`id_empresa`), `$facet` aggregation returning global totals + paginated data
- Column totals for `valor_produtos`, `valor_frete`, `valor` (both page and global)
- Detail view at `/notas-fiscais/view/[id]` showing items (prod + imposto), client/address, tax summary (ICMSTot)
- Excel export via existing `reportToExcel.tsx`
- Sidebar navigation entry under "Relatorio"
- TypeScript types for the nota_fiscal document shape

### Out of Scope
- Create / edit / delete operations (read-only screen)
- Change history (deferred — `updated_at` used as proxy)
- Full XML tree display (only key fields)
- DANFE print

## Capabilities

### New Capabilities
- `nota-fiscal-list`: Filterable, paginated list of notas fiscais with multi-filter bar, column totals (page + global), and server-side aggregation
- `nota-fiscal-detail`: Detail view per invoice showing client/supplier data, line items (prod code, description, qty, unit value, tax), and ICMSTot summary
- `nota-fiscal-export`: Export filtered nota fiscal data to Excel spreadsheet using existing `reportToExcel` utility

### Modified Capabilities
- None

## Approach

**Pattern**: Follows Pattern B (React Query + server actions) as in `ProdutoRoyaltyTable`. Detail view follows `EmpresaView` pattern (server component page + client view component).

**Key Architecture Decisions**:
1. **Date filter**: Use `data_movto` (Date field) for range queries, not `data_emissao` (string). Display `data_emissao` in the UI.
2. **Pagination fix**: Existing action has a negative skip bug (`skip = (page-1) * limit` with page=0 → skip=-100). Fixed: ensure `skip >= 0`, default page=1, limit=100.
3. **$facet pipeline**: Single MongoDB aggregation returning `[{ metadata: [{ total, globalTotals }], data: [...] }]`. Eliminates the N+1 countDocuments call.
4. **Totals dual strategy**: Server returns global totals from `$facet`; client computes page totals from the visible 100 rows via `useMemo`.
5. **natOp filter**: Select dropdown pre-populated with distinct values from DB via `distinct()` query, defaulting to "VENDA DE MERCADORIA".
6. **Tenant isolation**: All queries add `id_tenant` and `id_empresa` from `getUser()` session.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/types/notaFiscalTypes.ts` | **New** | Type definitions for NotaFiscal, NotaFiscalItem, NotaFiscalCliente, etc. |
| `src/actions/notaFiscalAction.tsx` | **Rewrite** | Add auth, tenant filters, $facet aggregation, getById, status/tipo/natOp filters, text search |
| `src/app/(private)/notas-fiscais/page.tsx` | **New** | List screen (server component shell — renders table component) |
| `src/components/nota-fiscal/NotaFiscalTable.tsx` | **New** | Client component: React Query fetch, filter bar, table, pagination, totals row, export button |
| `src/app/(private)/notas-fiscais/view/[id]/page.tsx` | **New** | Detail page (server component — fetches data, passes to view component) |
| `src/components/nota-fiscal/NotaFiscalView.tsx` | **New** | Client component: card-based detail view with items table, client info, tax summary |
| `src/lib/navigation-data.ts` | **Modified** | Add "Notas Fiscais" entry under "Relatorio" group |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `data_emissao` is string, not Date — can't use for MongoDB range queries | High | Use `data_movto` (Date) for filtering; display `data_emissao` in UI |
| Large collections (100k+ docs) may cause slow `$facet` on unfiltered queries | Medium | Default date filter (last 90 days); index hint on `data_movto` |
| `numero` field is string ("005121"), not numeric — text search needed | Medium | Use regex partial match (`$regex`) for numero search; warn if too broad |
| Sidebar navigation entry could break the nav if missing icon | Low | Use existing `ReceiptText` icon already imported |
| MongoDB `$facet` returns single-element array — destructuring mismatch possible | Low | Document the `[{ metadata, data }]` shape clearly; add runtime check |

## Rollback Plan

Revert the commit. No database writes, no schema changes, no migrations. The change is purely additive (new files + modified server action + navigation entry). To roll back: `git revert <commit>` and the previous state is fully restored.

## Dependencies

- `json-as-xlsx` (already installed, used by `reportToExcel.tsx`)
- `@tanstack/react-query` (already configured)
- `shadcn/ui` components: Table, Badge, Card, Select, Button, Input (all present)
- `lucide-react` icons: `ReceiptText` (already imported in navigation-data.ts)
- `sonner` toast (already configured)
- No new external packages required

## Success Criteria

- [ ] List page loads at `/notas-fiscais` with paginated data (100 rows/page)
- [ ] Filters work: date range, status, tipo (E/S), natOp (default "VENDA DE MERCADORIA"), numero text search
- [ ] Column totals row shows sum of `valor_produtos`, `valor_frete`, `valor` for current page AND global total
- [ ] Clicking a row navigates to `/notas-fiscais/view/[id]` showing items, client data, and ICMSTot
- [ ] Excel export button downloads `.xlsx` with all columns from the current filter
- [ ] Auth enforced: unauthenticated requests rejected; tenant-scoped data only
- [ ] Empty state, loading skeleton, and error state all handled
- [ ] Sidebar shows "Notas Fiscais" under Relatorio, navigates to list screen
- [ ] All user-facing text in PT-BR
