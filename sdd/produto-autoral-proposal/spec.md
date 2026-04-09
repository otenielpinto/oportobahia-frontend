# produto_autoral Specification

## Purpose

This specification defines the requirements, scenarios, data contract, and API contract for the `produto_autoral` entity, a server action module for managing authorial products in the OportoBahia system.

## Overview

The `produto_autoral` is a MongoDB collection (`tmp_produto_autoral`) that stores product data for royalty-bearing items. It provides full CRUD operations with multiple lookup strategies (by ID, SKU, GTIN) and paginated list retrieval.

---

## 1. Requirements

### 1.1 Functional Requirements

#### FR-001: Create Product (produto_autoral)

The system MUST allow creation of new authorial products.

- **FR-001.1**: The system SHALL generate a unique sequential ID using the `gen_id` function.
- **FR-001.2**: The system MUST automatically assign `id_tenant` and `id_empresa` from the authenticated user's session.
- **FR-001.3**: The system MUST automatically set `created_at` and `updated_at` timestamps on creation.
- **FR-001.4**: All fields defined in the Data Contract MUST be accepted as input.

#### FR-002: Read Product by ID

The system MUST allow retrieval of a single product by its unique identifier.

- **FR-002.1**: The lookup MUST filter by both `id` and `id_tenant` for multi-tenant security.
- **FR-002.2**: The system SHALL return a serialized document with ISO date strings for date fields.
- **FR-002.3**: The system MUST return an error if the product does not exist or belongs to another tenant.

#### FR-003: Read Product by SKU

The system MUST allow retrieval of a single product by its SKU (Stock Keeping Unit).

- **FR-003.1**: The lookup MUST filter by both `sku` and `id_tenant` for multi-tenant security.
- **FR-003.2**: The system SHALL perform an exact match on the SKU field (case-sensitive).

#### FR-004: Read Product by GTIN

The system MUST allow retrieval of a single product by its GTIN/EAN code.

- **FR-004.1**: The lookup MUST filter by both `gtinEan` and `id_tenant` for multi-tenant security.
- **FR-004.2**: The system SHALL perform an exact match on the GTIN field.

#### FR-005: List Products with Pagination

The system MUST provide a paginated list of all products.

- **FR-005.1**: The list MUST be filtered by `id_tenant` for multi-tenant security.
- **FR-005.2**: The system SHALL support pagination via `skip` and `limit` parameters.
- **FR-005.3**: The system SHALL return total count for pagination metadata.
- **FR-005.4**: The default page size SHOULD be configurable, with a suggested default of 20 items.

#### FR-006: Update Product

The system MUST allow modification of existing product data.

- **FR-006.1**: The update MUST filter by both `id` and `id_tenant` for security.
- **FR-006.2**: The system MUST automatically update the `updated_at` timestamp on modification.
- **FR-006.3**: The system SHALL only update the fields provided in the input (partial update).
- **FR-006.4**: The system MUST return an error if the product does not exist or belongs to another tenant.

#### FR-007: Delete Product

The system MUST allow removal of a product from the collection.

- **FR-007.1**: The delete MUST filter by both `id` and `id_tenant` for security.
- **FR-007.2**: The system MUST return an error if the product does not exist or belongs to another tenant.

### 1.2 Non-Functional Requirements

#### NFR-001: Authentication

All operations MUST require a valid authenticated user session.

- **NFR-001.1**: The system SHALL reject any request without a valid `id_tenant` in the session.
- **NFR-001.2**: The system SHALL use the `getUser()` action to validate authentication.

#### NFR-001: Performance

The system SHOULD return responses within acceptable time limits.

- **NFR-002.1**: Single-record lookups SHOULD complete within 100ms.
- **NFR-002.2**: List queries with pagination SHOULD complete within 200ms.

#### NFR-003: Data Serialization

Date fields MUST be serialized to ISO 8601 string format for client consumption.

---

## 2. Scenarios

### SCENARIO: Create a new authorial product

- **GIVEN** an authenticated user with valid session (`id_tenant`, `id_empresa`)
- **AND** valid product data including all required fields except `id`, `created_at`, `updated_at`
- **WHEN** the user calls `createProdutoAutoral` with the product data
- **THEN** the system generates a new sequential `id`
- **AND** the system assigns `id_tenant` and `id_empresa` from the session
- **AND** the system sets `created_at` and `updated_at` to the current timestamp
- **AND** the system inserts the product into the `tmp_produto_autoral` collection
- **AND** the system returns success with message "Produto autoral criado com sucesso."

### SCENARIO: Retrieve product by existing ID

