import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import test from 'node:test';

let session;
let records;
let children;
let calls;
const matches = (record, filter) => Object.entries(filter).every(([key, value]) => record[key] === value);
const client = {};
const database = {
  collection(name) {
    assert.ok(['tmp_apuracao_royalties_cab', 'tmp_apuracao_royalties_movto'].includes(name));
    return {
      async findOne(filter) {
        calls.push(['findOne', name, filter]);
        return records.find(record => matches(record, filter)) ?? null;
      },
      async deleteMany(filter) {
        calls.push(['deleteMany', name, filter]);
        children = children.filter(record => !matches(record, filter));
      },
      async deleteOne(filter) {
        calls.push(['deleteOne', name, filter]);
        records = records.filter(record => !matches(record, filter));
      },
    };
  },
};
globalThis.__royaltiesDeletionMocks = {
  TMongo: {
    async connectToDatabase() {
      calls.push(['connect']);
      return { client, clientdb: database };
    },
    async mongoDisconnect(value) {
      assert.equal(value, client);
      calls.push(['disconnect']);
    },
  },
  getUser: async () => session,
  revalidatePath: path => calls.push(['revalidatePath', path]),
  serializeMongoData: value => value,
};
const modules = {
  '@/infra/mongoClient': ['TMongo'],
  '@/actions/sessionAction': ['getUser'],
  '@/lib/serializeMongoData': ['serializeMongoData'],
  'next/cache': ['revalidatePath'],
};
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (modules[specifier]) {
      const source = modules[specifier].map(name =>
        `export const ${name} = globalThis.__royaltiesDeletionMocks.${name};`).join('\n');
      return { url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true };
    }
    if (specifier === '@/lib/royaltiesDeletionPolicy') {
      return { url: new URL('../src/lib/royaltiesDeletionPolicy.ts', import.meta.url).href, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
const { excluirApuracaoRoyaltiesCab } = await import('../src/actions/apurarRoyaltiesCabAction.ts');

const createdAt = '2026-10-19T20:20:45.276Z';
const boundary = Date.parse(createdAt) + 60 * 24 * 60 * 60 * 1000;
const oldError = 'Não é possível excluir apuração criada há mais de 60 dias';
const invalidError = 'Não é possível excluir apuração com data de criação ausente ou inválida';
const ownFilter = { id: 'cab', id_tenant: 1, id_empresa: 1 };

test.beforeEach(() => {
  session = { id_tenant: 1, id_empresa: 1 };
  records = [{ ...ownFilter, status: 'completada', createdAt,
    updatedAt: '2026-12-18T20:20:45.276Z', dataInicial: '2000-01-01', dataFinal: '2000-12-31' }];
  children = [{ id_royalty_cab: 'cab', id_tenant: 1 }, { id_royalty_cab: 'other', id_tenant: 1 }];
  calls = [];
});
test.afterEach(() => test.mock.timers.reset());
test.after(() => {
  hooks.deregister();
  delete globalThis.__royaltiesDeletionMocks;
});

async function denied(error, expectedCalls) {
  const before = structuredClone({ records, children });
  assert.deepEqual(await excluirApuracaoRoyaltiesCab('cab'), { success: false, error });
  assert.deepEqual({ records, children }, before);
  assert.deepEqual(calls, expectedCalls);
}
const lookupCalls = [
  ['connect'], ['findOne', 'tmp_apuracao_royalties_cab', ownFilter], ['disconnect'],
];

for (const value of [createdAt, new Date(createdAt)]) {
  test(`old creation (${typeof value}) rejects before either delete despite recent updatedAt`, async () => {
    test.mock.timers.enable({ apis: ['Date'], now: boundary + 1 });
    records[0].createdAt = value;
    await denied(oldError, lookupCalls);
  });
}
for (const value of [undefined, null, '', 'invalid', new Date(NaN)]) {
  test(`invalid creation rejects without mutation: ${String(value)}`, async () => {
    test.mock.timers.enable({ apis: ['Date'], now: boundary });
    records[0].createdAt = value;
    await denied(invalidError, lookupCalls);
  });
}
for (const offset of [-1, 0]) {
  test(`recent creation at boundary ${offset}ms preserves deletion and revalidation`, async () => {
    test.mock.timers.enable({ apis: ['Date'], now: boundary + offset });
    assert.deepEqual(await excluirApuracaoRoyaltiesCab('cab'), { success: true });
    assert.deepEqual(records, []);
    assert.deepEqual(children, [{ id_royalty_cab: 'other', id_tenant: 1 }]);
    assert.deepEqual(calls, [
      ...lookupCalls.slice(0, 2),
      ['deleteMany', 'tmp_apuracao_royalties_movto', { id_royalty_cab: 'cab', id_tenant: 1 }],
      ['deleteOne', 'tmp_apuracao_royalties_cab', { id: 'cab' }],
      ['disconnect'], ['revalidatePath', '/relatorio/apuracao-royalties'],
    ]);
  });
}
test('processando still rejects before age validation', async () => {
  records[0].status = 'processando';
  records[0].createdAt = null;
  await denied('Não é possível excluir apuração em processamento', lookupCalls);
});
test('unauthenticated still rejects without connecting', async () => {
  session = null;
  await denied('Não autenticado', []);
});
test('missing record still rejects', async () => {
  records = [];
  await denied('Apuração não encontrada', lookupCalls);
});
for (const field of ['id_tenant', 'id_empresa']) {
  test(`another ${field} still rejects without mutation`, async () => {
    records[0][field] = 2;
    await denied('Apuração não encontrada', lookupCalls);
  });
}
