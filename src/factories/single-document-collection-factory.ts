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
import type { input, z } from 'zod'

import type { DocumentOutput, ZodTypeDocumentData } from '../base'

import type { FirestoreZodFactoryOptions } from './firestore-zod-factory-options'
import { multiDocumentCollectionFactory } from './multi-document-collection-factory'

export type SingleDocumentCollectionFactory<Z extends ZodTypeDocumentData> = {
  readonly singleDocumentKey: string

  readonly read: {
    collection(this: void): CollectionReference<DocumentOutput<Z>>
    doc(this: void): DocumentReference<DocumentOutput<Z>>
    collectionGroup(this: void): CollectionGroup<DocumentOutput<Z>>
  }

  find(this: void): Promise<DocumentOutput<Z> | undefined>
  findOrThrow(this: void): Promise<DocumentOutput<Z>>

  readonly write: {
    collection(this: void): CollectionReference<z.input<Z>>
    doc(this: void): DocumentReference<z.input<Z>>
  }

  create(this: void, data: WithFieldValue<z.input<Z>>): Promise<WriteResult>
  set(this: void, data: PartialWithFieldValue<z.input<Z>>, options: SetOptions): Promise<WriteResult>
  update(this: void, data: UpdateData<z.input<Z>>, precondition?: Precondition): Promise<WriteResult>
  delete(this: void, precondition?: Precondition): Promise<WriteResult>
}

export const singleDocumentCollectionFactory = <TCollectionName extends string, Z extends ZodTypeDocumentData>(
  collectionName: TCollectionName,
  zod: Z,
  singleDocumentKey: string,
  factoryOptions: FirestoreZodFactoryOptions,
  parentPath?: [string, string],
): SingleDocumentCollectionFactory<Z> => {
  const { read, write, findById, findByIdOrThrow, set, update } = multiDocumentCollectionFactory(
    collectionName,
    zod,
    factoryOptions,
    parentPath,
  )
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
    create: (data) => write.doc(singleDocumentKey).create(data),
    set: (data, options) => set(singleDocumentKey, data, options),
    update: (data, precondition) => update(singleDocumentKey, data, precondition),
    delete: (precondition) => write.doc(singleDocumentKey).delete(precondition),
  }
}