- **GIVEN** an authenticated user with valid session
- **AND** a product ID that exists in the collection under the same tenant
- **WHEN** the user calls `getProdutoAutoralById` with the product ID
- **THEN** the system returns the product data with serialized dates
- **AND** returns success: true

### SCENARIO: Retrieve product by non-existent ID

- **GIVEN** an authenticated user with valid session
- **AND** a product ID that does not exist in the collection
- **WHEN** the user calls `getProdutoAutoralById` with the product ID
- **THEN** the system returns success: false
- **AND** returns error: "Produto autoral não encontrado."

### SCENARIO: Retrieve product by SKU

- **GIVEN** an authenticated user with valid session
- **AND** a SKU that exists in the collection under the same tenant
- **WHEN** the user calls `getProdutoAutoralBySku` with the SKU
- **THEN** the system returns the product data with serialized dates
- **AND** returns success: true

### SCENARIO: Retrieve product by GTIN

- **GIVEN** an authenticated user with valid session
- **AND** a GTIN that exists in the collection under the same tenant
- **WHEN** the user calls `getProdutoAutoralByGtin` with the GTIN
- **THEN** the system returns the product data with serialized dates
- **AND** returns success: true

### SCENARIO: List products with pagination

- **GIVEN** an authenticated user with valid session
- **AND** pagination parameters `page` (1-based) and `limit` (e.g., 20)
- **WHEN** the user calls `listProdutoAutoral` with pagination parameters
- **THEN** the system returns an array of products for the current tenant
- **AND** returns total count for building pagination UI
- **AND** returns success: true

### SCENARIO: Update an existing product

- **GIVEN** an authenticated user with valid session
- **AND** an existing product ID belonging to the same tenant
- **AND** partial update data (e.g., only `precoOporto` and `precoDistribuidora`)
- **WHEN** the user calls `updateProdutoAutoral` with the update data
- **THEN** the system updates only the provided fields
- **AND** the system updates `updated_at` to current timestamp
- **AND** the system returns success with message "Produto autoral atualizado com sucesso."

### SCENARIO: Delete an existing product

- **GIVEN** an authenticated user with valid session
- **AND** an existing product ID belonging to the same tenant
- **WHEN** the user calls `deleteProdutoAutoral` with the product ID
- **THEN** the system removes the product from the collection
- **AND** the system returns success with message "Produto autoral excluído com sucesso."

### SCENARIO: Unauthorized access (no valid session)

- **GIVEN** a request without valid authentication
- **WHEN** any CRUD operation is attempted
- **THEN** the system returns success: false
- **AND** returns error: "Não autorizado"

### SCENARIO: Update product from different tenant

- **GIVEN** an authenticated user with valid session (tenant A)
- **AND** a product ID that belongs to tenant B
- **WHEN** the user calls `updateProdutoAutoral` with that product ID
- **THEN** the system returns success: false
- **AND** returns error: "Produto autoral não encontrado ou não pertence ao seu tenant."

---

## 3. Data Contract

### 3.1 TypeScript Interface

```typescript
/**
 * Input for creating a new autoral product.
 * Excludes system fields: id, id_tenant, id_empresa, created_at, updated_at
 */
export interface ProdutoAutoralFormData {
  // Core identification
  sku: string;
  gtinEan: string;

  // Product details
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

  // Royalty information
  nivelRoyalty: string;
  percentual: number;
  tipo: string;

  // Music-specific details
  numeroDiscos: number;
  numeroFaixas: number;
  gravadora: string;
  peso: number;

  // Import metadata
  importadoEm?: Date;
  loteImportacao?: string;

  // Relational
  parceiro: string;
}

/**
 * Full autoral product entity (includes all fields from DB)
 */
export interface ProdutoAutoral extends ProdutoAutoralFormData {
  // System-generated identifiers
  id: number;
  id_tenant: number;
  id_empresa: number;

  // Timestamps
  created_at: Date;
  updated_at: Date;
}

/**
 * Input for updating an existing autoral product
 */
export interface ProdutoAutoralUpdateInput extends Partial<ProdutoAutoralFormData> {
  id: number; // Required for identifying the record to update
}

/**
 * Paginated list response
 */
export interface ProdutoAutoralListResponse {
  success: boolean;
  data: ProdutoAutoral[];
  total: number;
  page: number;
  limit: number;
  error?: string;
}

/**
 * Single entity response
 */
export interface ProdutoAutoralResponse {
  success: boolean;
  data?: ProdutoAutoral;
  message?: string;
  error?: string;
}
```

### 3.2 MongoDB Collection Schema

