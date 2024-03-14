import { firestoreCollectionPath, type ZodTypeDocumentData } from '../base'

import type { FirestoreZodFactoryOptions } from './firestore-zod-factory-options'
import {
  type MultiDocumentCollectionFactory,
  multiDocumentCollectionFactory,
} from './multi-document-collection-factory'
import {
  type SingleDocumentCollectionFactory,
  singleDocumentCollectionFactory,
} from './single-document-collection-factory'
import type { CollectionSchema, SchemaDocumentInput, SchemaDocumentOutput } from './types'

type SingleOrMultiDocumentCollectionFactory<
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>,
  TInput extends SchemaDocumentInput<Z, TCollectionSchema> = SchemaDocumentInput<Z, TCollectionSchema>,
  TOutput extends SchemaDocumentOutput<Z, TCollectionSchema> = SchemaDocumentOutput<Z, TCollectionSchema>,
> = TCollectionSchema['singleDocumentKey'] extends string
  ? SingleDocumentCollectionFactory<Z, TCollectionSchema, TInput, TOutput>
  : MultiDocumentCollectionFactory<Z, TCollectionSchema, TInput, TOutput>

export type CollectionFactory<
  TCollectionName extends string,
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>,
  TInput extends SchemaDocumentInput<Z, TCollectionSchema> = SchemaDocumentInput<Z, TCollectionSchema>,
  TOutput extends SchemaDocumentOutput<Z, TCollectionSchema> = SchemaDocumentOutput<Z, TCollectionSchema>,
> = SingleOrMultiDocumentCollectionFactory<Z, TCollectionSchema, TInput, TOutput> & {
  readonly collectionName: TCollectionName
  readonly collectionPath: string
  readonly zod: Z
}

export const collectionFactory = <
  TCollectionName extends string,
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>,
  TInput extends SchemaDocumentInput<Z, TCollectionSchema> = SchemaDocumentInput<Z, TCollectionSchema>,
  TOutput extends SchemaDocumentOutput<Z, TCollectionSchema> = SchemaDocumentOutput<Z, TCollectionSchema>,
>(
  collectionName: TCollectionName,
  { zod, singleDocumentKey, includeDocumentIdForZod }: TCollectionSchema,
  options?: FirestoreZodFactoryOptions,
  parentPath?: [string, string],
) => {
  const factoryOptions = { ...options, includeDocumentIdForZod }
  const collection = (
    typeof singleDocumentKey === 'string'
      ? singleDocumentCollectionFactory<TCollectionName, Z, TCollectionSchema, TInput, TOutput>(
          collectionName,
          zod,
          singleDocumentKey,
          factoryOptions,
          parentPath,
        )
      : multiDocumentCollectionFactory<TCollectionName, Z, TCollectionSchema, TInput, TOutput>(
          collectionName,
          zod,
          factoryOptions,
          parentPath,
        )
  ) as SingleOrMultiDocumentCollectionFactory<Z, TCollectionSchema, TInput, TOutput>

  return {
    collectionName,
    collectionPath: parentPath ? firestoreCollectionPath([...parentPath, collectionName]) : collectionName,
    zod,
    ...collection,
  }
}
