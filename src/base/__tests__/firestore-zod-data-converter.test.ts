import { type QueryDocumentSnapshot, Timestamp } from 'firebase-admin/firestore'
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

describe('firestoreZodDataConverter', () => {
  describe('base case', () => {
    const converter = firestoreZodDataConverter(TestDocumentZod)

    describe('toFirestore', () => {
      it('should omit _id _createTime _updateTime _readTime', () => {
        expect(
          converter.toFirestore({
            _id: 'id',
            _createTime: Timestamp.now(),
            _updateTime: Timestamp.now(),
            _readTime: Timestamp.now(),
            name: 'name',
          }),
        ).toEqual({ name: 'name' })
      })
    })

    describe('fromFirestore', () => {
      it('should parse and add _id _createTime _updateTime _readTime', () => {
        const now = Timestamp.now()
        const snapshot = mock<QueryDocumentSnapshot>({
          id: 'id',
          createTime: now,
          updateTime: now,
          readTime: now,
        })
        snapshot.data.mockReturnValue({ name: 'name' })

        expect(converter.fromFirestore(snapshot)).toEqual({
          _id: 'id',
          _createTime: now,
          _updateTime: now,
          _readTime: now,
          name: 'name',
        })
      })
    })
  })

  describe('discriminated union on _id', () => {
    const converter = firestoreZodDataConverter(TestDiscriminatedUnionDocumentZod, { includeDocumentIdForZod: true })

    describe('fromFirestore foo document', () => {
      it('should parse value with _id', () => {
        const now = Timestamp.now()
        const snapshot = mock<QueryDocumentSnapshot>({
          id: 'foo',
          createTime: now,
          updateTime: now,
          readTime: now,
        })
        snapshot.data.mockReturnValue({ name1: 'name1', name2: 'name2' })

        expect(converter.fromFirestore(snapshot)).toEqual({
          _id: 'foo',
          _createTime: now,
          _updateTime: now,
          _readTime: now,
          name1: 'name1',
          name2: undefined,
        })
      })
    })

    describe('fromFirestore bar document', () => {
      it('should parse value with _id', () => {
        const now = Timestamp.now()
        const snapshot = mock<QueryDocumentSnapshot>({
          id: 'bar',
          createTime: now,
          updateTime: now,
          readTime: now,
        })
        snapshot.data.mockReturnValue({ name1: 'name1', name2: 'name2' })

        expect(converter.fromFirestore(snapshot)).toEqual({
          _id: 'bar',
          _createTime: now,
          _updateTime: now,
          _readTime: now,
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
        const now = Timestamp.now()
        const snapshot = mock<QueryDocumentSnapshot>({
          id: 'id',
          createTime: now,
          updateTime: now,
          readTime: now,
        })
        snapshot.data.mockReturnValue({ name: 123 })

        expect(() => converter.fromFirestore(snapshot)).toThrow(ZodError)
      })
    })

    describe('with custom error handler', () => {
      const converter = firestoreZodDataConverter(TestDocumentZod, {
        zodErrorHandler: (error, snapshot) => {
          throw new Error(`Error: Invalid input on ${snapshot.id}`)
        },
      })

      it('should throw error with id', () => {
        const now = Timestamp.now()
        const snapshot = mock<QueryDocumentSnapshot>({
          id: 'id',
          createTime: now,
          updateTime: now,
          readTime: now,
        })
        snapshot.data.mockReturnValue({ name: 123 })

        expect(() => converter.fromFirestore(snapshot)).toThrow('Error: Invalid input on id')
      })
    })
  })
})
