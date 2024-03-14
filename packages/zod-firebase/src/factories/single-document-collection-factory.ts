import type {
  CollectionReference,
  DocumentReference,
  PartialWithFieldValue,
  Query,
  SetOptions,
  UpdateData,
  WithFieldValue,
} from 'firebase/firestore'

import type { ZodTypeDocumentData } from '../base'

import {
  multiDocumentCollectionFactory,
  type MultiDocumentCollectionFactoryOptions,
} from './multi-document-collection-factory'
import type { CollectionSchema, SchemaDocumentInput, SchemaDocumentOutput } from './types'

export type SingleDocumentCollectionFactory<
  Z extends ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>,
  TInput extends SchemaDocumentInput<Z, TCollectionSchema> = SchemaDocumentInput<Z, TCollectionSchema>,
  TOutput extends SchemaDocumentOutput<Z, TCollectionSchema> = SchemaDocumentOutput<Z, TCollectionSchema>,
> = {
  readonly singleDocumentKey: string

  readonly read: {
    collection(this: void): CollectionReference<TOutput>
    doc(this: void): DocumentReference<TOutput>
    collectionGroup(this: void): Query<TOutput>
  }

  find(this: void): Promise<TOutput | undefined>
  findOrThrow(this: void): Promise<TOutput>

  readonly write: {
    collection(this: void): CollectionReference<TInput>
    doc(this: void): DocumentReference<TInput>
  }

  set(this: void, data: WithFieldValue<TInput>): Promise<void>
  set(this: void, data: PartialWithFieldValue<TInput>, options: SetOptions): Promise<void>
  update(this: void, data: UpdateData<TInput>): Promise<void>
  delete(this: void): Promise<void>
}

export const singleDocumentCollectionFactory = <
  TCollectionName extends string,
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>,
  TInput extends SchemaDocumentInput<Z, TCollectionSchema> = SchemaDocumentInput<Z, TCollectionSchema>,
  TOutput extends SchemaDocumentOutput<Z, TCollectionSchema> = SchemaDocumentOutput<Z, TCollectionSchema>,
>(
  collectionName: TCollectionName,
  zod: Z,
  singleDocumentKey: string,
  factoryOptions?: MultiDocumentCollectionFactoryOptions,
  parentPath?: [string, string],
): SingleDocumentCollectionFactory<Z, TCollectionSchema, TInput, TOutput> => {
  const {
    read,
    write,
    findById,
    findByIdOrThrow,
    set,
    update,
    delete: deleteDocument,
  } = multiDocumentCollectionFactory<TCollectionName, Z, TCollectionSchema, TInput, TOutput>(
    collectionName,
    zod,
    factoryOptions,
    parentPath,
  )
  const setOverload = (data: PartialWithFieldValue<TInput>, setOptions?: SetOptions) =>
    setOptions ? set(singleDocumentKey, data, setOptions) : set(singleDocumentKey, data as WithFieldValue<TInput>)
  return {
    singleDocumentKey,
    read: {
      ...read,
      doc: () => read.doc(singleDocumentKey),
    },
    find: () => findById(singleDocumentKey),
    findOrThrow: () => findByIdOrThrow(singleDocumentKey),
    write: {
      ...write,
      doc: () => write.doc(singleDocumentKey),
    },
    set: setOverload,
    update: (data) => update(singleDocumentKey, data),
    delete: () => deleteDocument(singleDocumentKey),
  }
}
