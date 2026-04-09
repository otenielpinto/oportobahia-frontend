# Design: produto_autoral

## Technical Approach

Implementar una nueva action `produtoAutoralAction.tsx` para gestión completa de productos autorales en MongoDB, siguiendo exactamente el patrón existente en `empresaAction.tsx`. La colección será `tmp_produto_autoral` con CRUD completo y múltiples estrategias de búsqueda (byId, bySku, byGtin).

## Architecture Decisions

### Decision: MongoDB Indexing Strategy

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Single compound index `{id: 1, id_tenant: 1}` | Simple, but slower for tenant-only queries | ✅ Elegido |
| Separate indexes `{id: 1}` + `{id_tenant: 1}` | More writes, better read isolation | ❌ Descartado |
| Partial indexes per tenant | Complex to manage, better per-tenant performance | ❌ Descartado |

**Rationale**: Seguidor del patrón exacto de `empresaAction.tsx` que usa filtro compuesto `{id, id_tenant}`. Simplifica mantenimiento y es consistente con el codebase.

### Decision: ID Generation

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `gen_id("produto_autoral")` | Ya existe y funciona | ✅ Elegido |
| UUID | Sin secuencia, no friendly | ❌ Descartado |
| Auto-increment MongoDB | Requiere setup adicional | ❌ Descartado |

**Rationale**: `gen_id` ya está implementado y funciona correctamente para otras entities (empresa, mdfe). Mantiene consistencia.

### Decision: Date Serialization

| Option | Tradeoff | Decision |
|--------|----------|----------|
| ISO string en respuestas | Compatible con Client Components | ✅ Elegido |
| Timestamp numérico | Menos legible | ❌ Descartado |
| Date object directamente | No funciona en serialize | ❌ Descartado |

**Rationale**: Siguiendo patrón de `empresaAction.tsx` que serializa `createdAt`/`updatedAt` a ISO string. Requerido por Next.js para pasar datos entre Server y Client Components.

## Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Client         │────▶│  Server Action   │────▶│  MongoDB        │
│  Component      │     │  produtoAutoral  │     │  tmp_produto    │
└─────────────────┘     │  Action.tsx      │     │  _autoral       │
                        └──────────────────┘     └─────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
  ┌───────────┐         ┌─────────────┐         ┌────────────┐
  │ gen_id    │         │ getUser     │         │ revalidate │
  │ (IDs)     │         │ (Auth)      │         │ (Cache)    │
  └───────────┘         └─────────────┘         └────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/types/produtoAutoralTypes.ts` | Create | TypeScript interfaces: `ProdutoAutoral`, `ProdutoAutoralFormData`, `ProdutoAutoralUpdateInput`, responses |
| `src/actions/produtoAutoralAction.tsx` | Create | Server actions: create, read (byId, bySku, byGtin, list), update, delete |
| `src/infra/mongoClient.ts` | No Change | Ya tiene TMongo.connectToDatabase() |

### Detalhamento das Functions em produtoAutoralAction.tsx

| Function | Propósito |
|----------|-----------|
| `createProdutoAutoral(data)` | Cria produto com gen_id, id_tenant, id_empresa, timestamps |
| `getProdutoAutoralById(id)` | Busca por id + id_tenant |
| `getProdutoAutoralBySku(sku)` | Busca por sku + id_tenant |
| `getProdutoAutoralByGtin(gtin)` | Busca por gtinEan + id_tenant |
| `listProdutoAutoral(page, limit)` | Lista paginada filtrada por id_tenant |
| `updateProdutoAutoral(data)` | Update parcial com updated_at automático |
| `deleteProdutoAutoral(id)` | Remove por id + id_tenant |

## Interfaces / Contracts

```typescript
// src/types/produtoAutoralTypes.ts
export interface ProdutoAutoralFormData {
  sku: string;
  gtinEan: string;
  descricaoTitulo: string;
  release: Date | null;
  listaPreco: string;
  precoOporto: number;
  precoDistribuidora: number;
  ncm: string;
  origem: string;
  precoCusto: number;
  fornecedor: string;
  categoriaProduto: string;
  marca: string;
  nivelRoyalty: string;
  percentual: number;
  tipo: string;
  numeroDiscos: number;
  numeroFaixas: number;
  gravadora: string;
  peso: number;
  importadoEm?: Date;
  loteImportacao?: string;
  parceiro: string;
}

export interface ProdutoAutoral extends ProdutoAutoralFormData {
  id: number;
  id_tenant: number;
  id_empresa: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProdutoAutoralUpdateInput extends Partial<ProdutoAutoralFormData> {
  id: number;
}

export interface ProdutoAutoralResponse {
  success: boolean;
  data?: ProdutoAutoral;
  message?: string;
  error?: string;
}

export interface ProdutoAutoralListResponse {
  success: boolean;
  data: ProdutoAutoral[];
  total: number;
  page: number;
  limit: number;
  error?: string;
}
```

### MongoDB Index Creation (manual)

```javascript
// Ejecutar una vez en MongoDB shell o via migration script
db.tmp_produto_autoral.createIndex({ id: 1, id_tenant: 1 }, { unique: true });
db.tmp_produto_autoral.createIndex({ sku: 1, id_tenant: 1 }, { unique: true });
db.tmp_produto_autoral.createIndex({ gtinEan: 1, id_tenant: 1 });
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Types, validaciones de input | Jest with mocks de TMongo |
| Integration | CRUD completo con DB real | Testes de integração via `npm run test:integration` |
| E2E | UI de producto autoral | Playwright - formulario, list, edit, delete |

**Por ahora**: Testing manual siguiendo los escenarios de la spec.

## Migration / Rollout

No migration required. La colección `tmp_produto_autoral` es nueva.

**Nota**: Los índices deben ser creados manualmente o via startup script. Considerar agregar al `infra/init.ts` si existe.

## Open Questions

- [ ] ¿Debe el sistema crear los índices automáticamente al primer uso? (actualmente no lo hace)
- [ ] ¿Se necesita endpoint de API REST además de Server Actions? (no en scope actual)
- [ ] ¿Implementar soft-delete (marcar como deleted) o hard-delete? — Spec dice hard-delete

### Next Step
Ready for sdd-tasks (implementação das tasks do CRUD).