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
