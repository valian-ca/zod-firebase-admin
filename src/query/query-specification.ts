import type { DocumentData, FieldPath, Filter, OrderByDirection, Query, WhereFilterOp } from 'firebase-admin/firestore'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WhereTuple = [FieldPath | string, WhereFilterOp, any]
type OrderByTuple = [FieldPath | string, OrderByDirection] | [FieldPath | string]

export type QuerySpecification = {
  name: string
  where?: Array<WhereTuple> | Filter
  orderBy?: Array<OrderByTuple>
  limit?: number
}

function isWhereTuple(filter: QuerySpecification['where']): filter is Array<WhereTuple> {
  return Array.isArray(filter)
}

export const applyQuerySpecification = <T extends DocumentData = DocumentData>(
  query: Query<T>,
  { where, orderBy, limit }: QuerySpecification
): Query<T> => {
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
  return result
}
