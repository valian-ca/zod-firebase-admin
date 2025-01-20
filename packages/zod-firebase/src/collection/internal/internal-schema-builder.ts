import { type CollectionSchema, type FirestoreZodFactoryOptions, type Schema } from '../../schema'
import { type CollectionFactoryBuilder, collectionFactoryBuilder } from '../factory/collection-factory-builder'
import { type SubCollectionsSchema } from '../types'

export type InternalSchema<TSchema extends Schema> = {
  [CollectionName in keyof TSchema]: CollectionName extends string
    ? TSchema[CollectionName] extends CollectionSchema
      ? TSchema[CollectionName] & InternalCollectionSchema<CollectionName, TSchema[CollectionName]>
      : never
    : never
}

export type InternalCollectionSchema<
  TCollectionName extends string,
  TCollectionSchema extends CollectionSchema,
> = TCollectionSchema &
  CollectionFactoryBuilder<TCollectionName, TCollectionSchema> & {
    readonly collectionName: TCollectionName
    readonly internalSubSchema: SubCollectionsSchema<TCollectionSchema> extends Schema
      ? InternalSchema<SubCollectionsSchema<TCollectionSchema>>
      : null
  }

export const internalSchemaBuilder = <TSchema extends Schema>(
  schema: TSchema,
  options?: FirestoreZodFactoryOptions,
): InternalSchema<TSchema> =>
  Object.fromEntries(
    Object.entries(schema).map(([collectionName, collectionSchema]) => [
      collectionName,
      internalCollectionSchema(collectionName, collectionSchema, options),
    ]),
  ) as unknown as InternalSchema<TSchema>

const internalCollectionSchema = <TCollectionName extends string, TCollectionSchema extends CollectionSchema>(
  collectionName: TCollectionName,
  collectionSchema: TCollectionSchema,
  options?: FirestoreZodFactoryOptions,
) => {
  const factoryBuilder = collectionFactoryBuilder(collectionName, collectionSchema, options)

  const { zod, singleDocumentKey, includeDocumentIdForZod, readonlyDocuments, ...subSchema } = collectionSchema
  const internalSubSchema =
    Object.keys(subSchema).length === 0 ? null : internalSchemaBuilder(subSchema as Schema, options)

  return {
    collectionName,
    zod,
    singleDocumentKey,
    includeDocumentIdForZod,
    readonlyDocuments,
    internalSubSchema,
    ...internalSubSchema,
    ...factoryBuilder,
  } as InternalCollectionSchema<TCollectionName, TCollectionSchema>
}
