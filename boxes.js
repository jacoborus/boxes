'use strict'

const ae = require('arbitrary-emitter')

/**
 * create and return a new box with given objject state
 *
 * @param {object} state = {} inital state
 * @returns {object} a new box
 */
function boxes (state) {
  const emitter = ae()
  if (state) {
    if (typeof state !== 'object') {
      throw new Error('state should be a object')
    }
  } else {
    state = {}
  }

  let step = -1
  const links = new Map()
  const history = []
  const records = []
  const box = {
    get: () => state,
    save, emit, on, off, undo, redo, log, records, now
  }

  // save initial state so we can get back later
  save(state)

  // clean future stories and future logs
  function removeFuture () {
    if (step + 1 < history.length) {
      // get future stories
      const toClean = history.splice(step + 2)
      records.splice(step + 2)
      // reset `post` property in every link in of future stories
      toClean.forEach(story => story.targets.forEach(link => {link.post = []}))
    }
  }

  /**
   * Call the `action` when saving or triggering `scope`. `scope` is `state` by default
   *
   * @param {object} scope target. `state` by default
   * @param {function} action method to dispatch on saving
   * @returns {function} unsubscribe method
   */
  function on (scope, action) {
    if (!action) {
      action = scope
      scope = state
    } else if (!links.has(scope)) {
      throw new Error('cannot subscribe to a scope outside the box state')
    }
    if (!action || typeof action !== 'function') {
      throw new Error('on requires a function as first argument')
    }

    return emitter.on(scope, action)
  }

  function off (scope, action) {
    emitter.off(scope, action)
  }

  function getNewLink (scope) {
    const link = {
      scope,
      pre: [],
      post: []
    }
    links.set(scope, link)
    return link
  }

  function applySave (scope) {
    // make a copy of the object
    const copy = Array.isArray(scope) ? [] : {},
          link = links.get(scope) || getNewLink(scope)
    Object.keys(scope).forEach(k => {
      const val = scope[k]
      copy[k] = val
      // save nested objects whether they are new in the box
      if (val && typeof val === 'object' && !links.has(val)) {
        applySave(val)
      }
    })
    // save the copy of the object in `pre` list in its link
    link.pre.push(copy)
    // call subscriptions
    triggerLink(link)
    // the returned link will be stored as a story in the history
    return link
  }

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
    history[++step] = story
    records[step] = story.info
    return box
  }

  function log (info) {
    info = 0 in arguments ? info : Date.now()
    records[step] = history[step].info = info
  }

  // emit actions subscribed to a `link`.
  function triggerLink (link) {
    let scope = link.scope
    emitter.emit(scope, scope)
    return box
  }

  // trigger actions subscribed to a `scope`.
  function triggerScope (scope) {
    return triggerLink(links.get(scope))
  }

  /**
   * call triggerScope passing `state` as `scope` by default
   * also check passed `scope` is inside state
   * @param {object} scope optional target
   */
  function emit (scope) {
    if (!scope) return triggerScope(state)
    // check passed `scope` is inside state
    if (!links.has(scope)) {
      throw new Error('Cannot trigger a scope outside the box')
    }
    triggerScope(scope)
    return box
  }

  function applyStory (link) {
    const pre = link.pre[link.pre.length - 1],
          scope = link.scope
    if (Array.isArray(scope)) {
      // remove extra length
      scope.splice(pre.length)
      // assign properties
      pre.forEach((el, i) => {scope[i] = el})
    } else {
      let keys = Object.keys(pre)
      // delete properties
      Object.keys(scope)
      .filter(i => keys.indexOf(i) < 0)
      .forEach(k => delete scope[k])
      // assign properties
      keys.forEach(k => {scope[k] = pre[k]})
    }
    emitter.emit(scope, scope)
  }

  function undo (steps) {
    if (!steps || steps && (isNaN(steps) || steps < 1)) {
      steps = 1
    }
    if (step - steps + 1) {
      let i = steps
      while (i) {
        history[step--].targets.forEach(link => {
          link.post.push(link.pre.pop())
          applyStory(link)
        })
        --i
      }
      return step
    }
    return step
  }

  function redo (steps) {
    if (!steps || steps && (isNaN(steps) || steps < 1)) {
      steps = 1
    }
    let i = steps
    if (history[step + steps]) {
      while (i) {
        history[++step].targets.forEach(link => {
          link.pre.push(link.post.pop())
          applyStory(link)
        })
        --i
      }
      return step
    }
    return step
  }

  function now (pos) {
    if (!(0 in arguments) ||
        isNaN(pos) ||
        !Number.isInteger(pos) ||
        pos === step ||
        history.length > pos < 0) {
      return step
    }
    if (step < pos) {
      return box.redo(pos - step)
    }
    return box.undo(step - pos)
  }

  return box
}

// this line has to be the last for building purposes
module.exports = boxes
