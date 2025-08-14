import { initializeApp } from 'firebase-admin/app'
import { Filter, getFirestore } from 'firebase-admin/firestore'
import functionsTest from 'firebase-functions-test'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { z } from 'zod'

import { collectionsBuilder } from '../src'

const TestDocumentZod = z.object({
  name: z.string(),
  values: z.array(z.string()).optional().default([]),
})

const schema = {
  test: {
    zod: TestDocumentZod,
  },
} as const

describe('QuerySpecification integration (admin)', () => {
  const testHelper = functionsTest()
  const collection = collectionsBuilder(schema)

  beforeAll(() => {
    initializeApp({ projectId: 'demo-zod-firebase-admin' })
  })

  afterEach(() => testHelper.firestore.clearFirestoreData({ projectId: 'demo-zod-firebase-admin' }))

  afterAll(() => {
    testHelper.cleanup()
  })

  beforeEach(async () => {
    await getFirestore().doc('test/a').set({ name: 'a' })
    await getFirestore().doc('test/b').set({ name: 'b' })
    await getFirestore().doc('test/c').set({ name: 'c' })
  })

  it('where equality (tuple)', async () => {
    const docs = await collection.test.findMany({ name: 'by-name', where: [['name', '==', 'b']] })
    expect(docs.map((d) => d.name)).toEqual(['b'])
  })

  it('where Filter API', async () => {
    const docs = await collection.test.findMany({ name: 'filter', where: Filter.where('name', '==', 'a') })
    expect(docs.map((d) => d.name)).toEqual(['a'])
  })

  it('orderBy asc/desc with limit', async () => {
    const firstAsc = await collection.test.findMany({ name: 'asc', orderBy: [['name', 'asc']], limit: 1 })
    expect(firstAsc.map((d) => d.name)).toEqual(['a'])

    const firstDesc = await collection.test.findMany({ name: 'desc', orderBy: [['name', 'desc']], limit: 1 })
    expect(firstDesc.map((d) => d.name)).toEqual(['c'])
  })

  it('limitToLast returns last N', async () => {
    const lastTwo = await collection.test.findMany({
      name: 'last-two',
      orderBy: [['name', 'asc']],
      limitToLast: 2,
    })
    expect(lastTwo.map((d) => d.name)).toEqual(['b', 'c'])
  })

  it('offset skips N', async () => {
    const afterOne = await collection.test.findMany({ name: 'offset', orderBy: [['name', 'asc']], offset: 1 })
    expect(afterOne.map((d) => d.name)).toEqual(['b', 'c'])
  })

  it('startAt/startAfter cursors', async () => {
    const fromB = await collection.test.findMany({ name: 'from-b', orderBy: [['name', 'asc']], startAt: ['b'] })
    expect(fromB.map((d) => d.name)).toEqual(['b', 'c'])

    const afterB = await collection.test.findMany({ name: 'after-b', orderBy: [['name', 'asc']], startAfter: ['b'] })
    expect(afterB.map((d) => d.name)).toEqual(['c'])
  })

  it('endAt/endBefore cursors', async () => {
    const untilB = await collection.test.findMany({ name: 'until-b', orderBy: [['name', 'asc']], endAt: ['b'] })
    expect(untilB.map((d) => d.name)).toEqual(['a', 'b'])

    const beforeB = await collection.test.findMany({ name: 'before-b', orderBy: [['name', 'asc']], endBefore: ['b'] })
    expect(beforeB.map((d) => d.name)).toEqual(['a'])
  })
})
