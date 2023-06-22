import { getFirestore as defaultGetFirestore } from 'firebase-admin/firestore'
import { type Collections, type FactoryOptions, type Schema, collectionsFactory } from './factories'

export const collectionsBuilder = <TSchema extends Schema>(
  schema: TSchema,
  options: Partial<FactoryOptions> = {}
): Collections<TSchema> => collectionsFactory(schema, { getFirestore: defaultGetFirestore, ...options })
