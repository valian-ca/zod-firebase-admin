import {
  type DocumentData,
  type FieldPath,
  limit as firestoreLimit,
  orderBy as firestoreOrderBy,
  type OrderByDirection,
  type Query,
  query as firestoreQuery,
  type QueryConstraint,
  where as firestoreWhere,
  type WhereFilterOp,
} from 'firebase/firestore'

type WhereTuple = [FieldPath | string, WhereFilterOp, unknown]
type OrderByTuple = [FieldPath | string, OrderByDirection] | [FieldPath | string]

export interface QuerySpecification {
  name: string
  constraints?: QueryConstraint[]
  where?: WhereTuple[]
  orderBy?: OrderByTuple[]
  limit?: number
}

export const applyQuerySpecification = <AppModelType, DbModelType extends DocumentData = DocumentData>(
  query: Query<AppModelType, DbModelType>,
  { constraints = [], where, orderBy, limit }: QuerySpecification,
): Query<AppModelType, DbModelType> => {
  const whereContraints = where?.map(([field, operator, value]) => firestoreWhere(field, operator, value)) ?? []
  const orderByContraints = orderBy?.map(([field, direction]) => firestoreOrderBy(field, direction)) ?? []
  const limitContraint = limit ? [firestoreLimit(limit)] : []
  return firestoreQuery(query, ...constraints, ...whereContraints, ...orderByContraints, ...limitContraint)
}
