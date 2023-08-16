import type { CollectionGroup, CollectionReference, DocumentReference } from 'firebase-admin/firestore'
import type { z } from 'zod'

import type { DocumentOutput, ZodTypeDocumentData } from '../base'

import type { FactoryOptions } from './factory-options'
import { multiDocumentCollectionFactory } from './multi-document-collection-factory'

export type SingleDocumentCollectionFactory<Z extends ZodTypeDocumentData> = {
  readonly singleDocumentKey: string

  readonly read: {
    collection(this: void): CollectionReference<DocumentOutput<Z>>
    doc(this: void): DocumentReference<DocumentOutput<Z>>
    collectionGroup(this: void): CollectionGroup<DocumentOutput<Z>>
  }

  readonly write: {
    collection(this: void): CollectionReference<z.input<Z>>
    doc(this: void): DocumentReference<z.input<Z>>
  }

  find(this: void): Promise<DocumentOutput<Z> | undefined>
  findOrThrow(this: void): Promise<DocumentOutput<Z>>
}

export const singleDocumentCollectionFactory = <TCollectionName extends string, Z extends ZodTypeDocumentData>(
  collectionName: TCollectionName,
  zod: Z,
  singleDocumentKey: string,
  options: FactoryOptions,
  parentPath?: [string, string],
): SingleDocumentCollectionFactory<Z> => {
  const { read, write, findById, findByIdOrThrow } = multiDocumentCollectionFactory(
    collectionName,
    zod,
    options,
    parentPath,
  )
  return {
    singleDocumentKey,
    read: {
      ...read,
      doc: () => read.doc(singleDocumentKey),
    },
    write: {
      ...write,
      doc: () => write.doc(singleDocumentKey),
    },
    find: () => findById(singleDocumentKey),
    findOrThrow: () => findByIdOrThrow(singleDocumentKey),
  }
}
