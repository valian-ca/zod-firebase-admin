import type { DocumentData } from 'firebase-admin/firestore'
import type { z } from 'zod'

export type ZodTypeDocumentData<
  Output extends DocumentData = DocumentData,
  Input extends DocumentData = Output
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
> = z.ZodType<Output, any, Input>

export type DocumentOutput<Z extends ZodTypeDocumentData> = z.output<Z> & { readonly _id: string }
