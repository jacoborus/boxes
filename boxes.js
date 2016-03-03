'use strict'

function boxes (state = {}) {
  const links = new Map()
  const history = []

  let hIndex = 0

  function deletePastFuture () {
    if (hIndex < history.length) {
      let toClean = history.splice(hIndex + 1)
      toClean.forEach(story => story.forEach(link => link.post = []))
    }
  }

  function subscribe (action, scope) {
    if (!action || typeof action !== 'function') {
      throw new Error('subscribe requires a function as action argument')
    }
    if (!scope) {
      scope = state
    } else if (typeof scope !== 'object') {
      throw new Error('subscribe requires a object as scope argumnent')
    }
    let link = links.get(scope),
        subscribed = true
    link.bindings.add(action)
    return () => {
      if (subscribed) {
        link.bindings.delete(action)
        subscribed = false
      }
    }
  }

  function save (scope) {
    if (!scope) {
      scope = state
    } else if (typeof scope !== 'object') {
      throw new Error('save argument has to be a object or undefined')
    }
    deletePastFuture()
    history[hIndex++] = saveItem(scope)
  }

  function saveItem (scope) {
    let link = links.get(scope) || links.set(scope, {scope, pre: [], post: [], bindings: new Set()}).get(scope)
    let cp = Array.isArray(scope) ? [] : {}
    Object.keys(scope).forEach(k => {
      let val = scope[k]
      cp[k] = val
      if (val && typeof val === 'object' && !links.has(val)) {
        saveItem(val)
      }
    })
    link.pre.push(cp)
    if (link.bindings.size) {
      link.bindings.forEach(f => f(scope))
    }
    return [link]
  }

  function applyStory (link) {
    link.post.push(link.pre.pop())
    let pre = link.pre[link.pre.length - 1]
    let scope = link.scope
    let keys = Object.keys(pre)
    // delete properties
    Object.keys(scope)
    .filter(i => keys.indexOf(i) < 0)
    .forEach(k => delete scope[k])
    // assign properties
    keys.forEach(k => scope[k] = pre[k])
    link.bindings.forEach(f => f(scope))
  }

  function prevState () {
    if (hIndex - 1) {
      let story = history[--hIndex]
      story.forEach(link => applyStory(link))
    }
  }

  function nextState () {
    if (history[hIndex]) {
      history[hIndex++].forEach(link => applyStory(link))
    }
  }

  save(state)

  return {
    get: () => state,
    save, subscribe, prevState, nextState
  }
}

// this line has to be here for building purposes
module.exports = boxes
