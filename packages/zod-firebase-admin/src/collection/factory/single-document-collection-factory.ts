import {
  type PartialWithFieldValue,
  type Precondition,
  type SetOptions,
  type UpdateData,
  type WithFieldValue,
  type WriteResult,
} from 'firebase-admin/firestore'
import { type Except } from 'type-fest'

import { type MetaOutputOptions } from '../../base'
import {
  type CollectionSchema,
  type SchemaDocumentInput,
  type SchemaDocumentOutput,
  type SchemaFirestoreFactory,
  type SchemaFirestoreReadFactory,
  type SchemaFirestoreWriteFactory,
  type SchemaReadDocumentReference,
  type SchemaWriteDocumentReference,
} from '../../schema'

import { multiDocumentCollectionFactory, type SchemaFallbackValue } from './multi-document-collection-factory'

export interface SingleDocumentCollectionFactory<TCollectionSchema extends CollectionSchema> {
  readonly singleDocumentKey: string

  readonly read: Except<SchemaFirestoreReadFactory<TCollectionSchema>, 'doc'> & {
    doc<Options extends MetaOutputOptions>(
      this: void,
      options?: Options,
    ): SchemaReadDocumentReference<TCollectionSchema, Options>
  }

  readonly write: Except<SchemaFirestoreWriteFactory<TCollectionSchema>, 'doc'> & {
    doc(this: void): SchemaWriteDocumentReference<TCollectionSchema>
  }

  find<Options extends MetaOutputOptions>(
    this: void,
    options?: Options,
  ): Promise<SchemaDocumentOutput<TCollectionSchema, Options> | undefined>

  findOrThrow<Options extends MetaOutputOptions>(
    this: void,
    options?: Options,
  ): Promise<SchemaDocumentOutput<TCollectionSchema, Options>>

  findWithFallback(
    this: void,
    fallback: SchemaFallbackValue<TCollectionSchema>,
  ): Promise<SchemaDocumentOutput<TCollectionSchema>>

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

export const singleDocumentCollectionFactory = <TCollectionSchema extends CollectionSchema>(
  firestoreFactory: SchemaFirestoreFactory<TCollectionSchema>,
  schema: TCollectionSchema,
  singleDocumentKey: string,
): SingleDocumentCollectionFactory<TCollectionSchema> => {
  const {
    read,
    write,
    findById,
    findByIdOrThrow,
    findByIdWithFallback,
    create,
    set,
    update,
    delete: deleteDocument,
    ...rest
  } = multiDocumentCollectionFactory(firestoreFactory, schema)

  return {
    ...rest,
    singleDocumentKey,
    read: {
      ...read,
      doc: <Options extends MetaOutputOptions>(options?: Options) => read.doc<Options>(singleDocumentKey, options),
    },
    find: <Options extends MetaOutputOptions>(options?: Options) => findById(singleDocumentKey, options),
    findOrThrow: <Options extends MetaOutputOptions>(options?: Options) => findByIdOrThrow(singleDocumentKey, options),
    findWithFallback: (fallback: SchemaFallbackValue<TCollectionSchema>) =>
      findByIdWithFallback(singleDocumentKey, fallback),
    write: {
      ...write,
      doc: () => write.doc(singleDocumentKey),
    },
    create: (data) => create(singleDocumentKey, data),
    set: (data: PartialWithFieldValue<SchemaDocumentInput<TCollectionSchema>>, setOptions?: SetOptions) =>
      setOptions
        ? set(singleDocumentKey, data, setOptions)
        : set(singleDocumentKey, data as WithFieldValue<SchemaDocumentInput<TCollectionSchema>>),
    update: (data: UpdateData<SchemaDocumentInput<TCollectionSchema>>, precondition?: Precondition) =>
      update(singleDocumentKey, data, precondition),
    delete: (precondition?: Precondition) => deleteDocument(singleDocumentKey, precondition),
  }
}
