# Delta for Royalties Excel Export

## ADDED Requirements

### Requirement: Export Apuração Royalties Movto Data

The system MUST provide a server action `exportarRoyaltiesMovto(cabId: string)` that fetches all movement records from `tmp_apuracao_royalties_movto` filtered by `id_royalty_cab`, `id_tenant`, and `id_empresa`. The action MUST return serialized data suitable for client-side Excel generation, including the apuração period for file naming.

#### Scenario: Export completed apuração with movements

- GIVEN an apuração with status "completada" and existing movement records
- WHEN the server action is called with a valid `cabId`
- THEN it returns `{ success: true, data: [...], period: "MM/YYYY" }` with all movements serialized
- AND each movement contains: dataMovto, cnpjCpf, cliente, notaFiscal, codBarras, descricao, qtdFaturada, vlrMercadoria, vlrRoyalties

#### Scenario: Export fails — apuração not found

- GIVEN an invalid or non-existent `cabId`
- WHEN the server action is called
- THEN it returns `{ success: false, error: "Apuração não encontrada" }`

#### Scenario: Export fails — unauthenticated user

- GIVEN no active user session
- WHEN the server action is called
- THEN it returns `{ success: false, error: "Não autenticado" }`

#### Scenario: Export with empty movto collection

- GIVEN an apuração with status "completada" but zero movement records
- WHEN the server action is called
- THEN it returns `{ success: true, data: [], period: "MM/YYYY" }`

### Requirement: Export UI Control in Grid

The system MUST display an Excel download button in the actions column of `ApuracaoRoyaltiesCabGrid` for each apuração row. The button MUST be disabled when the apuração status is not "completada".

#### Scenario: Button enabled for completed apuração

- GIVEN an apuração row with status "completada"
- WHEN the grid is rendered
- THEN the Excel button is visible and enabled

#### Scenario: Button disabled for non-completed apuração

- GIVEN an apuração row with status "pendente", "processando", or "erro"
- WHEN the grid is rendered
- THEN the Excel button is visible but disabled (with tooltip or visual indication)

#### Scenario: Export triggers file download with correct name

- GIVEN a completed apuração with period "03/2026"
- WHEN the user clicks the Excel button and the server action succeeds
- THEN the file `Royalties_03-2026_YYYY-MM-DD.xlsx` is downloaded to the user's device

### Requirement: Export Feedback and Error Handling

The system MUST provide visual feedback during the export process: a loading state while fetching data, a success toast with record count, and an error toast on failure.

#### Scenario: Loading state during export

- GIVEN the user clicks the export button
- WHEN the server action is in progress
- THEN the button shows a loading indicator and is disabled

#### Scenario: Success feedback with record count

- GIVEN the server action returns data successfully
- WHEN the export completes
- THEN a success toast displays "Exportados N registros" and the Excel file downloads

#### Scenario: Error feedback on server failure

- GIVEN the server action returns `{ success: false, error: "..." }`
- WHEN the export fails
- THEN an error toast displays the error message and no file is downloaded

#### Scenario: Error feedback on network timeout

- GIVEN the server action throws an unexpected error (network timeout, etc.)
- WHEN the export fails
- THEN an error toast displays "Erro ao exportar dados" and no file is downloaded
