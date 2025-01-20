import { doc, type DocumentData, type DocumentReference, getFirestore } from '@firebase/firestore'

import { type CollectionPath } from './firestore-collection-path'
import { firestoreDocumentPath } from './firestore-document-path'

export const firestoreDocument = <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  collectionPath: CollectionPath | string,
  documentId: string,
  firestore = getFirestore(),
) => doc(firestore, firestoreDocumentPath(collectionPath, documentId)) as DocumentReference<AppModelType, DbModelType>
