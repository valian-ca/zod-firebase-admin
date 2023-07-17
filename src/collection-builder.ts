import { getFirestore as defaultGetFirestore } from 'firebase-admin/firestore'

import { type Collections, collectionsFactory, type FactoryOptions, type Schema } from './factories'

export const collectionsBuilder = <TSchema extends Schema>(
  schema: TSchema,
  options: Partial<FactoryOptions> = {},
): Collections<TSchema> => collectionsFactory(schema, { getFirestore: defaultGetFirestore, ...options })
