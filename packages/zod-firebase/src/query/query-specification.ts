import {
  type DocumentData,
  type DocumentSnapshot,
  endAt as firestoreEndAt,
  endBefore as firestoreEndBefore,
  type FieldPath,
  limit as firestoreLimit,
  limitToLast as firestoreLimitToLast,
  orderBy as firestoreOrderBy,
  type OrderByDirection,
  type Query,
  query as firestoreQuery,
  type QueryConstraint,
  startAfter as firestoreStartAfter,
  startAt as firestoreStartAt,
  where as firestoreWhere,
  type WhereFilterOp,
} from '@firebase/firestore'

type WhereTuple = [FieldPath | string, WhereFilterOp, unknown]
type OrderByTuple = [FieldPath | string, OrderByDirection] | [FieldPath | string]

export interface QuerySpecification<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  readonly name: string
  readonly constraints?: QueryConstraint[]
  readonly where?: WhereTuple[]
  readonly orderBy?: OrderByTuple[]
  readonly limit?: number
  readonly limitToLast?: number
  readonly startAt?: DocumentSnapshot<AppModelType, DbModelType> | unknown[]
  readonly startAfter?: DocumentSnapshot<AppModelType, DbModelType> | unknown[]
  readonly endAt?: DocumentSnapshot<AppModelType, DbModelType> | unknown[]
  readonly endBefore?: DocumentSnapshot<AppModelType, DbModelType> | unknown[]
}

export const applyQuerySpecification = <AppModelType, DbModelType extends DocumentData = DocumentData>(
  query: Query<AppModelType, DbModelType>,
  {
    constraints = [],
    where,
    orderBy,
    limit,
    limitToLast,
    startAt,
    startAfter,
    endAt,
    endBefore,
  }: QuerySpecification<AppModelType, DbModelType>,
): Query<AppModelType, DbModelType> => {
  const whereContraints = where?.map(([field, operator, value]) => firestoreWhere(field, operator, value)) ?? []
  const orderByContraints = orderBy?.map(([field, direction]) => firestoreOrderBy(field, direction)) ?? []
  const limitContraint = limit ? [firestoreLimit(limit)] : []
  const limitToLastContraint = limitToLast ? [firestoreLimitToLast(limitToLast)] : []
  const startAtContraint = startAt
    ? [Array.isArray(startAt) ? firestoreStartAt(...startAt) : firestoreStartAt(startAt)]
    : []
  const startAfterContraint = startAfter
    ? [Array.isArray(startAfter) ? firestoreStartAfter(...startAfter) : firestoreStartAfter(startAfter)]
    : []
  const endAtContraint = endAt ? [Array.isArray(endAt) ? firestoreEndAt(...endAt) : firestoreEndAt(endAt)] : []
  const endBeforeContraint = endBefore
    ? [Array.isArray(endBefore) ? firestoreEndBefore(...endBefore) : firestoreEndBefore(endBefore)]
    : []
  return firestoreQuery(
    query,
    ...constraints,
    ...whereContraints,
    ...orderByContraints,
    ...limitContraint,
    ...limitToLastContraint,
    ...startAtContraint,
    ...startAfterContraint,
    ...endAtContraint,
    ...endBeforeContraint,
  )
}
