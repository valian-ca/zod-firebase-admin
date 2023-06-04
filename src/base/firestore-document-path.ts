import { type CollectionPath, firestoreCollectionPath } from './firestore-collection-path'

export const firestoreDocumentPath = (collectionPath: CollectionPath, documentId: string): string =>
  `${firestoreCollectionPath(collectionPath)}/${documentId}`
