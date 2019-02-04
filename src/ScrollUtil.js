let defaultConfig = {
  'windowWidth' :  window.innerWidth|| document.documentElement.clientWidth|| document.documentElement.getElementsByTagName('body')[0].clientWidth,
  'windowHeight' :  window.innerHeight|| document.documentElement.clientHeight|| document.documentElement.getElementsByTagName('body')[0].clientHeight,
  'ticking' : false,
  'hasTargets' : false,
  'allElements' : [],
  'slimmedAllElements' : [],
  'activeElements' : []
}
let rAF = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    window.oRequestAnimationFrame
const nodeListToArray = nodeList => [...nodeList]


function ScrollUtil(userConfig){
  this.init(userConfig)
}
/*
* [1] set all elements
 */
ScrollUtil.prototype.init = function(userConfig){
  // 'import' default & user config
  for (dC in defaultConfig) { this[dC] = defaultConfig[dC] }
  for (uC in userConfig) { this[uC] = userConfig[uC] }

  // set smoothScroll if needed
  if(this.smoothScroll){ this.smoothScrolling.init() }

  // retrieve targeted elements / set custom properties given on configuration / store them inside this.allElements
  // create slimmed clone of this.allElements for mapping purpose
  this.setallElements()

  // add listener calling map function on scroll
  this.addListener()
}
/*
* [2] Add listener
 */
ScrollUtil.prototype.addListener = function(){
  if(this.listen){
    window.addEventListener('scroll', () => { this.scrolling()  }, { capture: false, passive: true})
  }
}

/*
* ScrollMap
*/
ScrollUtil.prototype.scrolling = function(){
  this.ticking = false
  // update scroll position
  this.updateScrollPos()
  let lastScrollValue = this.scrollPos

  this.requestTick()
}
ScrollUtil.prototype.requestTick = function(){
  if(!this.ticking){
    self = this
    rAF(function(){ self.scrollMap(self) })
  }
  this.ticking = true
}
ScrollUtil.prototype.scrollMap = function(self){
  // We dont have targets, lets map on allElements[] to find some.
  if(!self.hasTargets){
    self.slimmedAllElements.map(function(e){
      if(e.update && e.update == '_touching'){
        // calculate & set trigger line if needed
        if(e.triggerLine == undefined){e.triggerLine = ((self.windowHeight/100) * e.trigger)}
        // testing conditions
        if(self.isTouchingTrigger(e)){
          // set boolean so self dont get removed from activeElements[] when checkTargets() occurs
          e.isTouchingTrigger = true
          // dispatch event once from here
          self.dispatchEvent(self.createEvent(e.events.isEligible, e))
          // build array containing each elements to activate
          self.activeElements.push(e)
        }
      }
    })
  }

  // check the length of activeElements array to determine wether we still have activated elements or not
  !self.checkTargets() ? self.sethasTargets(true) : self.sethasTargets(false)

  // function activated one or more elements, check if they still meet conditions / update boolean / dispatch corresponding events
  if(self.hasTargets){
    self.activeElements.map(function(activeElement){
      if(activeElement.update && activeElement.update == '_touching'){
        if(self.isTouchingTrigger(activeElement)){
          activeElement.isTouchingTrigger = true
          if(activeElement.events && activeElement.events.isEligible){
            self.dispatchEvent(self.createEvent(activeElement.events.isEligible, activeElement))
          }
        }else{
          activeElement.isTouchingTrigger = false
          if(activeElement.events && activeElement.events.lostEligibility){
            self.dispatchEvent(self.createEvent(activeElement.events.lostEligibility, activeElement))
          }

        }
      }
    })

    // filter activeElements array to remove each elements no longer eligible
    self.refreshActiveElements()
  }
}
/*
* updateScrollPos
*/
ScrollUtil.prototype.updateScrollPos = function(){ this.scrollPos = (window.pageYOffset || document.documentElement.scrollTop)  - (document.documentElement.clientTop || 0) }
/*
* refreshActiveElements
* remove !e.isTouchingTrigger elements from activeElements[]
*/
ScrollUtil.prototype.refreshActiveElements = function(){ this.activeElements = this.activeElements.filter(function(e){ return e.isTouchingTrigger === true }) }
/*
* Init function
* setallElements (called once by the constructor)
*/
ScrollUtil.prototype.setallElements = function(){
    // this function does too much..
    // 1.get all elements we need to 'listen' in arrays
    // 2.copy all prop/value in given listen property directly on elements
    // 3.concatenate arrays into one and send it to this.allElements[]
    // 4.calling slimmingMirror() to set a 'slimmed' version for mapping purpose
  for (arrIndex in this.listen) {
    // default trigger value for trigger, get overwrited if given (obvs, should change this.. )
    if(this.listen[arrIndex].update == '_touching' && !this.listen[arrIndex].trigger){ this.listen[arrIndex].trigger = 1 }

    els = nodeListToArray(document.documentElement.querySelectorAll(this.listen[arrIndex].selector))
    for (index in els) {
      for (prop in this.listen[arrIndex]) {
        els[index][prop] = this.listen[arrIndex][prop]
      }
    }
    this.allElements = this.allElements.concat(els)
  }
  // set a slim version to use for mapping
  if(this.slimmingMirror(this.allElements)){
    this.slimmedAllElements = this.slimmingMirror(this.allElements)
  }
  els = false
}
// garbageeeee
//
ScrollUtil.prototype.slimmingMirror = function(arr){
  let items = []
  let i = 0
  arr.map(function(e){
      items[i] = {}
      items[i].id = e.id
      items[i].offsetTop = e.offsetTop
      items[i].clientHeight = e.clientHeight
      items[i].selector = e.selector
      items[i].update = e.update
      items[i].trigger = e.trigger
      items[i].events = e.events
    i++
  })
  if(items.length === this.allElements.length){return items}else{return false} // issues w/ 'return items' when using shorthand js ??
}


