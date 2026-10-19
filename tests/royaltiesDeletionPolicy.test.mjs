import assert from 'node:assert/strict';
import test from 'node:test';
import { royaltiesDeletionError } from '../src/lib/royaltiesDeletionPolicy.ts';

const createdAt = '2026-10-19T20:20:45.276Z';
const boundary = Date.parse(createdAt) + 60 * 24 * 60 * 60 * 1000;
const oldError = 'Não é possível excluir apuração criada há mais de 60 dias';
const invalidError = 'Não é possível excluir apuração com data de criação ausente ou inválida';

for (const value of [createdAt, new Date(createdAt)]) {
  for (const [offset, expected] of [[-1, null], [0, null], [1, oldError]]) {
    test(`creation ${typeof value}, 60 days ${offset}ms`, () => {
      assert.equal(royaltiesDeletionError(value, boundary + offset), expected);
    });
  }
}

for (const value of [undefined, null, '', 'invalid', new Date(NaN), 0, {}, { $date: createdAt }]) {
  test(`invalid creation fails closed: ${String(value)}`, () => {
    assert.equal(royaltiesDeletionError(value, boundary), invalidError);
  });
}
