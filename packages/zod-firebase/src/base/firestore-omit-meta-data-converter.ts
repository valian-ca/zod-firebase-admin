import {
  type DocumentData,
  type FirestoreDataConverter,
  type SnapshotMetadata,
  type WithFieldValue,
} from '@firebase/firestore'

export type WithFieldValueAndMetadata<T extends DocumentData = DocumentData> = WithFieldValue<T> & {
  readonly _id?: string
  readonly _metadata?: SnapshotMetadata
}

export const omitMetadata = <
  AppModelType extends DocumentData = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>({
  _id,
  _metadata,
  ...rest
}: WithFieldValueAndMetadata<AppModelType>) => rest as WithFieldValue<DbModelType>

export const firestoreOmitMetaDataConverter = <T extends DocumentData = DocumentData>(): FirestoreDataConverter<
  T,
  T
> => ({
  toFirestore: (modelObject) => omitMetadata<T, T>(modelObject as WithFieldValueAndMetadata<T>),
  fromFirestore: (snapshot) => snapshot.data() as T,
})
