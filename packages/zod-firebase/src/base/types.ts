import type {
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Query,
  QuerySnapshot,
  SnapshotMetadata,
} from 'firebase/firestore'
import type { EmptyObject, ReadonlyDeep } from 'type-fest'
import type { z } from 'zod'

export type ZodTypeDocumentData<
  Output extends DocumentData = DocumentData,
  Input extends DocumentData = Output,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
> = z.ZodType<Output, any, Input>

export type DocumentInput<Z extends ZodTypeDocumentData = ZodTypeDocumentData> = z.input<Z>

export interface MetaOutputOptions {
  readonly _id?: boolean
  readonly _metadata?: true
  readonly readonly?: true
}

export type MetaOutput<Options extends MetaOutputOptions> = (Options['_id'] extends false
  ? EmptyObject
  : { readonly _id: string }) &
  (Options['_metadata'] extends true ? { readonly _metadata: SnapshotMetadata } : EmptyObject)

export type DocumentOutput<
  Z extends ZodTypeDocumentData,
  OutputOptions extends MetaOutputOptions = MetaOutputOptions,
> = (OutputOptions['readonly'] extends true ? ReadonlyDeep<z.output<Z>> : z.output<Z>) & MetaOutput<OutputOptions>

export type ReadonlyDocumentOutput<
  Z extends ZodTypeDocumentData,
  OutputOptions extends MetaOutputOptions = MetaOutputOptions,
> = ReadonlyDeep<z.output<Z>> & MetaOutput<OutputOptions>

export type ZodDocumentReference<
  Z extends ZodTypeDocumentData,
  OutputOptions extends MetaOutputOptions = MetaOutputOptions,
  AppModelType extends DocumentOutput<Z, OutputOptions> = DocumentOutput<Z, OutputOptions>,
  DbModelType extends DocumentData = DocumentInput<Z>,
> = DocumentReference<AppModelType, DbModelType>

export type ZodDocumentSnapshot<
  Z extends ZodTypeDocumentData,
  OutputOptions extends MetaOutputOptions = MetaOutputOptions,
  AppModelType extends DocumentOutput<Z, OutputOptions> = DocumentOutput<Z, OutputOptions>,
  DbModelType extends DocumentData = DocumentInput<Z>,
> = DocumentSnapshot<AppModelType, DbModelType>

export type ZodCollectionReference<
  Z extends ZodTypeDocumentData,
  OutputOptions extends MetaOutputOptions = MetaOutputOptions,
  AppModelType extends DocumentOutput<Z, OutputOptions> = DocumentOutput<Z, OutputOptions>,
  DbModelType extends DocumentData = DocumentInput<Z>,
> = CollectionReference<AppModelType, DbModelType>

export type ZodQuery<
  Z extends ZodTypeDocumentData,
  OutputOptions extends MetaOutputOptions = MetaOutputOptions,
  AppModelType extends DocumentOutput<Z, OutputOptions> = DocumentOutput<Z, OutputOptions>,
  DbModelType extends DocumentData = DocumentInput<Z>,
> = Query<AppModelType, DbModelType>

export type ZodQuerySnapshot<
  Z extends ZodTypeDocumentData,
  OutputOptions extends MetaOutputOptions = MetaOutputOptions,
  AppModelType extends DocumentOutput<Z, OutputOptions> = DocumentOutput<Z, OutputOptions>,
  DbModelType extends DocumentData = DocumentInput<Z>,
> = QuerySnapshot<AppModelType, DbModelType>
