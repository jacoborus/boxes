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
box.log('begin game')

document.getElementById('undo').addEventListener('click', () => box.undo())
document.getElementById('redo').addEventListener('click', () => box.redo())

const history = document.getElementById('history')
const container = document.getElementById('players')

state.players.forEach(player => {
  container.appendChild(createPlayer(player))
})

function printRecords () {
  history.innerHTML = ''
  box.records.forEach(log => history.appendChild(createRecord(log)))
}

function createRecord (log) {
  const el = document.createElement('li')
  el.innerHTML = log
  return el
}

function createPlayer (player) {
  const bt = document.createElement('button')
  const printLabel = p => {bt.innerHTML = p.points + ' ' + p.name}
  box.subscribe(printLabel, player)
  bt.addEventListener('click', () => {
    player.points++
    box.save(player).log(player.name + ' has ' + player.points)
    printRecords()
  })
  printLabel(player)
  return bt
}
