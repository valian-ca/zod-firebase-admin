import {
  type DocumentData,
  type FirestoreDataConverter,
  type Timestamp,
  type WithFieldValue,
} from 'firebase-admin/firestore'

export type WithFieldValueAndMetadata<T extends DocumentData = DocumentData> = WithFieldValue<T> & {
  readonly _id?: string
  readonly _createTime?: Timestamp
  readonly _updateTime?: Timestamp
  readonly _readTime?: Timestamp
}

export const omitMetadata = <
  AppModelType extends DocumentData = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>({
  _id,
  _readTime,
  _createTime,
  _updateTime,
  ...rest
}: WithFieldValueAndMetadata<AppModelType>) => rest as WithFieldValue<DbModelType>

export const firestoreOmitMetaDataConverter = <T extends DocumentData = DocumentData>(): FirestoreDataConverter<
  T,
  T
> => ({
  toFirestore: (modelObject) => omitMetadata<T, T>(modelObject as WithFieldValueAndMetadata<T>),
  fromFirestore: (snapshot) => snapshot.data() as T,
})
