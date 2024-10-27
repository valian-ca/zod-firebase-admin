import {
  addDoc,
  deleteDoc,
  type DocumentReference,
  getDoc,
  type PartialWithFieldValue,
  setDoc,
  type SetOptions,
  type UpdateData,
  updateDoc,
  type WithFieldValue,
} from '@firebase/firestore'

import {
  type CollectionPath,
  firestoreCollection,
  firestoreCollectionPath,
  firestoreDocument,
  firestoreZodCollection,
  firestoreZodCollectionGroup,
  type FirestoreZodDataConverterOptions,
  firestoreZodDocument,
  type MetaOutputOptions,
  type ZodTypeDocumentData,
} from '../base'
import { firestoreOmitMetaDataConverter } from '../base/firestore-omit-meta-data-converter'
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
  set(this: void, id: string, data: WithFieldValue<SchemaDocumentInput<TCollectionSchema>>): Promise<void>
  set(
    this: void,
    id: string,
    data: PartialWithFieldValue<SchemaDocumentInput<TCollectionSchema>>,
    options: SetOptions,
  ): Promise<void>
  update(this: void, id: string, data: UpdateData<SchemaDocumentInput<TCollectionSchema>>): Promise<void>
  delete(this: void, id: string): Promise<void>
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

  const schemaReadCollection = <Options extends MetaOutputOptions>(options?: Options) =>
    firestoreZodCollection<
      Z,
      Options,
      SchemaDocumentOutput<TCollectionSchema, Options>,
      SchemaDocumentInput<TCollectionSchema>
    >(collectionPath, zod, options, buildZodOptions())

  const schemaReadDoc = <Options extends MetaOutputOptions>(id: string, options?: Options) =>
    firestoreZodDocument<
      Z,
      Options,
      SchemaDocumentOutput<TCollectionSchema, Options>,
      SchemaDocumentInput<TCollectionSchema>
    >(collectionPath, id, zod, options, buildZodOptions())

  const schemaReadCollectionGroup = <Options extends MetaOutputOptions>(options?: Options) =>
    firestoreZodCollectionGroup<
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
      ? setDoc(schemaWriteDoc(id), data, setOptions)
      : setDoc(schemaWriteDoc(id), data as WithFieldValue<SchemaDocumentInput<TCollectionSchema>>)

  return {
    ...queryHelper,
    read: {
      collection: schemaReadCollection,
      doc: schemaReadDoc,
      collectionGroup: schemaReadCollectionGroup,
    },
    findById: async <Options extends MetaOutputOptions>(id: string, options?: Options) => {
      const doc = await getDoc(schemaReadDoc(id, options))
      return doc.data()
    },
    findByIdOrThrow: async <Options extends MetaOutputOptions>(id: string, options?: Options) => {
      const doc = await getDoc(schemaReadDoc(id, options))
      if (!doc.exists()) {
        throw new Error(`Document ${id} not found in collection ${firestoreCollectionPath(collectionPath)}`)
      }
      return doc.data()
    },
    write: {
      collection: schemaWriteCollection,
      doc: schemaWriteDoc,
    },
    add: async (data) => addDoc(schemaWriteCollection(), data),
    set,
    update: (id, data) => updateDoc(schemaWriteDoc(id), data),
    delete: (id) => deleteDoc(schemaWriteDoc(id)),
  }
}
