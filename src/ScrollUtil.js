var defaultConfig = {
  'windowWidth' :  window.innerWidth|| document.documentElement.clientWidth|| document.documentElement.getElementsByTagName('body')[0].clientWidth,
  'windowHeight' :  window.innerHeight|| document.documentElement.clientHeight|| document.documentElement.getElementsByTagName('body')[0].clientHeight,
  'hasTargets' : false,
  'allElements' : [],
  'activeElements' : []
}
const nodeListToArray = nodeList => [...nodeList];

function ScrollUtil(userConfig){
  // 'import' default & user config
  for (dC in defaultConfig) { this[dC] = defaultConfig[dC] }
  for (uC in userConfig) { this[uC] = userConfig[uC] }

  // set smoothScroll if needed
  if(this.smoothScroll){ this.smoothScrolling.init(); }

  // retrieve targeted elements / set custom properties given on configuration / store them inside this.allElements
  this.setallElements();

  // add listener calling map function on scroll
  if(this.listen){
    window.addEventListener('scroll', () => { this.scrollMap(this)  }, { capture: false, passive: true});
  }
}

/*
* ScrollMap
*/
ScrollUtil.prototype.scrollMap = function(self){
  // update scroll position
  this.updateScrollPos();
  //
  if(!self.hasTargets){
    self.allElements.map(function(e){
      if(e.update && e.update == '_touching'){
        // calculate & set trigger line if needed
        if(e.triggerLine == undefined){e.triggerLine = ((self.windowHeight/100) * e.trigger)}

        // build an array containing each elements to activate
        if(self.isTouchingTrigger(e)){ self.activeElements.push(e); }
      }
    });
  }
  // if activeElements contains at least one element we can assume we have at least one target
  // so we set our boolean, to stop pushing elements in our active elements array
  if(!this.checkTargets()){ this.sethasTargets(true) }

  // function activated one or more elements, check if they still meet conditions / update boolean / dispatch corresponding event
  if(self.hasTargets){
    self.activeElements.map(function(activeElement){
      if(activeElement.update && activeElement.update == '_touching'){
        if(self.isTouchingTrigger(activeElement)){
          activeElement.isTouchingTrigger = true;
          if(activeElement.events && activeElement.events.isEligible){ self.dispatchEvent(self.createEvent(activeElement.events.isEligible, activeElement)); }
        }else{
          activeElement.isTouchingTrigger = false;
          if(activeElement.events && activeElement.events.lostEligibility){ self.dispatchEvent(self.createEvent(activeElement.events.lostEligibility, activeElement)); }
        }
      }
    });
    // filter activeElements array to remove each elements no longer eligible
    this.refreshActiveElements();
    // check if we still have targets
    if(this.checkTargets()){ this.sethasTargets(false); }
  }
}
/*
* updateScrollPos
*/
ScrollUtil.prototype.updateScrollPos = function(){ this.scrollPos = (window.pageYOffset || document.documentElement.scrollTop)  - (document.documentElement.clientTop || 0); }
/*
* refreshActiveElements
*/
ScrollUtil.prototype.refreshActiveElements = function(){ this.activeElements = this.activeElements.filter(function(e){ return e.isTouchingTrigger === true }); }
/*
* Init function
* setallElements (called once by the constructor)
*/
ScrollUtil.prototype.setallElements = function(){
  for (arrIndex in this.listen) {
    // default trigger value for trigger, get overwrited if given
    if(this.listen[arrIndex].update == '_touching' && !this.listen[arrIndex].trigger){ this.listen[arrIndex].trigger = 1; }

    els = nodeListToArray(document.documentElement.querySelectorAll(this.listen[arrIndex].selector));
    for (index in els) {
      for (prop in this.listen[arrIndex]) {
        els[index][prop] = this.listen[arrIndex][prop];
      }
    }
    this.allElements = this.allElements.concat(els);
  }
  els = false;
}
/*
* Booleans functions
*///upcoming update's methods
// ScrollUtil.prototype.isVisible = function(e){
//   var rect = e.getBoundingClientRect();
//   var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
//   return !(rect.bottom <= 0 || rect.top - viewHeight >= 0);
// }
ScrollUtil.prototype.isTouchingTrigger = function(e){ return (e.offsetTop < (e.triggerLine + this.scrollPos)  && Math.round(e.offsetTop + e.clientHeight) > (e.triggerLine + this.scrollPos)) }
ScrollUtil.prototype.checkTargets = function(){ return (this.activeElements.length == 0) }

/*
* Setter/Getter
*/
ScrollUtil.prototype.sethasTargets = function(bool){ this.hasTargets = bool }

/*
* Event creation & dispatch
 */
ScrollUtil.prototype.createEvent = function(eventName, element){
  var evt = new CustomEvent(
    eventName,
    {
      detail: {
        activeElement : element
      },
      bubbles: true,
      cancelable: true
    }
  );
  return evt;
}
ScrollUtil.prototype.dispatchEvent = function(evt){ window.dispatchEvent(evt); }

/*
* smoothscrolling - init if smoothScroll==true
* (assume usage of new css scroll-behavior property, just a fallback for browsers not supporting it)
* did not coded this part here's the src : https://gist.github.com/blinkcursor/ce3172f534777f087cf0
* however, this is in test and may be temporary.
 */
ScrollUtil.prototype.smoothScrolling = {
  init: function() {
    var isSmoothScrollSupported = 'scrollBehavior' in document.documentElement.style;
    if (isSmoothScrollSupported) {
      return;
    }
    this.bindEvents();
  },
  bindEvents: function() {
    window.addEventListener('click', this.triggerScroll.bind(this), false);
  },
  triggerScroll: function(event) {
    if (event.target.hash && event.target.pathname.replace(/^\//, '') === location.pathname.replace(/^\//, '')) {
      var target = document.getElementById(event.target.hash.slice(1)),
        targetY = this.getElementY(target);
      this.smoothScroll(targetY);
    }
  },
  getElementY: function(element) {
    var y = element.offsetTop,
      node = element;
    while (node.offsetParent && node.offsetParent !== document.body) {
      node = node.offsetParent;
      y += node.offsetTop;
    }
    return y;
  },
  getCurrentY: function() {
    // Firefox, Chrome, Opera, Safari
    if (window.self.pageYOffset) {
      return window.self.pageYOffset;
    }
    // Internet Explorer 6 - standards mode
    if (document.documentElement && document.documentElement.scrollTop) {
      return document.documentElement.scrollTop;
    }
    // Internet Explorer 6, 7 and 8
    if (document.body.scrollTop) {
      return document.body.scrollTop;
    }
    return 0;
  },
  smoothScroll: function(targetY) {
    var startY = this.getCurrentY(),
      scrollBy = targetY - startY,
      speed = Math.abs(scrollBy / 100),
      increment = scrollBy / 25;

    if (Math.abs(scrollBy) < 100) {
      scrollTo(0, targetY);
      return;
    }
    var intermediateY;
    for (var i = 0; i <= 25; i++) {
      intermediateY = Math.round(startY + i * increment);
      setTimeout("window.scrollTo(0, " + intermediateY + ")", Math.round(i * speed));
    }
  }
};
