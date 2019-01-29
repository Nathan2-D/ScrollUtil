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

  // call the map function once, to set elements state if needed
  this.scrollMap(this);

  // add listener calling map function on scroll
  window.addEventListener('scroll', () => { this.scrollMap(this)  }, { capture: false, passive: true});
}

/*
* ScrollMap
*/
ScrollUtil.prototype.scrollMap = function(self){
  this.updateScrollPos();
  if(!self.hasTargets){
    elementOk = false
    self.allElements.map(function(e){
      if(e._visible){
        if(self.isVisible(e)){
          e.isVisible = true;
          if(e._visible.activeSelector){ e.classList.add(e._visible.activeSelector);}
          if(!elementOk){ self.activeElements.push(e); elementOk = true; };
        }else{
          if(e._visible.activeSelector){ e.classList.remove(e._visible.activeSelector); }
        }
      }
      if(e._touching){
        // calculate & set trigger line if needed
        if(e._touching.triggerLine == undefined){e._touching.triggerLine = ((self.windowHeight/100) * e._touching.trigger)}

        if(self.isTouchingTrigger(e)){
          // found an element meeting condition to be activated
          // call function if given
          if(e._touching.funcName){ window[e._touching.funcName](e); }
          // add activeSelector as a css class if given
          if(e._touching.activeSelector){ e.classList.add(e._touching.activeSelector); }
          // wip..
          if(e._touching.pairingWith){
            var target = document.querySelector(e._touching.pairingWith).querySelectorAll("a[href='#"+e.id+"']")[0];
            target.classList.add(e._touching.activePairSelector);
          }
          // set boolean on object
          e.isTouchingTrigger = true;
          // build an array containing each elements to activate
          if(!elementOk){ self.activeElements.push(e); elementOk = true; }
        }else{
          if(e._touching.activeSelector){ e.classList.remove(e._touching.activeSelector); }
          //
          if(e._touching.pairingWith){
            var target = document.querySelector(e._touching.pairingWith).querySelectorAll("a[href='#"+e.id+"']")[0];
            target.classList.remove(e._touching.activePairSelector);
          }
        }

      }
      // if(e._above){     }
      // if(e._below){     }
    });
  }
  // if activeElements contains at least one element we can assume we have at least one target
  // so we set our boolean, to stop pushing elements in our active elements array
  if(!this.checkTargets()){ this.sethasTargets(true) }
  // function activated one or more elements, lets first check if they still meet the condition to be active & update boolean
  if(self.hasTargets){
    self.activeElements.map(function(activeElement){
      if(activeElement._visible){
        if(self.isVisible(activeElement)){ activeElement.isVisible = true }
        else{ activeElement.isVisible = false }
      }
      if(activeElement._touching){
        // call function if given
        if(activeElement._touching.funcName){ window[activeElement._touching.funcName](activeElement); }
        // check ilegibility & set boolean
        if(self.isTouchingTrigger(activeElement)){ activeElement.isTouchingTrigger = true }
        else{ activeElement.isTouchingTrigger = false }
      }
    });

    // filter activeElements array to remove each elements no longer eligible
    this.refreshActiveElements();

    // check if we still have targets
    if(this.checkTargets()){ this.sethasTargets(false) }
  }
}
/*
* updateScrollPos
*/
ScrollUtil.prototype.updateScrollPos = function(){ this.scrollPos = (window.pageYOffset || document.documentElement.scrollTop)  - (document.documentElement.clientTop || 0); }
/*
* refreshActiveElements
*/
ScrollUtil.prototype.refreshActiveElements = function(){ this.activeElements = this.activeElements.filter(function(e){ return e.isTouchingTrigger === true && e.isVisible === true; }); }
/*
* Init function
* setallElements (called once by the constructor)
*/
ScrollUtil.prototype.setallElements = function(){
  for (target in this.listen) {
    // defaults value for _touching, get overwrited if given
    if(this.listen[target]._touching){ this.listen[target]._touching.trigger = 1; }
    if(this.listen[target]._touching.pairingWith && !this.listen[target]._touching.activePairSelector){ this.listen[target]._touching.activePairSelector = 'is-active'; }

    els = nodeListToArray(document.documentElement.querySelectorAll(target));
    for (index in els) {
      for (prop in this.listen[target]) {
        els[index][prop] = this.listen[target][prop];
      }
    }
    this.allElements = this.allElements.concat(els);
  }
  els = false;
}
/*
* Booleans functions
*/
ScrollUtil.prototype.isVisible = function(e){
  var rect = e.getBoundingClientRect();
  var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  return !(rect.bottom <= 0 || rect.top - viewHeight >= 0);
}
ScrollUtil.prototype.isTouchingTrigger = function(e){ return (e.offsetTop < (e._touching.triggerLine + this.scrollPos)  && Math.round(e.offsetTop + e.clientHeight) > (e._touching.triggerLine + this.scrollPos)) }
ScrollUtil.prototype.checkTargets = function(){ return (this.activeElements.length == 0) }

/*
* Setter/Getter
*/
ScrollUtil.prototype.sethasTargets = function(bool){ this.hasTargets = bool }

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

