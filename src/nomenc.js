//
var test = new ScrollUtil({
  'smoothScroll' : true,
  'targetedElements' : {
    '.myCustomElements' : {
      '_visible' : {'activeStateClass' : 'is-visible'}, // aplly css class to element visible within viewport
      '_touching' : {'trigger' : 50, 'activeStateClass' : 'is-touching', 'funcName' : 'anyFuncName'} // apply css class to element touching custom trigger & call custom function
    },
    '.myOthersCustomElements' : {
      '_touching' : {'trigger' : 50, 'activeStateClass' : 'is-visible2', 'ref' : '.nav'} // apply css class to elements touching custom trigger & elements targeting it (w/ href) inside specified 'container' (most likely a nav)
    }
  }
});
function anyFuncName(activeElement){
  console.log(activeElement)
  console.log(test.scrollPos)
}
