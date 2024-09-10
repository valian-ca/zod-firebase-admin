import type { PartialWithFieldValue, SetOptions, UpdateData, WithFieldValue } from 'firebase/firestore'

import type { MetaOutputOptions, ZodTypeDocumentData } from '../base'

import {
  multiDocumentCollectionFactory,
  type MultiDocumentCollectionFactoryOptions,
} from './multi-document-collection-factory'
import type {
  CollectionSchema,
  SchemaDocumentInput,
  SchemaDocumentOutput,
  SchemaReadCollectionGroup,
  SchemaReadCollectionReference,
  SchemaReadDocumentReference,
  SchemaWriteCollectionReference,
  SchemaWriteDocumentReference,
} from './types'

export interface SingleDocumentCollectionFactory<TCollectionSchema extends CollectionSchema> {
  readonly singleDocumentKey: string

  readonly read: {
    collection<Options extends MetaOutputOptions>(
      this: void,
      options?: Options,
    ): SchemaReadCollectionReference<TCollectionSchema, Options>
    doc<Options extends MetaOutputOptions>(
      this: void,
      options?: Options,
    ): SchemaReadDocumentReference<TCollectionSchema, Options>
    collectionGroup<Options extends MetaOutputOptions>(
      this: void,
      options?: Options,
    ): SchemaReadCollectionGroup<TCollectionSchema, Options>
  }

  find<Options extends MetaOutputOptions>(
    this: void,
    options?: Options,
  ): Promise<SchemaDocumentOutput<TCollectionSchema, Options> | undefined>
  findOrThrow<Options extends MetaOutputOptions>(
    this: void,
    options?: Options,
  ): Promise<SchemaDocumentOutput<TCollectionSchema, Options>>

  readonly write: {
    collection(this: void): SchemaWriteCollectionReference<TCollectionSchema>
    doc(this: void): SchemaWriteDocumentReference<TCollectionSchema>
  }

  set(this: void, data: WithFieldValue<SchemaDocumentInput<TCollectionSchema>>): Promise<void>
  set(
    this: void,
    data: PartialWithFieldValue<SchemaDocumentInput<TCollectionSchema>>,
    options: SetOptions,
  ): Promise<void>
  update(this: void, data: UpdateData<SchemaDocumentInput<TCollectionSchema>>): Promise<void>
  delete(this: void): Promise<void>
}

export const singleDocumentCollectionFactory = <
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>,
>(
  collectionName: string,
  zod: Z,
  singleDocumentKey: string,
  factoryOptions?: MultiDocumentCollectionFactoryOptions,
  parentPath?: [string, string],
): SingleDocumentCollectionFactory<TCollectionSchema> => {
  const {
    read,
    write,
    findById,
    findByIdOrThrow,
    set,
    update,
    delete: deleteDocument,
  } = multiDocumentCollectionFactory<Z, TCollectionSchema>(collectionName, zod, parentPath, factoryOptions)
  const setOverload = (data: PartialWithFieldValue<SchemaDocumentInput<TCollectionSchema>>, setOptions?: SetOptions) =>
    setOptions
      ? set(singleDocumentKey, data, setOptions)
      : set(singleDocumentKey, data as WithFieldValue<SchemaDocumentInput<TCollectionSchema>>)
  return {
    singleDocumentKey,
    read: {
      ...read,
      doc: <Options extends MetaOutputOptions>(options?: Options) => read.doc<Options>(singleDocumentKey, options),
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
