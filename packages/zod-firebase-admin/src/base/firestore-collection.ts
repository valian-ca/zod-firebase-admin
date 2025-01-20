import { type CollectionReference, type DocumentData, getFirestore } from 'firebase-admin/firestore'

import { type CollectionPath, firestoreCollectionPath } from './firestore-collection-path'

export const firestoreCollection = <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  collectionPath: CollectionPath | string,
  firestore = getFirestore(),
) => firestore.collection(firestoreCollectionPath(collectionPath)) as CollectionReference<AppModelType, DbModelType>
