import { type CollectionSchema, type Schema } from '../../schema'
import { type Collection, type Collections } from '../types'

import { type InternalCollectionSchema, type InternalSchema } from './index'

export const internalCollectionsBuilder = <TSchema extends Schema>(
  internalSchema: InternalSchema<TSchema>,
  parentPath: [string, string],
) =>
  Object.fromEntries(
    Object.entries(internalSchema).map(([collectionName, schemaBuilder]) => [
      collectionName,
      internalCollectionBuilder(schemaBuilder, parentPath),
    ]),
  ) as Collections<TSchema>

const internalCollectionBuilder = <TCollectionName extends string, TCollectionSchema extends CollectionSchema>(
  internalCollectionSchema: InternalCollectionSchema<TCollectionName, TCollectionSchema>,
  parentPath: [string, string],
): Collection<TCollectionName, TCollectionSchema> => {
  const collection = internalCollectionSchema.build(parentPath)

  const { internalSubSchema } = internalCollectionSchema
  if (!internalSubSchema) {
    return collection as Collection<TCollectionName, TCollectionSchema>
  }

  const subCollectionsAccessor = (documentId: string) =>
    internalCollectionsBuilder(internalSubSchema, [collection.collectionPath, documentId])

  return Object.assign(subCollectionsAccessor, collection, internalSubSchema) as Collection<
    TCollectionName,
    TCollectionSchema
  >
}
