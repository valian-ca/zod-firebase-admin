import { collection, type CollectionReference, type DocumentData, getFirestore } from '@firebase/firestore'

import { type CollectionPath, firestoreCollectionPath } from './firestore-collection-path'

export const firestoreCollection = <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  collectionPath: CollectionPath | string,
  firestore = getFirestore(),
) => collection(firestore, firestoreCollectionPath(collectionPath)) as CollectionReference<AppModelType, DbModelType>
