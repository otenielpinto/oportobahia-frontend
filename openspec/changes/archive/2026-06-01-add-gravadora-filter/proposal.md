# Proposal: Align Royalty Import Columns with Export Model

## Intent

Unify the royalty spreadsheet import column names with the already-established export column model (accent-free). Eliminate the "Oigem" typo and promote three optional columns (custo_operativo, royalty_min_garantido_dolar, royalty_min_garantido_reais) to regular columns in the import system. Fix a field name bug in the export component.

## Scope

### In Scope
- Update `EXCEL_REQUIRED_COLUMNS` in types to use accent-free names matching EXPORT_COLUMNS
- Remove "Release" from required columns (keep in types for validation, exclude from export model)
- Promote `custo_operativo`, `royalty_min_garantido_dolar`, `royalty_min_garantido_reais` from optional to required columns
- Fix "Oigem" → "Origem" typo in types and action file
- Update all column name references in `planilhaRoyaltyAction.tsx` to accent-free versions
- Fix export bug: `royalty_min_garantido_real` → `royalty_min_garantido_reais` in ExportProdutoRoyaltyForm.tsx

### Out of Scope
- Changing the export column model (already correct)
- Database schema changes
- UI/UX changes to the import/export forms

## Capabilities

### Modified Capabilities
- `produto-royalty-import`: Column name normalization, typo fix, optional→required column promotion

## Approach

1. **Types file** (`planilhaRoyaltyTypes.ts`): Replace accented column names in `EXCEL_REQUIRED_COLUMNS` with accent-free equivalents from EXPORT_COLUMNS. Fix "Oigem" → "Origem". Remove "Release" from required list (keep in interface). Move optional columns into required list. Update `COLUMN_TO_FIELD` mapping. Remove `EXCEL_OPTIONAL_COLUMNS` entirely.

2. **Action file** (`planilhaRoyaltyAction.tsx`): Update all `getStr()`, `getNum()`, `getPercentual()` calls to use new accent-free column names. Update the release column validation to check if column exists (not required). Remove optional column conditional checks for the three promoted columns.

3. **Export form** (`ExportProdutoRoyaltyForm.tsx`): Fix line 64 — change `royalty_min_garantido_real` to `royalty_min_garantido_reais` to match the actual data field name.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/types/planilhaRoyaltyTypes.ts` | Modified | Column names, mappings, optional→required |
| `src/actions/planilhaRoyaltyAction.tsx` | Modified | All column name references in row parsing |
| `src/components/relatorio/ExportProdutoRoyaltyForm.tsx` | Modified | Single field name bug fix |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Existing Excel templates with accented column names will fail validation | High | Communicate change to users; provide updated template; consider dual-support migration period |
| "Release" column removal from required list breaks existing validation | Low | Release column stays in types for validation, just not in export model |
| Export field name fix may break existing exports if downstream consumers expect the wrong name | Low | Field name was already wrong; fixing aligns with actual data model |

## Rollback Plan

1. Revert git commit to restore accented column names
2. Re-introduce `EXCEL_OPTIONAL_COLUMNS` if needed
3. Revert the export field name fix if downstream breakage occurs

## Dependencies

- None — pure column name alignment

## Success Criteria

- [ ] Import accepts Excel files with accent-free column names matching export model
- [ ] "Origem" column is correctly spelled (not "Oigem")
- [ ] Three promoted columns (custo_operativo, royalty_min_garantido_*) are required in import
- [ ] Export produces correct field name `royalty_min_garantido_reais`
- [ ] All existing import functionality continues to work
