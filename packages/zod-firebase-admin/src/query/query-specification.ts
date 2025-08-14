import {
  type DocumentData,
  type DocumentSnapshot,
  type FieldPath,
  type Filter,
  type OrderByDirection,
  type Query,
  type WhereFilterOp,
} from 'firebase-admin/firestore'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WhereTuple = [FieldPath | string, WhereFilterOp, any]
type OrderByTuple = [FieldPath | string, OrderByDirection] | [FieldPath | string]

export interface QuerySpecification<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  name: string
  where?: WhereTuple[] | Filter
  orderBy?: OrderByTuple[]
  limit?: number
  limitToLast?: number
  offset?: number
  startAt?: DocumentSnapshot<AppModelType, DbModelType> | unknown[]
  startAfter?: DocumentSnapshot<AppModelType, DbModelType> | unknown[]
  endAt?: DocumentSnapshot<AppModelType, DbModelType> | unknown[]
  endBefore?: DocumentSnapshot<AppModelType, DbModelType> | unknown[]
}

const isWhereTuple = (filter: QuerySpecification['where']): filter is WhereTuple[] => Array.isArray(filter)

export const applyQuerySpecification = <AppModelType, DbModelType extends DocumentData = DocumentData>(
  query: Query<AppModelType, DbModelType>,
  {
    where,
    orderBy,
    limit,
    limitToLast,
    offset,
    startAt,
    startAfter,
    endAt,
    endBefore,
  }: QuerySpecification<AppModelType, DbModelType>,
): Query<AppModelType, DbModelType> => {
  let result = query
  if (where) {
    result = isWhereTuple(where)
      ? where.reduce((acc, [field, operator, value]) => acc.where(field, operator, value), result)
      : result.where(where)
  }
  if (orderBy) {
    result = orderBy.reduce((acc, [field, direction]) => acc.orderBy(field, direction), result)
  }
  if (limit) {
    result = result.limit(limit)
  }
  if (limitToLast) {
    result = result.limitToLast(limitToLast)
  }
  if (offset) {
    result = result.offset(offset)
  }
  if (startAt) {
    result = Array.isArray(startAt) ? result.startAt(...startAt) : result.startAt(startAt)
  }
  if (startAfter) {
    result = Array.isArray(startAfter) ? result.startAfter(...startAfter) : result.startAfter(startAfter)
  }
  if (endAt) {
    result = Array.isArray(endAt) ? result.endAt(...endAt) : result.endAt(endAt)
  }
  if (endBefore) {
    result = Array.isArray(endBefore) ? result.endBefore(...endBefore) : result.endBefore(endBefore)
  }
  return result
}
