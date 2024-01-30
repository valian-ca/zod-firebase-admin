import { type CollectionPath, firestoreCollectionPath } from './firestore-collection-path'

export const firestoreDocumentPath = (collectionPath: CollectionPath | string, documentId: string): string =>
  `${firestoreCollectionPath(collectionPath)}/${documentId}`
