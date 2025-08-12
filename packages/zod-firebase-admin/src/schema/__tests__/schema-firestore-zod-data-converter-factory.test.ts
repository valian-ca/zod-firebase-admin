import { describe, expect, it, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'
import { z } from 'zod'

import { firestoreZodDataConverter } from '../../base'
import { schemaFirestoreZodDataConverterFactory } from '../schema-firestore-zod-data-converter-factory'

vi.mock('../../base')

const TestDocumentZod = z.object({
  name: z.string(),
})

vi.mocked(firestoreZodDataConverter).mockReturnValue(mock())

describe('schemaFirestoreZodDataConverterFactory', () => {
  describe('factory options', () => {
    it('should build default converter', () => {
      schemaFirestoreZodDataConverterFactory({ zod: TestDocumentZod })
      expect(firestoreZodDataConverter).toHaveBeenCalledWith(TestDocumentZod, undefined, {})
    })

    it('should build default converter with includeDocumentIdForZod', () => {
      schemaFirestoreZodDataConverterFactory({
        zod: TestDocumentZod,
        includeDocumentIdForZod: true,
      })
      expect(firestoreZodDataConverter).toHaveBeenCalledWith(TestDocumentZod, undefined, {
        includeDocumentIdForZod: true,
      })
    })

    it('should build default converter with zodErrorHandler', () => {
      const zodErrorHandler = vi.fn()
      schemaFirestoreZodDataConverterFactory({ zod: TestDocumentZod }, { zodErrorHandler })
      expect(firestoreZodDataConverter).toHaveBeenCalledWith(TestDocumentZod, undefined, {
        zodErrorHandler,
      })
    })

    it('should build default converter with snapshotDataConverter', () => {
      const snapshotDataConverter = vi.fn()
      schemaFirestoreZodDataConverterFactory({ zod: TestDocumentZod }, { snapshotDataConverter })
      expect(firestoreZodDataConverter).toHaveBeenCalledWith(TestDocumentZod, undefined, {
        snapshotDataConverter,
      })
    })
  })

  describe('without meta option', () => {
    it('should return the default converter', () => {
      const factory = schemaFirestoreZodDataConverterFactory({ zod: TestDocumentZod })
      expect(firestoreZodDataConverter).toHaveBeenCalled()
      vi.mocked(firestoreZodDataConverter).mockClear()

      factory()
      expect(firestoreZodDataConverter).not.toHaveBeenCalled()
    })
  })

  describe('with meta options', () => {
    it('should return the a new converter', () => {
      const factory = schemaFirestoreZodDataConverterFactory({ zod: TestDocumentZod })
      expect(firestoreZodDataConverter).toHaveBeenCalled()
      vi.mocked(firestoreZodDataConverter).mockClear()

      factory({ _id: true })
      expect(firestoreZodDataConverter).toHaveBeenCalledWith(TestDocumentZod, { _id: true }, {})
      vi.mocked(firestoreZodDataConverter).mockClear()

      factory({ _id: true })
      expect(firestoreZodDataConverter).toHaveBeenCalledWith(TestDocumentZod, { _id: true }, {})
    })

    it('should return the a new converter only if options is not cached', () => {
      const factory = schemaFirestoreZodDataConverterFactory({ zod: TestDocumentZod })
      expect(firestoreZodDataConverter).toHaveBeenCalled()
      vi.mocked(firestoreZodDataConverter).mockClear()

      const option = { _id: true } as const
      factory(option)
      expect(firestoreZodDataConverter).toHaveBeenCalledWith(TestDocumentZod, option, {})
      vi.mocked(firestoreZodDataConverter).mockClear()

      factory(option)
      expect(firestoreZodDataConverter).not.toHaveBeenCalled()
    })
  })
})
