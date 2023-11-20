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

import type { DocumentInput, DocumentOutput, ZodTypeDocumentData } from '../base'

import type { FirestoreZodFactoryOptions } from './firestore-zod-factory-options'
import { multiDocumentCollectionFactory } from './multi-document-collection-factory'

export type SingleDocumentCollectionFactory<
  Z extends ZodTypeDocumentData,
  TInput extends DocumentData = DocumentInput<Z>,
  TOutput extends DocumentData = DocumentOutput<Z>,
> = {
  readonly singleDocumentKey: string

  readonly read: {
    collection(this: void): CollectionReference<TOutput>
    doc(this: void): DocumentReference<TOutput>
    collectionGroup(this: void): CollectionGroup<TOutput>
  }

  find(this: void): Promise<TOutput | undefined>
  findOrThrow(this: void): Promise<TOutput>

  readonly write: {
    collection(this: void): CollectionReference<TInput>
    doc(this: void): DocumentReference<TInput>
  }

  create(this: void, data: WithFieldValue<TInput>): Promise<WriteResult>
  set(this: void, data: PartialWithFieldValue<TInput>, options: SetOptions): Promise<WriteResult>
  update(this: void, data: UpdateData<TInput>, precondition?: Precondition): Promise<WriteResult>
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
