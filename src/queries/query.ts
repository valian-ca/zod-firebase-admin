import { getFirestore, Query, CollectionReference, FieldPath, WhereFilterOp } from 'firebase-admin/firestore'
import { firestoreZodCollection, ZodTypeDocumentData } from '../base'

export const query = <T extends ZodTypeDocumentData>(name: string, schema: T, firestore = getFirestore()) =>
  firestoreZodCollection(name, schema, firestore).where('name', '==', 'bob').get()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryParams = Array<[FieldPath, WhereFilterOp, any]>

export const applyQuery = <T extends ZodTypeDocumentData>(
  collectionReference: CollectionReference<T>,
  queryParams: QueryParams
): Query<T> =>
  queryParams.reduce(
    (acc, [field, operator, value]) => acc.where(field, operator, value),
    collectionReference as Query<T>
  )
