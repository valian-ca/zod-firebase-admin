import type { QueryDocumentSnapshot, SnapshotMetadata } from 'firebase/firestore'
import { mock } from 'jest-mock-extended'
import { z, ZodError } from 'zod'

import { firestoreZodDataConverter } from '../firestore-zod-data-converter'

const TestDocumentZod = z.object({
  name: z.string(),
})

const TestDiscriminatedUnionDocumentZod = z.discriminatedUnion('_id', [
  z.object({
    _id: z.literal('foo'),
    name1: z.string(),
  }),
  z.object({
    _id: z.literal('bar'),
    name2: z.string(),
  }),
])

const META_DATA_MOCK = mock<SnapshotMetadata>()

describe('firestoreZodDataConverter', () => {
  describe('base case', () => {
    const converter = firestoreZodDataConverter(TestDocumentZod)

    describe('toFirestore', () => {
      it('should omit _id _metadata', () => {
        expect(
          converter.toFirestore({
            _id: 'id',
            name: 'name',
          }),
        ).toEqual({ name: 'name' })
      })
    })

    describe('fromFirestore', () => {
      it('should parse and add _id', () => {
        const snapshot = mock<QueryDocumentSnapshot>({
          id: 'id',
          metadata: META_DATA_MOCK,
        })
        snapshot.data.mockReturnValue({ name: 'name' })

        expect(converter.fromFirestore(snapshot)).toEqual({
          _id: 'id',
          name: 'name',
        })
      })
    })
  })

  describe('with metadata', () => {
    const converter = firestoreZodDataConverter(TestDocumentZod, { _metadata: true })

    describe('toFirestore', () => {
      it('should omit _id _metadata', () => {
        expect(
          converter.toFirestore({
            _id: 'id',
            _metadata: META_DATA_MOCK,
            name: 'name',
          }),
        ).toEqual({ name: 'name' })
      })
    })

    describe('fromFirestore', () => {
      it('should parse and add _id _metadata', () => {
        const snapshot = mock<QueryDocumentSnapshot>({
          id: 'id',
          metadata: META_DATA_MOCK,
        })
        snapshot.data.mockReturnValue({ name: 'name' })

        expect(converter.fromFirestore(snapshot)).toEqual({
          _id: 'id',
          _metadata: META_DATA_MOCK,
          name: 'name',
        })
      })
    })
  })

  describe('without id', () => {
    const converter = firestoreZodDataConverter(TestDocumentZod, { _id: false })

    describe('toFirestore', () => {
      it('should omit _id _metadata', () => {
        expect(
          converter.toFirestore({
            name: 'name',
          }),
        ).toEqual({ name: 'name' })
      })
    })

    describe('fromFirestore', () => {
      it('should parse data', () => {
        const snapshot = mock<QueryDocumentSnapshot>({
          id: 'id',
          metadata: META_DATA_MOCK,
        })
        snapshot.data.mockReturnValue({ name: 'name' })

        expect(converter.fromFirestore(snapshot)).toEqual({
          name: 'name',
        })
      })
    })
  })

  describe('discriminated union on _id', () => {
    const converter = firestoreZodDataConverter(
      TestDiscriminatedUnionDocumentZod,
      {},
      {
        includeDocumentIdForZod: true,
      },
    )

    describe('fromFirestore foo document', () => {
      it('should parse value with _id', () => {
        const snapshot = mock<QueryDocumentSnapshot>({
          id: 'foo',
          metadata: META_DATA_MOCK,
        })
        snapshot.data.mockReturnValue({ name1: 'name1', name2: 'name2' })

        expect(converter.fromFirestore(snapshot)).toEqual({
          _id: 'foo',
          name1: 'name1',
          name2: undefined,
        })
      })
    })

    describe('fromFirestore bar document', () => {
      it('should parse value with _id', () => {
        const snapshot = mock<QueryDocumentSnapshot>({
          id: 'bar',
          metadata: META_DATA_MOCK,
        })
        snapshot.data.mockReturnValue({ name1: 'name1', name2: 'name2' })

        expect(converter.fromFirestore(snapshot)).toEqual({
          _id: 'bar',
          name1: undefined,
          name2: 'name2',
        })
      })
    })
  })

  describe('zod error', () => {
    describe('without custom error handler', () => {
      const converter = firestoreZodDataConverter(TestDocumentZod)

      it('should throw error with id', () => {
        const snapshot = mock<QueryDocumentSnapshot>({
          id: 'id',
          metadata: META_DATA_MOCK,
        })
        snapshot.data.mockReturnValue({ name: 123 })

        expect(() => converter.fromFirestore(snapshot)).toThrow(ZodError)
      })
    })

    describe('with custom error handler', () => {
      const converter = firestoreZodDataConverter(
        TestDocumentZod,
        {},
        {
          zodErrorHandler: (error, snapshot) => {
            throw new Error(`Error: Invalid input on ${snapshot.id}`)
          },
        },
      )

      it('should throw error with id', () => {
        const snapshot = mock<QueryDocumentSnapshot>({
          id: 'id',
          metadata: META_DATA_MOCK,
        })
        snapshot.data.mockReturnValue({ name: 123 })

        expect(() => converter.fromFirestore(snapshot)).toThrow('Error: Invalid input on id')
      })
    })
  })

  describe('snapshotDataConverter', () => {
    it('should return data', () => {
      const snapshotDataConverter = jest.fn().mockImplementation((snapshot: QueryDocumentSnapshot) => snapshot.data())
      const converter = firestoreZodDataConverter(
        TestDocumentZod,
        {},
        {
          snapshotDataConverter,
        },
      )

      const snapshot = mock<QueryDocumentSnapshot>({
        id: 'id',
        metadata: META_DATA_MOCK,
      })
      snapshot.data.mockReturnValue({ name: 'name' })

      expect(converter.fromFirestore(snapshot)).toMatchObject({
        name: 'name',
      })
      expect(snapshotDataConverter).toHaveBeenCalledWith(snapshot)
    })
  })
})
