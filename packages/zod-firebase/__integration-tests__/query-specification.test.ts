import {
  connectFirestoreEmulator,
  doc,
  getFirestore,
  orderBy as orderByConstraint,
  setDoc,
  where as whereConstraint,
} from '@firebase/firestore'
import { initializeApp } from 'firebase/app'
import functionsTest from 'firebase-functions-test'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { type Collections, collectionsBuilder } from '../src'

vi.unmock('@firebase/firestore')

const TestDocumentZod = z.object({
  name: z.string(),
  values: z.array(z.string()).optional().default([]),
})

const schema = {
  test: {
    zod: TestDocumentZod,
  },
} as const

describe('QuerySpecification integration (web)', () => {
  const testHelper = functionsTest()
  let collection: Collections<typeof schema>

  beforeAll(() => {
    const app = initializeApp({ projectId: 'demo-zod-firebase' })
    connectFirestoreEmulator(getFirestore(app), 'localhost', 8080)
    collection = collectionsBuilder(schema)
  })

  afterEach(() => testHelper.firestore.clearFirestoreData({ projectId: 'demo-zod-firebase' }))

  afterAll(() => {
    testHelper.cleanup()
  })

  beforeEach(async () => {
    await setDoc(doc(getFirestore(), 'test/a'), { name: 'a' })
    await setDoc(doc(getFirestore(), 'test/b'), { name: 'b' })
    await setDoc(doc(getFirestore(), 'test/c'), { name: 'c' })
  })

  it('where equality', async () => {
    const docs = await collection.test.findMany({ name: 'by-name', where: [['name', '==', 'b']] })
    expect(docs.map((d) => d.name)).toEqual(['b'])
  })

  it('orderBy asc/desc with limit', async () => {
    const firstAsc = await collection.test.findMany({ name: 'asc', orderBy: [['name', 'asc']], limit: 1 })
    expect(firstAsc.map((d) => d.name)).toEqual(['a'])

    const firstDesc = await collection.test.findMany({ name: 'desc', orderBy: [['name', 'desc']], limit: 1 })
    expect(firstDesc.map((d) => d.name)).toEqual(['c'])
  })

  it('limitToLast requires orderBy and returns last N', async () => {
    const lastTwo = await collection.test.findMany({
      name: 'last-two',
      orderBy: [['name', 'asc']],
      limitToLast: 2,
    })
    expect(lastTwo.map((d) => d.name)).toEqual(['b', 'c'])
  })

  it('startAt/startAfter cursors', async () => {
    const fromB = await collection.test.findMany({
      name: 'from-b',
      orderBy: [['name', 'asc']],
      startAt: ['b'],
    })
    expect(fromB.map((d) => d.name)).toEqual(['b', 'c'])

    const afterB = await collection.test.findMany({
      name: 'after-b',
      orderBy: [['name', 'asc']],
      startAfter: ['b'],
    })
    expect(afterB.map((d) => d.name)).toEqual(['c'])
  })

  it('endAt/endBefore cursors', async () => {
    const untilB = await collection.test.findMany({
      name: 'until-b',
      orderBy: [['name', 'asc']],
      endAt: ['b'],
    })
    expect(untilB.map((d) => d.name)).toEqual(['a', 'b'])

    const beforeB = await collection.test.findMany({
      name: 'before-b',
      orderBy: [['name', 'asc']],
      endBefore: ['b'],
    })
    expect(beforeB.map((d) => d.name)).toEqual(['a'])
  })

  it('prebuilt constraints', async () => {
    const docs = await collection.test.findMany({
      name: 'constraints',
      constraints: [whereConstraint('name', '==', 'a'), orderByConstraint('name', 'asc')],
    })
    expect(docs.map((d) => d.name)).toEqual(['a'])
  })
})
