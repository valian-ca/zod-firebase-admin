import { collection, getFirestore, orderBy, query, where } from 'firebase/firestore'
import { z } from 'zod'

import { firestoreZodCollectionQuery } from '../firestore-zod-collection-query'

const TestDocumentZod = z.object({
  name: z.string(),
})

describe('firestoreZodCollectionQuery', () => {
  it('should invoke applyQuerySpecification to firestoreZodCollection', () => {
    firestoreZodCollectionQuery('test', TestDocumentZod, {
      name: 'test',
      where: [['test', '==', 'value']],
      orderBy: [['test']],
    })

    expect(where).toHaveBeenCalledWith('test', '==', 'value')
    expect(orderBy).toHaveBeenCalledWith('test', undefined)
    expect(query).toHaveBeenCalledWith(
      collection(getFirestore(), 'test'),
      where('test', '==', 'value'),
      orderBy('test'),
    )
  })
})
