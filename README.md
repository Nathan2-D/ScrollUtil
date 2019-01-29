# ScrollUtil.js

lightweight scroll utility with one goals :

**Provide optimized and crossbrowsers tools for commons scroll related actions**

*[WIP] do not use*

>__pull request welcome ;)__


## Getting Started

Clone this repository

```
git clone https://github.com/Nathan2-D/ScrollUtil.git
```

Html to test it :

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ScrollUtil [WIP] - Basic Demo</title>
  <style>
    html{scroll-behavior: smooth;}
    *{margin: 0;padding: 0;box-sizing: border-box;}
    body{
      font-size:62.5%;
      counter-reset: i;
    }
    section{min-height: 100vh;}
    section:after{
      counter-increment: i;
      content: 'Section  #'counters(i, '---');
      display: block;
      width: 100%;
      line-height: 100vh;
      font-family: 'Segoe UI';
      font-size: 4.2em;
      text-align: center;
    }
    section:nth-of-type(even){background:#b9b9b9;}
    .nav{
      width: 100%;
      height: 55px;
      position: fixed;
      top: 0;left: 0;right: 0;
    }
    .nav ul li{
      display: inline-block;
      list-style: none;
    }
    .nav ul li a.is-active{
      background:#999;
    }
  </style>
</head>
<body>
  <nav class="nav">
    <ul>
      <li><a href="#section1">Section 1</a></li>
      <li><a href="#section2">Section 2</a></li>
      <li><a href="#section3">Section 3</a></li>
      <li><a href="#section4">Section 4</a></li>
      <li><a href="#section5">Section 5</a></li>
    </ul>
  </nav>
  <section id="section1" class="myCssClass"></section>
  <section id="section2" class="myCssClass"></section>
  <section id="section3" class="myCssClass"></section>
  <section id="section4" class="myCssClass"></section>
  <section id="section5" class="myCssClass"></section>
  <script src="../src/ScrollUtil.js" ></script>
  <script>
    // better demo and explications coming...
    // smoothScroll(optional/default:false) -> this assume usage of new 'scroll-behavior' css property and fallback for browsers not supporting it
    // listen -> object representing a list of elements SU will track while scrolling happen and their respective configurations
      // .myCssClass -> SU will track all these elements and update their state based on declared activation logic, see below.
        // _touching -> activation logic : element is active only when touching the computed trigger line
          // trigger(optional/default:1) -> represent a percentage of available window height, used to calculate trigger line. like so: triggerLine = (windowHeight/100)*trigger)
          // activeStateClass(optional) -> if declared, active elements receive this css class
          // pairingWith(optional) -> ScrollUtil will find any anchors links linking to active elements** and will apply 'activePairSelector' as css class if declared or 'is-active' by default if not. **eg: if  <div class="element-is-active" id="whatever"></div> is active <div class="nav"><a href="#whatever" class="is-active">Hey ;)</a></div>
          // activePairSelector(optional/default:'is-active') -> if pairingWith is declared
    var test = new ScrollUtil({
      'smoothScroll' : true,
      'listen' : {
        '.myCssClass' : {
          '_touching' : {'trigger' : 1, 'activeSelector' : 'element-is-active', 'pairingWith' : '.nav', 'activePairSelector' : 'is-active'}
          // [WIP] -> '_visible' : {'activeStateClass' : 'is-visible'}
        }
      }
    });
  </script>
</body>
</html>

```


## WIPWIPWIPWIPWIP

Documentations coming soon, eventually ;)


## Authors

* **Nathanaël Demeuse** - *Initial work* - [Nathan2-D](https://github.com/Nathan2-D)

>__pull request welcome ;)__

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

