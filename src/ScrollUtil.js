var w = window;
var d = document;
var dE = d.documentElement;
var b = dE.getElementsByTagName('body')[0];
var activatedElement;
var allObjects = [];
var defaultConfig = {
  'windowWidth' :  w.innerWidth|| dE.clientWidth|| b.clientWidth,
  'windowHeight' :  w.innerHeight|| dE.clientHeight|| b.clientHeight,
  'hasTargets' : false,
  'allElements' : [],
  'activeElements' : []
}
const nodeListToArray = nodeList => [...nodeList];

function ScrollUtil(userConfig){
  // 'import' default config
  for (dC in defaultConfig) { this[dC] = defaultConfig[dC] }
  // 'import' user config, overwrite default if needed
  for (uC in userConfig) { this[uC] = userConfig[uC] }

  // retrieve targeted elements / set custom properties given on configuration / store them inside this.allElements
  this.setallElements();

  w.addEventListener('scroll', (evt) => { this.scrollMap(evt, this)  }, { capture: false, passive: true});
}

ScrollUtil.prototype.scrollMap = function(evt, self){

  this.updateScrollPos();

  if(!self.hasTargets){
    elementOk = false
    self.allElements.map(function(e){
      if(e._visible){
        if(self.isVisible(e)){
          e.isVisible = true;
          if(e._visible.activeStateClass){ e.classList.add(e._visible.activeStateClass);}
          if(!elementOk){ self.activeElements.push(e); elementOk = true; };
        }else{
          if(e._visible.activeStateClass){ e.classList.remove(e._visible.activeStateClass); }
        }
      }
      if(e._touching && e._touching.trigger){
        // calculate & set trigger line if needed
        if(e._touching.triggerLine == undefined){e._touching.triggerLine = ((self.windowHeight/100) * e._touching.trigger)}

        if(self.isTouchingTrigger(e)){
          // found an element meeting condition to be activated
          // call function if given
          if(e._touching.funcName){ window[e._touching.funcName](e); }
          // add activeStateClass as a css class if given
          if(e._touching.activeStateClass){ e.classList.add(e._touching.activeStateClass); }
          // set boolean on object
          e.isTouchingTrigger = true;
          // build an array containing each elements to activate
          if(!elementOk){ self.activeElements.push(e); elementOk = true; }
        }else{
          if(e._touching.activeStateClass){ e.classList.remove(e._touching.activeStateClass); }
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

ScrollUtil.prototype.setallElements = function(){
  for (target in this.targetedElements) {
    els = nodeListToArray(dE.querySelectorAll(target));
    for (index in els) {
      for (prop in this.targetedElements[target]) {
        els[index][prop] = this.targetedElements[target][prop];
      }
    }
    this.allElements = this.allElements.concat(els);
  }
}

ScrollUtil.prototype.updateScrollPos = function(){
  this.scrollPos = (window.pageYOffset || document.documentElement.scrollTop)  - (document.documentElement.clientTop || 0)
}

ScrollUtil.prototype.refreshActiveElements = function(){
  this.activeElements = this.activeElements.filter(function(e){ return e.isTouchingTrigger === true && e.isVisible === true; });
}

ScrollUtil.prototype.isVisible = function(e){
  var rect = e.getBoundingClientRect();
  var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  return !(rect.bottom <= 0 || rect.top - viewHeight >= 0);
}

ScrollUtil.prototype.isTouchingTrigger = function(e){
  return (e.offsetTop < (e._touching.triggerLine + this.scrollPos)  && Math.round(e.offsetTop + e.clientHeight) > (e._touching.triggerLine + this.scrollPos))
}

ScrollUtil.prototype.checkTargets = function(){
  return (this.activeElements.length == 0)
}

//
//
//

ScrollUtil.prototype.sethasTargets = function(bool){
  this.hasTargets = bool
}

