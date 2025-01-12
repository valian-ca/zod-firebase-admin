import {
  type DocumentReference,
  type PartialWithFieldValue,
  type Precondition,
  type SetOptions,
  type UpdateData,
  type WithFieldValue,
  type WriteResult,
} from 'firebase-admin/firestore'

import {
  type CollectionPath,
  firestoreCollection,
  firestoreCollectionGroupWithConverter,
  firestoreCollectionPath,
  firestoreCollectionWithConverter,
  firestoreDocument,
  firestoreDocumentWithConverter,
  firestoreOmitMetaDataConverter,
  firestoreZodCollection,
  firestoreZodCollectionGroup,
  firestoreZodDataConverter,
  type FirestoreZodDataConverterOptions,
  firestoreZodDocument,
  type MetaOutputOptions,
  type ZodTypeDocumentData,
} from '../base'
import { applyQuerySpecification, type QuerySpecification } from '../query'

import { type FirestoreZodFactoryOptions } from './firestore-zod-factory-options'
import { type SchemaQueryHelper, schemaQueryHelper } from './schema-query-helper'
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

export type MultiDocumentCollectionFactory<TCollectionSchema extends CollectionSchema> = {
  readonly read: {
    collection<Options extends MetaOutputOptions>(
      this: void,
      options?: Options,
    ): SchemaReadCollectionReference<TCollectionSchema, Options>
    doc<Options extends MetaOutputOptions>(
      this: void,
      id: string,
      options?: Options,
    ): SchemaReadDocumentReference<TCollectionSchema, Options>
    collectionGroup<Options extends MetaOutputOptions>(
      this: void,
      options?: Options,
    ): SchemaReadCollectionGroup<TCollectionSchema, Options>
  }

  findById<Options extends MetaOutputOptions>(
    this: void,
    id: string,
    options?: Options,
  ): Promise<SchemaDocumentOutput<TCollectionSchema, Options> | undefined>
  findByIdOrThrow<Options extends MetaOutputOptions>(
    this: void,
    id: string,
    options?: Options,
  ): Promise<SchemaDocumentOutput<TCollectionSchema, Options>>

  readonly write: {
    collection(this: void): SchemaWriteCollectionReference<TCollectionSchema>
    doc(this: void, id: string): SchemaWriteDocumentReference<TCollectionSchema>
  }

  add(
    this: void,
    data: WithFieldValue<SchemaDocumentInput<TCollectionSchema>>,
  ): Promise<DocumentReference<SchemaDocumentInput<TCollectionSchema>>>
  create(this: void, id: string, data: WithFieldValue<SchemaDocumentInput<TCollectionSchema>>): Promise<WriteResult>
  set(this: void, id: string, data: WithFieldValue<SchemaDocumentInput<TCollectionSchema>>): Promise<WriteResult>
  set(
    this: void,
    id: string,
    data: PartialWithFieldValue<SchemaDocumentInput<TCollectionSchema>>,
    options: SetOptions,
  ): Promise<WriteResult>
  update(
    this: void,
    id: string,
    data: UpdateData<SchemaDocumentInput<TCollectionSchema>>,
    precondition?: Precondition,
  ): Promise<WriteResult>
  delete(this: void, id: string, precondition?: Precondition): Promise<WriteResult>
} & SchemaQueryHelper<TCollectionSchema>

export type MultiDocumentCollectionFactoryOptions = FirestoreZodFactoryOptions & FirestoreZodDataConverterOptions

export const multiDocumentCollectionFactory = <
  Z extends ZodTypeDocumentData = ZodTypeDocumentData,
  TCollectionSchema extends CollectionSchema<Z> = CollectionSchema<Z>,
