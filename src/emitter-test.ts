import test from 'tape'
import { Box, on, clear } from './boxes'

interface Msg {
  prop: string
  oldValue: any
}

test('emitter#set in object', t => {
  t.plan(2)
  const box = Box({
    a: 1,
    b: {
      x: 'x',
      z: 'z'
    },
    c: [1, 2, 3, 4]
  })
  on(box, ({ prop, oldValue }: Msg) => {
    t.is(prop, 'a', 'default call on all properties')
    t.is(oldValue, 1, 'default call on all properties')
  })
  box.a = 99
  clear(box)
  box.a = true
})

test('emitter#set in array', t => {
  t.plan(2)
  const box = Box([1, 2, 3, 4])
  on(box, ({ prop, oldValue }: Msg) => {
    t.is(prop, '2', 'default call on all properties')
    t.is(oldValue, 3, 'default call on all properties')
  })
  box['2'] = 99
  clear(box)
  box['2'] = true
})

test('emitter#set only triggers emitter if value is different', t => {
  t.plan(1)
  const box = Box([1, 2, 3, 4])
  on(box, () => t.pass())
  box[0] = 1
  box[0] = 1
  box[0] = 1
  box[0] = 1
  box[0] = 99
  clear(box)
  box['2'] = true
})

test('emitter#delete in object', t => {
  t.plan(2)
  const box = Box({ a: 1, b: 2 })
  on(box, ({ prop, oldValue }: Msg) => {
    t.is(prop, 'a', 'default call on all properties')
    t.is(oldValue, 1, 'default call on all properties')
  })
  delete box.a
  clear(box)
  delete box.b
})

test('emitter#delete in array', t => {
  t.plan(2)
  const box = Box([1, 2, 3, 4])
  on(box, ({ prop, oldValue }: Msg) => {
    t.is(prop, '2', 'default call on all properties')
    t.is(oldValue, 3, 'default call on all properties')
  })
  delete box['2']
  clear(box)
  delete box[0]
})
