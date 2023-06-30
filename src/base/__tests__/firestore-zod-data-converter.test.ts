import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { mock } from 'jest-mock-extended'
import { z } from 'zod'

import { firestoreZodDataConverter } from '../firestore-zod-data-converter'

const TestDocumentZod = z.object({
  name: z.string(),
})

describe('firestoreZodDataConverter', () => {
  const converter = firestoreZodDataConverter(TestDocumentZod)

  describe('toFirestore', () => {
    it('should omit _id', () => {
      expect(converter.toFirestore({ _id: 'id', name: 'name' })).toEqual({ name: 'name' })
    })
  })

  describe('fromFirestore', () => {
    it('should omit _id', () => {
      const snapshot = mock<QueryDocumentSnapshot>({ id: 'id' })
      snapshot.data.mockReturnValue({ name: 'name' })

      expect(converter.fromFirestore(snapshot)).toEqual({ _id: 'id', name: 'name' })
    })
  })
})