```javascript
{
  // Primary key
  id: Number,           // Sequential, unique within tenant

  // Tenant isolation
  id_tenant: Number,    // Required, indexed
  id_empresa: Number,   // Required

  // Core identification
  sku: String,          // Required, indexed, unique within tenant
  gtinEan: String,      // Required, indexed

  // Product details
  descricaoTitulo: String,
  release: Date,
  listaPreco: String,
  precoOporto: Number,
  precoDistribuidora: Number,
  ncm: String,
  origem: String,
  precoCusto: Number,
  fornecedor: String,
  categoriaProduto: String,
  marca: String,

  // Royalty
  nivelRoyalty: String,
  percentual: Number,
  tipo: String,

  // Music details
  numeroDiscos: Number,
  numeroFaixas: Number,
  gravadora: String,
  peso: Number,

  // Import metadata
  importadoEm: Date,
  loteImportacao: String,

  // Relational
  parceiro: String,

  // Timestamps
  created_at: Date,
  updated_at: Date
}
```

**Indexes Required:**

- `{ id: 1, id_tenant: 1 }` — Primary lookup
- `{ sku: 1, id_tenant: 1 }` — SKU lookup
- `{ gtinEan: 1, id_tenant: 1 }` — GTIN lookup

---

## 4. API Contract

### 4.1 Server Actions

All actions follow the pattern established in `empresaAction.tsx` and use `"use server"`.

```typescript
"use server";

import {
  ProdutoAutoralFormData,
  ProdutoAutoralUpdateInput,
  ProdutoAutoralListResponse,
  ProdutoAutoralResponse,
} from "@/types/produtoAutoralTypes";

/**
 * Creates a new autoral product.
 * @param data - Product data (without system fields)
 * @returns ProdutoAutoralResponse
 */
export async function createProdutoAutoral(
  data: ProdutoAutoralFormData,
): Promise<ProdutoAutoralResponse>;

/**
 * Retrieves a product by its unique ID.
 * @param id - Product ID (number)
 * @returns ProdutoAutoralResponse
 */
export async function getProdutoAutoralById(
  id: number,
): Promise<ProdutoAutoralResponse>;

/**
 * Retrieves a product by its SKU.
 * @param sku - Product SKU (string)
 * @returns ProdutoAutoralResponse
 */
export async function getProdutoAutoralBySku(
  sku: string,
): Promise<ProdutoAutoralResponse>;

/**
 * Retrieves a product by its GTIN/EAN.
 * @param gtin - GTIN/EAN code (string)
 * @returns ProdutoAutoralResponse
 */
export async function getProdutoAutoralByGtin(
  gtin: string,
): Promise<ProdutoAutoralResponse>;

/**
 * Lists all products with pagination.
 * @param page - Page number (1-based, default: 1)
 * @param limit - Items per page (default: 20)
 * @returns ProdutoAutoralListResponse
 */
export async function listProdutoAutoral(
  page?: number,
  limit?: number,
): Promise<ProdutoAutoralListResponse>;

/**
 * Updates an existing product.
 * @param data - Update data including id
 * @returns ProdutoAutoralResponse
 */
export async function updateProdutoAutoral(
  data: ProdutoAutoralUpdateInput,
): Promise<ProdutoAutoralResponse>;

/**
 * Deletes a product by its ID.
 * @param id - Product ID (number)
 * @returns ProdutoAutoralResponse
 */
export async function deleteProdutoAutoral(
  id: number,
): Promise<ProdutoAutoralResponse>;
```

### 4.2 Response Patterns

**Success Response (create, update, delete):**

```typescript
{ success: true, message: "Produto autoral criado/atualizado/excluído com sucesso." }
```

**Success Response (getById, getBySku, getByGtin):**

```typescript
{ success: true, data: { ...ProdutoAutoral } }
```

**Success Response (list):**

```typescript
{ success: true, data: [...], total: 100, page: 1, limit: 20 }
```

**Error Response:**

```typescript
{ success: false, error: "Mensagem de erro específica" }
```

**Not Found Response:**

```typescript
{ success: false, error: "Produto autoral não encontrado." }
```

---

## 5. Dependencies

| Dependency                  | Purpose                              |
| --------------------------- | ------------------------------------ |
| `@/infra/mongoClient`       | MongoDB connection (`TMongo`)        |
| `@/actions/generatorAction` | ID generation (`gen_id`)             |
| `@/actions/sessionAction`   | User authentication (`getUser`)      |
| `next/cache`                | Path revalidation (`revalidatePath`) |

---

## 6. References

- **Reference Action**: `/src/actions/empresaAction.tsx` — Pattern for CRUD operations
- **Reference Generator**: `/src/actions/generatorAction.tsx` — Sequential ID generation
- **Reference Types**: `/src/types/planilhaCopyrightTypes.ts` — Base product fields (excluding `gtinEanNumero`)
