import { type CollectionPath, firestoreCollection, firestoreDocument } from '../base'
import { firestoreOmitMetaDataConverter } from '../base/firestore-omit-meta-data-converter'

import {
  type CollectionSchema,
  type FirestoreFactoryOptions,
  type SchemaDocumentInput,
  type SchemaFirestoreWriteFactory,
} from './types'

export interface SchemaFirestoreWriteFactoryBuilder<TCollectionSchema extends CollectionSchema> {
  build(this: void, parentPath?: [string, string]): SchemaFirestoreWriteFactory<TCollectionSchema>
}

export const schemaFirestoreWriteFactoryBuilder = <TCollectionSchema extends CollectionSchema>(
  collectionName: string,
  _schema: TCollectionSchema,
  { getFirestore }: FirestoreFactoryOptions = {},
): SchemaFirestoreWriteFactoryBuilder<TCollectionSchema> => {
  const converter = firestoreOmitMetaDataConverter<SchemaDocumentInput<TCollectionSchema>>()
  const build = (parentPath?: [string, string]): SchemaFirestoreWriteFactory<TCollectionSchema> => {
    const collectionPath: CollectionPath = parentPath ? [...parentPath, collectionName] : [collectionName]
    return {
      collection: () => firestoreCollection(collectionPath, getFirestore?.()).withConverter(converter),
      doc: (id: string) => firestoreDocument(collectionPath, id, getFirestore?.()).withConverter(converter),
    }
  }
  return {
    build,
  }
}