>(
  collectionName: string,
  zod: Z,
  parentPath?: [string, string],
  { getFirestore, ...zodDataConverterOptions }: MultiDocumentCollectionFactoryOptions = {},
): MultiDocumentCollectionFactory<TCollectionSchema> => {
  const collectionPath: CollectionPath = parentPath ? [...parentPath, collectionName] : [collectionName]
  const buildZodOptions = () =>
    getFirestore
      ? {
          ...zodDataConverterOptions,
          firestore: getFirestore(),
        }
      : zodDataConverterOptions

  const defaultConverter = firestoreZodDataConverter<
    Z,
    MetaOutputOptions,
    SchemaDocumentOutput<TCollectionSchema>,
    SchemaDocumentInput<TCollectionSchema>
  >(zod, undefined, zodDataConverterOptions)
  const defaultReadCollection = () =>
    firestoreCollectionWithConverter<SchemaDocumentOutput<TCollectionSchema>, SchemaDocumentInput<TCollectionSchema>>(
      collectionPath,
      defaultConverter,
      getFirestore?.(),
    )
  const defaultReadDocument = (id: string) =>
    firestoreDocumentWithConverter<SchemaDocumentOutput<TCollectionSchema>, SchemaDocumentInput<TCollectionSchema>>(
      collectionPath,
      id,
      defaultConverter,
      getFirestore?.(),
    )
  const defaultReadCollectionGroup = () =>
    firestoreCollectionGroupWithConverter<
      SchemaDocumentOutput<TCollectionSchema>,
      SchemaDocumentInput<TCollectionSchema>
    >(collectionName, defaultConverter, getFirestore?.())

  const schemaReadCollection = <Options extends MetaOutputOptions>(options?: Options) =>
    !options
      ? defaultReadCollection()
      : firestoreZodCollection<
          Z,
          Options,
          SchemaDocumentOutput<TCollectionSchema, Options>,
          SchemaDocumentInput<TCollectionSchema>
        >(collectionPath, zod, options, buildZodOptions())

  const schemaReadDoc = <Options extends MetaOutputOptions>(id: string, options?: Options) =>
    !options
      ? defaultReadDocument(id)
      : firestoreZodDocument<
          Z,
          Options,
          SchemaDocumentOutput<TCollectionSchema, Options>,
          SchemaDocumentInput<TCollectionSchema>
        >(collectionPath, id, zod, options, buildZodOptions())

  const schemaReadCollectionGroup = <Options extends MetaOutputOptions>(options?: Options) =>
    !options
      ? defaultReadCollectionGroup()
      : firestoreZodCollectionGroup<
          Z,
          Options,
          SchemaDocumentOutput<TCollectionSchema, Options>,
          SchemaDocumentInput<TCollectionSchema>
        >(collectionName, zod, options, buildZodOptions())

  const schemaWriteCollection = () =>
    firestoreCollection<SchemaDocumentInput<TCollectionSchema>, SchemaDocumentInput<TCollectionSchema>>(
      collectionPath,
      getFirestore?.(),
    ).withConverter(firestoreOmitMetaDataConverter<SchemaDocumentInput<TCollectionSchema>>())

  const schemaWriteDoc = (id: string): SchemaWriteDocumentReference<TCollectionSchema> =>
    firestoreDocument<SchemaDocumentInput<TCollectionSchema>, SchemaDocumentInput<TCollectionSchema>>(
      collectionPath,
      id,
      getFirestore?.(),
    ).withConverter(firestoreOmitMetaDataConverter<SchemaDocumentInput<TCollectionSchema>>())

  const queryFactory = <Options extends MetaOutputOptions>(query: QuerySpecification, options?: Options) =>
    applyQuerySpecification(schemaReadCollection(options), query)
  const queryHelper = schemaQueryHelper(queryFactory)

  const set = (
    id: string,
    data: PartialWithFieldValue<SchemaDocumentInput<TCollectionSchema>>,
    setOptions?: SetOptions,
  ) =>
    setOptions
      ? schemaWriteDoc(id).set(data, setOptions)
      : schemaWriteDoc(id).set(data as WithFieldValue<SchemaDocumentInput<TCollectionSchema>>)

  return {
    ...queryHelper,
    read: {
      collection: schemaReadCollection,
      doc: schemaReadDoc,
      collectionGroup: schemaReadCollectionGroup,
    },
    findById: async <Options extends MetaOutputOptions>(id: string, options?: Options) => {
      const doc = await schemaReadDoc(id, options).get()
      return doc.data()
    },
    findByIdOrThrow: async <Options extends MetaOutputOptions>(id: string, options?: Options) => {
      const doc = await schemaReadDoc(id, options).get()
      if (!doc.exists) {
        throw new Error(`Document ${id} not found in collection ${firestoreCollectionPath(collectionPath)}`)
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return doc.data()!
    },
    write: {
      collection: schemaWriteCollection,
      doc: schemaWriteDoc,
    },
    add: async (data) => schemaWriteCollection().add(data),
    create: async (id, data) => schemaWriteDoc(id).create(data),
    set,
    update: (id: string, data: UpdateData<SchemaDocumentInput<TCollectionSchema>>, precondition?: Precondition) =>
      precondition ? schemaWriteDoc(id).update(data, precondition) : schemaWriteDoc(id).update(data),
    delete: (id: string, precondition?: Precondition) => schemaWriteDoc(id).delete(precondition),
  }
}