/*
* Booleans functions
*///upcoming update's methods
// ScrollUtil.prototype.isVisible = function(e){
//   let rect = e.getBoundingClientRect()
//   let viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight)
//   return !(rect.bottom <= 0 || rect.top - viewHeight >= 0)
// }

// return true if e isTouchingTrigger
ScrollUtil.prototype.isTouchingTrigger = function(e){ return (e.offsetTop < (e.triggerLine + this.scrollPos)  && Math.round(e.offsetTop + e.clientHeight) > (e.triggerLine + this.scrollPos)) }

// return true when no target
ScrollUtil.prototype.checkTargets = function(){ return (this.activeElements.length == 0) }
/*
* Setter/Getter
*/
ScrollUtil.prototype.sethasTargets = function(bool){ this.hasTargets = bool }
/*
* Event creation & dispatch
 */
ScrollUtil.prototype.createEvent = function(eventName, element){
  let evt = new CustomEvent(
    eventName,
    {
      detail: {
        activeElement : element
      },
      bubbles: false,
      cancelable: true
    }
  )
  return evt
}
ScrollUtil.prototype.dispatchEvent = function(evt){ window.dispatchEvent(evt) }

/*
* smoothscrolling - init if smoothScroll==true
* (assume usage of new css scroll-behavior property, just a fallback for browsers not supporting it)
* did not coded this part here's the src : https://gist.github.com/blinkcursor/ce3172f534777f087cf0
* however, this is in test and may be temporary.
 */
ScrollUtil.prototype.smoothScrolling = {
  init: function() {
    let isSmoothScrollSupported = 'scrollBehavior' in document.documentElement.style
    if (isSmoothScrollSupported) {
      return
    }
    this.bindEvents()
  },
  bindEvents: function() {
    window.addEventListener('click', this.triggerScroll.bind(this), false)
  },
  triggerScroll: function(event) {
    if (event.target.hash && event.target.pathname.replace(/^\//, '') === location.pathname.replace(/^\//, '')) {
      let target = document.getElementById(event.target.hash.slice(1)),
        targetY = this.getElementY(target)
      this.smoothScroll(targetY)
    }
  },
  getElementY: function(element) {
    let y = element.offsetTop,
      node = element
    while (node.offsetParent && node.offsetParent !== document.body) {
      node = node.offsetParent
      y += node.offsetTop
    }
    return y
  },
  getCurrentY: function() {
    // Firefox, Chrome, Opera, Safari
    if (window.self.pageYOffset) {
      return window.self.pageYOffset
    }
    // Internet Explorer 6 - standards mode
    if (document.documentElement && document.documentElement.scrollTop) {
      return document.documentElement.scrollTop
    }
    // Internet Explorer 6, 7 and 8
    if (document.body.scrollTop) {
      return document.body.scrollTop
    }
    return 0
  },
  smoothScroll: function(targetY) {
    let startY = this.getCurrentY(),
      scrollBy = targetY - startY,
      speed = Math.abs(scrollBy / 100),
      increment = scrollBy / 25

    if (Math.abs(scrollBy) < 100) {
      scrollTo(0, targetY)
      return
    }
    let intermediateY
    for (let i = 0; i <= 25; i++) {
      intermediateY = Math.round(startY + i * increment)
      setTimeout("window.scrollTo(0, " + intermediateY + ")", Math.round(i * speed))
    }
  }
}
