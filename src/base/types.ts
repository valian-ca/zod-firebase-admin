import type { CollectionReference, DocumentData, DocumentReference } from 'firebase-admin/firestore'
import type { z } from 'zod'
import { firestore } from 'firebase-admin'
import DocumentSnapshot = firestore.DocumentSnapshot

export type ZodTypeDocumentData<
  Output extends DocumentData = DocumentData,
  Input extends DocumentData = Output
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
> = z.ZodType<Output, any, Input>

export type DocumentOutput<Z extends ZodTypeDocumentData = ZodTypeDocumentData> = z.output<Z> & { readonly _id: string }

export type ZodDocumentReference<Z extends ZodTypeDocumentData = ZodTypeDocumentData> = DocumentReference<
  DocumentOutput<Z>
>

export type ZodDocumentSnapshot<Z extends ZodTypeDocumentData = ZodTypeDocumentData> = DocumentSnapshot<
  DocumentOutput<Z>
>

export type ZodCollectionReference<Z extends ZodTypeDocumentData = ZodTypeDocumentData> = CollectionReference<
  DocumentOutput<Z>
>
