import { getDocs, type QuerySnapshot } from 'firebase/firestore'
import { mock } from 'jest-mock-extended'
import { z } from 'zod'

import { collectionGroupQueryHelper } from '../collection-group-query-helper'

const TestDocumentZod = z.object({
  name: z.string(),
})

describe('collectionGroupQueryHelper', () => {
  it('should produce a queryHelper for CollectionGroup', async () => {
    const snapshot = mock<QuerySnapshot>({ size: 8 })
    jest.mocked(getDocs).mockResolvedValue(snapshot)

    const helper = collectionGroupQueryHelper('for', { zod: TestDocumentZod })

    const result = await helper.query({ name: 'test' })

    expect(result.size).toBe(8)
  })
})
