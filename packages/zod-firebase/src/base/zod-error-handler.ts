import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import type { ZodError } from 'zod'

export type ZodErrorHandler = <T extends DocumentData = DocumentData>(
  zodError: ZodError<T>,
  snapshot: QueryDocumentSnapshot,
) => Error
