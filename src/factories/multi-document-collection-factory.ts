import type { CollectionGroup, CollectionReference, DocumentReference } from 'firebase-admin/firestore'
import type { z } from 'zod'
import type { FactoryOptions } from './factory-options'
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

export type MultiDocumentCollectionFactory<TCollectionName extends string, Z extends ZodTypeDocumentData> = {
  readonly name: TCollectionName
  readonly collectionPath: CollectionPath

  readonly read: {
    collection(): CollectionReference<DocumentOutput<Z>>
    doc(id: string): DocumentReference<DocumentOutput<Z>>
    collectionGroup(): CollectionGroup<DocumentOutput<Z>>
  }

  readonly write: {
    collection(): CollectionReference<z.input<Z>>
    doc(id: string): DocumentReference<z.input<Z>>
  }

  findById(this: void, id: string): Promise<DocumentOutput<Z> | undefined>
  findByIdOrThrow(this: void, id: string): Promise<DocumentOutput<Z>>
  //
  // query(): Promise<QuerySnapshot<DocumentOutput<Z>>>
  //
  // findMany(): Promise<Array<DocumentOutput<Z>>>
  // findUnique(): Promise<DocumentOutput<Z> | null>
  // findUniqueOrThrow(): Promise<DocumentOutput<Z>>
  // findFirst(): Promise<DocumentOutput<Z> | null>
  // findFirstOrThrow(): Promise<DocumentOutput<Z>>
}

export const multiDocumentCollectionFactory = <TCollectionName extends string, Z extends ZodTypeDocumentData>(
  name: TCollectionName,
  zod: Z,
  { getFirestore }: FactoryOptions,
  parentPath?: [string, string]
): MultiDocumentCollectionFactory<TCollectionName, Z> => {
  const collectionPath: CollectionPath = parentPath ? [...parentPath, name] : [name]
  return {
    name,
    collectionPath,
    read: {
      collection: () => firestoreZodCollection(collectionPath, zod, getFirestore()),
      doc: (id: string) => firestoreZodDocument(collectionPath, id, zod, getFirestore()),
      collectionGroup: () => firestoreZodCollectionGroup(name, zod, getFirestore()),
    },
    write: {
      collection: () => firestoreCollection(collectionPath, getFirestore()),
      doc: (id: string) => firestoreDocument(collectionPath, id, getFirestore()),
    },
    findById: async (id: string) => {
      const doc = await firestoreZodDocument(collectionPath, id, zod, getFirestore()).get()
      return doc.data()
    },
    findByIdOrThrow: async (id: string) => {
      const doc = await firestoreZodDocument(collectionPath, id, zod, getFirestore()).get()
      if (!doc.exists) {
        throw new Error(`Document ${id} not found in collection ${firestoreCollectionPath(collectionPath)}`)
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return doc.data()!
    },
  }
}
