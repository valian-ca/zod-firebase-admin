import { getFirestore as defaultGetFirestore } from 'firebase-admin/firestore'
import type { Collections, FactoryOptions, Schema } from './factories'
import { collectionWithSubCollectionsFactory } from './factories'

export const collectionsBuilder = <TSchema extends Schema>(
  schema: TSchema,
  factoryOptions: Partial<FactoryOptions> = {}
): Collections<TSchema> => {
  const options = { getFirestore: defaultGetFirestore, ...factoryOptions }
  return Object.entries(schema).reduce(
    (acc, [collectionName, collectionSchema]) => ({
      ...acc,
      [collectionName]: collectionWithSubCollectionsFactory<string>(collectionName, collectionSchema, options),
    }),
    {} as Collections<TSchema>
  )
}
