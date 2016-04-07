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
  const printLabel = () => {bt.innerHTML = player.points + ' ' + player.name}
  box.subscribe(printLabel, player)
  bt.addEventListener('click', () => {
    player.points++
    box.save(player)
  })
  printLabel()
  return bt
}

const container = document.getElementById('players')
state.players.forEach(player => {
  container.appendChild(createPlayer(player))
})
