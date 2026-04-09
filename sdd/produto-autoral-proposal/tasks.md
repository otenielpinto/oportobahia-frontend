# Tasks: produto_autoral

## Phase 1: Types (Foundation)

- [ ] 1.1 Create `src/types/produtoAutoralTypes.ts` with interface `ProdutoAutoralFormData` (all fields except system fields)
- [ ] 1.2 Add `ProdutoAutoral` interface extending FormData with `id`, `id_tenant`, `id_empresa`, `created_at`, `updated_at`
- [ ] 1.3 Add `ProdutoAutoralUpdateInput` type with `id` required + partial FormData
- [ ] 1.4 Add response interfaces: `ProdutoAutoralResponse` and `ProdutoAutoralListResponse`
- [ ] 1.5 Add `COLLECTION_NAME = "tmp_produto_autoral"` constant

## Phase 2: Action (Core Implementation)

- [ ] 2.1 Create `src/actions/produtoAutoralAction.tsx` with imports: TMongo, serializeMongoData, getUser, revalidatePath, gen_id
- [ ] 2.2 Implement `getAllProdutoAutorais(page?, limit?)` - paginated list filtered by id_tenant
- [ ] 2.3 Implement `getProdutoAutoralById(id: number)` - find by id + id_tenant
- [ ] 2.4 Implement `getProdutoAutoralBySku(sku: string)` - find by sku + id_tenant
- [ ] 2.5 Implement `getProdutoAutoralByGtin(gtin: string)` - find by gtinEan + id_tenant
- [ ] 2.6 Implement `createProdutoAutoral(data)` - create with gen_id, id_tenant, id_empresa, timestamps
- [ ] 2.7 Implement `updateProdutoAutoral(data)` - partial update with updated_at
- [ ] 2.8 Implement `deleteProdutoAutoral(id: number)` - delete by id + id_tenant
- [ ] 2.9 Add proper error handling and serialize dates to ISO format for all responses

## Phase 3: MongoDB Indexes (Manual)

- [ ] 3.1 Create compound index `{ id: 1, id_tenant: 1 }` on `tmp_produto_autoral` collection
- [ ] 3.2 Create compound index `{ sku: 1, id_tenant: 1 }` on `tmp_produto_autoral` collection
- [ ] 3.3 Create compound index `{ gtinEan: 1, id_tenant: 1 }` on `tmp_produto_autoral` collection