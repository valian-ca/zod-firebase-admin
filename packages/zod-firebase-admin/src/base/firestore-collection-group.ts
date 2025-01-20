import { type CollectionGroup, type DocumentData, getFirestore } from 'firebase-admin/firestore'

export const firestoreCollectionGroup = <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  collectionId: string,
  firestore = getFirestore(),
) => firestore.collectionGroup(collectionId) as CollectionGroup<AppModelType, DbModelType>
