import { getFirestore as defaultGetFirestore } from 'firebase-admin/firestore'

import { type Collections, collectionsFactory, type FirestoreZodFactoryOptions, type Schema } from './factories'

type CollectionsBuilderOptions = Omit<FirestoreZodFactoryOptions, 'getFirestore'> & {
  readonly getFirestore?: typeof defaultGetFirestore
}

export const collectionsBuilder = <TSchema extends Schema>(
  schema: TSchema,
  { getFirestore = defaultGetFirestore, ...options }: CollectionsBuilderOptions = {},
): Collections<TSchema> => collectionsFactory(schema, { getFirestore, ...options })
