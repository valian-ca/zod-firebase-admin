import { collectionFactory, type CollectionFactory } from './collection-factory'
import type { FactoryOptions } from './factory-options'
import type { CollectionSchema, Schema } from './types'
import type { ZodTypeDocumentData } from '../base'

export type CollectionWithSubCollectionsFactory<
  TCollectionName extends string,
  Z extends ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>
> = CollectionFactory<TCollectionName, Z, TCollectionSchema> &
  (Omit<TCollectionSchema, 'zod' | 'singleDocumentKey'> extends Schema
    ? SubCollectionAccessor<Omit<TCollectionSchema, 'zod' | 'singleDocumentKey'>>
    : object)

export type Collections<TSchema extends Schema> = {
  [CollectionName in keyof TSchema]: CollectionName extends string
    ? TSchema[CollectionName] extends CollectionSchema<infer Z>
      ? CollectionWithSubCollectionsFactory<CollectionName, Z, TSchema[CollectionName]>
      : never
    : never
}

type SubCollectionAccessor<TSubCollectionsSchema extends Schema> = (
  documentId: string
) => Collections<TSubCollectionsSchema>

const subCollectionAccessor =
  <TSubCollectionsSchema extends Schema>(
    schema: TSubCollectionsSchema,
    options: FactoryOptions,
    parent: string
  ): SubCollectionAccessor<TSubCollectionsSchema> =>
  (documentId: string) =>
    Object.entries(schema).reduce(
      (acc, [collectionName, collectionSchema]) => ({
        ...acc,
        [collectionName]: collectionFactory<string>(collectionName, collectionSchema, options, [parent, documentId]),
      }),
      {} as Collections<TSubCollectionsSchema>
    )

type SubCollectionsSchema<TSchema> = Omit<TSchema, 'zod' | 'singleDocumentKey'> extends Schema
  ? Omit<TSchema, 'zod' | 'singleDocumentKey'>
  : never

export const collectionWithSubCollectionsFactory = <
  TCollectionName extends string,
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>
>(
  name: TCollectionName,
  collectionSchema: TCollectionSchema,
  options: FactoryOptions
): CollectionWithSubCollectionsFactory<TCollectionName, Z, TCollectionSchema> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { zod, singleDocumentKey, ...subCollectionsSchema } = collectionSchema
  const factory = collectionFactory(name, collectionSchema, options)

  if (Object.keys(subCollectionsSchema).length === 0) {
    return factory as CollectionWithSubCollectionsFactory<TCollectionName, Z, TCollectionSchema>
  }
  return {
    ...factory,
    ...subCollectionAccessor(subCollectionsSchema as SubCollectionsSchema<TCollectionSchema>, options, name),
  }
}
