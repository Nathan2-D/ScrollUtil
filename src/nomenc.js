//
var test = new ScrollUtil({
  'anchor' : false,
  'targetedElements' : {
    '.myCustomElements' : {
      '_visible' : {'activeStateClass' : 'is-visible'}, // aplly css class to element visible within viewport
      '_touching' : {'trigger' : 50, 'activeStateClass' : 'is-touching', 'funcName' : 'anyFuncName'} // // aplly css class to element touching custom trigger & call custom function
    },
    '.myOthersCustomElements' : {
      '_visible' : {'trigger' : 50, 'activeStateClass' : 'is-visible2'}
    }
  }
});
function anyFuncName(activeElement){
  console.log(activeElement)
  console.log(test.scrollPos)
}
