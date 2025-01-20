import { type CollectionSchema, type FirestoreZodFactoryOptions, type Schema } from '../schema'

import { collectionFactoryBuilder } from './factory/collection-factory-builder'
import { internalCollectionsBuilder, internalSchemaBuilder } from './internal'
import { subCollectionsSchema } from './sub-collections-schema'
import { type Collection, type Collections } from './types'

export const rootCollectionsBuilder = <TSchema extends Schema>(
  schema: TSchema,
  factoryOptions?: FirestoreZodFactoryOptions,
) =>
  Object.fromEntries(
    Object.entries(schema).map(([collectionName, collectionSchema]) => [
      collectionName,
      rootCollectionBuilder(collectionName, collectionSchema, factoryOptions),
    ]),
  ) as unknown as Collections<TSchema>

const rootCollectionBuilder = <TCollectionName extends string, TCollectionSchema extends CollectionSchema>(
  collectionName: TCollectionName,
  collectionSchema: TCollectionSchema,
  factoryOptions?: FirestoreZodFactoryOptions,
): Collection<TCollectionName, TCollectionSchema> => {
  const builder = collectionFactoryBuilder(collectionName, collectionSchema, factoryOptions)
  const collectionFactory = builder.build()
  const subSchema = subCollectionsSchema(collectionSchema)
  if (Object.keys(subSchema).length === 0) {
    return collectionFactory as Collection<TCollectionName, TCollectionSchema>
  }

  const internalSchema = internalSchemaBuilder(subSchema, factoryOptions)
  const subCollectionsAccessor = (documentId: string) =>
    internalCollectionsBuilder(internalSchema, [collectionFactory.collectionPath, documentId])

  return Object.assign(subCollectionsAccessor, collectionFactory, internalSchema) as Collection<
    TCollectionName,
    TCollectionSchema
  >
}
