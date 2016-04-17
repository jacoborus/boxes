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

document.getElementById('undo').addEventListener('click', () => {
  box.undo()
  printRecords()
})
document.getElementById('redo').addEventListener('click', () => {
  box.redo()
  printRecords()
})

const container = document.getElementById('players')
state.players.forEach(player => {
  container.appendChild(createPlayer(player))
})

const history = document.getElementById('history')
printRecords()

function printRecords () {
  history.innerHTML = ''
  box.records.forEach((log, i) => {
    history.appendChild(createRecord(log, i))
  })
}

function createRecord (log, i) {
  const el = document.createElement('li')
  el.innerHTML = log
  if (box.now() === i) {
    el.classList.add('current')
  }
  el.addEventListener('click', () => {
    box.now(i)
    printRecords()
  })
  return el
}

function createPlayer (player) {
  const bt = document.createElement('button')
  const printLabel = p => {bt.innerHTML = p.points + ' ' + p.name}
  box.on(player, printLabel)
  bt.addEventListener('click', () => {
    player.points++
    box.save(player).log(player.name + ' has ' + player.points)
    printRecords()
  })
  printLabel(player)
  return bt
}
