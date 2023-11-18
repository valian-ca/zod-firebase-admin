import { getFirestore as defaultGetFirestore } from 'firebase-admin/firestore'

import { type Collections, collectionsFactory, type FirestoreZodFactoryOptions, type Schema } from './factories'

export const collectionsBuilder = <TSchema extends Schema>(
  schema: TSchema,
  options: Partial<FirestoreZodFactoryOptions> = {},
): Collections<TSchema> => collectionsFactory(schema, { getFirestore: defaultGetFirestore, ...options })
