import { z } from 'zod'
import { getFirestore } from 'firebase-admin/firestore'
import { mock } from 'jest-mock-extended'
import { collectionGroupQueryHelper } from '../collection-group-query-helper'
import type { ZodQuerySnapshot } from '../../base'

const TestDocumentZod = z.object({
  name: z.string(),
})

describe('collectionGroupQueryHelper', () => {
  it('should produce a queryHelper for CollectionGroup', async () => {
    const snapshot = mock<ZodQuerySnapshot>({ size: 8 })
    jest.mocked(getFirestore().collectionGroup('foo').get).mockResolvedValue(snapshot)

    const helper = collectionGroupQueryHelper('for', { zod: TestDocumentZod }, { getFirestore })

    const result = await helper.query({ name: 'test' })

    expect(result.size).toBe(8)
  })
})
