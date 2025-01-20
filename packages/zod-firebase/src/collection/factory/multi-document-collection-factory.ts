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

  set(this: void, id: string, data: WithFieldValue<SchemaDocumentInput<TCollectionSchema>>): Promise<void>

  set(
    this: void,
    id: string,
    data: PartialWithFieldValue<SchemaDocumentInput<TCollectionSchema>>,
    options: SetOptions,
  ): Promise<void>

  update(this: void, id: string, data: UpdateData<SchemaDocumentInput<TCollectionSchema>>): Promise<void>

  delete(this: void, id: string): Promise<void>
}

export const multiDocumentCollectionFactory = <TCollectionSchema extends CollectionSchema>(
  firestoreFactory: SchemaFirestoreFactory<TCollectionSchema>,
): MultiDocumentCollectionFactory<TCollectionSchema> => ({
  ...firestoreFactory,
  findById: async <Options extends MetaOutputOptions>(id: string, options?: Options) => {
    const doc = await getDoc(firestoreFactory.read.doc(id, options))
    return doc.data()
  },
  findByIdOrThrow: async <Options extends MetaOutputOptions>(id: string, options?: Options) => {
    const reference = firestoreFactory.read.doc(id, options)
    const doc = await getDoc(reference)
    if (!doc.exists()) {
      throw new Error(`Document ${reference.path} not found`)
    }
    return doc.data()
  },
  add: async (data) => addDoc(firestoreFactory.write.collection(), data),
  set: async (
    id: string,
    data: PartialWithFieldValue<SchemaDocumentInput<TCollectionSchema>>,
    setOptions?: SetOptions,
  ) =>
    setOptions
      ? setDoc(firestoreFactory.write.doc(id), data, setOptions)
      : setDoc(firestoreFactory.write.doc(id), data as WithFieldValue<SchemaDocumentInput<TCollectionSchema>>),
  update: (id, data) => updateDoc(firestoreFactory.write.doc(id), data),
  delete: (id) => deleteDoc(firestoreFactory.write.doc(id)),
})
