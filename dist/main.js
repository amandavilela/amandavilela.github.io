(()=>{"use strict";var e,t,n,r,i,o,a,s,c,l,f,u,d,m,p={807:(e,t,n)=>{n.d(t,{Z:()=>f});var r=n(645),i=n.n(r),o=n(667),a=n.n(o),s=new URL(n(595),n.b),c=i()((function(e){return e[1]}));c.push([e.id,"@import url(https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.css);"]);var l=a()(s);c.push([e.id,"html{font-size:16px}body{font-family:'Inconsolata', Consolas}h1,h2,h3,h4,h5,h6{font-family:'Merriweather', serif}h1{font-size:1.5rem}@media (min-width: 1024px){h1{font-size:2.5rem}}p{font-size:1rem;line-height:1.35;margin:.5rem 0}@media (min-width: 768px){p{font-size:1.15rem}}::selection{background:#363636;color:#f9f9fa}::-moz-selection{background:#363636;color:#f9f9fa}*{margin:0;padding:0;box-sizing:border-box}html{overflow-x:hidden;color:#5f5f5f}ul{padding:0;margin:0;list-style:none}img{border:0}a{text-decoration:none}h1,h2,h3,h4,h5,h6{color:#363636}@keyframes type{from{width:0}}@keyframes type2{0%{width:0}50%{width:0}100%{width:100}}@keyframes blink{to{opacity:.0}}main{align-items:center;background:url("+l+") 0 0 no-repeat;background-size:cover;background-attachment:fixed;display:flex;flex-direction:column;justify-content:center;height:100vh}main .container{display:flex;flex-direction:column;justify-content:center;width:75%}@media (min-width: 1024px){main .container{max-width:60em}}main h1{margin:0 0 1rem 0}main p.type:after{content:' ';animation:blink 1s infinite;border-right:solid 1px #000}main .social{display:flex;margin:1.5rem 0}main .social li{margin-right:1rem}main .social li a{background:#363636;border-radius:50%;display:block;height:2.5rem;padding:.5rem;transition:all 0.3s linear;width:2.5rem}main .social li a:hover{opacity:0.7}main .svg-fill{fill:#f9f9fa}main .svg-stroke{stroke:#f9f9fa}\n",""]);const f=c},645:e=>{e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var n=e(t);return t[2]?"@media ".concat(t[2]," {").concat(n,"}"):n})).join("")},t.i=function(e,n,r){"string"==typeof e&&(e=[[null,e,""]]);var i={};if(r)for(var o=0;o<this.length;o++){var a=this[o][0];null!=a&&(i[a]=!0)}for(var s=0;s<e.length;s++){var c=[].concat(e[s]);r&&i[c[0]]||(n&&(c[2]?c[2]="".concat(n," and ").concat(c[2]):c[2]=n),t.push(c))}},t}},667:e=>{e.exports=function(e,t){return t||(t={}),e?(e=String(e.__esModule?e.default:e),/^['"].*['"]$/.test(e)&&(e=e.slice(1,-1)),t.hash&&(e+=t.hash),/["'() \t\n]|(%20)/.test(e)||t.needQuotes?'"'.concat(e.replace(/"/g,'\\"').replace(/\n/g,"\\n"),'"'):e):e}},379:e=>{var t=[];function n(e){for(var n=-1,r=0;r<t.length;r++)if(t[r].identifier===e){n=r;break}return n}function r(e,r){for(var o={},a=[],s=0;s<e.length;s++){var c=e[s],l=r.base?c[0]+r.base:c[0],f=o[l]||0,u="".concat(l," ").concat(f);o[l]=f+1;var d=n(u),m={css:c[1],media:c[2],sourceMap:c[3]};-1!==d?(t[d].references++,t[d].updater(m)):t.push({identifier:u,updater:i(m,r),references:1}),a.push(u)}return a}function i(e,t){var n=t.domAPI(t);return n.update(e),function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap)return;n.update(e=t)}else n.remove()}}e.exports=function(e,i){var o=r(e=e||[],i=i||{});return function(e){e=e||[];for(var a=0;a<o.length;a++){var s=n(o[a]);t[s].references--}for(var c=r(e,i),l=0;l<o.length;l++){var f=n(o[l]);0===t[f].references&&(t[f].updater(),t.splice(f,1))}o=c}}},569:e=>{var t={};e.exports=function(e,n){var r=function(e){if(void 0===t[e]){var n=document.querySelector(e);if(window.HTMLIFrameElement&&n instanceof window.HTMLIFrameElement)try{n=n.contentDocument.head}catch(e){n=null}t[e]=n}return t[e]}(e);if(!r)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");r.appendChild(n)}},216:e=>{e.exports=function(e){var t=document.createElement("style");return e.setAttributes(t,e.attributes),e.insert(t),t}},565:(e,t,n)=>{e.exports=function(e){var t=n.nc;t&&e.setAttribute("nonce",t)}},795:e=>{e.exports=function(e){var t=e.insertStyleElement(e);return{update:function(n){!function(e,t,n){var r=n.css,i=n.media,o=n.sourceMap;i?e.setAttribute("media",i):e.removeAttribute("media"),o&&"undefined"!=typeof btoa&&(r+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(o))))," */")),t.styleTagTransform(r,e)}(t,e,n)},remove:function(){!function(e){if(null===e.parentNode)return!1;e.parentNode.removeChild(e)}(t)}}}},589:e=>{e.exports=function(e,t){if(t.styleSheet)t.styleSheet.cssText=e;else{for(;t.firstChild;)t.removeChild(t.firstChild);t.appendChild(document.createTextNode(e))}}},595:(e,t,n)=>{e.exports=n.p+"18d3d5ef2029c012cf03.jpg"}},h={};function g(e){var t=h[e];if(void 0!==t)return t.exports;var n=h[e]={id:e,exports:{}};return p[e](n,n.exports,g),n.exports}g.m=p,g.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return g.d(t,{a:t}),t},g.d=(e,t)=>{for(var n in t)g.o(t,n)&&!g.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},g.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),g.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e;g.g.importScripts&&(e=g.g.location+"");var t=g.g.document;if(!e&&t&&(t.currentScript&&(e=t.currentScript.src),!e)){var n=t.getElementsByTagName("script");n.length&&(e=n[n.length-1].src)}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),g.p=e})(),g.b=document.baseURI||self.location.href,e=g(379),t=g.n(e),n=g(795),r=g.n(n),i=g(569),o=g.n(i),a=g(565),s=g.n(a),c=g(216),l=g.n(c),f=g(589),u=g.n(f),d=g(807),(m={}).styleTagTransform=u(),m.setAttributes=s(),m.insert=o().bind(null,"head"),m.domAPI=r(),m.insertStyleElement=l(),t()(d.Z,m),d.Z&&d.Z.locals&&d.Z.locals})();