# ScrollUtil.js

*[WIP] do not use*

>__pull request welcome ;)__

[https://codepen.io/Nathan-D/full/XOgryL](basic scrollspy))

## Getting Started

Clone this repository

```
git clone https://github.com/Nathan2-D/ScrollUtil.git
```



## Options

##### CURRENT OPTIONS

**SmoothScroll** : *(optional/default:false)* -> assume usage of new 'scroll-behavior' css property and fallback for browsers not supporting it
  **listen** :  -> array of objects representing elements SU will track while scroll happen and their configurations :
  **selector** : *(required)* -
    SU will track all these elements and update their state based on update
 **update** :
   *(activation logic)* eg : if ```_touching```, element is active only when touching the computed trigger line
 **trigger** *(optional/default:1)*
    represent a percentage of available window height, used to calculate trigger line. like so: ``` triggerLine = (windowHeight/100)*trigger) ```
 **events** :
      -isEligible : name of the event fired when element meet condition
      -lostEligibility : name of the event fired when element lost eligibility (noway)

##### INCOMING
-  offset for fixed nav (any direction)
-  allow multiples selector and updates methods (pipe?) (eg: ```'update' : '_visible|_touching'```)



## Template for testing (emmet)

```
!>.container>(#nav>ul>li*12>a[href=#section$]{Section $})+section.myCssClass#section$*12
```

## Init
```
var test = new ScrollUtil({
  'smoothScroll' : true,
  'listen' : [
    {'selector' : '.myCssClass', 'update' : '_touching', 'trigger' : 50, 'events' : {'isEligible' : 'myCustomEvent', 'lostEligibility' : 'myOtherCustomEvent'} }
  ]
});
```
## Listening Custom Events

```
let curr
// happen when elements is eligible
window.addEventListener('myCustomEvent', (e) => {
  if(!curr){
    curr = e.detail.activeElement
  }
  // change target when we receive a new one
  if(curr != e.detail.activeElement){
    curr = e.detail.activeElement
  }
  // getPair() Element methods / retrieve (href)targeting element
  curr.getPair().classList.add('is-active')
});

// happen when element lost eligibility
window.addEventListener('myOtherCustomEvent', (e) => {
  elem = e.detail.activeElement
  elem.getPair().classList.remove('is-active')
});
```
## Authors

* **Nathanaël Demeuse** - *Initial work* - [Nathan2-D](https://github.com/Nathan2-D)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details

