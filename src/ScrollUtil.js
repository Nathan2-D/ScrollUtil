let defaultConfig = {
  'windowWidth' :  window.innerWidth|| document.documentElement.clientWidth|| document.documentElement.getElementsByTagName('body')[0].clientWidth,
  'windowHeight' :  window.innerHeight|| document.documentElement.clientHeight|| document.documentElement.getElementsByTagName('body')[0].clientHeight,
  'ticking' : false,
  'hasTargets' : false,
  'allElements' : [],
  'slimmedAllElements' : [],
  'activeElements' : []
}
let dataNeeded = ['id', 'listen', 'clientHeight', 'offsetTop']
let rAF = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    window.oRequestAnimationFrame
const nodeListToArray = nodeList => [...nodeList]

// ScrollUtil constructor
function ScrollUtil(userConfig){
  this.init(userConfig)
}

// Element constructor
function Element(element){
  // use of underscore.js _.pick function to keep only properties we need
  // not sure this is useful, basic idea is to 'slim' all objects so they're less heavy for the mapping function..
  // .. currently just keeping id as a reference to the html object, not sure how i want to do this..
  // maybe generate and add one if none specified on 'listened' elements? ..
  // or find another way to retrieve the full object within the DOM when we in need of it.
  this.element = _.pick(element, dataNeeded)

  // default value for trigger
  if(!this.element.listen.trigger){this.element.listen.trigger = 1}

  return this
}

// Element prototype getPair
Element.prototype.getPair = function(){
  return document.querySelectorAll("a[href='#"+this.element.id+"']")[0];
}
/*
* [1] init
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
* Scroll
*/
ScrollUtil.prototype.scrolling = function(){
  this.ticking = false
  // update scroll position
  this.updateScrollPos()

  this.requestTick()
}
ScrollUtil.prototype.requestTick = function(){
  if(!this.ticking){
    self = this
    self.scrollMap(self)
  }
  this.ticking = true
}
ScrollUtil.prototype.scrollMap = function(self){
  // We dont have targets, lets map on allElements[] to find some.
  if(!self.hasTargets){
    self.allElements.map(function(e){
      if(e.element.listen.update && e.element.listen.update == '_touching'){
        // calculate & set trigger line if needed
        if(e.element.listen.triggerLine == undefined){e.element.listen.triggerLine = ((self.windowHeight/100) * e.element.listen.trigger)}
        // testing conditions
        if(self.isTouchingTrigger(e.element)){
          // set boolean so this dont get removed from activeElements[] when checkTargets() occurs
          e.element.isTouchingTrigger = true
          // dispatch event once from here
          self.dispatchEvent(self.createEvent(e.element.listen.events.isEligible, e))
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
      if(activeElement.element.listen.update && activeElement.element.listen.update == '_touching'){
        if(self.isTouchingTrigger(activeElement.element)){
          activeElement.element.isTouchingTrigger = true
          if(activeElement.element.listen.events && activeElement.element.listen.events.isEligible){
            self.dispatchEvent(self.createEvent(activeElement.element.listen.events.isEligible, activeElement))
          }
        }else{
          activeElement.element.isTouchingTrigger = false
          if(activeElement.element.listen.events && activeElement.element.listen.events.lostEligibility){
            self.dispatchEvent(self.createEvent(activeElement.element.listen.events.lostEligibility, activeElement))
          }
        }
      }
    })

    // filter activeElements array to remove each elements no longer eligible
   self.refreshActiveElements()
  }
}

// update scroll position
ScrollUtil.prototype.updateScrollPos = function(){ this.scrollPos = (window.pageYOffset || document.documentElement.scrollTop)  - (document.documentElement.clientTop || 0) }

// remove !e.isTouchingTrigger elements from activeElements[]
ScrollUtil.prototype.refreshActiveElements = function(){ this.activeElements = this.activeElements.filter(function(e){ return e.element.isTouchingTrigger === true }) }

// 1.query all elements targeted by 'listen.selector' in arrays
// 2.copy 'listen' config given directly on targeted object
// 3.instanciate this.allElements[] with the concatenation of all arrays
// 4.calling Element constructor for each element in this array.
ScrollUtil.prototype.setallElements = function(){
  for (arrIndex in this.listen) {
    els = nodeListToArray(document.documentElement.querySelectorAll(this.listen[arrIndex].selector))
    for (index in els) {
      els[index].listen = this.listen[arrIndex]
    }
    this.allElements = this.allElements.concat(els)
  }
  for (arrIndex in this.allElements) {
    this.allElements[arrIndex] = new Element(this.allElements[arrIndex])
  }
  els = false
}

// return true if element is touching the computed trigger line.
ScrollUtil.prototype.isTouchingTrigger = function(e){
  return (e.offsetTop < (e.listen.triggerLine + this.scrollPos)  && Math.round(e.offsetTop + e.clientHeight) > (e.listen.triggerLine + this.scrollPos))
}

// return true if no target
ScrollUtil.prototype.checkTargets = function(){ return (this.activeElements.length == 0) }

// 'main boolean' does the script have activated target or not?
ScrollUtil.prototype.sethasTargets = function(bool){ this.hasTargets = bool }

// event creation
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
// event dispatch
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

