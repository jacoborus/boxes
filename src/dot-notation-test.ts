import test from 'tape'
import { getBox, on } from './boxes'

test('Dot notation: simple object', t => {
  const team = {
    director: {
      name: 'uno'
    }
  }
  const box = getBox(team)
  t.plan(3)
  on(box, 'director.name', () => t.pass())
  box.director.name = 'dos'
  box.director = {
    name: 'tres'
  }
  box.director.name = 'cuatro'
  t.end()
})

test('Dot notation: deep object', t => {
  const team = {}
  const box = getBox(team)
  t.plan(3)
  on(box, 'director.name', () => t.pass())
  box.director = {}
  box.director.name = 'cuatro'
  box.director.name = 'cinco'
  box.director = {
    name: 'cinco'
  }
  box.director.name = 'tres'
  t.end()
})

test('Dot notation: simple array', t => {
  const box = getBox([{
    number: 'Zero'
  }])
  t.plan(3)
  on(box, '1.number', () => t.pass())
  box[1] = {}
  box[1].number = 'uno'
  box[1] = { number: 'dos' }
  box[1].number = 'tres'
  t.end()
})

test('Dot notation: eventController#off', t => {
  const team = {
    director: {
      name: 'uno'
    }
  }
  const box = getBox(team)
  t.plan(1)
  const eventController = on(box, 'director.name', () => t.fail())
  eventController.off()
  box.director.name = 'dos'
  t.pass()
  t.end()
})

test('Dot notation: eventController#emit', t => {
  const team = {
    director: {
      name: 'uno'
    }
  }
  const box = getBox(team)
  t.plan(2)
  const eventController = on(box, 'director.name', (...change) => {
    t.same(change, [1, 2, 3, 4])
  })
  eventController.emit(1, 2, 3, 4)
  eventController.emit(1, 2, 3, 4)
  t.end()
})
