import { collectionGroup, getFirestore, orderBy, query, where } from 'firebase/firestore'
import { z } from 'zod'

import { firestoreZodCollectionGroupQuery } from '../firestore-zod-collection-group-query'

const TestDocumentZod = z.object({
  name: z.string(),
})

describe('firestoreZodCollectionGroupQuery', () => {
  it('should invoke applyQuerySpecification to firestoreZodCollection', () => {
    firestoreZodCollectionGroupQuery('test', TestDocumentZod, {
      name: 'test',
      where: [['test', '==', 'value']],
      orderBy: [['test']],
    })

    expect(where).toHaveBeenCalledWith('test', '==', 'value')
    expect(orderBy).toHaveBeenCalledWith('test', undefined)
    expect(query).toHaveBeenCalledWith(
      collectionGroup(getFirestore(), 'test'),
      where('test', '==', 'value'),
      orderBy('test'),
    )
  })
})
