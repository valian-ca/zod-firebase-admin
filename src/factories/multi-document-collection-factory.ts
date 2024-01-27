import type {
  CollectionGroup,
  CollectionReference,
  DocumentData,
  DocumentReference,
  PartialWithFieldValue,
  Precondition,
  SetOptions,
  UpdateData,
  WithFieldValue,
  WriteResult,
} from 'firebase-admin/firestore'

import {
  type CollectionPath,
  type DocumentInput,
  type DocumentOutput,
  firestoreCollection,
  firestoreCollectionPath,
  firestoreDocument,
  firestoreZodCollection,
  firestoreZodCollectionGroup,
  type FirestoreZodDataConverterOptions,
  firestoreZodDocument,
  type ZodTypeDocumentData,
} from '../base'
import { firestoreZodCollectionQuery, type QueryHelper, queryHelper } from '../query'

import type { FirestoreZodFactoryOptions } from './firestore-zod-factory-options'

export type MultiDocumentCollectionFactory<
  Z extends ZodTypeDocumentData,
  TInput extends DocumentData = DocumentInput<Z>,
  TOutput extends DocumentData = DocumentOutput<Z>,
> = {
  readonly read: {
    collection(this: void): CollectionReference<TOutput>
    doc(this: void, id: string): DocumentReference<TOutput>
    collectionGroup(this: void): CollectionGroup<TOutput>
  }

  findById(this: void, id: string): Promise<TOutput | undefined>
  findByIdOrThrow(this: void, id: string): Promise<TOutput>

  readonly write: {
    collection(this: void): CollectionReference<TInput>
    doc(this: void, id: string): DocumentReference<TInput>
  }

  add(this: void, data: WithFieldValue<TInput>): Promise<DocumentReference<TInput>>
  create(this: void, id: string, data: WithFieldValue<TInput>): Promise<WriteResult>
  set(this: void, id: string, data: PartialWithFieldValue<TInput>, options: SetOptions): Promise<WriteResult>
  update(this: void, id: string, data: UpdateData<TInput>, precondition?: Precondition): Promise<WriteResult>
  delete(this: void, id: string, precondition?: Precondition): Promise<WriteResult>
} & QueryHelper<TOutput>

export type MultiDocumentCollectionFactoryOptions = FirestoreZodFactoryOptions & FirestoreZodDataConverterOptions

export const multiDocumentCollectionFactory = <TCollectionName extends string, Z extends ZodTypeDocumentData>(
  collectionName: TCollectionName,
  zod: Z,
  { getFirestore, ...zodOptions }: MultiDocumentCollectionFactoryOptions = {},
  parentPath?: [string, string],
): MultiDocumentCollectionFactory<Z> => {
  const collectionPath: CollectionPath = parentPath ? [...parentPath, collectionName] : [collectionName]
  const buildOptions = () => (getFirestore ? { ...zodOptions, firestore: getFirestore() } : zodOptions)
  return {
    read: {
      collection: () => firestoreZodCollection(collectionPath, zod, buildOptions()),
      doc: (id) => firestoreZodDocument(collectionPath, id, zod, buildOptions()),
      collectionGroup: () => firestoreZodCollectionGroup(collectionName, zod, buildOptions()),
    },
    findById: async (id) => {
      const doc = await firestoreZodDocument(collectionPath, id, zod, buildOptions()).get()
      return doc.data()
    },
    findByIdOrThrow: async (id) => {
      const doc = await firestoreZodDocument(collectionPath, id, zod, buildOptions()).get()
      if (!doc.exists) {
        throw new Error(`Document ${id} not found in collection ${firestoreCollectionPath(collectionPath)}`)
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return doc.data()!
    },
    write: {
      collection: () => firestoreCollection(collectionPath, getFirestore?.()),
      doc: (id) => firestoreDocument(collectionPath, id, getFirestore?.()),
    },
    add: async (data) => firestoreCollection(collectionPath, getFirestore?.()).add(data),
    create: async (id, data) => firestoreDocument(collectionPath, id, getFirestore?.()).create(data),
    set: (id, data, setOptions) => firestoreDocument(collectionPath, id, getFirestore?.()).set(data, setOptions),
    update: (id, data, precondition) =>
      precondition
        ? firestoreDocument(collectionPath, id, getFirestore?.()).update(data, precondition)
        : firestoreDocument(collectionPath, id, getFirestore?.()).update(data),
    delete: (id, precondition) => firestoreDocument(collectionPath, id, getFirestore?.()).delete(precondition),
    ...queryHelper((query) => firestoreZodCollectionQuery(collectionPath, zod, query, buildOptions())),
  }
}
