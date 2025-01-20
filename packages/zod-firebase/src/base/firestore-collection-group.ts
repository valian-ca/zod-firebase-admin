import { collectionGroup, type DocumentData, getFirestore, type Query } from '@firebase/firestore'

export const firestoreCollectionGroup = <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  collectionId: string,
  firestore = getFirestore(),
) => collectionGroup(firestore, collectionId) as Query<AppModelType, DbModelType>
