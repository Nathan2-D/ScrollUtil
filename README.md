# ScrollUtil.js

*[WIP] do not use*

>__pull request welcome ;)__

## Getting Started

Clone this repository

```
git clone https://github.com/Nathan2-D/ScrollUtil.git
```



## Options

```
/*
  * CURRENT OPTIONS
   */

  // smoothScroll : (optional/default:false)
  //    -> this assume usage of new 'scroll-behavior' css property and fallback for browsers not supporting it
  // listen :
  //    -> array of objects representing elements SU will track while scroll happen and their configurations
  // selector : (required) -
  //    -> SU will track all these elements and update their state based on update
  // update :
  //    -> (activation logic) eg : if _touching, element is active only when touching the computed trigger line
  // trigger(optional/default:1)
  //    -> represent a percentage of available window height, used to calculate trigger line. like so: triggerLine = (windowHeight/100)*trigger)
  // events :
  //    -> obj contain :
  //      _>isEligible : name of the event fired when element meet condition
  //      _>lostEligibility : name of the event fired when element lost eligibility (noway)

/*
  * INCOMING
   */

  //  offset for fixed nav (in any direction?)
  //  allow multiples selector and updates methods (array/or pipe?) (eg pipe: 'update' : '_visible|_touching')
  // research on evt deleg/bubbling/propag to find the best solutions
  // (could every evts run in a blackbox sort of things?)
```

## Init
```
var test = new ScrollUtil({
  'smoothScroll' : true,
  'listen' : [
    {'selector' : '.myCssClass', 'update' : '_touching', 'trigger' : 50, 'events' : {'isEligible' : 'myCustomEvent', 'lostEligibility' : 'myOtherCustomEvent'} },
    //{'selector' : '.myOtherCssClass', 'update' : '_visible' }
  ]
});
```
## Listening Custom Events
```
// happen when elements is eligible
  window.addEventListener('myCustomEvent', (e) => {
    elem = e.detail.activeElement;
    console.log('Throwing isEligible event for  '+elem.id+'')
    if(typeof elem.pair == 'undefined'){
      elem.pair = document.querySelector('.nav').querySelectorAll("a[href='#"+elem.id+"']")[0];
    }
    elem.pair.classList.add('is-active');
  });

  // happen when element lost eligibility
  window.addEventListener('myOtherCustomEvent', (e) => {
    elem = e.detail.activeElement;
    console.log('Throwing lostEligibility event for  '+elem.id+'')
    if(typeof elem.pair != 'undefined'){elem.pair.classList.remove('is-active');}
  });
```
## Authors

* **Nathanaël Demeuse** - *Initial work* - [Nathan2-D](https://github.com/Nathan2-D)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

