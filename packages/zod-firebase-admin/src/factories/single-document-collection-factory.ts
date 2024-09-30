import {
  type PartialWithFieldValue,
  type Precondition,
  type SetOptions,
  type UpdateData,
  type WithFieldValue,
  type WriteResult,
} from 'firebase-admin/firestore'

import { type MetaOutputOptions, type ZodTypeDocumentData } from '../base'

import {
  multiDocumentCollectionFactory,
  type MultiDocumentCollectionFactoryOptions,
} from './multi-document-collection-factory'
import {
  type CollectionSchema,
  type SchemaDocumentInput,
  type SchemaDocumentOutput,
  type SchemaReadCollectionGroup,
  type SchemaReadCollectionReference,
  type SchemaReadDocumentReference,
  type SchemaWriteCollectionReference,
  type SchemaWriteDocumentReference,
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

  create(this: void, data: WithFieldValue<SchemaDocumentInput<TCollectionSchema>>): Promise<WriteResult>
  set(this: void, data: WithFieldValue<SchemaDocumentInput<TCollectionSchema>>): Promise<WriteResult>
  set(
    this: void,
    data: PartialWithFieldValue<SchemaDocumentInput<TCollectionSchema>>,
    options: SetOptions,
  ): Promise<WriteResult>
  update(
    this: void,
    data: UpdateData<SchemaDocumentInput<TCollectionSchema>>,
    precondition?: Precondition,
  ): Promise<WriteResult>
  delete(this: void, precondition?: Precondition): Promise<WriteResult>
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
    create,
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
      doc: <Options extends MetaOutputOptions>(options?: Options) => read.doc(singleDocumentKey, options),
    },
    find: <Options extends MetaOutputOptions>(options?: Options) => findById(singleDocumentKey, options),
    findOrThrow: <Options extends MetaOutputOptions>(options?: Options) => findByIdOrThrow(singleDocumentKey, options),
    write: {
      ...write,
      doc: () => write.doc(singleDocumentKey),
    },
    create: (data) => create(singleDocumentKey, data),
    set: setOverload,
    update: (data: UpdateData<SchemaDocumentInput<TCollectionSchema>>, precondition?: Precondition) =>
      update(singleDocumentKey, data, precondition),
    delete: (precondition?: Precondition) => deleteDocument(singleDocumentKey, precondition),
  }
}
