import {
  type DocumentReference,
  type PartialWithFieldValue,
  type Precondition,
  type SetOptions,
  type UpdateData,
  type WithFieldValue,
  type WriteResult,
} from 'firebase-admin/firestore'

import { type MetaOutputOptions } from '../../base'
import {
  type CollectionSchema,
  type SchemaDocumentInput,
  type SchemaDocumentOutput,
  type SchemaFirestoreFactory,
} from '../../schema'

export interface MultiDocumentCollectionFactory<TCollectionSchema extends CollectionSchema>
  extends SchemaFirestoreFactory<TCollectionSchema> {
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
}

export const multiDocumentCollectionFactory = <TCollectionSchema extends CollectionSchema>(
  firestoreFactory: SchemaFirestoreFactory<TCollectionSchema>,
): MultiDocumentCollectionFactory<TCollectionSchema> => ({
  ...firestoreFactory,
  findById: async <Options extends MetaOutputOptions>(id: string, options?: Options) => {
    const doc = await firestoreFactory.read.doc(id, options).get()
    return doc.data()
  },
  findByIdOrThrow: async <Options extends MetaOutputOptions>(id: string, options?: Options) => {
    const reference = firestoreFactory.read.doc(id, options)
    const doc = await reference.get()
    if (!doc.exists) {
      throw new Error(`Document ${reference.path} not found`)
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return doc.data()!
  },
  add: async (data) => firestoreFactory.write.collection().add(data),
  create: async (id, data) => firestoreFactory.write.doc(id).create(data),
  set: async (
    id: string,
    data: PartialWithFieldValue<SchemaDocumentInput<TCollectionSchema>>,
    setOptions?: SetOptions,
  ) =>
    setOptions
      ? firestoreFactory.write.doc(id).set(data, setOptions)
      : firestoreFactory.write.doc(id).set(data as WithFieldValue<SchemaDocumentInput<TCollectionSchema>>),
  update: (id: string, data: UpdateData<SchemaDocumentInput<TCollectionSchema>>, precondition?: Precondition) =>
    precondition
      ? firestoreFactory.write.doc(id).update(data, precondition)
      : firestoreFactory.write.doc(id).update(data),
  delete: (id: string, precondition?: Precondition) => firestoreFactory.write.doc(id).delete(precondition),
})
