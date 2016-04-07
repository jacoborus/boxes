'use strict'

/**
 * create and return a new box with given objject state
 *
 * @param {object} state = {} inital state
 * @returns {object} a new box
 */
function boxes (state) {
  if (state) {
    if (typeof state !== 'object') {
      throw new Error('state should be a object')
    }
  } else {
    state = {}
  }
  const links = new Map()
  const history = []
  let now = 0

  function deleteFutureStories () {
    if (now < history.length) {
      // get future stories
      const toClean = history.splice(now + 1)
      // reset `post` property in every link in of future stories
      toClean.forEach(story => story.forEach(link => {link.post = []}))
    }
  }

  /**
   * Call the `action` when saving or triggering `scope`. Default scope is main scope (state)
   *
   * @param {function} action method to dispatch every time `scope` is saved or triggered
   * @param {object} scope target. By default is the main state
   * @returns {function} unsubscribe
   */
  function subscribe (action, scope) {
    if (!action || typeof action !== 'function') {
      throw new Error('subscribe requires a function as first argument')
    }
    // use state as default scope
    if (!scope) {
      scope = state
    } else if (!links.has(scope)) {
      throw new Error('cannot subscribe to a scope outside the box state')
    }
    const link = links.get(scope)
    let subscribed = true
    link.bindings.add(action)
    // return unsubscribe method
    return () => {
      if (subscribed) {
        link.bindings.delete(action)
        subscribed = false
      }
    }
  }

  function getNewLink (scope) {
    const link = {
      scope,
      pre: [],
      post: [],
      bindings: new Set()
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
    applyTrigger(scope)
    // the returned link will be stored as a story in the history
    return [link]
  }

  function save (scope) {
    if (!scope) {
      // use state as default scope
      scope = state
    } else if (typeof scope !== 'object') {
      throw new Error('save argument has to be a object or undefined')
    }
    // assure we can add new stories after old ones
    deleteFutureStories()
    // add story to history and increase `now`
    history[now++] = applySave(scope)
  }

  // trigger actions subscribed to a `scope`.
  function applyTrigger (scope) {
    const bindings = links.get(scope).bindings
    if (bindings.size) {
      bindings.forEach(f => f(scope))
    }
  }

  /**
   * call applyTrigger passing `state` as `scope` by default
   * also check passed `scope` is inside state
   * @param {object} scope optional target
   */
  function trigger (scope) {
    if (!scope) return applyTrigger(state)
    // check passed `scope` is inside state
    if (!links.has(scope)) {
      throw new Error('Cannot trigger a scope outside the box')
    }
    applyTrigger(scope)
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
    link.bindings.forEach(f => f(scope))
  }

  function undo (steps) {
    if (!steps || steps && (isNaN(steps) || steps < 1)) {
      steps = 1
    }
    if (now - steps) {
      let i = steps
      while (i) {
        history[--now].forEach(link => {
          link.post.push(link.pre.pop())
          applyStory(link)
        })
        --i
      }
      return steps
    }
    return 0
  }

  function redo (steps) {
    if (!steps || steps && (isNaN(steps) || steps < 1)) {
      steps = 1
    }
    let i = steps
    if (history[now + steps - 1]) {
      while (i) {
        history[now++].forEach(link => {
          link.pre.push(link.post.pop())
          applyStory(link)
        })
        --i
      }
      return steps
    }
    return 0
  }

  // save initial state so we can get back later
  save(state)

  return {
    get: () => state,
    save, trigger, subscribe, undo, redo
  }
}

// this line has to be the last for building purposes
module.exports = boxes
