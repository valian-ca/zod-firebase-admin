import type {
  CollectionGroup,
  CollectionReference,
  DocumentReference,
  PartialWithFieldValue,
  Precondition,
  SetOptions,
  UpdateData,
  WithFieldValue,
  WriteResult,
} from 'firebase-admin/firestore'
import type { z } from 'zod'

import {
  type CollectionPath,
  type DocumentOutput,
  firestoreCollection,
  firestoreCollectionPath,
  firestoreDocument,
  firestoreZodCollection,
  firestoreZodCollectionGroup,
  firestoreZodDocument,
  type ZodTypeDocumentData,
} from '../base'
import { firestoreZodCollectionQuery, type QueryHelper, queryHelper } from '../query'

import type { FirestoreZodFactoryOptions } from './firestore-zod-factory-options'

export type MultiDocumentCollectionFactory<Z extends ZodTypeDocumentData> = {
  readonly read: {
    collection(this: void): CollectionReference<DocumentOutput<Z>>
    doc(this: void, id: string): DocumentReference<DocumentOutput<Z>>
    collectionGroup(this: void): CollectionGroup<DocumentOutput<Z>>
  }

  findById(this: void, id: string): Promise<DocumentOutput<Z> | undefined>
  findByIdOrThrow(this: void, id: string): Promise<DocumentOutput<Z>>

  readonly write: {
    collection(this: void): CollectionReference<z.input<Z>>
    doc(this: void, id: string): DocumentReference<z.input<Z>>
  }

  add(this: void, data: WithFieldValue<z.input<Z>>): Promise<DocumentReference<z.input<Z>>>
  create(this: void, id: string, data: WithFieldValue<z.input<Z>>): Promise<z.input<Z>>
  set(this: void, id: string, data: PartialWithFieldValue<z.input<Z>>, options: SetOptions): Promise<WriteResult>
  update(this: void, id: string, data: UpdateData<z.input<Z>>, precondition?: Precondition): Promise<WriteResult>
  delete(this: void, id: string, precondition?: Precondition): Promise<WriteResult>
} & QueryHelper<DocumentOutput<Z>>

export const multiDocumentCollectionFactory = <TCollectionName extends string, Z extends ZodTypeDocumentData>(
  collectionName: TCollectionName,
  zod: Z,
  { getFirestore, ...zodOptions }: FirestoreZodFactoryOptions,
  parentPath?: [string, string],
): MultiDocumentCollectionFactory<Z> => {
  const collectionPath: CollectionPath = parentPath ? [...parentPath, collectionName] : [collectionName]
  const buildOptions = () => ({ ...zodOptions, firestore: getFirestore() })
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
      collection: () => firestoreCollection(collectionPath, getFirestore()),
      doc: (id) => firestoreDocument(collectionPath, id, getFirestore()),
    },
    add: async (data) => firestoreCollection(collectionPath, getFirestore()).add(data),
    create: async (id, data) => firestoreDocument(collectionPath, id, getFirestore()).create(data),
    set: (id, data, setOptions) => firestoreDocument(collectionPath, id, getFirestore()).set(data, setOptions),
    update: (id, data, precondition) =>
      firestoreDocument(collectionPath, id, getFirestore()).update(data, precondition),
    delete: (id, precondition) => firestoreDocument(collectionPath, id, getFirestore()).delete(precondition),
    ...queryHelper((query) => firestoreZodCollectionQuery(collectionPath, zod, query, buildOptions())),
  }
}
