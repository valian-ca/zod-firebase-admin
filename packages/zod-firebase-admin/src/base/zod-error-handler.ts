import { type DocumentData, type QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { type ZodError } from 'zod'

export type ZodErrorHandler = <T extends DocumentData = DocumentData>(
  zodError: ZodError<T>,
  snapshot: QueryDocumentSnapshot,
) => Error
