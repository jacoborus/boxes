'use strict'

const ae = require('arbitrary-emitter')

/**
 * Create and return a new box from given object `state`
 *
 * @param {object} state inital state
 * @returns {object} a new box
 */
function boxes (state) {
  const emitter = ae()
  if (!state || typeof state !== 'object') {
    throw new Error('boxes requires an object state')
  }

  let step = -1
  const links = new Map()
  const hist = [] // history

  // clean future stories and future logs
  function removeFuture () {
    if (step + 1 < hist.length) {
      // get future stories
      const toClean = hist.splice(step + 2)
      // reset `future` property in every link in of future stories
      toClean.forEach(story => {
        story.targets.forEach(link => {
          link.future = []
        })
      })
    }
  }

  function getNewLink (scope) {
    const link = {
      scope,
      past: [],
      future: []
    }
    links.set(scope, link)
    return link
  }

  function applySave (scope) {
    // make a copy of the object
    const copy = Array.isArray(scope) ? [] : {}
    const link = links.get(scope) || getNewLink(scope)
    Object.keys(scope).forEach(k => {
      const val = copy[k] = scope[k]
      // save nested objects whether they are new in the box
      if (val && typeof val === 'object' && !links.has(val)) {
        applySave(val)
      }
    })
    // save the copy of the object in `past` list in its `link`
    link.past.push(copy)
    // call listeners
    emitter.emit(scope)
    // the returned link will be stored as a story in the history
    return link
  }

  function applyStory (link) {
    const past = link.past[link.past.length - 1]
    const scope = link.scope
    if (Array.isArray(scope)) {
      // remove extra length
      scope.splice(past.length)
      // assign properties
      past.forEach((el, i) => { scope[i] = el })
    } else {
      let keys = Object.keys(past)
      // delete properties
      Object.keys(scope)
      .filter(i => keys.indexOf(i) < 0)
      .forEach(k => delete scope[k])
      // assign properties
      keys.forEach(k => { scope[k] = past[k] })
    }
    emitter.emit(scope)
  }

  /**
   * Call the `listener` when saving or triggering `scope`. `scope` is `state` by default
   *
   * @param {object} scope target. `state` by default
   * @param {function} listener method to dispatch on saving
   * @returns {function} unsubscribe method
   */
  function on (scope, listener) {
    if (!listener) {
      listener = scope
      scope = state
    } else if (!links.has(scope)) {
      throw new Error('cannot subscribe to a scope outside the box state')
    }
    if (!listener || typeof listener !== 'function') {
      throw new Error('on method requires a listener function')
    }

    return emitter.on(scope, listener)
  }

  /**
   * Unsubscribe `listener` tagged with `scope`. Remove all
   * listeners tagged with `scope` if no `listener` is passed
   *
   * @param {Object} scope event key
   * @param {Function} listener target to remove
   */
  function off (scope, listener) {
    if (!listener) {
      listener = scope
      scope = state
    }
    if (!listener || typeof listener !== 'function') {
      throw new Error('off method requires a listener function')
    }
    emitter.off(scope, listener)
  }

  /**
   * save `scope` values in history, then call listeners tagged with `scope`
   *
   * @param {Object} scope Optional, is `state` by default
   * @returns {Object} box
   */
  function save (scope) {
    if (!scope) {
      // use state as default scope
      scope = state
    } else if (typeof scope !== 'object') {
      throw new Error('scope argument has to be a object')
    }
    // assure we can add new stories after old ones
    removeFuture()
    // add story to history and increase `step`
    const story = {
      targets: [applySave(scope)],
      info: Date.now()
    }
    hist[++step] = story
    return box
  }

  /**
   * Call listeners tagged with `scope`.
   *
   * @param {object} scope optional, is `state` by default
   */
  function emit (scope) {
    if (!scope) emitter.emit(state)
    else if (links.has(scope)) emitter.emit(scope)
    else {
      throw new Error('Cannot trigger scopes from outside the box')
    }
    return box
  }

  function undo (steps) {
    if (!steps || steps && (isNaN(steps) || steps < 1)) {
      steps = 1
    }
    if (step - steps + 1) {
      let i = steps
      while (i--) {
        hist[step--].targets.forEach(link => {
          link.future.push(link.past.pop())
          applyStory(link)
        })
      }
    }
    return step
  }

  function redo (steps) {
    if (!steps || steps && (isNaN(steps) || steps < 1)) {
      steps = 1
    }
    if (hist[step + steps]) {
      let i = steps
      while (i--) {
        hist[++step].targets.forEach(link => {
          link.past.push(link.future.pop())
          applyStory(link)
        })
      }
    }
    return step
  }

  const box = {
    get: () => state,
    save, emit, on, off, undo, redo
  }

  // save initial state so we can get back later
  return save(state)
}

// this line has to be the last for building purposes
module.exports = boxes
