import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import Dexie from 'dexie';

/**
 * Ensures Dexie uses fake-indexeddb in Node/Vitest test environments.
 */
export function setupTestIndexedDb(): void {
  const fakeIdb = new IDBFactory();
  Dexie.dependencies.indexedDB = fakeIdb;
  Dexie.dependencies.IDBKeyRange = IDBKeyRange;
  (globalThis as unknown as { indexedDB: IDBFactory }).indexedDB = fakeIdb;
  (globalThis as unknown as { IDBKeyRange: typeof IDBKeyRange }).IDBKeyRange = IDBKeyRange;
}
