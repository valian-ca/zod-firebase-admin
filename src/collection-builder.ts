import { getFirestore as defaultGetFirestore } from 'firebase-admin/firestore'

import { type Collections, collectionsFactory, type Schema } from './factories'

type CollectionsBuilderOptions = {
  readonly getFirestore?: typeof defaultGetFirestore
}

export const collectionsBuilder = <TSchema extends Schema>(
  schema: TSchema,
  options?: CollectionsBuilderOptions,
): Collections<TSchema> => collectionsFactory(schema, { getFirestore: options?.getFirestore ?? defaultGetFirestore })
