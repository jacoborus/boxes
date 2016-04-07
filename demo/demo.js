/* global boxes, document */
'use strict'

const state = {
  players: [{
    name: 'Kurt',
    points: 0
  }, {
    name: 'Bob',
    points: 0
  }, {
    name: 'Jimi',
    points: 0
  }]
}

const box = boxes(state)

document.getElementById('undo').addEventListener('click', () => box.undo())
document.getElementById('redo').addEventListener('click', () => box.redo())

function createPlayer (player) {
  const bt = document.createElement('button')
  const printLabel = p => {bt.innerHTML = p.points + ' ' + p.name}
  box.subscribe(printLabel, player)
  bt.addEventListener('click', () => {
    player.points++
    box.save(player)
  })
  printLabel(player)
  return bt
}

const container = document.getElementById('players')
state.players.forEach(player => {
  container.appendChild(createPlayer(player))
})
