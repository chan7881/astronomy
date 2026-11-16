// ASTRO_WIDGET — 천문 관측 예보 위젯 (https://chan7881.github.io/astronomy/)
// 이 파일은 widget/build.mjs가 만든다. 직접 고치지 않는다.
if (typeof URLSearchParams === 'undefined') {
  globalThis.URLSearchParams = class {
    constructor(o) { this.o = o; }
    toString() { return Object.keys(this.o).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(this.o[k])).join('&'); }
  };
}
const __a = { exports: {} };
(function (module, exports) {
/*
 MIT


    Astronomy library for JavaScript (browser and Node.js).
    https://github.com/cosinekitty/astronomy

    MIT License

    Copyright (c) 2019-2023 Don Cross <cosinekitty@gmail.com>

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/
var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.createTemplateTagFirstArg=function(r){return r.raw=r};$jscomp.createTemplateTagFirstArgWithRaw=function(r,u){r.raw=u;return r};$jscomp.arrayIteratorImpl=function(r){var u=0;return function(){return u<r.length?{done:!1,value:r[u++]}:{done:!0}}};$jscomp.arrayIterator=function(r){return{next:$jscomp.arrayIteratorImpl(r)}};$jscomp.makeIterator=function(r){var u="undefined"!=typeof Symbol&&Symbol.iterator&&r[Symbol.iterator];return u?u.call(r):$jscomp.arrayIterator(r)};
$jscomp.getGlobal=function(r){r=["object"==typeof globalThis&&globalThis,r,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof global&&global];for(var u=0;u<r.length;++u){var e=r[u];if(e&&e.Math==Math)return e}throw Error("Cannot find global object");};$jscomp.global=$jscomp.getGlobal(this);$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.SIMPLE_FROUND_POLYFILL=!1;$jscomp.ISOLATE_POLYFILLS=!1;$jscomp.FORCE_POLYFILL_PROMISE=!1;
$jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(r,u,e){if(r==Array.prototype||r==Object.prototype)return r;r[u]=e.value;return r};$jscomp.IS_SYMBOL_NATIVE="function"===typeof Symbol&&"symbol"===typeof Symbol("x");$jscomp.TRUST_ES6_POLYFILLS=!$jscomp.ISOLATE_POLYFILLS||$jscomp.IS_SYMBOL_NATIVE;$jscomp.polyfills={};$jscomp.propertyToPolyfillSymbol={};
$jscomp.POLYFILL_PREFIX="$jscp$";var $jscomp$lookupPolyfilledValue=function(r,u){var e=$jscomp.propertyToPolyfillSymbol[u];if(null==e)return r[u];e=r[e];return void 0!==e?e:r[u]};$jscomp.polyfill=function(r,u,e,C){u&&($jscomp.ISOLATE_POLYFILLS?$jscomp.polyfillIsolated(r,u,e,C):$jscomp.polyfillUnisolated(r,u,e,C))};
$jscomp.polyfillUnisolated=function(r,u,e,C){e=$jscomp.global;r=r.split(".");for(C=0;C<r.length-1;C++){var A=r[C];if(!(A in e))return;e=e[A]}r=r[r.length-1];C=e[r];u=u(C);u!=C&&null!=u&&$jscomp.defineProperty(e,r,{configurable:!0,writable:!0,value:u})};
$jscomp.polyfillIsolated=function(r,u,e,C){var A=r.split(".");r=1===A.length;C=A[0];C=!r&&C in $jscomp.polyfills?$jscomp.polyfills:$jscomp.global;for(var w=0;w<A.length-1;w++){var Q=A[w];if(!(Q in C))return;C=C[Q]}A=A[A.length-1];e=$jscomp.IS_SYMBOL_NATIVE&&"es6"===e?C[A]:null;u=u(e);null!=u&&(r?$jscomp.defineProperty($jscomp.polyfills,A,{configurable:!0,writable:!0,value:u}):u!==e&&(void 0===$jscomp.propertyToPolyfillSymbol[A]&&($jscomp.propertyToPolyfillSymbol[A]=$jscomp.IS_SYMBOL_NATIVE?$jscomp.global.Symbol(A):
$jscomp.POLYFILL_PREFIX+A),$jscomp.defineProperty(C,$jscomp.propertyToPolyfillSymbol[A],{configurable:!0,writable:!0,value:u})))};$jscomp.polyfill("Math.log10",function(r){return r?r:function(u){return Math.log(u)/Math.LN10}},"es6","es3");$jscomp.polyfill("Number.isFinite",function(r){return r?r:function(u){return"number"!==typeof u?!1:!isNaN(u)&&Infinity!==u&&-Infinity!==u}},"es6","es3");
$jscomp.polyfill("Math.hypot",function(r){return r?r:function(u){if(2>arguments.length)return arguments.length?Math.abs(arguments[0]):0;var e,C,A;for(e=A=0;e<arguments.length;e++)A=Math.max(A,Math.abs(arguments[e]));if(1E100<A||1E-100>A){if(!A)return A;for(e=C=0;e<arguments.length;e++){var w=Number(arguments[e])/A;C+=w*w}return Math.sqrt(C)*A}for(e=C=0;e<arguments.length;e++)w=Number(arguments[e]),C+=w*w;return Math.sqrt(C)}},"es6","es3");
$jscomp.polyfill("Number.MAX_SAFE_INTEGER",function(){return 9007199254740991},"es6","es3");$jscomp.polyfill("Number.isInteger",function(r){return r?r:function(u){return Number.isFinite(u)?u===Math.floor(u):!1}},"es6","es3");$jscomp.polyfill("Number.isSafeInteger",function(r){return r?r:function(u){return Number.isInteger(u)&&Math.abs(u)<=Number.MAX_SAFE_INTEGER}},"es6","es3");
$jscomp.polyfill("Math.cbrt",function(r){return r?r:function(u){if(0===u)return u;u=Number(u);var e=Math.pow(Math.abs(u),1/3);return 0>u?-e:e}},"es6","es3");
(function(r){"object"===typeof exports&&"undefined"!==typeof module?module.exports=r():"function"===typeof define&&define.amd?define([],r):("undefined"!==typeof window?window:"undefined"!==typeof global?global:"undefined"!==typeof self?self:this).Astronomy=r()})(function(){return function(){function r(u,e,C){function A(N,T){if(!e[N]){if(!u[N]){var ka="function"==typeof require&&require;if(!T&&ka)return ka(N,!0);if(w)return w(N,!0);T=Error("Cannot find module '"+N+"'");throw T.code="MODULE_NOT_FOUND",
T;}T=e[N]={exports:{}};u[N][0].call(T.exports,function(sa){return A(u[N][1][sa]||sa)},T,T.exports,r,u,e,C)}return e[N].exports}for(var w="function"==typeof require&&require,Q=0;Q<C.length;Q++)A(C[Q]);return A}return r}()({1:[function(r,u,e){function C(a){switch(a){case m.Sun:return 2.959122082855911E-4;case m.Mercury:return 4.912547451450812E-11;case m.Venus:return 7.243452486162703E-10;case m.Earth:return 8.887692390113509E-10;case m.Moon:return 1.093189565989891E-11;case m.EMB:return 8.997011346712498E-10;
case m.Mars:return 9.549535105779258E-11;case m.Jupiter:return 2.825345909524226E-7;case m.Saturn:return 8.459715185680659E-8;case m.Uranus:return 1.292024916781969E-8;case m.Neptune:return 1.524358900784276E-8;case m.Pluto:return 2.18869976542597E-12;default:throw"Do not know mass product for body: "+a;}}function A(a){if(!0!==a&&!1!==a)throw console.trace(),"Value is not boolean: "+a;return a}function w(a){if(!Number.isFinite(a))throw console.trace(),"Value is not a finite number: "+a;return a}function Q(a){return a-
Math.floor(a)}function N(a,b){var c=a.x*a.x+a.y*a.y+a.z*a.z;if(1E-8>Math.abs(c))throw"AngleBetween: first vector is too short.";var d=b.x*b.x+b.y*b.y+b.z*b.z;if(1E-8>Math.abs(d))throw"AngleBetween: second vector is too short.";a=(a.x*b.x+a.y*b.y+a.z*b.z)/Math.sqrt(c*d);return-1>=a?180:1<=a?0:e.RAD2DEG*Math.acos(a)}function T(a){a=ld.indexOf(a);return 0<=a?md[a]:null}function ka(a){return(a=T(a))&&0<a.dist?a:null}function sa(a){var b=2E3+(a-14)/365.24217;if(-500>b)return a=(b-1820)/100,-20+32*a*a;
if(500>b){a=b/100;b=a*a;var c=a*b;return 10583.6-1014.41*a+33.78311*b-5.952053*c-.1798452*b*b+.022174192*b*c+.0090316521*c*c}if(1600>b)return a=(b-1E3)/100,b=a*a,c=a*b,1574.2-556.01*a+71.23472*b+.319781*c-.8503463*b*b-.005050998*b*c+.0083572073*c*c;if(1700>b)return a=b-1600,b=a*a,120-.9808*a-.01532*b+a*b/7129;if(1800>b)return a=b-1700,b=a*a,8.83+.1603*a-.0059285*b+1.3336E-4*a*b-b*b/1174E3;if(1860>b){a=b-1800;b=a*a;c=a*b;var d=b*b;return 13.72-.332447*a+.0068612*b+.0041116*c-3.7436E-4*d+1.21272E-5*
b*c-1.699E-7*c*c+8.75E-10*c*d}if(1900>b)return a=b-1860,b=a*a,c=a*b,7.62+.5737*a-.251754*b+.01680668*c-4.473624E-4*b*b+b*c/233174;if(1920>b)return a=b-1900,b=a*a,-2.79+1.494119*a-.0598939*b+.0061966*a*b-1.97E-4*b*b;if(1941>b)return a=b-1920,b=a*a,21.2+.84493*a-.0761*b+.0020936*a*b;if(1961>b)return a=b-1950,b=a*a,29.07+.407*a-b/233+a*b/2547;if(1986>b)return a=b-1975,b=a*a,45.45+1.067*a-b/260-a*b/718;if(2005>b)return a=b-2E3,b=a*a,c=a*b,63.86+.3345*a-.060374*b+.0017275*c+6.51814E-4*b*b+2.373599E-5*
b*c;if(2050>b)return a=b-2E3,62.92+.32217*a+.005589*a*a;if(2150>b)return a=(b-1820)/100,-20+32*a*a-.5628*(2150-b);a=(b-1820)/100;return-20+32*a*a}function Vb(a){return a+Wb(a)/86400}function v(a){return a instanceof O?a:new O(a)}function Xb(a){a=a.tt/36525;return(((((-4.34E-8*a-5.76E-7)*a+.0020034)*a-1.831E-4)*a-46.836769)*a+84381.406)/3600}function da(a){if(!$a||1E-6<Math.abs($a.tt-a.tt)){var b=a.tt/36525;var c=(1287104.79305+1.295965810481E8*b)%1296E3*4.84813681109536E-6;var d=(335779.526232+1.7395272628478E9*
b)%1296E3*4.84813681109536E-6,f=(450160.398036-6962890.5431*b)%1296E3*4.84813681109536E-6,g=Math.sin(f),h=Math.cos(f),l=(-172064161-174666*b)*g+33386*h,k=(92052331+9086*b)*h+15377*g;h=2*(d-(1072260.70369+1.602961601209E9*b)%1296E3*4.84813681109536E-6+f);g=Math.sin(h);h=Math.cos(h);l+=(-13170906-1675*b)*g-13696*h;k+=(5730336-3015*b)*h-4587*g;h=2*(d+f);g=Math.sin(h);h=Math.cos(h);l+=(-2276413-234*b)*g+2796*h;k+=(978459-485*b)*h+1374*g;h=2*f;g=Math.sin(h);h=Math.cos(h);l+=(2074554+207*b)*g-698*h;k+=
(-897492+470*b)*h-291*g;g=Math.sin(c);h=Math.cos(c);c=-1.35E-4+1E-7*(l+((1475877-3633*b)*g+11817*h));b=3.88E-4+1E-7*(k+((73871-184*b)*h-1924*g));g=Xb(a);$a={tt:a.tt,dpsi:c,deps:b,ee:c*Math.cos(g*e.DEG2RAD)/15,mobl:g,tobl:g+b/3600}}return $a}function Yb(a,b){var c=a*e.DEG2RAD;a=Math.cos(c);c=Math.sin(c);return[b[0],b[1]*a-b[2]*c,b[1]*c+b[2]*a]}function ea(a){function b(D,G,P,fa){for(var L=[],ta=0;ta<=G-D;++ta){var ua=L,ub=ua.push,vb,Zb=P,nd=fa,$b=[];for(vb=0;vb<=nd-Zb;++vb)$b.push(0);ub.call(ua,{min:Zb,
array:$b})}return{min:D,array:L}}function c(D,G,P){D=D.array[G-D.min];return D.array[P-D.min]}function d(D,G,P){D=y.array[D-y.min];D.array[G-D.min]=P}function f(D,G,P){D=x.array[D-x.min];D.array[G-D.min]=P}function g(D,G,P,fa,L){L(D*P-G*fa,G*P+D*fa)}function h(D){return Math.sin(U*D)}function l(D,G,P,fa){var L={x:1,y:0};D=[0,D,G,P,fa];for(G=1;4>=G;++G)0!==D[G]&&g(L.x,L.y,c(y,D[G],G),c(x,D[G],G),function(ta,ua){return L.x=ta,L.y=ua});return L}function k(D,G,P,fa,L,ta,ua,ub){L=l(L,ta,ua,ub);q+=D*L.y;
t+=G*L.y;ab+=P*L.x;va+=fa*L.x}++e.CalcMoonCount;a=a.tt/36525;var n,p,q,t,y=b(-6,6,1,4),x=b(-6,6,1,4);var z=a*a;var ab=t=q=0;var va=3422.7;var la=h(.19833+.05611*a);var ha=h(.27869+.04508*a);var V=h(.16827-.36903*a);var ba=h(.34734-5.37261*a);var La=h(.10498-5.37899*a);var bb=h(.42681-.41855*a),od=h(.14943-5.37511*a);var cb=.84*la+.31*ha+14.27*V+7.26*ba+.28*La+.24*bb;var wb=2.94*la+.31*ha+14.27*V+9.34*ba+1.12*La+.83*bb;var db=-6.4*la-1.89*bb;ha=.21*la+.31*ha+14.27*V-88.7*ba-15.3*La+.24*bb-1.86*od;
V=cb-db;la=-3.332E-6*h(.59734-5.37261*a)-5.39E-7*h(.35498-5.37899*a)-6.4E-8*h(.39943-5.37511*a);cb=U*Q(.60643382+1336.85522467*a-3.13E-6*z)+cb/ia;wb=U*Q(.37489701+1325.55240982*a+2.565E-5*z)+wb/ia;db=U*Q(.99312619+99.99735956*a-4.4E-7*z)+db/ia;ha=U*Q(.25909118+1342.2278298*a-8.92E-6*z)+ha/ia;La=U*Q(.82736186+1236.85308708*a-3.97E-6*z)+V/ia;for(n=1;4>=n;++n){switch(n){case 1:V=wb;z=4;ba=1.000002208;break;case 2:V=db;z=3;ba=.997504612-.002495388*a;break;case 3:V=ha;z=4;ba=1.000002708+139.978*la;break;
case 4:V=La;z=6;ba=1;break;default:throw"Internal error: I = "+n;}d(0,n,1);d(1,n,Math.cos(V)*ba);f(0,n,0);f(1,n,Math.sin(V)*ba);for(p=2;p<=z;++p)g(c(y,p-1,n),c(x,p-1,n),c(y,1,n),c(x,1,n),function(D,G){return d(p,n,D),f(p,n,G)});for(p=1;p<=z;++p)d(-p,n,c(y,p,n)),f(-p,n,-c(x,p,n))}k(13.902,14.06,-.001,.2607,0,0,0,4);k(.403,-4.01,.394,.0023,0,0,0,3);k(2369.912,2373.36,.601,28.2333,0,0,0,2);k(-125.154,-112.79,-.725,-.9781,0,0,0,1);k(1.979,6.98,-.445,.0433,1,0,0,4);k(191.953,192.72,.029,3.0861,1,0,0,2);
k(-8.466,-13.51,.455,-.1093,1,0,0,1);k(22639.5,22609.07,.079,186.5398,1,0,0,0);k(18.609,3.59,-.094,.0118,1,0,0,-1);k(-4586.465,-4578.13,-.077,34.3117,1,0,0,-2);k(3.215,5.44,.192,-.0386,1,0,0,-3);k(-38.428,-38.64,.001,.6008,1,0,0,-4);k(-.393,-1.43,-.092,.0086,1,0,0,-6);k(-.289,-1.59,.123,-.0053,0,1,0,4);k(-24.42,-25.1,.04,-.3,0,1,0,2);k(18.023,17.93,.007,.1494,0,1,0,1);k(-668.146,-126.98,-1.302,-.3997,0,1,0,0);k(.56,.32,-.001,-.0037,0,1,0,-1);k(-165.145,-165.06,.054,1.9178,0,1,0,-2);k(-1.877,-6.46,
-.416,.0339,0,1,0,-4);k(.213,1.02,-.074,.0054,2,0,0,4);k(14.387,14.78,-.017,.2833,2,0,0,2);k(-.586,-1.2,.054,-.01,2,0,0,1);k(769.016,767.96,.107,10.1657,2,0,0,0);k(1.75,2.01,-.018,.0155,2,0,0,-1);k(-211.656,-152.53,5.679,-.3039,2,0,0,-2);k(1.225,.91,-.03,-.0088,2,0,0,-3);k(-30.773,-34.07,-.308,.3722,2,0,0,-4);k(-.57,-1.4,-.074,.0109,2,0,0,-6);k(-2.921,-11.75,.787,-.0484,1,1,0,2);k(1.267,1.52,-.022,.0164,1,1,0,1);k(-109.673,-115.18,.461,-.949,1,1,0,0);k(-205.962,-182.36,2.056,1.4437,1,1,0,-2);k(.233,
.36,.012,-.0025,1,1,0,-3);k(-4.391,-9.66,-.471,.0673,1,1,0,-4);k(.283,1.53,-.111,.006,1,-1,0,4);k(14.577,31.7,-1.54,.2302,1,-1,0,2);k(147.687,138.76,.679,1.1528,1,-1,0,0);k(-1.089,.55,.021,0,1,-1,0,-1);k(28.475,23.59,-.443,-.2257,1,-1,0,-2);k(-.276,-.38,-.006,-.0036,1,-1,0,-3);k(.636,2.27,.146,-.0102,1,-1,0,-4);k(-.189,-1.68,.131,-.0028,0,2,0,2);k(-7.486,-.66,-.037,-.0086,0,2,0,0);k(-8.096,-16.35,-.74,.0918,0,2,0,-2);k(-5.741,-.04,0,-9E-4,0,0,2,2);k(.255,0,0,0,0,0,2,1);k(-411.608,-.2,0,-.0124,0,0,
2,0);k(.584,.84,0,.0071,0,0,2,-1);k(-55.173,-52.14,0,-.1052,0,0,2,-2);k(.254,.25,0,-.0017,0,0,2,-3);k(.025,-1.67,0,.0031,0,0,2,-4);k(1.06,2.96,-.166,.0243,3,0,0,2);k(36.124,50.64,-1.3,.6215,3,0,0,0);k(-13.193,-16.4,.258,-.1187,3,0,0,-2);k(-1.187,-.74,.042,.0074,3,0,0,-4);k(-.293,-.31,-.002,.0046,3,0,0,-6);k(-.29,-1.45,.116,-.0051,2,1,0,2);k(-7.649,-10.56,.259,-.1038,2,1,0,0);k(-8.627,-7.59,.078,-.0192,2,1,0,-2);k(-2.74,-2.54,.022,.0324,2,1,0,-4);k(1.181,3.32,-.212,.0213,2,-1,0,2);k(9.703,11.67,-.151,
.1268,2,-1,0,0);k(-.352,-.37,.001,-.0028,2,-1,0,-1);k(-2.494,-1.17,-.003,-.0017,2,-1,0,-2);k(.36,.2,-.012,-.0043,2,-1,0,-4);k(-1.167,-1.25,.008,-.0106,1,2,0,0);k(-7.412,-6.12,.117,.0484,1,2,0,-2);k(-.311,-.65,-.032,.0044,1,2,0,-4);k(.757,1.82,-.105,.0112,1,-2,0,2);k(2.58,2.32,.027,.0196,1,-2,0,0);k(2.533,2.4,-.014,-.0212,1,-2,0,-2);k(-.344,-.57,-.025,.0036,0,3,0,-2);k(-.992,-.02,0,0,1,0,2,2);k(-45.099,-.02,0,-.001,1,0,2,0);k(-.179,-9.52,0,-.0833,1,0,2,-2);k(-.301,-.33,0,.0014,1,0,2,-4);k(-6.382,-3.37,
0,-.0481,1,0,-2,2);k(39.528,85.13,0,-.7136,1,0,-2,0);k(9.366,.71,0,-.0112,1,0,-2,-2);k(.202,.02,0,0,1,0,-2,-4);k(.415,.1,0,.0013,0,1,2,0);k(-2.152,-2.26,0,-.0066,0,1,2,-2);k(-1.44,-1.3,0,.0014,0,1,-2,2);k(.384,-.04,0,0,0,1,-2,-2);k(1.938,3.6,-.145,.0401,4,0,0,0);k(-.952,-1.58,.052,-.013,4,0,0,-2);k(-.551,-.94,.032,-.0097,3,1,0,0);k(-.482,-.57,.005,-.0045,3,1,0,-2);k(.681,.96,-.026,.0115,3,-1,0,0);k(-.297,-.27,.002,-9E-4,2,2,0,-2);k(.254,.21,-.003,0,2,-2,0,-2);k(-.25,-.22,.004,.0014,1,3,0,-2);k(-3.996,
0,0,4E-4,2,0,2,0);k(.557,-.75,0,-.009,2,0,2,-2);k(-.459,-.38,0,-.0053,2,0,-2,2);k(-1.298,.74,0,4E-4,2,0,-2,0);k(.538,1.14,0,-.0141,2,0,-2,-2);k(.263,.02,0,0,1,1,2,0);k(.426,.07,0,-6E-4,1,1,-2,-2);k(-.304,.03,0,3E-4,1,-1,2,0);k(-.372,-.19,0,-.0027,1,-1,-2,2);k(.418,0,0,0,0,0,4,0);k(-.33,-.04,0,0,3,0,2,0);z=-526.069*l(0,0,1,-2).y;z+=-3.352*l(0,0,1,-4).y;z+=44.297*l(1,0,1,-2).y;z+=-6*l(1,0,1,-4).y;z+=20.599*l(-1,0,1,0).y;z+=-30.598*l(-1,0,1,-2).y;z+=-24.649*l(-2,0,1,0).y;z+=-2*l(-2,0,1,-2).y;z+=-22.571*
l(0,1,1,-2).y;z+=10.985*l(0,-1,1,-2).y;q+=.82*h(.7736-62.5512*a)+.31*h(.0466-125.1025*a)+.35*h(.5785-25.1042*a)+.66*h(.4591+1335.8075*a)+.64*h(.313-91.568*a)+1.14*h(.148+1331.2898*a)+.21*h(.5918+1056.5859*a)+.44*h(.5784+1322.8595*a)+.24*h(.2275-5.7374*a)+.28*h(.2965+2.6929*a)+.33*h(.3132+6.3368*a);a=ha+t/ia;a=(1.000002708+139.978*la)*(18518.511+1.189+ab)*Math.sin(a)-6.24*Math.sin(3*a)+z;return{geo_eclip_lon:U*Q((cb+q/ia)/U),geo_eclip_lat:Math.PI/648E3*a,distance_au:ia*pd/(.999953253*va)}}function ac(a,
b){return[a.rot[0][0]*b[0]+a.rot[1][0]*b[1]+a.rot[2][0]*b[2],a.rot[0][1]*b[0]+a.rot[1][1]*b[1]+a.rot[2][1]*b[2],a.rot[0][2]*b[0]+a.rot[1][2]*b[1]+a.rot[2][2]*b[2]]}function wa(a,b,c){b=Ma(b,c);return ac(b,a)}function Ma(a,b){a=a.tt/36525;var c=84381.406,d=((((3.337E-7*a-4.67E-7)*a-.00772503)*a+.0512623)*a-.025754)*a+c;c*=4.84813681109536E-6;var f=((((-9.51E-8*a+1.32851E-4)*a-.00114045)*a-1.0790069)*a+5038.481507)*a*4.84813681109536E-6;d*=4.84813681109536E-6;var g=((((-5.6E-8*a+1.70663E-4)*a-.00121197)*
a-2.3814292)*a+10.556403)*a*4.84813681109536E-6;a=Math.sin(c);c=Math.cos(c);var h=Math.sin(-f);f=Math.cos(-f);var l=Math.sin(-d);d=Math.cos(-d);var k=Math.sin(g),n=Math.cos(g);g=n*f-h*k*d;var p=n*h*c+k*d*f*c-a*k*l,q=n*h*a+k*d*f*a+c*k*l,t=-k*f-h*n*d,y=-k*h*c+n*d*f*c-a*n*l;k=-k*h*a+n*d*f*a+c*n*l;h*=l;n=-l*f*c-a*d;a=-l*f*a+d*c;if(b===F.Into2000)return new J([[g,p,q],[t,y,k],[h,n,a]]);if(b===F.From2000)return new J([[g,t,h],[p,y,n],[q,k,a]]);throw"Invalid precess direction";}function ca(a){if(!eb||eb.tt!==
a.tt){var b=a.tt/36525,c=15*da(a).ee,d=(.779057273264+.00273781191135448*a.ut+a.ut%1)%1*360;0>d&&(d+=360);b=((c+.014506+((((-3.68E-8*b-2.9956E-5)*b-4.4E-7)*b+1.3915817)*b+4612.156534)*b)/3600+d)%360/15;0>b&&(b+=24);eb={tt:a.tt,st:b}}return eb.st}function bc(a){a=v(a);return ca(a)}function xb(a,b){var c=a.latitude*e.DEG2RAD,d=Math.sin(c);c=Math.cos(c);var f=1/Math.hypot(c,.996647180302104*d),g=a.height/1E3,h=6378.1366*f+g;b=(15*b+a.longitude)*e.DEG2RAD;a=Math.sin(b);b=Math.cos(b);return{pos:[h*c*b/
e.KM_PER_AU,h*c*a/e.KM_PER_AU,(6335.438815127603*f+g)*d/e.KM_PER_AU],vel:[-7.292115E-5*h*c*a*86400/e.KM_PER_AU,7.292115E-5*h*c*b*86400/e.KM_PER_AU,0]}}function xa(a,b,c){b=Na(b,c);return ac(b,a)}function Na(a,b){a=da(a);var c=a.mobl*e.DEG2RAD,d=a.tobl*e.DEG2RAD,f=4.84813681109536E-6*a.dpsi;a=Math.cos(c);c=Math.sin(c);var g=Math.cos(d),h=Math.sin(d);d=Math.cos(f);var l=Math.sin(f);f=-l*a;var k=-l*c,n=l*g,p=d*a*g+c*h,q=d*c*g-a*h;l*=h;var t=d*a*h-c*g;a=d*c*h+a*g;if(b===F.From2000)return new J([[d,n,
l],[f,p,t],[k,q,a]]);if(b===F.Into2000)return new J([[d,f,k],[n,p,q],[l,t,a]]);throw"Invalid precess direction";}function fb(a,b,c){return c===F.Into2000?wa(xa(a,b,c),b,c):xa(wa(a,b,c),b,c)}function cc(a,b){var c=ca(a);b=xb(b,c).pos;return fb(b,a,F.Into2000)}function qd(a){if(!(a instanceof Array)||3!==a.length)return!1;for(var b=0;3>b;++b){if(!(a[b]instanceof Array)||3!==a[b].length)return!1;for(var c=0;3>c;++c)if(!Number.isFinite(a[b][c]))return!1}return!0}function yb(a,b){return new E(a[0],a[1],
a[2],b)}function dc(a,b){b=yb(a,b);var c=b.x*b.x+b.y*b.y,d=Math.sqrt(c+b.z*b.z);if(0===c){if(0===b.z)throw"Indeterminate sky coordinates";return new gb(0,0>b.z?-90:90,d,b)}var f=e.RAD2HOUR*Math.atan2(b.y,b.x);0>f&&(f+=24);return new gb(f,e.RAD2DEG*Math.atan2(a[2],Math.sqrt(c)),d,b)}function ya(a,b){var c=a*e.DEG2RAD;a=Math.cos(c);c=Math.sin(c);return[a*b[0]+c*b[1],a*b[1]-c*b[0],b[2]]}function hb(a,b,c,d,f){a=v(a);za(b);w(c);w(d);var g=Math.sin(b.latitude*e.DEG2RAD),h=Math.cos(b.latitude*e.DEG2RAD),
l=Math.sin(b.longitude*e.DEG2RAD),k=Math.cos(b.longitude*e.DEG2RAD);b=Math.sin(d*e.DEG2RAD);var n=Math.cos(d*e.DEG2RAD),p=Math.sin(c*e.HOUR2RAD),q=Math.cos(c*e.HOUR2RAD),t=[h*k,h*l,g];g=[-g*k,-g*l,h];l=[l,-k,0];h=-15*ca(a);a=ya(h,t);t=ya(h,g);l=ya(h,l);b=[n*q,n*p,b];p=b[0]*a[0]+b[1]*a[1]+b[2]*a[2];n=b[0]*t[0]+b[1]*t[1]+b[2]*t[2];t=b[0]*l[0]+b[1]*l[1]+b[2]*l[2];q=Math.hypot(n,t);0<q?(n=-e.RAD2DEG*Math.atan2(t,n),0>n&&(n+=360)):n=0;p=e.RAD2DEG*Math.atan2(q,p);q=d;if(f&&(d=p,f=Oa(f,90-p),p-=f,0<f&&3E-4<
p)){c=Math.sin(p*e.DEG2RAD);q=Math.cos(p*e.DEG2RAD);t=Math.sin(d*e.DEG2RAD);d=Math.cos(d*e.DEG2RAD);f=[];for(l=0;3>l;++l)f.push((b[l]-d*a[l])/t*c+a[l]*q);q=Math.hypot(f[0],f[1]);0<q?(c=e.RAD2HOUR*Math.atan2(f[1],f[0]),0>c&&(c+=24)):c=0;q=e.RAD2DEG*Math.atan2(f[2],q)}return new ec(n,90-p,c,q)}function za(a){if(!(a instanceof zb))throw"Not an instance of the Observer class: "+a;w(a.latitude);w(a.longitude);w(a.height);if(-90>a.latitude||90<a.latitude)throw"Latitude "+a.latitude+" is out of range. Must be -90..+90.";
return a}function fc(a){a=v(a).AddDays(-1/e.C_AUDAY);var b=Aa(M.Earth,a),c=$jscomp.makeIterator(fb([-b.x,-b.y,-b.z],a,F.From2000));b=c.next().value;var d=c.next().value,f=c.next().value,g=e.DEG2RAD*da(a).tobl;c=Math.cos(g);g=Math.sin(g);a=new E(b,d,f,a);return Ab(a,c,g)}function Pa(a,b,c,d,f){za(c);A(d);A(f);b=v(b);c=cc(b,c);a=W(a,b,f);a=[a.x-c[0],a.y-c[1],a.z-c[2]];if(!d)return dc(a,b);d=fb(a,b,F.From2000);return dc(d,b)}function Ab(a,b,c){var d=a.x,f=a.y*b+a.z*c;c=-a.y*c+a.z*b;var g=Math.hypot(d,
f);b=0;0<g&&(b=e.RAD2DEG*Math.atan2(f,d),0>b&&(b+=360));g=e.RAD2DEG*Math.atan2(c,g);a=new E(d,f,c,a.t);return new gc(a,g,b)}function Qa(a){var b=da(a.t),c=wa([a.x,a.y,a.z],a.t,F.From2000),d=$jscomp.makeIterator(xa(c,a.t,F.From2000));c=d.next().value;var f=d.next().value;d=d.next().value;a=new E(c,f,d,a.t);b=b.tobl*e.DEG2RAD;return Ab(a,Math.cos(b),Math.sin(b))}function Y(a){a=v(a);var b=ea(a),c=b.distance_au*Math.cos(b.geo_eclip_lat);b=[c*Math.cos(b.geo_eclip_lon),c*Math.sin(b.geo_eclip_lon),b.distance_au*
Math.sin(b.geo_eclip_lat)];b=Yb(Xb(a),b);b=wa(b,a,F.Into2000);return new E(b[0],b[1],b[2],a)}function ib(a){var b=v(a);a=ea(b);var c=a.distance_au*Math.cos(a.geo_eclip_lat),d=[c*Math.cos(a.geo_eclip_lon),c*Math.sin(a.geo_eclip_lon),a.distance_au*Math.sin(a.geo_eclip_lat)];c=da(b);d=Yb(c.mobl,d);d=xa(d,b,F.From2000);b=yb(d,b);c=c.tobl*e.DEG2RAD;b=Ab(b,Math.cos(c),Math.sin(c));return new Ba(b.elat,b.elon,a.distance_au)}function Ra(a){a=v(a);var b=a.AddDays(-1E-5),c=a.AddDays(1E-5);b=Y(b);c=Y(c);return new I((b.x+
c.x)/2,(b.y+c.y)/2,(b.z+c.z)/2,(c.x-b.x)/2E-5,(c.y-b.y)/2E-5,(c.z-b.z)/2E-5,a)}function Bb(a){a=v(a);var b=Ra(a);return new I(b.x/82.30056,b.y/82.30056,b.z/82.30056,b.vx/82.30056,b.vy/82.30056,b.vz/82.30056,a)}function ma(a,b,c){var d=1,f=0;a=$jscomp.makeIterator(a);for(var g=a.next();!g.done;g=a.next()){var h=0;g=$jscomp.makeIterator(g.value);for(var l=g.next();!l.done;l=g.next()){var k=$jscomp.makeIterator(l.value);l=k.next().value;var n=k.next().value;k=k.next().value;h+=l*Math.cos(n+b*k)}h*=d;
c&&(h%=U);f+=h;d*=b}return f}function Cb(a,b){var c=1,d=0,f=0,g=0;a=$jscomp.makeIterator(a);for(var h=a.next();!h.done;h=a.next()){var l=0,k=0;h=$jscomp.makeIterator(h.value);for(var n=h.next();!n.done;n=h.next()){var p=$jscomp.makeIterator(n.value);n=p.next().value;var q=p.next().value;p=p.next().value;q+=b*p;l+=n*p*Math.sin(q);0<g&&(k+=n*Math.cos(q))}f+=g*d*k-c*l;d=c;c*=b;++g}return f}function Db(a){return new B(a[0]+4.4036E-7*a[1]-1.90919E-7*a[2],-4.79966E-7*a[0]+.917482137087*a[1]-.397776982902*
a[2],.397776982902*a[1]+.917482137087*a[2])}function hc(a,b,c){var d=c*Math.cos(b);return[d*Math.cos(a),d*Math.sin(a),c*Math.sin(b)]}function Aa(a,b){var c=b.tt/365250,d=ma(a[0],c,!0),f=ma(a[1],c,!1);a=ma(a[2],c,!1);d=hc(d,f,a);return Db(d).ToAstroVector(b)}function Sa(a,b){var c=b/365250,d=ma(a[0],c,!0),f=ma(a[1],c,!1),g=ma(a[2],c,!1),h=Cb(a[0],c),l=Cb(a[1],c);c=Cb(a[2],c);var k=Math.cos(d),n=Math.sin(d),p=Math.cos(f),q=Math.sin(f);a=+(c*p*k)-g*q*k*l-g*p*n*h;h=+(c*p*n)-g*q*n*l+g*p*k*h;l=+(c*q)+g*
p*l;d=hc(d,f,g);f=[a/365250,h/365250,l/365250];d=Db(d);f=Db(f);return new X(b,d,f)}function jb(a,b,c,d){d/=d+2.959122082855911E-4;b=Aa(M[c],b);a.x+=d*b.x;a.y+=d*b.y;a.z+=d*b.z}function R(a,b,c,d){d/=d+2.959122082855911E-4;b=Sa(M[c],b);a.r.incr(b.r.mul(d));a.v.incr(b.v.mul(d));return b}function Ta(a,b,c){a=c.sub(a);c=a.quadrature();return a.mul(b/(c*Math.sqrt(c)))}function Ca(a,b,c,d){return new B(b.x+a*(c.x+a*d.x/2),b.y+a*(c.y+a*d.y/2),b.z+a*(c.z+a*d.z/2))}function Eb(a,b,c){return new B(b.x+a*c.x,
b.y+a*c.y,b.z+a*c.z)}function Fb(a,b){var c=a-b.tt,d=new Da(a),f=Ca(c,b.r,b.v,b.a),g=d.Acceleration(f).mean(b.a);f=Ca(c,b.r,b.v,g);b=b.v.add(g.mul(c));c=d.Acceleration(f);a=new Ua(a,f,b,c);return new ic(d,a)}function jc(a,b){a=Math.floor(a);return 0>a?0:a>=b?b-1:a}function Gb(a){var b=$jscomp.makeIterator(a);a=b.next().value;var c=$jscomp.makeIterator(b.next().value);var d=c.next().value;var f=c.next().value;c=c.next().value;var g=$jscomp.makeIterator(b.next().value);b=g.next().value;var h=g.next().value;
g=g.next().value;d=new X(a,new B(d,f,c),new B(b,h,g));a=new Da(d.tt);f=d.r.add(a.Sun.r);c=d.v.add(a.Sun.v);b=a.Acceleration(f);d=new Ua(d.tt,f,c,b);return new ic(a,d)}function kc(a,b,c){a=Gb(a);for(var d=Math.ceil((b-a.grav.tt)/c),f=0;f<d;++f)a=Fb(f+1===d?b:a.grav.tt+c,a.grav);return a}function Hb(a,b){var c=a.tt;var d=na[0][0];if(c<d||c>na[50][0])c=null;else{c=jc((c-d)/29200,50);if(!Ib[c]){d=Ib[c]=[];d[0]=Gb(na[c]).grav;d[200]=Gb(na[c+1]).grav;var f,g=d[0].tt;for(f=1;200>f;++f)d[f]=Fb(g+=146,d[f-
1]).grav;g=d[200].tt;var h=[];h[200]=d[200];for(f=199;0<f;--f)h[f]=Fb(g-=146,h[f+1]).grav;for(f=199;0<f;--f)g=f/200,d[f].r=d[f].r.mul(1-g).add(h[f].r.mul(g)),d[f].v=d[f].v.mul(1-g).add(h[f].v.mul(g)),d[f].a=d[f].a.mul(1-g).add(h[f].a.mul(g))}c=Ib[c]}if(d=c){f=jc((a.tt-d[0].tt)/146,200);c=d[f];g=d[f+1];var l=c.a.mean(g.a);f=Ca(a.tt-c.tt,c.r,c.v,l);d=Eb(a.tt-c.tt,c.v,l);h=Ca(a.tt-g.tt,g.r,g.v,l);g=Eb(a.tt-g.tt,g.v,l);l=(a.tt-c.tt)/146;c=f.mul(1-l).add(h.mul(l));d=d.mul(1-l).add(g.mul(l))}else{var k=
a.tt<na[0][0]?kc(na[0],a.tt,-146):kc(na[50],a.tt,146);c=k.grav.r;d=k.grav.v;k=k.bary}b&&(k||(k=new Da(a.tt)),c=c.sub(k.Sun.r),d=d.sub(k.Sun.v));return new I(c.x,c.y,c.z,d.x,d.y,d.z,a)}function kb(a,b){for(var c=a.tt+18262.5,d=[0,b.al[0]+c*b.al[1],0,0,0,0],f=$jscomp.makeIterator(b.a),g=f.next();!g.done;g=f.next()){var h=$jscomp.makeIterator(g.value);g=h.next().value;var l=h.next().value;h=h.next().value;d[0]+=g*Math.cos(l+c*h)}f=$jscomp.makeIterator(b.l);for(g=f.next();!g.done;g=f.next())h=$jscomp.makeIterator(g.value),
g=h.next().value,l=h.next().value,h=h.next().value,d[1]+=g*Math.sin(l+c*h);d[1]%=U;0>d[1]&&(d[1]+=U);f=$jscomp.makeIterator(b.z);for(g=f.next();!g.done;g=f.next())h=$jscomp.makeIterator(g.value),g=h.next().value,l=h.next().value,h=h.next().value,l+=c*h,d[2]+=g*Math.cos(l),d[3]+=g*Math.sin(l);f=$jscomp.makeIterator(b.zeta);for(g=f.next();!g.done;g=f.next())h=$jscomp.makeIterator(g.value),g=h.next().value,l=h.next().value,h=h.next().value,l+=c*h,d[4]+=g*Math.cos(l),d[5]+=g*Math.sin(l);f=d[0];h=d[1];
g=d[2];l=d[3];c=d[4];d=d[5];var k=Math.sqrt(b.mu/(f*f*f));b=h+g*Math.sin(h)-l*Math.cos(h);do{var n=Math.cos(b);var p=Math.sin(b);n=(h-b+g*p-l*n)/(1-g*n-l*p);b+=n}while(1E-12<=Math.abs(n));n=Math.cos(b);p=Math.sin(b);h=l*n-g*p;var q=-g*n-l*p,t=1/(1+q),y=1/(1+Math.sqrt(1-g*g-l*l));b=f*(n-g-y*l*h);h=f*(p-l+y*g*h);l=k*t*f*(-p-y*l*q);f=k*t*f*(+n+y*g*q);g=2*Math.sqrt(1-c*c-d*d);k=1-2*d*d;n=1-2*c*c;p=2*d*c;a=new I(b*k+h*p,b*p+h*n,(c*h-b*d)*g,l*k+f*p,l*p+f*n,(c*f-l*d)*g,a);return Ea(rd,a)}function Z(a,b){b=
v(b);if(a in M)return Aa(M[a],b);if(a===m.Pluto)return a=Hb(b,!0),new E(a.x,a.y,a.z,b);if(a===m.Sun)return new E(0,0,0,b);if(a===m.Moon){a=Aa(M.Earth,b);var c=Y(b);return new E(a.x+c.x,a.y+c.y,a.z+c.z,b)}if(a===m.EMB)return a=Aa(M.Earth,b),c=Y(b),new E(a.x+c.x/82.30056,a.y+c.y/82.30056,a.z+c.z/82.30056,b);if(a===m.SSB)return a=new E(0,0,0,b),jb(a,b,m.Jupiter,2.825345909524226E-7),jb(a,b,m.Saturn,8.459715185680659E-8),jb(a,b,m.Uranus,1.292024916781969E-8),jb(a,b,m.Neptune,1.524358900784276E-8),a;if(c=
ka(a))return a=new Ba(c.dec,15*c.ra,c.dist),lb(a,b);throw'HelioVector: Unknown body "'+a+'"';}function oa(a,b){var c=ka(a);if(c)return c.dist;b=v(b);return a in M?ma(M[a][2],b.tt/365250,!1):Z(a,b).Length()}function lc(a,b){for(var c=b,d=0,f=0;10>f;++f){var g=a(c);d=g.Length()/e.C_AUDAY;if(1<d)throw"Object is too distant for light-travel solver.";var h=b.AddDays(-d);d=Math.abs(h.tt-c.tt);if(1E-9>d)return g;c=h}throw"Light-travel time solver did not converge: dt = "+d;}function mc(a,b,c,d){A(d);a=v(a);
if(ka(c)){c=Z(c,a);if(d)return b=mb(b,a),d=new E(c.x-b.x,c.y-b.y,c.z-b.z,a),c=e.C_AUDAY/d.Length(),new E(d.x+b.vx/c,d.y+b.vy/c,d.z+b.vz/c,a);b=Z(b,a);return new E(c.x-b.x,c.y-b.y,c.z-b.z,a)}var f=d?new E(0,0,0,a):Z(b,a);var g=new nc(b,c,d,f);return lc(function(h){return g.Position(h)},a)}function W(a,b,c){A(c);b=v(b);switch(a){case m.Earth:return new E(0,0,0,b);case m.Moon:return Y(b);default:return a=mc(b,m.Earth,a,c),a.t=b,a}}function pa(a,b){return new I(a.r.x,a.r.y,a.r.z,a.v.x,a.v.y,a.v.z,b)}
function mb(a,b){b=v(b);switch(a){case m.Sun:return new I(0,0,0,0,0,0,b);case m.SSB:return a=new Da(b.tt),new I(-a.Sun.r.x,-a.Sun.r.y,-a.Sun.r.z,-a.Sun.v.x,-a.Sun.v.y,-a.Sun.v.z,b);case m.Mercury:case m.Venus:case m.Earth:case m.Mars:case m.Jupiter:case m.Saturn:case m.Uranus:case m.Neptune:return a=Sa(M[a],b.tt),pa(a,b);case m.Pluto:return Hb(b,!0);case m.Moon:case m.EMB:var c=Sa(M.Earth,b.tt);a=a==m.Moon?Ra(b):Bb(b);return new I(a.x+c.r.x,a.y+c.r.y,a.z+c.r.z,a.vx+c.v.x,a.vy+c.v.y,a.vz+c.v.z,b);
default:if(ka(a))return a=Z(a,b),new I(a.x,a.y,a.z,0,0,0,b);throw'HelioState: Unsupported body "'+a+'"';}}function sd(a,b,c,d,f){var g=(f+c)/2-d;c=(f-c)/2;if(0==g){if(0==c)return null;d=-d/c;if(-1>d||1<d)return null}else{d=c*c-4*g*d;if(0>=d)return null;f=Math.sqrt(d);d=(-c+f)/(2*g);f=(-c-f)/(2*g);if(-1<=d&&1>=d){if(-1<=f&&1>=f)return null}else if(-1<=f&&1>=f)d=f;else return null}return{t:a+d*b,df_dt:(2*g*d+c)/b}}function K(a,b,c,d){var f=w(d&&d.dt_tolerance_seconds||1);f=Math.abs(f/86400);var g=d&&
d.init_f1||a(b),h=d&&d.init_f2||a(c),l=NaN,k=0;d=d&&d.iter_limit||20;for(var n=!0;;){if(++k>d)throw"Excessive iteration in Search()";var p=new O(b.ut+.5*(c.ut-b.ut)),q=p.ut-b.ut;if(Math.abs(q)<f)return p;n?l=a(p):n=!0;var t=sd(p.ut,c.ut-p.ut,g,l,h);if(t){var y=v(t.t),x=a(y);if(0!==t.df_dt){if(Math.abs(x/t.df_dt)<f)return y;t=1.2*Math.abs(x/t.df_dt);if(t<q/10&&(q=y.AddDays(-t),y=y.AddDays(+t),0>(q.ut-b.ut)*(q.ut-c.ut)&&0>(y.ut-b.ut)*(y.ut-c.ut))){t=a(q);var z=a(y);if(0>t&&0<=z){g=t;h=z;b=q;c=y;l=x;
n=!1;continue}}}}if(0>g&&0<=l)c=p,h=l;else if(0>l&&0<=h)b=p,g=l;else return null}}function Fa(a){for(;-180>=a;)a+=360;for(;180<a;)a-=360;return a}function Ga(a){for(;0>a;)a+=360;for(;360<=a;)a-=360;return a}function oc(a,b,c){w(a);w(c);b=v(b);c=b.AddDays(c);return K(function(d){d=fc(d);return Fa(d.elon-a)},b,c,{dt_tolerance_seconds:.01})}function Jb(a,b,c){if(a===m.Earth||b===m.Earth)throw"The Earth does not have a longitude as seen from itself.";c=v(c);a=W(a,c,!1);a=Qa(a);b=W(b,c,!1);b=Qa(b);return Ga(a.elon-
b.elon)}function Ha(a,b){if(a==m.Earth)throw"The Earth does not have an angle as seen from itself.";var c=v(b);b=W(m.Sun,c,!0);a=W(a,c,!0);return N(b,a)}function qa(a,b){if(a===m.Sun)throw"Cannot calculate heliocentric longitude of the Sun.";a=Z(a,b);return Qa(a).elon}function nb(a,b){if(a===m.Earth)throw"The illumination of the Earth is not defined.";var c=v(b),d=Aa(M.Earth,c);if(a===m.Sun){var f=new E(-d.x,-d.y,-d.z,c);b=new E(0,0,0,c);d=0}else a===m.Moon?(f=Y(c),b=new E(d.x+f.x,d.y+f.y,d.z+f.z,
c)):(b=Z(a,b),f=new E(b.x-d.x,b.y-d.y,b.z-d.z,c)),d=N(f,b);var g=f.Length(),h=b.Length();if(a===m.Sun)var l=td+5*Math.log10(g);else if(a===m.Moon)a=d*e.DEG2RAD,l=a*a,a=-12.717+1.49*Math.abs(a)+.0431*l*l,l=a+=5*Math.log10(g/(385000.6/e.KM_PER_AU)*h);else if(a===m.Saturn){var k=d;a=Qa(f);l=28.06*e.DEG2RAD;var n=e.DEG2RAD*a.elat;a=Math.asin(Math.sin(n)*Math.cos(l)-Math.cos(n)*Math.sin(l)*Math.sin(e.DEG2RAD*a.elon-e.DEG2RAD*(169.51+3.82E-5*c.tt)));l=Math.sin(Math.abs(a));k=-9+.044*k+l*(-2.6+1.2*l)+5*
Math.log10(h*g);a*=e.RAD2DEG;l=k;k=a}else{var p=n=l=0;switch(a){case m.Mercury:a=-.6;l=4.98;n=-4.88;p=3.02;break;case m.Venus:163.6>d?(a=-4.47,l=1.03,n=.57,p=.13):(a=.98,l=-1.02);break;case m.Mars:a=-1.52;l=1.6;break;case m.Jupiter:a=-9.4;l=.5;break;case m.Uranus:a=-7.19;l=.25;break;case m.Neptune:a=-6.87;break;case m.Pluto:a=-1;l=4;break;default:throw"VisualMagnitude: unsupported body "+a;}var q=d/100;l=a+q*(l+q*(n+q*p))+5*Math.log10(h*g)}return new pc(c,l,d,h,g,f,b,k)}function Va(a){if(a===m.Earth)throw"The Earth does not have a synodic period as seen from itself.";
if(a===m.Moon)return 29.530588;var b=aa[a];if(!b)throw"Not a valid planet name: "+a;a=aa.Earth.OrbitalPeriod;return Math.abs(a/(a/b.OrbitalPeriod-1))}function Ia(a,b,c){function d(n){var p=qa(a,n);n=qa(m.Earth,n);return Fa(g*(n-p)-b)}w(b);var f=aa[a];if(!f)throw"Cannot search relative longitude because body is not a planet: "+a;if(a===m.Earth)throw"Cannot search relative longitude for the Earth (it is always 0)";var g=f.OrbitalPeriod>aa.Earth.OrbitalPeriod?1:-1;f=Va(a);c=v(c);var h=d(c);0<h&&(h-=
360);for(var l=0;100>l;++l){var k=-h/360*f;c=c.AddDays(k);if(1>86400*Math.abs(k))return c;k=h;h=d(c);30>Math.abs(k)&&k!==h&&(k/=k-h,.5<k&&2>k&&(f*=k))}throw"Relative longitude search failed to converge for "+a+" near "+c.toString()+" (error_angle = "+h+").";}function Kb(a){return Jb(m.Moon,m.Sun,a)}function Wa(a,b,c){function d(l){l=Kb(l);return Fa(l-a)}w(a);w(c);b=v(b);var f=d(b);if(0>c){0>f&&(f+=360);var g=-(29.530588*f)/360;f=g+1.5;if(f<c)return null;var h=Math.max(c,g-1.5)}else{0<f&&(f-=360);
g=-(29.530588*f)/360;h=g-1.5;if(h>c)return null;f=Math.min(c,g+1.5)}c=b.AddDays(h);b=b.AddDays(f);return K(d,c,b,{dt_tolerance_seconds:.1})}function qc(a){var b=Kb(a);b=(Math.floor(b/90)+1)%4;a=Wa(90*b,a,10);if(!a)throw"Cannot find moon quarter";return new rc(b,a)}function sc(a){if(!Number.isFinite(a)||-500>a||1E5<a)throw"Invalid elevation: "+a;if(11E3>=a){var b=288.15-.0065*a;a=101325*Math.pow(288.15/b,-5.25577)}else 2E4>=a?(b=216.65,a=22632*Math.exp(-1.5768832E-4*(a-11E3))):(b=216.65+.001*(a-2E4),
a=5474.87*Math.pow(216.65/b,34.16319));return new tc(a,b,a/b/(101325/288.15))}function Lb(a,b,c,d,f,g,h){if(0>g&&0<=h)return new ud(d,f,g,h);if(0<=g&&0>h)return null;if(17<a)throw"Excessive recursion in rise/set ascent search.";var l=f.ut-d.ut;if(1>86400*l||Math.min(Math.abs(g),Math.abs(h))>l/2*c)return null;l=new O((d.ut+f.ut)/2);var k=b(l);return Lb(1+a,b,c,d,l,g,k)||Lb(1+a,b,c,l,f,k,h)}function vd(a,b){if(-90>b||90<b)throw"Invalid geographic latitude: "+b;switch(a){case m.Moon:a=4.5;var c=8.2;
break;case m.Sun:a=.8;c=.5;break;case m.Mercury:a=-1.6;c=1;break;case m.Venus:a=-.8;c=.6;break;case m.Mars:a=-.5;c=.4;break;case m.Jupiter:case m.Saturn:case m.Uranus:case m.Neptune:case m.Pluto:a=-.2;c=.2;break;case m.Star1:case m.Star2:case m.Star3:case m.Star4:case m.Star5:case m.Star6:case m.Star7:case m.Star8:a=-.008;c=.008;break;default:throw"Body not allowed for altitude search: "+a;}b*=e.DEG2RAD;return Math.abs((360.98564540070413-a)*Math.cos(b))+Math.abs(c*Math.sin(b))}function uc(a,b,c,
d,f,g,h){function l(x){var z=Pa(a,x,b,!0,!0);x=hb(x,b,z.ra,z.dec).altitude+e.RAD2DEG*Math.asin(g/z.dist);return c*(x-h)}za(b);w(f);w(g);w(h);if(-90>h||90<h)throw"Invalid target altitude angle: "+h;for(var k=vd(a,b.latitude),n=d=v(d),p=d,q=l(n),t=q;;){0>f?(n=p.AddDays(-.42),q=l(n)):(p=n.AddDays(.42),t=l(p));var y=Lb(0,l,k,n,p,q,t);if(y){if(k=K(l,y.tx,y.ty,{dt_tolerance_seconds:.1,init_f1:y.ax,init_f2:y.ay})){if(0>f){if(k.ut<d.ut+f)return null}else if(k.ut>d.ut+f)return null;return k}throw"Rise/set search failed after finding ascent: t1="+
n+", t2="+p+", a1="+q+", a2="+t;}if(0>f){if(n.ut<d.ut+f)return null;p=n;t=q}else{if(p.ut>d.ut+f)return null;n=p;q=t}}}function vc(a,b){b=v(b);var c=Jb(a,m.Sun,b);if(180<c){var d="morning";c=360-c}else d="evening";a=Ha(a,b);return new wc(b,d,a,c)}function xc(a){function b(l){var k=l.AddDays(-5E-4);l=l.AddDays(5E-4);k=ea(k).distance_au;return(ea(l).distance_au-k)/.001}function c(l){return-b(l)}a=v(a);for(var d=b(a),f=0;59.061176>5*f;++f){var g=a.AddDays(5),h=b(g);if(0>=d*h){if(0>d||0<h){a=K(b,a,g,{init_f1:d,
init_f2:h});if(!a)throw"SearchLunarApsis INTERNAL ERROR: perigee search failed!";d=ea(a).distance_au;return new Xa(a,0,d)}if(0<d||0>h){a=K(c,a,g,{init_f1:-d,init_f2:-h});if(!a)throw"SearchLunarApsis INTERNAL ERROR: apogee search failed!";d=ea(a).distance_au;return new Xa(a,1,d)}throw"SearchLunarApsis INTERNAL ERROR: cannot classify apsis event!";}a=g;d=h}throw"SearchLunarApsis INTERNAL ERROR: could not find apsis within 2 synodic months of start date.";}function yc(a,b,c,d){for(var f=b===Ja.Apocenter?
1:-1;;){d/=9;if(d<1/1440)return c=c.AddDays(d/2),a=oa(a,c),new Xa(c,b,a);for(var g=-1,h=0,l=0;10>l;++l){var k=c.AddDays(l*d);k=f*oa(a,k);if(0==l||k>h)g=l,h=k}c=c.AddDays((g-1)*d);d*=2}}function wd(a,b){var c=b.AddDays(-30/360*aa[a].OrbitalPeriod),d=b.AddDays(.75*aa[a].OrbitalPeriod),f=c,g=c,h=-1,l=-1;d=(d.ut-c.ut)/99;for(var k=0;100>k;++k){var n=c.AddDays(k*d),p=oa(a,n);0===k?l=h=p:(p>l&&(l=p,g=n),p<h&&(h=p,f=n))}c=yc(a,0,f.AddDays(-2*d),4*d);a=yc(a,1,g.AddDays(-2*d),4*d);if(c.time.tt>=b.tt)return a.time.tt>=
b.tt&&a.time.tt<c.time.tt?a:c;if(a.time.tt>=b.tt)return a;throw"Internal error: failed to find Neptune apsis.";}function zc(a,b){function c(p){var q=p.AddDays(-5E-4);p=p.AddDays(5E-4);q=oa(a,q);return(oa(a,p)-q)/.001}function d(p){return-c(p)}b=v(b);if(a===m.Neptune||a===m.Pluto)return wd(a,b);for(var f=aa[a].OrbitalPeriod,g=f/6,h=c(b),l=0;l*g<2*f;++l){var k=b.AddDays(g),n=c(k);if(0>=h*n){f=g=void 0;if(0>h||0<n)g=c,f=Ja.Pericenter;else if(0<h||0>n)g=d,f=Ja.Apocenter;else throw"Internal error with slopes in SearchPlanetApsis";
b=K(g,b,k);if(!b)throw"Failed to find slope transition in planetary apsis search.";h=oa(a,b);return new Xa(b,f,h)}b=k;h=n}throw"Internal error: should have found planetary apsis within 2 orbital periods.";}function Ka(a){return new J([[a.rot[0][0],a.rot[1][0],a.rot[2][0]],[a.rot[0][1],a.rot[1][1],a.rot[2][1]],[a.rot[0][2],a.rot[1][2],a.rot[2][2]]])}function ja(a,b){return new J([[b.rot[0][0]*a.rot[0][0]+b.rot[1][0]*a.rot[0][1]+b.rot[2][0]*a.rot[0][2],b.rot[0][1]*a.rot[0][0]+b.rot[1][1]*a.rot[0][1]+
b.rot[2][1]*a.rot[0][2],b.rot[0][2]*a.rot[0][0]+b.rot[1][2]*a.rot[0][1]+b.rot[2][2]*a.rot[0][2]],[b.rot[0][0]*a.rot[1][0]+b.rot[1][0]*a.rot[1][1]+b.rot[2][0]*a.rot[1][2],b.rot[0][1]*a.rot[1][0]+b.rot[1][1]*a.rot[1][1]+b.rot[2][1]*a.rot[1][2],b.rot[0][2]*a.rot[1][0]+b.rot[1][2]*a.rot[1][1]+b.rot[2][2]*a.rot[1][2]],[b.rot[0][0]*a.rot[2][0]+b.rot[1][0]*a.rot[2][1]+b.rot[2][0]*a.rot[2][2],b.rot[0][1]*a.rot[2][0]+b.rot[1][1]*a.rot[2][1]+b.rot[2][1]*a.rot[2][2],b.rot[0][2]*a.rot[2][0]+b.rot[1][2]*a.rot[2][1]+
b.rot[2][2]*a.rot[2][2]]])}function lb(a,b){b=v(b);var c=a.lat*e.DEG2RAD,d=a.lon*e.DEG2RAD,f=a.dist*Math.cos(c);return new E(f*Math.cos(d),f*Math.sin(d),a.dist*Math.sin(c),b)}function Mb(a){var b=Nb(a);return new gb(b.lon/15,b.lat,b.dist,a)}function Nb(a){var b=a.x*a.x+a.y*a.y,c=Math.sqrt(b+a.z*a.z);if(0===b){if(0===a.z)throw"Zero-length vector not allowed.";var d=0;a=0>a.z?-90:90}else d=e.RAD2DEG*Math.atan2(a.y,a.x),0>d&&(d+=360),a=e.RAD2DEG*Math.atan2(a.z,Math.sqrt(b));return new Ba(a,d,c)}function Ac(a){a=
360-a;360<=a?a-=360:0>a&&(a+=360);return a}function Oa(a,b){w(b);if(-90>b||90<b)return 0;if("normal"===a||"jplhor"===a){var c=b;-1>c&&(c=-1);c=1.02/Math.tan((c+10.3/(c+5.11))*e.DEG2RAD)/60;"normal"===a&&-1>b&&(c*=(b+90)/89)}else{if(a)throw"Invalid refraction option: "+a;c=0}return c}function Bc(a,b){if(-90>b||90<b)return 0;for(var c=b-Oa(a,b);;){var d=c+Oa(a,c)-b;if(1E-14>Math.abs(d))return c-b;c-=d}}function Ya(a,b){return new E(a.rot[0][0]*b.x+a.rot[1][0]*b.y+a.rot[2][0]*b.z,a.rot[0][1]*b.x+a.rot[1][1]*
b.y+a.rot[2][1]*b.z,a.rot[0][2]*b.x+a.rot[1][2]*b.y+a.rot[2][2]*b.z,b.t)}function Ea(a,b){return new I(a.rot[0][0]*b.x+a.rot[1][0]*b.y+a.rot[2][0]*b.z,a.rot[0][1]*b.x+a.rot[1][1]*b.y+a.rot[2][1]*b.z,a.rot[0][2]*b.x+a.rot[1][2]*b.y+a.rot[2][2]*b.z,a.rot[0][0]*b.vx+a.rot[1][0]*b.vy+a.rot[2][0]*b.vz,a.rot[0][1]*b.vx+a.rot[1][1]*b.vy+a.rot[2][1]*b.vz,a.rot[0][2]*b.vx+a.rot[1][2]*b.vy+a.rot[2][2]*b.vz,b.t)}function Cc(){return new J([[1,0,0],[0,.9174821430670688,-.3977769691083922],[0,.3977769691083922,
.9174821430670688]])}function ob(a){a=v(a);var b=Ma(a,F.From2000);a=Na(a,F.From2000);return ja(b,a)}function pb(a){a=v(a);var b=Na(a,F.Into2000);a=Ma(a,F.Into2000);return ja(b,a)}function Ob(a,b){a=v(a);var c=Math.sin(b.latitude*e.DEG2RAD),d=Math.cos(b.latitude*e.DEG2RAD),f=Math.sin(b.longitude*e.DEG2RAD),g=Math.cos(b.longitude*e.DEG2RAD);b=[d*g,d*f,c];c=[-c*g,-c*f,d];f=[f,-g,0];a=-15*ca(a);b=ya(a,b);c=ya(a,c);a=ya(a,f);return new J([[c[0],a[0],b[0]],[c[1],a[1],b[1]],[c[2],a[2],b[2]]])}function Dc(a,
b){a=Ob(a,b);return Ka(a)}function Ec(a,b){a=v(a);b=Dc(a,b);a=pb(a);return ja(b,a)}function Fc(a){a=pb(a);var b=Cc();return ja(a,b)}function Gc(a){a=Fc(a);return Ka(a)}function Hc(a,b){a=v(a);var c=Gc(a);a=Ob(a,b);return ja(c,a)}function Ic(a){var b=da(v(a)).tobl*e.DEG2RAD;a=Math.cos(b);b=Math.sin(b);return new J([[1,0,0],[0,+a,+b],[0,-b,+a]])}function Jc(a){var b=da(v(a)).tobl*e.DEG2RAD;a=Math.cos(b);b=Math.sin(b);return new J([[1,0,0],[0,+a,-b],[0,+b,+a]])}function Za(a,b,c,d){var f=(d.x*c.x+d.y*
c.y+d.z*c.z)/(d.x*d.x+d.y*d.y+d.z*d.z);return new xd(b,f,e.KM_PER_AU*Math.hypot(f*d.x-c.x,f*d.y-c.y,f*d.z-c.z),695700-(1+f)*(695700-a),-695700+(1+f)*(695700+a),c,d)}function qb(a){var b=W(m.Sun,a,!0);b=new E(-b.x,-b.y,-b.z,b.t);var c=Y(a);return Za(6459,a,c,b)}function Kc(a){var b=W(m.Sun,a,!0),c=Y(a),d=new E(-c.x,-c.y,-c.z,c.t);c.x-=b.x;c.y-=b.y;c.z-=b.z;return Za(1737.4,a,d,c)}function Pb(a,b){var c=cc(a,b);b=W(m.Sun,a,!0);var d=Y(a);c=new E(c[0]-d.x,c[1]-d.y,c[2]-d.z,a);d.x-=b.x;d.y-=b.y;d.z-=
b.z;return Za(1737.4,a,c,d)}function rb(a,b,c){a=W(a,c,!0);var d=W(m.Sun,c,!0),f=new E(a.x-d.x,a.y-d.y,a.z-d.z,c);d.x=-a.x;d.y=-a.y;d.z=-a.z;return Za(b,c,d,f)}function Qb(a,b){var c=1/86400,d=b.AddDays(-c);b=b.AddDays(+c);d=a(d);return(a(b).r-d.r)/c}function yd(a){var b=a.AddDays(-.03);a=a.AddDays(.03);b=K(function(c){return Qb(qb,c)},b,a);if(!b)throw"Failed to find peak Earth shadow time.";return qb(b)}function zd(a){var b=a.AddDays(-.03);a=a.AddDays(.03);b=K(function(c){return Qb(Kc,c)},b,a);if(!b)throw"Failed to find peak Moon shadow time.";
return Kc(b)}function Ad(a,b,c){var d=c.AddDays(-1);c=c.AddDays(1);d=K(function(f){var g=1/86400,h=rb(a,b,f.AddDays(-g));return(rb(a,b,f.AddDays(+g)).r-h.r)/g},d,c);if(!d)throw"Failed to find peak planet shadow time.";return rb(a,b,d)}function Bd(a,b){function c(g){return Pb(g,b)}var d=a.AddDays(-.2),f=a.AddDays(.2);d=K(function(g){return Qb(c,g)},d,f);if(!d)throw"PeakLocalMoonShadow: search failure for search_center_time = "+a;return Pb(d,b)}function Rb(a,b,c){var d=c/1440;c=a.AddDays(-d);d=a.AddDays(+d);
c=K(function(f){return-(qb(f).r-b)},c,a);a=K(function(f){return+(qb(f).r-b)},a,d);if(!c||!a)throw"Failed to find shadow semiduration";return 720*(a.ut-c.ut)}function Sb(a){a=ea(a);return e.RAD2DEG*a.geo_eclip_lat}function Lc(a,b,c){if(0>=a)throw"Radius of first disc must be positive.";if(0>=b)throw"Radius of second disc must be positive.";if(0>c)throw"Distance between discs is not allowed to be negative.";if(c>=a+b)return 0;if(0==c)return a<=b?1:b*b/(a*a);var d=(a*a-b*b+c*c)/(2*c),f=a*a-d*d;if(0>=
f)return a<=b?1:b*b/(a*a);f=Math.sqrt(f);return(a*a*Math.acos(d/a)-d*f+(b*b*Math.acos((c-d)/b)-(c-d)*f))/(Math.PI*a*a)}function Mc(a,b){var c=new E(a.x+b.x,a.y+b.y,a.z+b.z,a.t);a=Math.asin(Nc/c.Length());var d=Math.asin(Cd/b.Length());b=N(b,c);b=Lc(a,d,b*e.DEG2RAD);return Math.min(.9999,b)}function Oc(a){a=v(a);for(var b=0;12>b;++b){var c=Wa(180,a,40);if(!c)throw"Cannot find full moon.";a=Sb(c);if(1.8>Math.abs(a)&&(a=yd(c),a.r<a.p+1737.4)){b=S.Penumbral;var d=c=0,f=0,g=Rb(a.time,a.p+1737.4,200);a.r<
a.k+1737.4&&(b=S.Partial,f=Rb(a.time,a.k+1737.4,g),a.r+1737.4<a.k?(b=S.Total,c=1,d=Rb(a.time,a.k-1737.4,f)):c=Lc(1737.4,a.k,a.r));return new Pc(b,c,a.time,g,f,d)}a=c.AddDays(10)}throw"Failed to find lunar eclipse within 12 full moons.";}function Qc(a){a=v(a);var b;for(b=0;12>b;++b){var c=Wa(0,a,40);if(!c)throw"Cannot find new moon";a=Sb(c);if(1.8>Math.abs(a)&&(a=zd(c),a.r<a.p+6371)){var d=void 0,f=void 0,g=S.Partial;b=a.time;c=a.r;var h=ob(a.time),l=Ya(h,a.dir),k=Ya(h,a.target);l.x*=e.KM_PER_AU;l.y*=
e.KM_PER_AU;l.z*=e.KM_PER_AU/.996647180302104;k.x*=e.KM_PER_AU;k.y*=e.KM_PER_AU;k.z*=e.KM_PER_AU/.996647180302104;var n=l.x*l.x+l.y*l.y+l.z*l.z,p=-2*(l.x*k.x+l.y*k.y+l.z*k.z),q=p*p-4*n*(k.x*k.x+k.y*k.y+k.z*k.z-4.068062648825956E7);if(0<q){f=(-p-Math.sqrt(q))/(2*n);g=f*l.x-k.x;n=f*l.y-k.y;l=.996647180302104*(f*l.z-k.z);f=.9933056020041345*Math.hypot(g,n);f=0==f?0<l?90:-90:e.RAD2DEG*Math.atan(l/f);d=ca(b);d=(e.RAD2DEG*Math.atan2(n,g)-15*d)%360;-180>=d?d+=360:180<d&&(d-=360);h=Ka(h);l=new E(g/e.KM_PER_AU,
n/e.KM_PER_AU,l/e.KM_PER_AU,a.time);l=Ya(h,l);l.x+=a.target.x;l.y+=a.target.y;l.z+=a.target.z;h=Za(1736,a.time,l,a.dir);if(1E-9<h.r||0>h.r)throw"Unexpected shadow distance from geoid intersection = "+h.r;g=.014<h.k?S.Total:S.Annular;a=g===S.Total?1:Mc(a.dir,l)}else a=void 0;return new Rc(g,a,b,c,f,d)}a=c.AddDays(10)}throw"Failed to find solar eclipse within 12 full moons.";}function Sc(a){return a.p-a.r}function Tc(a){return Math.abs(a.k)-a.r}function sb(a,b,c,d,f){d=K(function(g){g=Pb(g,a);return b*
c(g)},d,f);if(!d)throw"Local eclipse transition search failed.";return Uc(a,d)}function Uc(a,b){var c=Pa(m.Sun,b,a,!0,!0);a=hb(b,a,c.ra,c.dec,"normal").altitude;return new Vc(b,a)}function Wc(a,b){a=v(a);for(za(b);;){a=Wa(0,a,40);if(!a)throw"Cannot find next new moon";var c=Sb(a);if(1.8>Math.abs(c)){var d=Bd(a,b);if(d.r<d.p){var f=c=void 0;var g=b;var h=Uc(g,d.time),l=d.time.AddDays(-.2),k=d.time.AddDays(.2),n=sb(g,1,Sc,l,d.time),p=sb(g,-1,Sc,d.time,k);d.r<Math.abs(d.k)?(l=d.time.AddDays(-.01),k=
d.time.AddDays(.01),f=sb(g,1,Tc,l,d.time),c=sb(g,-1,Tc,d.time,k),g=.014<d.k?S.Total:S.Annular):g=S.Partial;d=g===S.Total?1:Mc(d.dir,d.target);c=new Xc(g,d,n,f,h,c,p);if(0<c.partial_begin.altitude||0<c.partial_end.altitude)return c}}a=a.AddDays(10)}}function Yc(a,b,c,d,f){c=K(function(g){g=rb(a,b,g);return f*(g.r-g.p)},c,d);if(!c)throw"Planet transit boundary search failed";return c}function Zc(a,b){b=v(b);switch(a){case m.Mercury:var c=2439.7;break;case m.Venus:c=6051.8;break;default:throw"Invalid body: "+
a;}for(;;){var d=Ia(a,0,b);if(.4>Ha(a,d)&&(b=Ad(a,c,d),b.r<b.p)){d=b.time.AddDays(-1);d=Yc(a,c,d,b.time,-1);var f=b.time.AddDays(1);c=Yc(a,c,b.time,f,1);a=60*Ha(a,b.time);return new $c(d,b.time,c,a)}b=d.AddDays(10)}}function ad(a){var b=v(a),c=ib(b);for(a={};;a={$jscomp$loop$prop$kind$33:a.$jscomp$loop$prop$kind$33}){var d=b.AddDays(10),f=ib(d);if(0>=c.lat*f.lat){a.$jscomp$loop$prop$kind$33=f.lat>c.lat?ra.Ascending:ra.Descending;b=K(function(g){return function(h){return g.$jscomp$loop$prop$kind$33*
ib(h).lat}}(a),b,d);if(!b)throw"Could not find moon node.";return new bd(a.$jscomp$loop$prop$kind$33,b)}b=d;c=f}}function cd(a,b,c,d,f){if(1>a||5<a)throw"Invalid lagrange point "+a;if(!Number.isFinite(c)||0>=c)throw"Major mass must be a positive number.";if(!Number.isFinite(f)||0>=f)throw"Minor mass must be a negative number.";var g=d.x-b.x,h=d.y-b.y,l=d.z-b.z,k=g*g+h*h+l*l,n=Math.sqrt(k),p=d.vx-b.vx,q=d.vy-b.vy;d=d.vz-b.vz;if(4===a||5===a){k=h*d-l*q;c=l*p-g*d;var t=g*q-h*p,y=c*l-t*h;t=t*g-k*l;k=
k*h-c*g;c=Math.sqrt(y*y+t*t+k*k);y/=c;t/=c;k/=c;g/=n;h/=n;l/=n;a=4==a?.8660254037844386:-.8660254037844386;c=.5*g+a*y;f=.5*h+a*t;var x=.5*l+a*k,z=p*g+q*h+d*l;p=p*y+q*t+d*k;b=new I(n*c,n*f,n*x,z*c+p*(.5*y-a*g),z*f+p*(.5*t-a*h),z*x+p*(.5*k-a*l),b.t)}else{y=f/(c+f)*-n;t=c/(c+f)*+n;k=(c+f)/(k*n);if(1===a||2===a)x=c/(c+f)*Math.cbrt(f/(3*c)),c=-c,1==a?(x=1-x,a=+f):(x=1+x,a=-f);else if(3===a)x=(7/12*f-c)/(f+c),c=+c,a=+f;else throw"Invalid Langrage point "+a+". Must be an integer 1..5.";f=n*x-y;do x=f-y,
z=f-t,x=(k*f+c/(x*x)+a/(z*z))/(k-2*c/(x*x*x)-2*a/(z*z*z)),f-=x;while(1E-14<Math.abs(x/n));x=(f-y)/n;b=new I(x*g,x*h,x*l,x*p,x*q,x*d,b.t)}return b}Object.defineProperty(e,"__esModule",{value:!0});e.GeoEmbState=e.GeoMoonState=e.EclipticGeoMoon=e.GeoMoon=e.Ecliptic=e.ObserverGravity=e.VectorObserver=e.ObserverState=e.ObserverVector=e.Equator=e.SunPosition=e.Observer=e.Horizon=e.EclipticCoordinates=e.HorizontalCoordinates=e.MakeRotation=e.RotationMatrix=e.EquatorialCoordinates=e.Spherical=e.StateVector=
e.Vector=e.SiderealTime=e.Libration=e.LibrationInfo=e.CalcMoonCount=e.e_tilt=e.MakeTime=e.AstroTime=e.SetDeltaTFunction=e.DeltaT_JplHorizons=e.DeltaT_EspenakMeeus=e.PlanetOrbitalPeriod=e.DefineStar=e.Body=e.AngleBetween=e.MassProduct=e.CALLISTO_RADIUS_KM=e.GANYMEDE_RADIUS_KM=e.EUROPA_RADIUS_KM=e.IO_RADIUS_KM=e.JUPITER_MEAN_RADIUS_KM=e.JUPITER_POLAR_RADIUS_KM=e.JUPITER_EQUATORIAL_RADIUS_KM=e.RAD2HOUR=e.RAD2DEG=e.HOUR2RAD=e.DEG2RAD=e.AU_PER_LY=e.KM_PER_AU=e.C_AUDAY=void 0;e.VectorFromHorizon=e.HorizonFromVector=
e.SphereFromVector=e.EquatorFromVector=e.VectorFromSphere=e.Pivot=e.IdentityMatrix=e.CombineRotation=e.InverseRotation=e.NextPlanetApsis=e.SearchPlanetApsis=e.NextLunarApsis=e.SearchLunarApsis=e.Apsis=e.ApsisKind=e.SearchPeakMagnitude=e.SearchMaxElongation=e.Elongation=e.ElongationEvent=e.Seasons=e.SeasonInfo=e.HourAngle=e.SearchHourAngle=e.HourAngleEvent=e.SearchAltitude=e.SearchRiseSet=e.Atmosphere=e.AtmosphereInfo=e.NextMoonQuarter=e.SearchMoonQuarter=e.MoonQuarter=e.SearchMoonPhase=e.MoonPhase=
e.SearchRelativeLongitude=e.Illumination=e.IlluminationInfo=e.EclipticLongitude=e.AngleFromSun=e.PairLongitude=e.SearchSunLongitude=e.Search=e.HelioState=e.BaryState=e.GeoVector=e.BackdatePosition=e.CorrectLightTravel=e.HelioDistance=e.HelioVector=e.JupiterMoons=e.JupiterMoonsInfo=void 0;e.GravitySimulator=e.LagrangePointFast=e.LagrangePoint=e.RotationAxis=e.AxisInfo=e.NextMoonNode=e.SearchMoonNode=e.NodeEventInfo=e.NodeEventKind=e.NextTransit=e.SearchTransit=e.TransitInfo=e.NextLocalSolarEclipse=
e.SearchLocalSolarEclipse=e.LocalSolarEclipseInfo=e.EclipseEvent=e.NextGlobalSolarEclipse=e.SearchGlobalSolarEclipse=e.NextLunarEclipse=e.GlobalSolarEclipseInfo=e.SearchLunarEclipse=e.LunarEclipseInfo=e.EclipseKind=e.Constellation=e.ConstellationInfo=e.Rotation_EQD_ECT=e.Rotation_ECT_EQD=e.Rotation_GAL_EQJ=e.Rotation_EQJ_GAL=e.Rotation_HOR_ECL=e.Rotation_ECL_HOR=e.Rotation_ECL_EQD=e.Rotation_EQD_ECL=e.Rotation_EQJ_HOR=e.Rotation_HOR_EQJ=e.Rotation_HOR_EQD=e.Rotation_EQD_HOR=e.Rotation_EQD_EQJ=e.Rotation_ECT_EQJ=
e.Rotation_EQJ_ECT=e.Rotation_EQJ_EQD=e.Rotation_ECL_EQJ=e.Rotation_EQJ_ECL=e.RotateState=e.RotateVector=e.InverseRefraction=e.Refraction=void 0;e.C_AUDAY=173.1446326846693;e.KM_PER_AU=1.4959787069098932E8;e.AU_PER_LY=63241.07708807546;e.DEG2RAD=.017453292519943295;e.HOUR2RAD=.26179938779914946;e.RAD2DEG=57.29577951308232;e.RAD2HOUR=3.819718634205488;e.JUPITER_EQUATORIAL_RADIUS_KM=71492;e.JUPITER_POLAR_RADIUS_KM=66854;e.JUPITER_MEAN_RADIUS_KM=69911;e.IO_RADIUS_KM=1821.6;e.EUROPA_RADIUS_KM=1560.8;
e.GANYMEDE_RADIUS_KM=2631.2;e.CALLISTO_RADIUS_KM=2410.3;var dd=new Date("2000-01-01T12:00:00Z"),U=2*Math.PI,ia=180/Math.PI*3600,td=-.17-5*Math.log10(648E3/Math.PI),Nc=695700/e.KM_PER_AU,pd=6378.1366/e.KM_PER_AU,Dd=1738.1/e.KM_PER_AU,Cd=1736/e.KM_PER_AU,Ed=34/60;e.MassProduct=C;e.AngleBetween=N;var m;(function(a){a.Sun="Sun";a.Moon="Moon";a.Mercury="Mercury";a.Venus="Venus";a.Earth="Earth";a.Mars="Mars";a.Jupiter="Jupiter";a.Saturn="Saturn";a.Uranus="Uranus";a.Neptune="Neptune";a.Pluto="Pluto";a.SSB=
"SSB";a.EMB="EMB";a.Star1="Star1";a.Star2="Star2";a.Star3="Star3";a.Star4="Star4";a.Star5="Star5";a.Star6="Star6";a.Star7="Star7";a.Star8="Star8"})(m=e.Body||(e.Body={}));var ld=[m.Star1,m.Star2,m.Star3,m.Star4,m.Star5,m.Star6,m.Star7,m.Star8],md=[{ra:0,dec:0,dist:0},{ra:0,dec:0,dist:0},{ra:0,dec:0,dist:0},{ra:0,dec:0,dist:0},{ra:0,dec:0,dist:0},{ra:0,dec:0,dist:0},{ra:0,dec:0,dist:0},{ra:0,dec:0,dist:0}];e.DefineStar=function(a,b,c,d){var f=T(a);if(!f)throw"Invalid star body: "+a;w(b);w(c);w(d);
if(0>b||24<=b)throw"Invalid right ascension for star: "+b;if(-90>c||90<c)throw"Invalid declination for star: "+c;if(1>d)throw"Invalid star distance: "+d;f.ra=b;f.dec=c;f.dist=d*e.AU_PER_LY};var F;(function(a){a[a.From2000=0]="From2000";a[a.Into2000=1]="Into2000"})(F||(F={}));var aa={Mercury:{OrbitalPeriod:87.969},Venus:{OrbitalPeriod:224.701},Earth:{OrbitalPeriod:365.256},Mars:{OrbitalPeriod:686.98},Jupiter:{OrbitalPeriod:4332.589},Saturn:{OrbitalPeriod:10759.22},Uranus:{OrbitalPeriod:30685.4},Neptune:{OrbitalPeriod:60189},
Pluto:{OrbitalPeriod:90560}};e.PlanetOrbitalPeriod=function(a){if(a in aa)return aa[a].OrbitalPeriod;throw"Unknown orbital period for: "+a;};var M={Mercury:[[[[4.40250710144,0,0],[.40989414977,1.48302034195,26087.9031415742],[.050462942,4.47785489551,52175.8062831484],[.00855346844,1.16520322459,78263.70942472259],[.00165590362,4.11969163423,104351.61256629678],[3.4561897E-4,.77930768443,130439.51570787099],[7.583476E-5,3.71348404924,156527.41884944518]],[[26087.90313685529,0,0],[.01131199811,6.21874197797,
26087.9031415742],[.00292242298,3.04449355541,52175.8062831484],[7.5775081E-4,6.08568821653,78263.70942472259],[1.9676525E-4,2.80965111777,104351.61256629678]]],[[[.11737528961,1.98357498767,26087.9031415742],[.02388076996,5.03738959686,52175.8062831484],[.01222839532,3.14159265359,0],[.0054325181,1.79644363964,78263.70942472259],[.0012977877,4.83232503958,104351.61256629678],[3.1866927E-4,1.58088495658,130439.51570787099],[7.963301E-5,4.60972126127,156527.41884944518]],[[.00274646065,3.95008450011,
26087.9031415742],[9.9737713E-4,3.14159265359,0]]],[[[.39528271651,0,0],[.07834131818,6.19233722598,26087.9031415742],[.00795525558,2.95989690104,52175.8062831484],[.00121281764,6.01064153797,78263.70942472259],[2.1921969E-4,2.77820093972,104351.61256629678],[4.354065E-5,5.82894543774,130439.51570787099]],[[.0021734774,4.65617158665,26087.9031415742],[4.4141826E-4,1.42385544001,52175.8062831484]]]],Venus:[[[[3.17614666774,0,0],[.01353968419,5.59313319619,10213.285546211],[8.9891645E-4,5.30650047764,
20426.571092422],[5.477194E-5,4.41630661466,7860.4193924392],[3.455741E-5,2.6996444782,11790.6290886588],[2.372061E-5,2.99377542079,3930.2096962196],[1.317168E-5,5.18668228402,26.2983197998],[1.664146E-5,4.25018630147,1577.3435424478],[1.438387E-5,4.15745084182,9683.5945811164],[1.200521E-5,6.15357116043,30639.856638633]],[[10213.28554621638,0,0],[9.5617813E-4,2.4640651111,10213.285546211],[7.787201E-5,.6247848222,20426.571092422]]],[[[.05923638472,.26702775812,10213.285546211],[4.0107978E-4,1.14737178112,
20426.571092422],[3.2814918E-4,3.14159265359,0]],[[.00287821243,1.88964962838,10213.285546211]]],[[[.72334820891,0,0],[.00489824182,4.02151831717,10213.285546211],[1.658058E-5,4.90206728031,20426.571092422],[1.378043E-5,1.12846591367,11790.6290886588],[1.632096E-5,2.84548795207,7860.4193924392],[4.98395E-6,2.58682193892,9683.5945811164],[2.21985E-6,2.01346696541,19367.1891622328],[2.37454E-6,2.55136053886,15720.8387848784]],[[3.4551041E-4,.89198706276,10213.285546211]]]],Earth:[[[[1.75347045673,0,
0],[.03341656453,4.66925680415,6283.0758499914],[3.4894275E-4,4.62610242189,12566.1516999828],[3.417572E-5,2.82886579754,3.523118349],[3.497056E-5,2.74411783405,5753.3848848968],[3.135899E-5,3.62767041756,77713.7714681205],[2.676218E-5,4.41808345438,7860.4193924392],[2.342691E-5,6.13516214446,3930.2096962196],[1.273165E-5,2.03709657878,529.6909650946],[1.324294E-5,.74246341673,11506.7697697936],[9.01854E-6,2.04505446477,26.2983197998],[1.199167E-5,1.10962946234,1577.3435424478],[8.57223E-6,3.50849152283,
398.1490034082],[7.79786E-6,1.17882681962,5223.6939198022],[9.9025E-6,5.23268072088,5884.9268465832],[7.53141E-6,2.53339052847,5507.5532386674],[5.05267E-6,4.58292599973,18849.2275499742],[4.92392E-6,4.20505711826,775.522611324],[3.56672E-6,2.91954114478,.0673103028],[2.84125E-6,1.89869240932,796.2980068164],[2.42879E-6,.34481445893,5486.777843175],[3.17087E-6,5.84901948512,11790.6290886588],[2.71112E-6,.31486255375,10977.078804699],[2.06217E-6,4.80646631478,2544.3144198834],[2.05478E-6,1.86953770281,
5573.1428014331],[2.02318E-6,2.45767790232,6069.7767545534],[1.26225E-6,1.08295459501,20.7753954924],[1.55516E-6,.83306084617,213.299095438]],[[6283.0758499914,0,0],[.00206058863,2.67823455808,6283.0758499914],[4.303419E-5,2.63512233481,12566.1516999828]],[[8.721859E-5,1.07253635559,6283.0758499914]]],[[],[[.00227777722,3.4137662053,6283.0758499914],[3.805678E-5,3.37063423795,12566.1516999828]]],[[[1.00013988784,0,0],[.01670699632,3.09846350258,6283.0758499914],[1.3956024E-4,3.05524609456,12566.1516999828],
[3.08372E-5,5.19846674381,77713.7714681205],[1.628463E-5,1.17387558054,5753.3848848968],[1.575572E-5,2.84685214877,7860.4193924392],[9.24799E-6,5.45292236722,11506.7697697936],[5.42439E-6,4.56409151453,3930.2096962196],[4.7211E-6,3.66100022149,5884.9268465832],[8.5831E-7,1.27079125277,161000.6857376741],[5.7056E-7,2.01374292245,83996.84731811189],[5.5736E-7,5.2415979917,71430.69561812909],[1.74844E-6,3.01193636733,18849.2275499742],[2.43181E-6,4.2734953079,11790.6290886588]],[[.00103018607,1.10748968172,
6283.0758499914],[1.721238E-5,1.06442300386,12566.1516999828]],[[4.359385E-5,5.78455133808,6283.0758499914]]]],Mars:[[[[6.20347711581,0,0],[.18656368093,5.0503710027,3340.6124266998],[.01108216816,5.40099836344,6681.2248533996],[9.1798406E-4,5.75478744667,10021.8372800994],[2.7744987E-4,5.97049513147,3.523118349],[1.0610235E-4,2.93958560338,2281.2304965106],[1.2315897E-4,.84956094002,2810.9214616052],[8.926784E-5,4.15697846427,.0172536522],[8.715691E-5,6.11005153139,13362.4497067992],[6.797556E-5,
.36462229657,398.1490034082],[7.774872E-5,3.33968761376,5621.8429232104],[3.575078E-5,1.6618650571,2544.3144198834],[4.161108E-5,.22814971327,2942.4634232916],[3.075252E-5,.85696614132,191.4482661116],[2.628117E-5,.64806124465,3337.0893083508],[2.937546E-5,6.07893711402,.0673103028],[2.389414E-5,5.03896442664,796.2980068164],[2.579844E-5,.02996736156,3344.1355450488],[1.528141E-5,1.14979301996,6151.533888305],[1.798806E-5,.65634057445,529.6909650946],[1.264357E-5,3.62275122593,5092.1519581158],[1.286228E-5,
3.06796065034,2146.1654164752],[1.546404E-5,2.91579701718,1751.539531416],[1.024902E-5,3.69334099279,8962.4553499102],[8.91566E-6,.18293837498,16703.062133499],[8.58759E-6,2.4009381194,2914.0142358238],[8.32715E-6,2.46418619474,3340.5951730476],[8.3272E-6,4.49495782139,3340.629680352],[7.12902E-6,3.66335473479,1059.3819301892],[7.48723E-6,3.82248614017,155.4203994342],[7.23861E-6,.67497311481,3738.761430108],[6.35548E-6,2.92182225127,8432.7643848156],[6.55162E-6,.48864064125,3127.3133312618],[5.50474E-6,
3.81001042328,.9803210682],[5.5275E-6,4.47479317037,1748.016413067],[4.25966E-6,.55364317304,6283.0758499914],[4.15131E-6,.49662285038,213.299095438],[4.72167E-6,3.62547124025,1194.4470102246],[3.06551E-6,.38052848348,6684.7479717486],[3.12141E-6,.99853944405,6677.7017350506],[2.93198E-6,4.22131299634,20.7753954924],[3.02375E-6,4.48618007156,3532.0606928114],[2.74027E-6,.54222167059,3340.545116397],[2.81079E-6,5.88163521788,1349.8674096588],[2.31183E-6,1.28242156993,3870.3033917944],[2.83602E-6,5.7688543494,
3149.1641605882],[2.36117E-6,5.75503217933,3333.498879699],[2.74033E-6,.13372524985,3340.6797370026],[2.99395E-6,2.78323740866,6254.6266625236]],[[3340.61242700512,0,0],[.01457554523,3.60433733236,3340.6124266998],[.00168414711,3.92318567804,6681.2248533996],[2.0622975E-4,4.26108844583,10021.8372800994],[3.452392E-5,4.7321039319,3.523118349],[2.586332E-5,4.60670058555,13362.4497067992],[8.41535E-6,4.45864030426,2281.2304965106]],[[5.8152577E-4,2.04961712429,3340.6124266998],[1.3459579E-4,2.45738706163,
6681.2248533996]]],[[[.03197134986,3.76832042431,3340.6124266998],[.00298033234,4.10616996305,6681.2248533996],[.00289104742,0,0],[3.1365539E-4,4.4465105309,10021.8372800994],[3.4841E-5,4.7881254926,13362.4497067992]],[[.00217310991,6.04472194776,3340.6124266998],[2.0976948E-4,3.14159265359,0],[1.2834709E-4,1.60810667915,6681.2248533996]]],[[[1.53033488271,0,0],[.1418495316,3.47971283528,3340.6124266998],[.00660776362,3.81783443019,6681.2248533996],[4.6179117E-4,4.15595316782,10021.8372800994],[8.109733E-5,
5.55958416318,2810.9214616052],[7.485318E-5,1.77239078402,5621.8429232104],[5.523191E-5,1.3643630377,2281.2304965106],[3.82516E-5,4.49407183687,13362.4497067992],[2.306537E-5,.09081579001,2544.3144198834],[1.999396E-5,5.36059617709,3337.0893083508],[2.484394E-5,4.9254563992,2942.4634232916],[1.960195E-5,4.74249437639,3344.1355450488],[1.167119E-5,2.11260868341,5092.1519581158],[1.102816E-5,5.00908403998,398.1490034082],[8.99066E-6,4.40791133207,529.6909650946],[9.92252E-6,5.83861961952,6151.533888305],
[8.07354E-6,2.10217065501,1059.3819301892],[7.97915E-6,3.44839203899,796.2980068164],[7.40975E-6,1.49906336885,2146.1654164752]],[[.01107433345,2.03250524857,3340.6124266998],[.00103175887,2.37071847807,6681.2248533996],[1.28772E-4,0,0],[1.081588E-4,2.70888095665,10021.8372800994]],[[4.4242249E-4,.47930604954,3340.6124266998],[8.138042E-5,.86998389204,6681.2248533996]]]],Jupiter:[[[[.59954691494,0,0],[.09695898719,5.06191793158,529.6909650946],[.00573610142,1.44406205629,7.1135470008],[.00306389205,
5.41734730184,1059.3819301892],[9.7178296E-4,4.14264726552,632.7837393132],[7.2903078E-4,3.64042916389,522.5774180938],[6.4263975E-4,3.41145165351,103.0927742186],[3.9806064E-4,2.29376740788,419.4846438752],[3.8857767E-4,1.27231755835,316.3918696566],[2.7964629E-4,1.7845459182,536.8045120954],[1.358973E-4,5.7748104079,1589.0728952838],[8.246349E-5,3.5822792584,206.1855484372],[8.768704E-5,3.63000308199,949.1756089698],[7.368042E-5,5.0810119427,735.8765135318],[6.26315E-5,.02497628807,213.299095438],
[6.114062E-5,4.51319998626,1162.4747044078],[4.905396E-5,1.32084470588,110.2063212194],[5.305285E-5,1.30671216791,14.2270940016],[5.305441E-5,4.18625634012,1052.2683831884],[4.647248E-5,4.69958103684,3.9321532631],[3.045023E-5,4.31676431084,426.598190876],[2.609999E-5,1.56667394063,846.0828347512],[2.028191E-5,1.06376530715,3.1813937377],[1.764763E-5,2.14148655117,1066.49547719],[1.722972E-5,3.88036268267,1265.5674786264],[1.920945E-5,.97168196472,639.897286314],[1.633223E-5,3.58201833555,515.463871093],
[1.431999E-5,4.29685556046,625.6701923124],[9.73272E-6,4.09764549134,95.9792272178]],[[529.69096508814,0,0],[.00489503243,4.2208293947,529.6909650946],[.00228917222,6.02646855621,7.1135470008],[3.0099479E-4,4.54540782858,1059.3819301892],[2.072092E-4,5.45943156902,522.5774180938],[1.2103653E-4,.16994816098,536.8045120954],[6.067987E-5,4.42422292017,103.0927742186],[5.433968E-5,3.98480737746,419.4846438752],[4.237744E-5,5.89008707199,14.2270940016]],[[4.7233601E-4,4.32148536482,7.1135470008],[3.0649436E-4,
2.929777887,529.6909650946],[1.4837605E-4,3.14159265359,0]]],[[[.02268615702,3.55852606721,529.6909650946],[.00109971634,3.90809347197,1059.3819301892],[.00110090358,0,0],[8.101428E-5,3.60509572885,522.5774180938],[6.043996E-5,4.25883108339,1589.0728952838],[6.437782E-5,.30627119215,536.8045120954]],[[7.8203446E-4,1.52377859742,529.6909650946]]],[[[5.20887429326,0,0],[.25209327119,3.49108639871,529.6909650946],[.00610599976,3.84115365948,1059.3819301892],[.00282029458,2.57419881293,632.7837393132],
[.00187647346,2.07590383214,522.5774180938],[8.6792905E-4,.71001145545,419.4846438752],[7.2062974E-4,.21465724607,536.8045120954],[6.5517248E-4,5.9799588479,316.3918696566],[2.9134542E-4,1.67759379655,103.0927742186],[3.0135335E-4,2.16132003734,949.1756089698],[2.3453271E-4,3.54023522184,735.8765135318],[2.2283743E-4,4.19362594399,1589.0728952838],[2.3947298E-4,.2745803748,7.1135470008],[1.3032614E-4,2.96042965363,1162.4747044078],[9.70336E-5,1.90669633585,206.1855484372],[1.2749023E-4,2.71550286592,
1052.2683831884],[7.057931E-5,2.18184839926,1265.5674786264],[6.137703E-5,6.26418240033,846.0828347512],[2.616976E-5,2.00994012876,1581.959348283]],[[.0127180152,2.64937512894,529.6909650946],[6.1661816E-4,3.00076460387,1059.3819301892],[5.3443713E-4,3.89717383175,522.5774180938],[3.1185171E-4,4.88276958012,536.8045120954],[4.1390269E-4,0,0]]]],Saturn:[[[[.87401354025,0,0],[.11107659762,3.96205090159,213.299095438],[.01414150957,4.58581516874,7.1135470008],[.00398379389,.52112032699,206.1855484372],
[.00350769243,3.30329907896,426.598190876],[.00206816305,.24658372002,103.0927742186],[7.92713E-4,3.84007056878,220.4126424388],[2.3990355E-4,4.66976924553,110.2063212194],[1.6573588E-4,.43719228296,419.4846438752],[1.4906995E-4,5.76903183869,316.3918696566],[1.582029E-4,.93809155235,632.7837393132],[1.4609559E-4,1.56518472,3.9321532631],[1.3160301E-4,4.44891291899,14.2270940016],[1.5053543E-4,2.71669915667,639.897286314],[1.3005299E-4,5.98119023644,11.0457002639],[1.0725067E-4,3.12939523827,202.2533951741],
[5.863206E-5,.23656938524,529.6909650946],[5.227757E-5,4.20783365759,3.1813937377],[6.126317E-5,1.76328667907,277.0349937414],[5.019687E-5,3.17787728405,433.7117378768],[4.59255E-5,.61977744975,199.0720014364],[4.005867E-5,2.24479718502,63.7358983034],[2.953796E-5,.98280366998,95.9792272178],[3.87367E-5,3.22283226966,138.5174968707],[2.461186E-5,2.03163875071,735.8765135318],[3.269484E-5,.77492638211,949.1756089698],[1.758145E-5,3.2658010994,522.5774180938],[1.640172E-5,5.5050445305,846.0828347512],
[1.391327E-5,4.02333150505,323.5054166574],[1.580648E-5,4.37265307169,309.2783226558],[1.123498E-5,2.83726798446,415.5524906121],[1.017275E-5,3.71700135395,227.5261894396],[8.48642E-6,3.1915017083,209.3669421749]],[[213.2990952169,0,0],[.01297370862,1.82834923978,213.299095438],[.00564345393,2.88499717272,7.1135470008],[9.3734369E-4,1.06311793502,426.598190876],[.00107674962,2.27769131009,206.1855484372],[4.0244455E-4,2.04108104671,220.4126424388],[1.9941774E-4,1.2795439047,103.0927742186],[1.0511678E-4,
2.7488034213,14.2270940016],[6.416106E-5,.38238295041,639.897286314],[4.848994E-5,2.43037610229,419.4846438752],[4.056892E-5,2.92133209468,110.2063212194],[3.768635E-5,3.6496533078,3.9321532631]],[[.0011644133,1.17988132879,7.1135470008],[9.1841837E-4,.0732519584,213.299095438],[3.6661728E-4,0,0],[1.5274496E-4,4.06493179167,206.1855484372]]],[[[.04330678039,3.60284428399,213.299095438],[.00240348302,2.85238489373,426.598190876],[8.4745939E-4,0,0],[3.0863357E-4,3.48441504555,220.4126424388],[3.4116062E-4,
.57297307557,206.1855484372],[1.473407E-4,2.11846596715,639.897286314],[9.916667E-5,5.79003188904,419.4846438752],[6.993564E-5,4.7360468972,7.1135470008],[4.807588E-5,5.43305312061,316.3918696566]],[[.00198927992,4.93901017903,213.299095438],[3.6947916E-4,3.14159265359,0],[1.7966989E-4,.5197943111,426.598190876]]],[[[9.55758135486,0,0],[.52921382865,2.39226219573,213.299095438],[.01873679867,5.2354960466,206.1855484372],[.01464663929,1.64763042902,426.598190876],[.00821891141,5.93520042303,316.3918696566],
[.00547506923,5.0153261898,103.0927742186],[.0037168465,2.27114821115,220.4126424388],[.00361778765,3.13904301847,7.1135470008],[.00140617506,5.70406606781,632.7837393132],[.00108974848,3.29313390175,110.2063212194],[6.9006962E-4,5.94099540992,419.4846438752],[6.1053367E-4,.94037691801,639.897286314],[4.8913294E-4,1.55733638681,202.2533951741],[3.4143772E-4,.19519102597,277.0349937414],[3.2401773E-4,5.47084567016,949.1756089698],[2.0936596E-4,.46349251129,735.8765135318],[9.796004E-5,5.20477537945,
1265.5674786264],[1.1993338E-4,5.98050967385,846.0828347512],[2.08393E-4,1.52102476129,433.7117378768],[1.5298404E-4,3.0594381494,529.6909650946],[6.465823E-5,.17732249942,1052.2683831884],[1.1380257E-4,1.7310542704,522.5774180938],[3.419618E-5,4.94550542171,1581.959348283]],[[.0618298134,.2584351148,213.299095438],[.00506577242,.71114625261,206.1855484372],[.00341394029,5.79635741658,426.598190876],[.00188491195,.47215589652,220.4126424388],[.00186261486,3.14159265359,0],[.00143891146,1.40744822888,
7.1135470008]],[[.00436902572,4.78671677509,213.299095438]]]],Uranus:[[[[5.48129294297,0,0],[.09260408234,.89106421507,74.7815985673],[.01504247898,3.6271926092,1.4844727083],[.00365981674,1.89962179044,73.297125859],[.00272328168,3.35823706307,149.5631971346],[7.0328461E-4,5.39254450063,63.7358983034],[6.8892678E-4,6.09292483287,76.2660712756],[6.1998615E-4,2.26952066061,2.9689454166],[6.1950719E-4,2.85098872691,11.0457002639],[2.646877E-4,3.14152083966,71.8126531507],[2.5710476E-4,6.11379840493,
454.9093665273],[2.107885E-4,4.36059339067,148.0787244263],[1.7818647E-4,1.74436930289,36.6485629295],[1.4613507E-4,4.73732166022,3.9321532631],[1.1162509E-4,5.8268179635,224.3447957019],[1.099791E-4,.48865004018,138.5174968707],[9.527478E-5,2.95516862826,35.1640902212],[7.545601E-5,5.236265824,109.9456887885],[4.220241E-5,3.23328220918,70.8494453042],[4.0519E-5,2.277550173,151.0476698429],[3.354596E-5,1.0654900738,4.4534181249],[2.926718E-5,4.62903718891,9.5612275556],[3.49034E-5,5.48306144511,146.594251718],
[3.144069E-5,4.75199570434,77.7505439839],[2.922333E-5,5.35235361027,85.8272988312],[2.272788E-5,4.36600400036,70.3281804424],[2.051219E-5,1.51773566586,.1118745846],[2.148602E-5,.60745949945,38.1330356378],[1.991643E-5,4.92437588682,277.0349937414],[1.376226E-5,2.04283539351,65.2203710117],[1.666902E-5,3.62744066769,380.12776796],[1.284107E-5,3.11347961505,202.2533951741],[1.150429E-5,.93343589092,3.1813937377],[1.533221E-5,2.58594681212,52.6901980395],[1.281604E-5,.54271272721,222.8603229936],[1.372139E-5,
4.19641530878,111.4301614968],[1.221029E-5,.1990065003,108.4612160802],[9.46181E-6,1.19253165736,127.4717966068],[1.150989E-5,4.17898916639,33.6796175129]],[[74.7815986091,0,0],[.00154332863,5.24158770553,74.7815985673],[2.4456474E-4,1.71260334156,1.4844727083],[9.258442E-5,.4282973235,11.0457002639],[8.265977E-5,1.50218091379,63.7358983034],[9.15016E-5,1.41213765216,149.5631971346]]],[[[.01346277648,2.61877810547,74.7815985673],[6.23414E-4,5.08111189648,149.5631971346],[6.1601196E-4,3.14159265359,
0],[9.963722E-5,1.61603805646,76.2660712756],[9.92616E-5,.57630380333,73.297125859]],[[3.4101978E-4,.01321929936,74.7815985673]]],[[[19.21264847206,0,0],[.88784984413,5.60377527014,74.7815985673],[.03440836062,.32836099706,73.297125859],[.0205565386,1.7829515933,149.5631971346],[.0064932241,4.52247285911,76.2660712756],[.00602247865,3.86003823674,63.7358983034],[.00496404167,1.40139935333,454.9093665273],[.00338525369,1.58002770318,138.5174968707],[.00243509114,1.57086606044,71.8126531507],[.00190522303,
1.99809394714,1.4844727083],[.00161858838,2.79137786799,148.0787244263],[.00143706183,1.38368544947,11.0457002639],[9.3192405E-4,.17437220467,36.6485629295],[7.1424548E-4,4.24509236074,224.3447957019],[8.9806014E-4,3.66105364565,109.9456887885],[3.9009723E-4,1.66971401684,70.8494453042],[4.6677296E-4,1.39976401694,35.1640902212],[3.9025624E-4,3.36234773834,277.0349937414],[3.6755274E-4,3.88649278513,146.594251718],[3.0348723E-4,.70100838798,151.0476698429],[2.9156413E-4,3.180563367,77.7505439839],
[2.2637073E-4,.72518687029,529.6909650946],[1.1959076E-4,1.7504339214,984.6003316219],[2.5620756E-4,5.25656086672,380.12776796]],[[.01479896629,3.67205697578,74.7815985673]]]],Neptune:[[[[5.31188633046,0,0],[.0179847553,2.9010127389,38.1330356378],[.01019727652,.48580922867,1.4844727083],[.00124531845,4.83008090676,36.6485629295],[4.2064466E-4,5.41054993053,2.9689454166],[3.7714584E-4,6.09221808686,35.1640902212],[3.3784738E-4,1.24488874087,76.2660712756],[1.6482741E-4,7.727998E-5,491.5579294568],
[9.198584E-5,4.93747051954,39.6175083461],[8.99425E-5,.27462171806,175.1660598002]],[[38.13303563957,0,0],[1.6604172E-4,4.86323329249,1.4844727083],[1.5744045E-4,2.27887427527,38.1330356378]]],[[[.03088622933,1.44104372644,38.1330356378],[2.7780087E-4,5.91271884599,76.2660712756],[2.7623609E-4,0,0],[1.5355489E-4,2.52123799551,36.6485629295],[1.5448133E-4,3.50877079215,39.6175083461]]],[[[30.07013205828,0,0],[.27062259632,1.32999459377,38.1330356378],[.01691764014,3.25186135653,36.6485629295],[.00807830553,
5.18592878704,1.4844727083],[.0053776051,4.52113935896,35.1640902212],[.00495725141,1.5710564165,491.5579294568],[.00274571975,1.84552258866,175.1660598002],[1.201232E-4,1.92059384991,1021.2488945514],[.00121801746,5.79754470298,76.2660712756],[.00100896068,.3770272493,73.297125859],[.00135134092,3.37220609835,39.6175083461],[7.571796E-5,1.07149207335,388.4651552382]]]]};e.DeltaT_EspenakMeeus=sa;e.DeltaT_JplHorizons=function(a){return sa(Math.min(a,17*365.24217))};var Wb=sa;e.SetDeltaTFunction=function(a){Wb=
a};var O=function(a){if(a instanceof O)this.date=a.date,this.ut=a.ut,this.tt=a.tt;else if(a instanceof Date&&Number.isFinite(a.getTime()))this.date=a,this.ut=(a.getTime()-dd.getTime())/864E5,this.tt=Vb(this.ut);else if(Number.isFinite(a))this.date=new Date(dd.getTime()+864E5*a),this.ut=a,this.tt=Vb(this.ut);else throw"Argument must be a Date object, an AstroTime object, or a numeric UTC Julian date.";};O.FromTerrestrialTime=function(a){for(var b=new O(a);;){var c=a-b.tt;if(1E-12>Math.abs(c))return b;
b=b.AddDays(c)}};O.prototype.toString=function(){return this.date.toISOString()};O.prototype.AddDays=function(a){return new O(this.ut+a)};e.AstroTime=O;e.MakeTime=v;var $a;e.e_tilt=da;e.CalcMoonCount=0;var ed=function(a,b,c,d,f,g){this.elat=a;this.elon=b;this.mlat=c;this.mlon=d;this.dist_km=f;this.diam_deg=g};e.LibrationInfo=ed;e.Libration=function(a){var b=v(a);a=b.tt/36525;var c=a*a,d=c*a,f=c*c,g=ea(b);b=g.geo_eclip_lon;var h=g.geo_eclip_lat;g=g.distance_au*e.KM_PER_AU;var l=1.543*e.DEG2RAD,k=e.DEG2RAD*
Ga(93.272095+483202.0175233*a-.0036539*c-d/3526E3+f/86331E4),n=e.DEG2RAD*Ga(125.0445479-1934.1362891*a+.0020754*c+d/467441-f/60616E3),p=e.DEG2RAD*Ga(357.5291092+35999.0502909*a-1.536E-4*c+d/2449E4),q=e.DEG2RAD*Ga(134.9633964+477198.8675055*a+.0087414*c+d/69699-f/14712E3);d=e.DEG2RAD*Ga(297.8501921+445267.1114034*a-.0018819*c+d/545868-f/113065E3);c=1-.002516*a-7.4E-6*c;var t=b-n;f=Math.atan2(Math.sin(t)*Math.cos(h)*Math.cos(l)-Math.sin(h)*Math.sin(l),Math.cos(t)*Math.cos(h));var y=Fa(e.RAD2DEG*(f-
k));l=Math.asin(-Math.sin(t)*Math.cos(h)*Math.sin(l)-Math.sin(h)*Math.cos(l));t=-.02752*Math.cos(q)+-.02245*Math.sin(k)+.00684*Math.cos(q-2*k)+-.00293*Math.cos(2*k)+-8.5E-4*Math.cos(2*k-2*d)+-5.4E-4*Math.cos(q-2*d)+-2E-4*Math.sin(q+k)+-2E-4*Math.cos(q+2*k)+-2E-4*Math.cos(q-k)+1.4E-4*Math.cos(q+2*k-2*d);var x=-.02816*Math.sin(q)+.02244*Math.cos(k)+-.00682*Math.sin(q-2*k)+-.00279*Math.sin(2*k)+-8.3E-4*Math.sin(2*k-2*d)+6.9E-4*Math.sin(q-2*d)+4E-4*Math.cos(q+k)+-2.5E-4*Math.sin(2*q)+-2.3E-4*Math.sin(q+
2*k)+2E-4*Math.cos(q-k)+1.9E-4*Math.sin(q-k)+1.3E-4*Math.sin(q+2*k-2*d)+-1E-4*Math.cos(q-3*k);return new ed(e.RAD2DEG*l+(x*Math.cos(f)-t*Math.sin(f)),y+(-(.0252*c*Math.sin(p)+.00473*Math.sin(2*q-2*k)+-.00467*Math.sin(q)+.00396*Math.sin(e.DEG2RAD*(119.75+131.849*a))+.00276*Math.sin(2*q-2*d)+.00196*Math.sin(n)+-.00183*Math.cos(q-k)+.00115*Math.sin(q-2*d)+-9.6E-4*Math.sin(q-d)+4.6E-4*Math.sin(2*k-2*d)+-3.9E-4*Math.sin(q-k)+-3.2E-4*Math.sin(q-p-d)+2.7E-4*Math.sin(2*q-p-2*d)+2.3E-4*Math.sin(e.DEG2RAD*
(72.56+20.186*a))+-1.4E-4*Math.sin(2*d)+1.4E-4*Math.cos(2*q-2*k)+-1.2E-4*Math.sin(q-2*k)+-1.2E-4*Math.sin(2*q)+1.1E-4*Math.sin(2*q-2*p-2*d))+(t*Math.cos(f)+x*Math.sin(f))*Math.tan(l)),e.RAD2DEG*h,e.RAD2DEG*b,g,2*e.RAD2DEG*Math.atan(1737.4/Math.sqrt(g*g-1737.4*1737.4)))};var eb;e.SiderealTime=bc;var E=function(a,b,c,d){this.x=a;this.y=b;this.z=c;this.t=d};E.prototype.Length=function(){return Math.hypot(this.x,this.y,this.z)};e.Vector=E;var I=function(a,b,c,d,f,g,h){this.x=a;this.y=b;this.z=c;this.vx=
d;this.vy=f;this.vz=g;this.t=h};e.StateVector=I;var Ba=function(a,b,c){this.lat=w(a);this.lon=w(b);this.dist=w(c)};e.Spherical=Ba;var gb=function(a,b,c,d){this.ra=w(a);this.dec=w(b);this.dist=w(c);this.vec=d};e.EquatorialCoordinates=gb;var J=function(a){this.rot=a};e.RotationMatrix=J;e.MakeRotation=function(a){if(!qd(a))throw"Argument must be a [3][3] array of numbers";return new J(a)};var ec=function(a,b,c,d){this.azimuth=w(a);this.altitude=w(b);this.ra=w(c);this.dec=w(d)};e.HorizontalCoordinates=
ec;var gc=function(a,b,c){this.vec=a;this.elat=w(b);this.elon=w(c)};e.EclipticCoordinates=gc;e.Horizon=hb;var zb=function(a,b,c){this.latitude=a;this.longitude=b;this.height=c;za(this)};e.Observer=zb;e.SunPosition=fc;e.Equator=Pa;e.ObserverVector=function(a,b,c){a=v(a);var d=ca(a);b=xb(b,d).pos;c||(b=fb(b,a,F.Into2000));return yb(b,a)};e.ObserverState=function(a,b,c){a=v(a);var d=ca(a);b=xb(b,d);b=new I(b.pos[0],b.pos[1],b.pos[2],b.vel[0],b.vel[1],b.vel[2],a);return c?b:(c=F.Into2000,c===F.Into2000?
(d=Na(a,c),b=Ea(d,b),a=Ma(a,c),a=Ea(a,b)):(d=Ma(a,c),b=Ea(d,b),a=Na(a,c),a=Ea(a,b)),a)};e.VectorObserver=function(a,b){var c=ca(a.t),d=[a.x,a.y,a.z];b||(d=wa(d,a.t,F.From2000),d=xa(d,a.t,F.From2000));b=d[0]*e.KM_PER_AU;var f=d[1]*e.KM_PER_AU;d=d[2]*e.KM_PER_AU;a=Math.hypot(b,f);if(1E-6>a){c=0;var g=0<d?90:-90;d=Math.abs(d)-6356.751857971648}else{for(c=e.RAD2DEG*Math.atan2(f,b)-15*c;-180>=c;)c+=360;for(;180<c;)c-=360;g=Math.atan2(d,a);for(var h,l=0;;){if(10<++l)throw"inverse_terra failed to converge.";
b=Math.cos(g);f=Math.sin(g);var k=b*b,n=f*f,p=k+.9933056020041345*n;h=Math.sqrt(p);var q=-42.69778487239616*f*b/h-d*b+a*f;if(1E-8>Math.abs(q))break;g-=q/(-42.69778487239616*((k-n)/h-n*k*-.006694397995865464/(-42.69778487239616*p))+d*f+a*b)}g*=e.RAD2DEG;h=6378.1366/h;d=Math.abs(f)>Math.abs(b)?d/f-.9933056020041345*h:a/b-h}return new zb(g,c,1E3*d)};e.ObserverGravity=function(a,b){a=Math.sin(a*e.DEG2RAD);a*=a;return 9.7803253359*(1+.00193185265241*a)/Math.sqrt(1-.00669437999013*a)*(1-(3.15704E-7-2.10269E-9*
a)*b+7.37452E-14*b*b)};e.Ecliptic=Qa;e.GeoMoon=Y;e.EclipticGeoMoon=ib;e.GeoMoonState=Ra;e.GeoEmbState=Bb;var na=[[-73E4,[-26.118207232108,-14.376168177825,3.384402515299],[.0016339372163656,-.0027861699588508,-.0013585880229445]],[-700800,[41.974905202127,-.448502952929,-12.770351505989],[7.3458569351457E-4,.0022785014891658,4.8619778602049E-4]],[-671600,[14.706930780744,44.269110540027,9.353698474772],[-.00210001479998,2.2295915939915E-4,7.0143443551414E-4]],[-642400,[-29.441003929957,-6.43016153057,
6.858481011305],[8.4495803960544E-4,-.0030783914758711,-.0012106305981192]],[-613200,[39.444396946234,-6.557989760571,-13.913760296463],[.0011480029005873,.0022400006880665,3.5168075922288E-4]],[-584E3,[20.2303809507,43.266966657189,7.382966091923],[-.0019754081700585,5.3457141292226E-4,7.5929169129793E-4]],[-554800,[-30.65832536462,2.093818874552,9.880531138071],[6.1010603013347E-5,-.0031326500935382,-9.9346125151067E-4]],[-525600,[35.737703251673,-12.587706024764,-14.677847247563],[.0015802939375649,
.0021347678412429,1.9074436384343E-4]],[-496400,[25.466295188546,41.367478338417,5.216476873382],[-.0018054401046468,8.328308359951E-4,8.0260156912107E-4]],[-467200,[-29.847174904071,10.636426313081,12.297904180106],[-6.3257063052907E-4,-.0029969577578221,-7.4476074151596E-4]],[-438E3,[30.774692107687,-18.236637015304,-14.945535879896],[.0020113162005465,.0019353827024189,-2.0937793168297E-6]],[-408800,[30.243153324028,38.656267888503,2.938501750218],[-.0016052508674468,.0011183495337525,8.3333973416824E-4]],
[-379600,[-27.288984772533,18.643162147874,14.023633623329],[-.0011856388898191,-.0027170609282181,-4.9015526126399E-4]],[-350400,[24.519605196774,-23.245756064727,-14.626862367368],[.0024322321483154,.0016062008146048,-2.3369181613312E-4]],[-321200,[34.505274805875,35.125338586954,.557361475637],[-.0013824391637782,.0013833397561817,8.4823598806262E-4]],[-292E3,[-23.275363915119,25.818514298769,15.055381588598],[-.0016062295460975,-.0023395961498533,-2.4377362639479E-4]],[-262800,[17.050384798092,
-27.180376290126,-13.608963321694],[.0028175521080578,.0011358749093955,-4.9548725258825E-4]],[-233600,[38.093671910285,30.880588383337,-1.843688067413],[-.0011317697153459,.0016128814698472,8.4177586176055E-4]],[-204400,[-18.197852930878,31.932869934309,15.438294826279],[-.0019117272501813,-.0019146495909842,-1.9657304369835E-5]],[-175200,[8.528924039997,-29.618422200048,-11.805400994258],[.0031034370787005,5.139363329243E-4,-7.7293066202546E-4]],[-146E3,[40.94685725864,25.904973592021,-4.256336240499],
[-8.3652705194051E-4,.0018129497136404,8.156422827306E-4]],[-116800,[-12.326958895325,36.881883446292,15.217158258711],[-.0021166103705038,-.001481442003599,1.7401209844705E-4]],[-87600,[-.633258375909,-30.018759794709,-9.17193287495],[.0032016994581737,-2.5279858672148E-4,-.0010411088271861]],[-58400,[42.936048423883,20.344685584452,-6.588027007912],[-5.0525450073192E-4,.0019910074335507,7.7440196540269E-4]],[-29200,[-5.975910552974,40.61180995846,14.470131723673],[-.0022184202156107,-.0010562361130164,
3.3652250216211E-4]],[0,[-9.875369580774,-27.978926224737,-5.753711824704],[.0030287533248818,-.0011276087003636,-.0012651326732361]],[29200,[43.958831986165,14.214147973292,-8.808306227163],[-1.4717608981871E-4,.0021404187242141,7.1486567806614E-4]],[58400,[.67813676352,43.094461639362,13.243238780721],[-.0022358226110718,-6.3233636090933E-4,4.7664798895648E-4]],[87600,[-18.282602096834,-23.30503958666,-1.766620508028],[.0025567245263557,-.0019902940754171,-.0013943491701082]],[116800,[43.873338744526,
7.700705617215,-10.814273666425],[2.3174803055677E-4,.0022402163127924,6.2988756452032E-4]],[146E3,[7.392949027906,44.382678951534,11.629500214854],[-.002193281545383,-2.1751799585364E-4,5.9556516201114E-4]],[175200,[-24.981690229261,-16.204012851426,2.466457544298],[.001819398914958,-.0026765419531201,-.0013848283502247]],[204400,[42.530187039511,.845935508021,-12.554907527683],[6.5059779150669E-4,.0022725657282262,5.1133743202822E-4]],[233600,[13.999526486822,44.462363044894,9.669418486465],[-.0021079296569252,
1.7533423831993E-4,6.9128485798076E-4]],[262800,[-29.184024803031,-7.371243995762,6.493275957928],[9.3581363109681E-4,-.0030610357109184,-.0012364201089345]],[292E3,[39.831980671753,-6.078405766765,-13.909815358656],[.0011117769689167,.0022362097830152,3.6230548231153E-4]],[321200,[20.294955108476,43.417190420251,7.450091985932],[-.0019742157451535,5.3102050468554E-4,7.5938408813008E-4]],[350400,[-30.66999230216,2.318743558955,9.973480913858],[4.5605107450676E-5,-.0031308219926928,-9.9066533301924E-4]],
[379600,[35.626122155983,-12.897647509224,-14.777586508444],[.0016015684949743,.0021171931182284,1.8002516202204E-4]],[408800,[26.133186148561,41.232139187599,5.00640132622],[-.0017857704419579,8.6046232702817E-4,8.0614690298954E-4]],[438E3,[-29.57674022923,11.863535943587,12.631323039872],[-7.2292830060955E-4,-.0029587820140709,-7.08242964503E-4]],[467200,[29.910805787391,-19.159019294,-15.013363865194],[.0020871080437997,.0018848372554514,-3.8528655083926E-5]],[496400,[31.375957451819,38.050372720763,
2.433138343754],[-.0015546055556611,.0011699815465629,8.3565439266001E-4]],[525600,[-26.360071336928,20.662505904952,14.414696258958],[-.0013142373118349,-.0026236647854842,-4.2542017598193E-4]],[554800,[22.599441488648,-24.508879898306,-14.484045731468],[.0025454108304806,.0014917058755191,-3.0243665086079E-4]],[584E3,[35.877864013014,33.894226366071,-.224524636277],[-.0012941245730845,.0014560427668319,8.4762160640137E-4]],[613200,[-21.538149762417,28.204068269761,15.321973799534],[-.001731211740901,
-.0021939631314577,-1.631691327518E-4]],[642400,[13.971521374415,-28.339941764789,-13.083792871886],[.0029334630526035,9.1860931752944E-4,-5.9939422488627E-4]],[671600,[39.526942044143,28.93989736011,-2.872799527539],[-.0010068481658095,.001702113288809,8.3578230511981E-4]],[700800,[-15.576200701394,34.399412961275,15.466033737854],[-.0020098814612884,-.0017191109825989,7.0414782780416E-5]],[73E4,[4.24325283709,-30.118201690825,-10.707441231349],[.0031725847067411,1.609846120227E-4,-9.0672150593868E-4]]],
B=function(a,b,c){this.x=a;this.y=b;this.z=c};B.prototype.clone=function(){return new B(this.x,this.y,this.z)};B.prototype.ToAstroVector=function(a){return new E(this.x,this.y,this.z,a)};B.zero=function(){return new B(0,0,0)};B.prototype.quadrature=function(){return this.x*this.x+this.y*this.y+this.z*this.z};B.prototype.add=function(a){return new B(this.x+a.x,this.y+a.y,this.z+a.z)};B.prototype.sub=function(a){return new B(this.x-a.x,this.y-a.y,this.z-a.z)};B.prototype.incr=function(a){this.x+=a.x;
this.y+=a.y;this.z+=a.z};B.prototype.decr=function(a){this.x-=a.x;this.y-=a.y;this.z-=a.z};B.prototype.mul=function(a){return new B(a*this.x,a*this.y,a*this.z)};B.prototype.div=function(a){return new B(this.x/a,this.y/a,this.z/a)};B.prototype.mean=function(a){return new B((this.x+a.x)/2,(this.y+a.y)/2,(this.z+a.z)/2)};B.prototype.neg=function(){return new B(-this.x,-this.y,-this.z)};var X=function(a,b,c){this.tt=a;this.r=b;this.v=c};X.prototype.clone=function(){return new X(this.tt,this.r,this.v)};
X.prototype.sub=function(a){return new X(this.tt,this.r.sub(a.r),this.v.sub(a.v))};var Da=function(a){var b=new X(a,new B(0,0,0),new B(0,0,0));this.Jupiter=R(b,a,m.Jupiter,2.825345909524226E-7);this.Saturn=R(b,a,m.Saturn,8.459715185680659E-8);this.Uranus=R(b,a,m.Uranus,1.292024916781969E-8);this.Neptune=R(b,a,m.Neptune,1.524358900784276E-8);this.Jupiter.r.decr(b.r);this.Jupiter.v.decr(b.v);this.Saturn.r.decr(b.r);this.Saturn.v.decr(b.v);this.Uranus.r.decr(b.r);this.Uranus.v.decr(b.v);this.Neptune.r.decr(b.r);
this.Neptune.v.decr(b.v);this.Sun=new X(a,b.r.mul(-1),b.v.mul(-1))};Da.prototype.Acceleration=function(a){var b=Ta(a,2.959122082855911E-4,this.Sun.r);b.incr(Ta(a,2.825345909524226E-7,this.Jupiter.r));b.incr(Ta(a,8.459715185680659E-8,this.Saturn.r));b.incr(Ta(a,1.292024916781969E-8,this.Uranus.r));b.incr(Ta(a,1.524358900784276E-8,this.Neptune.r));return b};var Ua=function(a,b,c,d){this.tt=a;this.r=b;this.v=c;this.a=d};Ua.prototype.clone=function(){return new Ua(this.tt,this.r.clone(),this.v.clone(),
this.a.clone())};var ic=function(a,b){this.bary=a;this.grav=b},Ib=[],rd=new J([[.999432765338654,-.0336771074697641,0],[.0303959428906285,.902057912352809,.430543388542295],[-.0144994559663353,-.430299169409101,.902569881273754]]),tb=[{mu:2.82489428433814E-7,al:[1.446213296021224,3.5515522861824],a:[[.0028210960212903,0,0]],l:[[-1.925258348666E-4,4.9369589722645,.01358483658305],[-9.70803596076E-5,4.3188796477322,.01303413843243],[-8.988174165E-5,1.9080016428617,.00305064867158],[-5.53101050262E-5,
1.4936156681569,.01293892891155]],z:[[.0041510849668155,4.089939635545,-.01290686414666],[6.260521444113E-4,1.446188898627,3.5515522949802],[3.52747346169E-5,2.1256287034578,1.2727416567E-4]],zeta:[[3.142172466014E-4,2.7964219722923,-.002315096098],[9.04169207946E-5,1.0477061879627,-5.6920638196E-4]]},{mu:2.82483274392893E-7,al:[-.3735263437471362,1.76932271112347],a:[[.0044871037804314,0,0],[4.324367498E-7,1.819645606291,1.7822295777568]],l:[[8.576433172936E-4,4.3188693178264,.01303413830805],[4.549582875086E-4,
1.4936531751079,.01293892881962],[3.248939825174E-4,1.8196494533458,1.7822295777568],[-3.074250079334E-4,4.9377037005911,.01358483286724],[1.982386144784E-4,1.907986905476,.00305101212869],[1.834063551804E-4,2.1402853388529,.00145009789338],[-1.434383188452E-4,5.622214036663,.89111478887838],[-7.71939140944E-5,4.300272437235,2.6733443704266]],z:[[-.0093589104136341,4.0899396509039,-.01290686414666],[2.988994545555E-4,5.9097265185595,1.7693227079462],[2.13903639035E-4,2.1256289300016,1.2727418407E-4],
[1.980963564781E-4,2.743516829265,6.7797343009E-4],[1.210388158965E-4,5.5839943711203,3.20566149E-5],[8.37042048393E-5,1.6094538368039,-.90402165808846],[8.23525166369E-5,1.4461887708689,3.5515522949802]],zeta:[[.0040404917832303,1.0477063169425,-5.692064054E-4],[2.200421034564E-4,3.3368857864364,-1.2491307307E-4],[1.662544744719E-4,2.4134862374711,0],[5.90282470983E-5,5.9719930968366,-3.056160225E-5]]},{mu:2.82498184184723E-7,al:[.2874089391143348,.878207923589328],a:[[.0071566594572575,0,0],[1.393029911E-6,
1.1586745884981,2.6733443704266]],l:[[2.310797886226E-4,2.1402987195942,.00145009784384],[-1.828635964118E-4,4.3188672736968,.01303413828263],[1.512378778204E-4,4.9373102372298,.01358483481252],[-1.163720969778E-4,4.300265986149,2.6733443704266],[-9.55478069846E-5,1.4936612842567,.01293892879857],[8.15246854464E-5,5.6222137132535,.89111478887838],[-8.01219679602E-5,1.2995922951532,1.0034433456729],[-6.07017260182E-5,.64978769669238,.50172167043264]],z:[[.0014289811307319,2.1256295942739,1.2727413029E-4],
[7.71093122676E-4,5.5836330003496,3.20643411E-5],[5.925911780766E-4,4.0899396636448,-.01290686414666],[2.045597496146E-4,5.2713683670372,-.12523544076106],[1.785118648258E-4,.28743156721063,.8782079244252],[1.131999784893E-4,1.4462127277818,3.5515522949802],[-6.5877816921E-5,2.2702423990985,-1.7951364394537],[4.97058888328E-5,5.9096792204858,1.7693227129285]],zeta:[[.0015932721570848,3.3368862796665,-1.2491307058E-4],[8.533093128905E-4,2.4133881688166,0],[3.513347911037E-4,5.9720789850127,-3.056101771E-5],
[-1.441929255483E-4,1.0477061764435,-5.6920632124E-4]]},{mu:2.82492144889909E-7,al:[-.3620341291375704,.376486233433828],a:[[.0125879701715314,0,0],[3.595204947E-6,.64965776007116,.50172168165034],[2.7580210652E-6,1.808423578151,3.1750660413359]],l:[[5.586040123824E-4,2.1404207189815,.00145009793231],[-3.805813868176E-4,2.7358844897853,2.972965062E-5],[2.205152863262E-4,.649796525964,.5017216724358],[1.877895151158E-4,1.8084787604005,3.1750660413359],[7.66916975242E-5,6.2720114319755,1.3928364636651],
[7.47056855106E-5,1.2995916202344,1.0034433456729]],z:[[.0073755808467977,5.5836071576084,3.206509914E-5],[2.065924169942E-4,5.9209831565786,.37648624194703],[1.589869764021E-4,.28744006242623,.8782079244252],[-1.561131605348E-4,2.1257397865089,1.2727441285E-4],[1.486043380971E-4,1.4462134301023,3.5515522949802],[6.35073108731E-5,5.9096803285954,1.7693227129285],[5.99351698525E-5,4.1125517584798,-2.7985797954589],[5.40660842731E-5,5.5390350845569,.00286834082283],[-4.89596900866E-5,4.6218149483338,
-.62695712529519]],zeta:[[.0038422977898495,2.4133922085557,0],[.0022453891791894,5.9721736773277,-3.056125525E-5],[-2.604479450559E-4,3.3368746306409,-1.2491309972E-4],[3.3211214323E-5,5.5604137742337,.00290037688507]]}],fd=function(a,b,c,d){this.io=a;this.europa=b;this.ganymede=c;this.callisto=d};e.JupiterMoonsInfo=fd;e.JupiterMoons=function(a){a=new O(a);return new fd(kb(a,tb[0]),kb(a,tb[1]),kb(a,tb[2]),kb(a,tb[3]))};e.HelioVector=Z;e.HelioDistance=oa;e.CorrectLightTravel=lc;var nc=function(a,
b,c,d){this.observerBody=a;this.targetBody=b;this.aberration=c;this.observerPos=d};nc.prototype.Position=function(a){this.aberration&&(this.observerPos=Z(this.observerBody,a));var b=Z(this.targetBody,a);return new E(b.x-this.observerPos.x,b.y-this.observerPos.y,b.z-this.observerPos.z,a)};e.BackdatePosition=mc;e.GeoVector=W;e.BaryState=function(a,b){b=v(b);if(a===m.SSB)return new I(0,0,0,0,0,0,b);if(a===m.Pluto)return Hb(b,!1);var c=new Da(b.tt);switch(a){case m.Sun:return pa(c.Sun,b);case m.Jupiter:return pa(c.Jupiter,
b);case m.Saturn:return pa(c.Saturn,b);case m.Uranus:return pa(c.Uranus,b);case m.Neptune:return pa(c.Neptune,b);case m.Moon:case m.EMB:var d=Sa(M[m.Earth],b.tt);a=a===m.Moon?Ra(b):Bb(b);return new I(a.x+c.Sun.r.x+d.r.x,a.y+c.Sun.r.y+d.r.y,a.z+c.Sun.r.z+d.r.z,a.vx+c.Sun.v.x+d.v.x,a.vy+c.Sun.v.y+d.v.y,a.vz+c.Sun.v.z+d.v.z,b)}if(a in M)return a=Sa(M[a],b.tt),new I(c.Sun.r.x+a.r.x,c.Sun.r.y+a.r.y,c.Sun.r.z+a.r.z,c.Sun.v.x+a.v.x,c.Sun.v.y+a.v.y,c.Sun.v.z+a.v.z,b);throw'BaryState: Unsupported body "'+
a+'"';};e.HelioState=mb;e.Search=K;e.SearchSunLongitude=oc;e.PairLongitude=Jb;e.AngleFromSun=Ha;e.EclipticLongitude=qa;var pc=function(a,b,c,d,f,g,h,l){this.time=a;this.mag=b;this.phase_angle=c;this.helio_dist=d;this.geo_dist=f;this.gc=g;this.hc=h;this.ring_tilt=l;this.phase_fraction=(1+Math.cos(e.DEG2RAD*c))/2};e.IlluminationInfo=pc;e.Illumination=nb;e.SearchRelativeLongitude=Ia;e.MoonPhase=Kb;e.SearchMoonPhase=Wa;var rc=function(a,b){this.quarter=a;this.time=b};e.MoonQuarter=rc;e.SearchMoonQuarter=
qc;e.NextMoonQuarter=function(a){a=new Date(a.time.date.getTime()+5184E5);return qc(a)};var tc=function(a,b,c){this.pressure=a;this.temperature=b;this.density=c};e.AtmosphereInfo=tc;e.Atmosphere=sc;e.SearchRiseSet=function(a,b,c,d,f,g){g=void 0===g?0:g;if(!Number.isFinite(g)||0>g)throw"Invalid value for metersAboveGround: "+g;a:switch(a){case m.Sun:var h=Nc;break a;case m.Moon:h=Dd;break a;default:h=0}var l=sc(b.height-g),k=b.latitude*e.DEG2RAD,n=Math.sin(k);k=Math.cos(k);var p=1/Math.hypot(k,.996647180302104*
n),q=(b.height-g)/1E3,t=.175*Math.pow(1-.0065/283.15*(b.height-2/3*g),3.256);return uc(a,b,c,d,f,h,e.RAD2DEG*-(Math.sqrt(2*(1-t)*g/(1E3*Math.hypot((6378.1366*p+q)*k,(6335.438815127603*p+q)*n)))/(1-t))-Ed*l.density)};e.SearchAltitude=function(a,b,c,d,f,g){if(!Number.isFinite(g)||-90>g||90<g)throw"Invalid altitude angle: "+g;return uc(a,b,c,d,f,0,g)};var ud=function(a,b,c,d){this.tx=a;this.ty=b;this.ax=c;this.ay=d},gd=function(a,b){this.time=a;this.hor=b};e.HourAngleEvent=gd;e.SearchHourAngle=function(a,
b,c,d,f){f=void 0===f?1:f;za(b);d=v(d);var g=0;if(a===m.Earth)throw"Cannot search for hour angle of the Earth.";w(c);if(0>c||24<=c)throw"Invalid hour angle "+c;w(f);if(0===f)throw"Direction must be positive or negative.";for(;;){++g;var h=ca(d),l=Pa(a,d,b,!0,!0);h=(c+l.ra-b.longitude/15-h)%24;1===g?0<f?0>h&&(h+=24):0<h&&(h-=24):-12>h?h+=24:12<h&&(h-=24);if(.1>3600*Math.abs(h))return a=hb(d,b,l.ra,l.dec,"normal"),new gd(d,a);d=d.AddDays(h/24*.9972695717592592)}};e.HourAngle=function(a,b,c){var d=v(b);
b=bc(d);a=Pa(a,d,c,!0,!0);c=(c.longitude/15+b-a.ra)%24;0>c&&(c+=24);return c};var hd=function(a,b,c,d){this.mar_equinox=a;this.jun_solstice=b;this.sep_equinox=c;this.dec_solstice=d};e.SeasonInfo=hd;e.Seasons=function(a){function b(h,l,k){l=new Date(Date.UTC(a,l-1,k));h=oc(h,l,20);if(!h)throw"Cannot find season change near "+l.toISOString();return h}a instanceof Date&&Number.isFinite(a.getTime())&&(a=a.getUTCFullYear());if(!Number.isSafeInteger(a))throw"Cannot calculate seasons because year argument "+
a+" is neither a Date nor a safe integer.";var c=b(0,3,10),d=b(90,6,10),f=b(180,9,10),g=b(270,12,10);return new hd(c,d,f,g)};var wc=function(a,b,c,d){this.time=a;this.visibility=b;this.elongation=c;this.ecliptic_separation=d};e.ElongationEvent=wc;e.Elongation=vc;e.SearchMaxElongation=function(a,b){function c(n){var p=n.AddDays(-.005);n=n.AddDays(.005);p=Ha(a,p);n=Ha(a,n);return(p-n)/.01}b=v(b);var d={Mercury:{s1:50,s2:85},Venus:{s1:40,s2:50}}[a];if(!d)throw"SearchMaxElongation works for Mercury and Venus only.";
for(var f=0;2>=++f;){var g=qa(a,b),h=qa(m.Earth,b),l=Fa(g-h),k=g=h=void 0;l>=-d.s1&&l<+d.s1?(k=0,h=+d.s1,g=+d.s2):l>=+d.s2||l<-d.s2?(k=0,h=-d.s2,g=-d.s1):0<=l?(k=-Va(a)/4,h=+d.s1,g=+d.s2):(k=-Va(a)/4,h=-d.s2,g=-d.s1);l=b.AddDays(k);h=Ia(a,h,l);g=Ia(a,g,h);l=c(h);if(0<=l)throw"SearchMaxElongation: internal error: m1 = "+l;k=c(g);if(0>=k)throw"SearchMaxElongation: internal error: m2 = "+k;l=K(c,h,g,{init_f1:l,init_f2:k,dt_tolerance_seconds:10});if(!l)throw"SearchMaxElongation: failed search iter "+
f+" (t1="+h.toString()+", t2="+g.toString()+")";if(l.tt>=b.tt)return vc(a,l);b=g.AddDays(1)}throw"SearchMaxElongation: failed to find event after 2 tries.";};e.SearchPeakMagnitude=function(a,b){function c(k){var n=k.AddDays(-.005);k=k.AddDays(.005);n=nb(a,n).mag;return(nb(a,k).mag-n)/.01}if(a!==m.Venus)throw"SearchPeakMagnitude currently works for Venus only.";b=v(b);for(var d=0;2>=++d;){var f=qa(a,b),g=qa(m.Earth,b),h=Fa(f-g),l=f=g=void 0;-10<=h&&10>h?(l=0,g=10,f=30):30<=h||-30>h?(l=0,g=-30,f=-10):
0<=h?(l=-Va(a)/4,g=10,f=30):(l=-Va(a)/4,g=-30,f=-10);h=b.AddDays(l);g=Ia(a,g,h);f=Ia(a,f,g);h=c(g);if(0<=h)throw"SearchPeakMagnitude: internal error: m1 = "+h;l=c(f);if(0>=l)throw"SearchPeakMagnitude: internal error: m2 = "+l;h=K(c,g,f,{init_f1:h,init_f2:l,dt_tolerance_seconds:10});if(!h)throw"SearchPeakMagnitude: failed search iter "+d+" (t1="+g.toString()+", t2="+f.toString()+")";if(h.tt>=b.tt)return nb(a,h);b=f.AddDays(1)}throw"SearchPeakMagnitude: failed to find event after 2 tries.";};var Ja;
(function(a){a[a.Pericenter=0]="Pericenter";a[a.Apocenter=1]="Apocenter"})(Ja=e.ApsisKind||(e.ApsisKind={}));var Xa=function(a,b,c){this.time=a;this.kind=b;this.dist_au=c;this.dist_km=c*e.KM_PER_AU};e.Apsis=Xa;e.SearchLunarApsis=xc;e.NextLunarApsis=function(a){var b=xc(a.time.AddDays(11));if(1!==b.kind+a.kind)throw"NextLunarApsis INTERNAL ERROR: did not find alternating apogee/perigee: prev="+a.kind+" @ "+a.time.toString()+", next="+b.kind+" @ "+b.time.toString();return b};e.SearchPlanetApsis=zc;
e.NextPlanetApsis=function(a,b){if(b.kind!==Ja.Pericenter&&b.kind!==Ja.Apocenter)throw"Invalid apsis kind: "+b.kind;var c=b.time.AddDays(.25*aa[a].OrbitalPeriod);a=zc(a,c);if(1!==a.kind+b.kind)throw"Internal error: previous apsis was "+b.kind+", but found "+a.kind+" for next apsis.";return a};e.InverseRotation=Ka;e.CombineRotation=ja;e.IdentityMatrix=function(){return new J([[1,0,0],[0,1,0],[0,0,1]])};e.Pivot=function(a,b,c){if(0!==b&&1!==b&&2!==b)throw"Invalid axis "+b+". Must be [0, 1, 2].";var d=
w(c)*e.DEG2RAD;c=Math.cos(d);d=Math.sin(d);var f=(b+1)%3,g=(b+2)%3,h=[[0,0,0],[0,0,0],[0,0,0]];h[f][f]=c*a.rot[f][f]-d*a.rot[f][g];h[f][g]=d*a.rot[f][f]+c*a.rot[f][g];h[f][b]=a.rot[f][b];h[g][f]=c*a.rot[g][f]-d*a.rot[g][g];h[g][g]=d*a.rot[g][f]+c*a.rot[g][g];h[g][b]=a.rot[g][b];h[b][f]=c*a.rot[b][f]-d*a.rot[b][g];h[b][g]=d*a.rot[b][f]+c*a.rot[b][g];h[b][b]=a.rot[b][b];return new J(h)};e.VectorFromSphere=lb;e.EquatorFromVector=Mb;e.SphereFromVector=Nb;e.HorizonFromVector=function(a,b){a=Nb(a);a.lon=
Ac(a.lon);a.lat+=Oa(b,a.lat);return a};e.VectorFromHorizon=function(a,b,c){b=v(b);var d=Ac(a.lon);c=a.lat+Bc(c,a.lat);a=new Ba(c,d,a.dist);return lb(a,b)};e.Refraction=Oa;e.InverseRefraction=Bc;e.RotateVector=Ya;e.RotateState=Ea;e.Rotation_EQJ_ECL=Cc;e.Rotation_ECL_EQJ=function(){return new J([[1,0,0],[0,.9174821430670688,.3977769691083922],[0,-.3977769691083922,.9174821430670688]])};e.Rotation_EQJ_EQD=ob;e.Rotation_EQJ_ECT=function(a){var b=v(a);a=ob(b);b=Jc(b);return ja(a,b)};e.Rotation_ECT_EQJ=
function(a){var b=v(a);a=Ic(b);b=pb(b);return ja(a,b)};e.Rotation_EQD_EQJ=pb;e.Rotation_EQD_HOR=Ob;e.Rotation_HOR_EQD=Dc;e.Rotation_HOR_EQJ=Ec;e.Rotation_EQJ_HOR=function(a,b){a=Ec(a,b);return Ka(a)};e.Rotation_EQD_ECL=Fc;e.Rotation_ECL_EQD=Gc;e.Rotation_ECL_HOR=Hc;e.Rotation_HOR_ECL=function(a,b){a=Hc(a,b);return Ka(a)};e.Rotation_EQJ_GAL=function(){return new J([[-.0548624779711344,.4941095946388765,-.8676668813529025],[-.8734572784246782,-.4447938112296831,-.1980677870294097],[-.483800052994852,
.7470034631630423,.4559861124470794]])};e.Rotation_GAL_EQJ=function(){return new J([[-.0548624779711344,-.8734572784246782,-.483800052994852],[.4941095946388765,-.4447938112296831,.7470034631630423],[-.8676668813529025,-.1980677870294097,.4559861124470794]])};e.Rotation_ECT_EQD=Ic;e.Rotation_EQD_ECT=Jc;var Fd=[["And","Andromeda"],["Ant","Antila"],["Aps","Apus"],["Aql","Aquila"],["Aqr","Aquarius"],["Ara","Ara"],["Ari","Aries"],["Aur","Auriga"],["Boo","Bootes"],["Cae","Caelum"],["Cam","Camelopardis"],
["Cap","Capricornus"],["Car","Carina"],["Cas","Cassiopeia"],["Cen","Centaurus"],["Cep","Cepheus"],["Cet","Cetus"],["Cha","Chamaeleon"],["Cir","Circinus"],["CMa","Canis Major"],["CMi","Canis Minor"],["Cnc","Cancer"],["Col","Columba"],["Com","Coma Berenices"],["CrA","Corona Australis"],["CrB","Corona Borealis"],["Crt","Crater"],["Cru","Crux"],["Crv","Corvus"],["CVn","Canes Venatici"],["Cyg","Cygnus"],["Del","Delphinus"],["Dor","Dorado"],["Dra","Draco"],["Equ","Equuleus"],["Eri","Eridanus"],["For","Fornax"],
["Gem","Gemini"],["Gru","Grus"],["Her","Hercules"],["Hor","Horologium"],["Hya","Hydra"],["Hyi","Hydrus"],["Ind","Indus"],["Lac","Lacerta"],["Leo","Leo"],["Lep","Lepus"],["Lib","Libra"],["LMi","Leo Minor"],["Lup","Lupus"],["Lyn","Lynx"],["Lyr","Lyra"],["Men","Mensa"],["Mic","Microscopium"],["Mon","Monoceros"],["Mus","Musca"],["Nor","Norma"],["Oct","Octans"],["Oph","Ophiuchus"],["Ori","Orion"],["Pav","Pavo"],["Peg","Pegasus"],["Per","Perseus"],["Phe","Phoenix"],["Pic","Pictor"],["PsA","Pisces Austrinus"],
["Psc","Pisces"],["Pup","Puppis"],["Pyx","Pyxis"],["Ret","Reticulum"],["Scl","Sculptor"],["Sco","Scorpius"],["Sct","Scutum"],["Ser","Serpens"],["Sex","Sextans"],["Sge","Sagitta"],["Sgr","Sagittarius"],["Tau","Taurus"],["Tel","Telescopium"],["TrA","Triangulum Australe"],["Tri","Triangulum"],["Tuc","Tucana"],["UMa","Ursa Major"],["UMi","Ursa Minor"],["Vel","Vela"],["Vir","Virgo"],["Vol","Volans"],["Vul","Vulpecula"]],Gd=[[83,0,8640,2112],[83,2880,5220,2076],[83,7560,8280,2068],[83,6480,7560,2064],[15,
0,2880,2040],[10,3300,3840,1968],[15,0,1800,1920],[10,3840,5220,1920],[83,6300,6480,1920],[33,7260,7560,1920],[15,0,1263,1848],[10,4140,4890,1848],[83,5952,6300,1800],[15,7260,7440,1800],[10,2868,3300,1764],[33,3300,4080,1764],[83,4680,5952,1680],[13,1116,1230,1632],[33,7350,7440,1608],[33,4080,4320,1596],[15,0,120,1584],[83,5040,5640,1584],[15,8490,8640,1584],[33,4320,4860,1536],[33,4860,5190,1512],[15,8340,8490,1512],[10,2196,2520,1488],[33,7200,7350,1476],[15,7393.2,7416,1462],[10,2520,2868,1440],
[82,2868,3030,1440],[33,7116,7200,1428],[15,7200,7393.2,1428],[15,8232,8340,1418],[13,0,876,1404],[33,6990,7116,1392],[13,612,687,1380],[13,876,1116,1368],[10,1116,1140,1368],[15,8034,8232,1350],[10,1800,2196,1344],[82,5052,5190,1332],[33,5190,6990,1332],[10,1140,1200,1320],[15,7968,8034,1320],[15,7416,7908,1316],[13,0,612,1296],[50,2196,2340,1296],[82,4350,4860,1272],[33,5490,5670,1272],[15,7908,7968,1266],[10,1200,1800,1260],[13,8232,8400,1260],[33,5670,6120,1236],[62,735,906,1212],[33,6120,6564,
1212],[13,0,492,1200],[62,492,600,1200],[50,2340,2448,1200],[13,8400,8640,1200],[82,4860,5052,1164],[13,0,402,1152],[13,8490,8640,1152],[39,6543,6564,1140],[33,6564,6870,1140],[30,6870,6900,1140],[62,600,735,1128],[82,3030,3300,1128],[13,60,312,1104],[82,4320,4350,1080],[50,2448,2652,1068],[30,7887,7908,1056],[30,7875,7887,1050],[30,6900,6984,1044],[82,3300,3660,1008],[82,3660,3882,960],[8,5556,5670,960],[39,5670,5880,960],[50,3330,3450,954],[0,0,906,882],[62,906,924,882],[51,6969,6984,876],[62,1620,
1689,864],[30,7824,7875,864],[44,7875,7920,864],[7,2352,2652,852],[50,2652,2790,852],[0,0,720,840],[44,7920,8214,840],[44,8214,8232,828],[0,8232,8460,828],[62,924,978,816],[82,3882,3960,816],[29,4320,4440,816],[50,2790,3330,804],[48,3330,3558,804],[0,258,507,792],[8,5466,5556,792],[0,8460,8550,770],[29,4440,4770,768],[0,8550,8640,752],[29,5025,5052,738],[80,870,978,736],[62,978,1620,736],[7,1620,1710,720],[51,6543,6969,720],[82,3960,4320,696],[30,7080,7530,696],[7,1710,2118,684],[48,3558,3780,684],
[29,4770,5025,684],[0,0,24,672],[80,507,600,672],[7,2118,2352,672],[37,2838,2880,672],[30,7530,7824,672],[30,6933,7080,660],[80,690,870,654],[25,5820,5880,648],[8,5430,5466,624],[25,5466,5820,624],[51,6612,6792,624],[48,3870,3960,612],[51,6792,6933,612],[80,600,690,600],[66,258,306,570],[48,3780,3870,564],[87,7650,7710,564],[77,2052,2118,548],[0,24,51,528],[73,5730,5772,528],[37,2118,2238,516],[87,7140,7290,510],[87,6792,6930,506],[0,51,306,504],[87,7290,7404,492],[37,2811,2838,480],[87,7404,7650,
468],[87,6930,7140,460],[6,1182,1212,456],[75,6792,6840,444],[59,2052,2076,432],[37,2238,2271,420],[75,6840,7140,388],[77,1788,1920,384],[39,5730,5790,384],[75,7140,7290,378],[77,1662,1788,372],[77,1920,2016,372],[23,4620,4860,360],[39,6210,6570,344],[23,4272,4620,336],[37,2700,2811,324],[39,6030,6210,308],[61,0,51,300],[77,2016,2076,300],[37,2520,2700,300],[61,7602,7680,300],[37,2271,2496,288],[39,6570,6792,288],[31,7515,7578,284],[61,7578,7602,284],[45,4146,4272,264],[59,2247,2271,240],[37,2496,
2520,240],[21,2811,2853,240],[61,8580,8640,240],[6,600,1182,238],[31,7251,7308,204],[8,4860,5430,192],[61,8190,8580,180],[21,2853,3330,168],[45,3330,3870,168],[58,6570,6718.4,150],[3,6718.4,6792,150],[31,7500,7515,144],[20,2520,2526,132],[73,6570,6633,108],[39,5790,6030,96],[58,6570,6633,72],[61,7728,7800,66],[66,0,720,48],[73,6690,6792,48],[31,7308,7500,48],[34,7500,7680,48],[61,7680,7728,48],[61,7920,8190,48],[61,7800,7920,42],[20,2526,2592,36],[77,1290,1662,0],[59,1662,1680,0],[20,2592,2910,0],
[85,5280,5430,0],[58,6420,6570,0],[16,954,1182,-42],[77,1182,1290,-42],[73,5430,5856,-78],[59,1680,1830,-96],[59,2100,2247,-96],[73,6420,6468,-96],[73,6570,6690,-96],[3,6690,6792,-96],[66,8190,8580,-96],[45,3870,4146,-144],[85,4146,4260,-144],[66,0,120,-168],[66,8580,8640,-168],[85,5130,5280,-192],[58,5730,5856,-192],[3,7200,7392,-216],[4,7680,7872,-216],[58,6180,6468,-240],[54,2100,2910,-264],[35,1770,1830,-264],[59,1830,2100,-264],[41,2910,3012,-264],[74,3450,3870,-264],[85,4260,4620,-264],[58,
6330,6360,-280],[3,6792,7200,-288.8],[35,1740,1770,-348],[4,7392,7680,-360],[73,6180,6570,-384],[72,6570,6792,-384],[41,3012,3090,-408],[58,5856,5895,-438],[41,3090,3270,-456],[26,3870,3900,-456],[71,5856,5895,-462],[47,5640,5730,-480],[28,4530,4620,-528],[85,4620,5130,-528],[41,3270,3510,-576],[16,600,954,-585.2],[35,954,1350,-585.2],[26,3900,4260,-588],[28,4260,4530,-588],[47,5130,5370,-588],[58,5856,6030,-590],[16,0,600,-612],[11,7680,7872,-612],[4,7872,8580,-612],[16,8580,8640,-612],[41,3510,
3690,-636],[35,1692,1740,-654],[46,1740,2202,-654],[11,7200,7680,-672],[41,3690,3810,-700],[41,4530,5370,-708],[47,5370,5640,-708],[71,5640,5760,-708],[35,1650,1692,-720],[58,6030,6336,-720],[76,6336,6420,-720],[41,3810,3900,-748],[19,2202,2652,-792],[41,4410,4530,-792],[41,3900,4410,-840],[36,1260,1350,-864],[68,3012,3372,-882],[35,1536,1650,-888],[76,6420,6900,-888],[65,7680,8280,-888],[70,8280,8400,-888],[36,1080,1260,-950],[1,3372,3960,-954],[70,0,600,-960],[36,600,1080,-960],[35,1392,1536,-960],
[70,8400,8640,-960],[14,5100,5370,-1008],[49,5640,5760,-1008],[71,5760,5911.5,-1008],[9,1740,1800,-1032],[22,1800,2370,-1032],[67,2880,3012,-1032],[35,1230,1392,-1056],[71,5911.5,6420,-1092],[24,6420,6900,-1092],[76,6900,7320,-1092],[53,7320,7680,-1092],[35,1080,1230,-1104],[9,1620,1740,-1116],[49,5520,5640,-1152],[63,0,840,-1156],[35,960,1080,-1176],[40,1470,1536,-1176],[9,1536,1620,-1176],[38,7680,7920,-1200],[67,2160,2880,-1218],[84,2880,2940,-1218],[35,870,960,-1224],[40,1380,1470,-1224],[63,
0,660,-1236],[12,2160,2220,-1260],[84,2940,3042,-1272],[40,1260,1380,-1276],[32,1380,1440,-1276],[63,0,570,-1284],[35,780,870,-1296],[64,1620,1800,-1296],[49,5418,5520,-1296],[84,3042,3180,-1308],[12,2220,2340,-1320],[14,4260,4620,-1320],[49,5100,5418,-1320],[56,5418,5520,-1320],[32,1440,1560,-1356],[84,3180,3960,-1356],[14,3960,4050,-1356],[5,6300,6480,-1368],[78,6480,7320,-1368],[38,7920,8400,-1368],[40,1152,1260,-1380],[64,1800,1980,-1380],[12,2340,2460,-1392],[63,0,480,-1404],[35,480,780,-1404],
[63,8400,8640,-1404],[32,1560,1650,-1416],[56,5520,5911.5,-1440],[43,7320,7680,-1440],[64,1980,2160,-1464],[18,5460,5520,-1464],[5,5911.5,5970,-1464],[18,5370,5460,-1526],[5,5970,6030,-1526],[64,2160,2460,-1536],[12,2460,3252,-1536],[14,4050,4260,-1536],[27,4260,4620,-1536],[14,4620,5232,-1536],[18,4860,4920,-1560],[5,6030,6060,-1560],[40,780,1152,-1620],[69,1152,1650,-1620],[18,5310,5370,-1620],[5,6060,6300,-1620],[60,6300,6480,-1620],[81,7920,8400,-1620],[32,1650,2370,-1680],[18,4920,5310,-1680],
[79,5310,6120,-1680],[81,0,480,-1800],[42,1260,1650,-1800],[86,2370,3252,-1800],[12,3252,4050,-1800],[55,4050,4920,-1800],[60,6480,7680,-1800],[43,7680,8400,-1800],[81,8400,8640,-1800],[81,270,480,-1824],[42,0,1260,-1980],[17,2760,4920,-1980],[2,4920,6480,-1980],[52,1260,2760,-2040],[57,0,8640,-2160]],Tb,id,jd=function(a,b,c,d){this.symbol=a;this.name=b;this.ra1875=c;this.dec1875=d};e.ConstellationInfo=jd;e.Constellation=function(a,b){w(a);w(b);if(-90>b||90<b)throw"Invalid declination angle. Must be -90..+90.";
a%=24;0>a&&(a+=24);Tb||(Tb=ob(new O(-45655.74141261017)),id=new O(0));a=new Ba(b,15*a,1);a=lb(a,id);a=Ya(Tb,a);a=Mb(a);b=10/240;for(var c=b/15,d=$jscomp.makeIterator(Gd),f=d.next();!f.done;f=d.next()){f=f.value;var g=f[1]*c,h=f[2]*c;if(f[3]*b<=a.dec&&g<=a.ra&&a.ra<h)return b=Fd[f[0]],new jd(b[0],b[1],a.ra,a.dec)}throw"Unable to find constellation for given coordinates.";};var S;(function(a){a.Penumbral="penumbral";a.Partial="partial";a.Annular="annular";a.Total="total"})(S=e.EclipseKind||(e.EclipseKind=
{}));var Pc=function(a,b,c,d,f,g){this.kind=a;this.obscuration=b;this.peak=c;this.sd_penum=d;this.sd_partial=f;this.sd_total=g};e.LunarEclipseInfo=Pc;var xd=function(a,b,c,d,f,g,h){this.time=a;this.u=b;this.r=c;this.k=d;this.p=f;this.target=g;this.dir=h};e.SearchLunarEclipse=Oc;var Rc=function(a,b,c,d,f,g){this.kind=a;this.obscuration=b;this.peak=c;this.distance=d;this.latitude=f;this.longitude=g};e.GlobalSolarEclipseInfo=Rc;e.NextLunarEclipse=function(a){a=v(a);a=a.AddDays(10);return Oc(a)};e.SearchGlobalSolarEclipse=
Qc;e.NextGlobalSolarEclipse=function(a){a=v(a);a=a.AddDays(10);return Qc(a)};var Vc=function(a,b){this.time=a;this.altitude=b};e.EclipseEvent=Vc;var Xc=function(a,b,c,d,f,g,h){this.kind=a;this.obscuration=b;this.partial_begin=c;this.total_begin=d;this.peak=f;this.total_end=g;this.partial_end=h};e.LocalSolarEclipseInfo=Xc;e.SearchLocalSolarEclipse=Wc;e.NextLocalSolarEclipse=function(a,b){a=v(a);a=a.AddDays(10);return Wc(a,b)};var $c=function(a,b,c,d){this.start=a;this.peak=b;this.finish=c;this.separation=
d};e.TransitInfo=$c;e.SearchTransit=Zc;e.NextTransit=function(a,b){b=v(b);b=b.AddDays(100);return Zc(a,b)};var ra;(function(a){a[a.Invalid=0]="Invalid";a[a.Ascending=1]="Ascending";a[a.Descending=-1]="Descending"})(ra=e.NodeEventKind||(e.NodeEventKind={}));var bd=function(a,b){this.kind=a;this.time=b};e.NodeEventInfo=bd;e.SearchMoonNode=ad;e.NextMoonNode=function(a){var b=a.time.AddDays(10);b=ad(b);switch(a.kind){case ra.Ascending:if(b.kind!==ra.Descending)throw"Internal error: previous node was ascending, but this node was: "+
b.kind;break;case ra.Descending:if(b.kind!==ra.Ascending)throw"Internal error: previous node was descending, but this node was: "+b.kind;break;default:throw"Previous node has an invalid node kind: "+a.kind;}return b};var Ub=function(a,b,c,d){this.ra=a;this.dec=b;this.spin=c;this.north=d};e.AxisInfo=Ub;e.RotationAxis=function(a,b){b=v(b);var c=b.tt,d=c/36525;switch(a){case m.Sun:a=286.13;var f=63.87;c=84.176+14.1844*c;break;case m.Mercury:a=281.0103-.0328*d;f=61.4155-.0049*d;c=329.5988+6.1385108*c+
.01067257*Math.sin(e.DEG2RAD*(174.7910857+4.092335*c))-.00112309*Math.sin(e.DEG2RAD*(349.5821714+8.18467*c))-1.104E-4*Math.sin(e.DEG2RAD*(164.3732571+12.277005*c))-2.539E-5*Math.sin(e.DEG2RAD*(339.1643429+16.36934*c))-5.71E-6*Math.sin(e.DEG2RAD*(153.9554286+20.461675*c));break;case m.Venus:a=272.76;f=67.16;c=160.2-1.4813688*c;break;case m.Earth:return a=xa([0,0,1],b,F.Into2000),a=wa(a,b,F.Into2000),a=new E(a[0],a[1],a[2],b),c=Mb(a),new Ub(c.ra,c.dec,190.41375788700253+360.9856122880876*b.ut,a);case m.Moon:var g=
e.DEG2RAD*(125.045-.0529921*c),h=e.DEG2RAD*(250.089-.1059842*c),l=e.DEG2RAD*(260.008+13.0120009*c),k=e.DEG2RAD*(176.625+13.3407154*c),n=e.DEG2RAD*(357.529+.9856003*c),p=e.DEG2RAD*(311.589+26.4057084*c),q=e.DEG2RAD*(134.963+13.064993*c),t=e.DEG2RAD*(276.617+.3287146*c),y=e.DEG2RAD*(34.226+1.7484877*c),x=e.DEG2RAD*(15.134-.1589763*c),z=e.DEG2RAD*(119.743+.0036096*c),ab=e.DEG2RAD*(239.961+.1643573*c),va=e.DEG2RAD*(25.053+12.9590088*c);a=269.9949+.0031*d-3.8787*Math.sin(g)-.1204*Math.sin(h)+.07*Math.sin(l)-
.0172*Math.sin(k)+.0072*Math.sin(p)-.0052*Math.sin(x)+.0043*Math.sin(va);f=66.5392+.013*d+1.5419*Math.cos(g)+.0239*Math.cos(h)-.0278*Math.cos(l)+.0068*Math.cos(k)-.0029*Math.cos(p)+9E-4*Math.cos(q)+8E-4*Math.cos(x)-9E-4*Math.cos(va);c=38.3213+(13.17635815-1.4E-12*c)*c+3.561*Math.sin(g)+.1208*Math.sin(h)-.0642*Math.sin(l)+.0158*Math.sin(k)+.0252*Math.sin(n)-.0066*Math.sin(p)-.0047*Math.sin(q)-.0046*Math.sin(t)+.0028*Math.sin(y)+.0052*Math.sin(x)+.004*Math.sin(z)+.0019*Math.sin(ab)-.0044*Math.sin(va);
break;case m.Mars:a=317.269202-.10927547*d+6.8E-5*Math.sin(e.DEG2RAD*(198.991226+19139.4819985*d))+2.38E-4*Math.sin(e.DEG2RAD*(226.292679+38280.8511281*d))+5.2E-5*Math.sin(e.DEG2RAD*(249.663391+57420.7251593*d))+9E-6*Math.sin(e.DEG2RAD*(266.18351+76560.636795*d))+.419057*Math.sin(e.DEG2RAD*(79.398797+.5042615*d));f=54.432516-.05827105*d+5.1E-5*Math.cos(e.DEG2RAD*(122.433576+19139.9407476*d))+1.41E-4*Math.cos(e.DEG2RAD*(43.058401+38280.8753272*d))+3.1E-5*Math.cos(e.DEG2RAD*(57.663379+57420.7517205*
d))+5E-6*Math.cos(e.DEG2RAD*(79.476401+76560.6495004*d))+1.591274*Math.cos(e.DEG2RAD*(166.325722+.5042615*d));c=176.049863+350.891982443297*c+1.45E-4*Math.sin(e.DEG2RAD*(129.071773+19140.0328244*d))+1.57E-4*Math.sin(e.DEG2RAD*(36.352167+38281.0473591*d))+4E-5*Math.sin(e.DEG2RAD*(56.668646+57420.929536*d))+1E-6*Math.sin(e.DEG2RAD*(67.364003+76560.2552215*d))+1E-6*Math.sin(e.DEG2RAD*(104.79268+95700.4387578*d))+.584542*Math.sin(e.DEG2RAD*(95.391654+.5042615*d));break;case m.Jupiter:f=e.DEG2RAD*(99.360714+
4850.4046*d);g=e.DEG2RAD*(175.895369+1191.9605*d);h=e.DEG2RAD*(300.323162+262.5475*d);l=e.DEG2RAD*(114.012305+6070.2476*d);k=e.DEG2RAD*(49.511251+64.3*d);a=268.056595-.006499*d+1.17E-4*Math.sin(f)+9.38E-4*Math.sin(g)+.001432*Math.sin(h)+3E-5*Math.sin(l)+.00215*Math.sin(k);f=64.495303+.002413*d+5E-5*Math.cos(f)+4.04E-4*Math.cos(g)+6.17E-4*Math.cos(h)-1.3E-5*Math.cos(l)+9.26E-4*Math.cos(k);c=284.95+870.536*c;break;case m.Saturn:a=40.589-.036*d;f=83.537-.004*d;c=38.9+810.7939024*c;break;case m.Uranus:a=
257.311;f=-15.175;c=203.81-501.1600928*c;break;case m.Neptune:d=e.DEG2RAD*(357.85+52.316*d);a=299.36+.7*Math.sin(d);f=43.46-.51*Math.cos(d);c=249.978+541.1397757*c-.48*Math.sin(d);break;case m.Pluto:a=132.993;f=-6.163;c=302.695+56.3625225*c;break;default:throw"Invalid body: "+a;}d=f*e.DEG2RAD;g=a*e.DEG2RAD;h=Math.cos(d);b=new E(h*Math.cos(g),h*Math.sin(g),Math.sin(d),b);return new Ub(a/15,f,c,b)};e.LagrangePoint=function(a,b,c,d){var f=v(b);b=C(c);var g=C(d);c===m.Earth&&d===m.Moon?(c=new I(0,0,0,
0,0,0,f),d=Ra(f)):(c=mb(c,f),d=mb(d,f));return cd(a,c,b,d,g)};e.LagrangePointFast=cd;var H=function(a,b,c){b=v(b);this.originBody=a;for(var d=$jscomp.makeIterator(c),f=d.next();!f.done;f=d.next())if(f.value.t.tt!==b.tt)throw"Inconsistent times in bodyStates";d=[];f=H.CalcSolarSystem(b);this.curr=new kd(b,f,d);a=this.InternalBodyState(a);c=$jscomp.makeIterator(c);for(f=c.next();!f.done;f=c.next()){var g=f.value;f=new B(g.x+a.r.x,g.y+a.r.y,g.z+a.r.z);g=new B(g.vx+a.v.x,g.vy+a.v.y,g.vz+a.v.z);var h=
B.zero();d.push(new Ua(b.tt,f,g,h))}this.CalcBodyAccelerations();this.prev=this.Duplicate()};H.prototype.Update=function(a){a=v(a);var b=a.tt-this.curr.time.tt;if(0===b)this.prev=this.Duplicate();else{this.Swap();this.curr.time=a;this.curr.gravitators=H.CalcSolarSystem(a);for(var c=0;c<this.curr.bodies.length;++c){var d=this.prev.bodies[c];this.curr.bodies[c].r=Ca(b,d.r,d.v,d.a)}this.CalcBodyAccelerations();for(c=0;c<this.curr.bodies.length;++c){d=this.prev.bodies[c];var f=this.curr.bodies[c],g=d.a.mean(f.a);
f.tt=a.tt;f.r=Ca(b,d.r,d.v,g);f.v=Eb(b,d.v,g)}this.CalcBodyAccelerations()}b=[];c=this.InternalBodyState(this.originBody);d=$jscomp.makeIterator(this.curr.bodies);for(f=d.next();!f.done;f=d.next())f=f.value,b.push(new I(f.r.x-c.r.x,f.r.y-c.r.y,f.r.z-c.r.z,f.v.x-c.v.x,f.v.y-c.v.y,f.v.z-c.v.z,a));return b};H.prototype.Swap=function(){var a=this.curr;this.curr=this.prev;this.prev=a};H.prototype.SolarSystemBodyState=function(a){a=this.InternalBodyState(a);var b=this.InternalBodyState(this.originBody);
return pa(a.sub(b),this.curr.time)};H.prototype.InternalBodyState=function(a){if(a===m.SSB)return new X(this.curr.time.tt,B.zero(),B.zero());var b=this.curr.gravitators[a];if(b)return b;throw"Invalid body: "+a;};H.CalcSolarSystem=function(a){var b={},c=new X(a.tt,B.zero(),B.zero());b[m.Mercury]=R(c,a.tt,m.Mercury,4.912547451450812E-11);b[m.Venus]=R(c,a.tt,m.Venus,7.243452486162703E-10);b[m.Earth]=R(c,a.tt,m.Earth,8.997011346712498E-10);b[m.Mars]=R(c,a.tt,m.Mars,9.549535105779258E-11);b[m.Jupiter]=
R(c,a.tt,m.Jupiter,2.825345909524226E-7);b[m.Saturn]=R(c,a.tt,m.Saturn,8.459715185680659E-8);b[m.Uranus]=R(c,a.tt,m.Uranus,1.292024916781969E-8);b[m.Neptune]=R(c,a.tt,m.Neptune,1.524358900784276E-8);for(var d in b)b[d].r.decr(c.r),b[d].v.decr(c.v);b[m.Sun]=new X(a.tt,c.r.neg(),c.v.neg());return b};H.prototype.CalcBodyAccelerations=function(){for(var a=$jscomp.makeIterator(this.curr.bodies),b=a.next();!b.done;b=a.next())b=b.value,b.a=B.zero(),H.AddAcceleration(b.a,b.r,this.curr.gravitators[m.Sun].r,
2.959122082855911E-4),H.AddAcceleration(b.a,b.r,this.curr.gravitators[m.Mercury].r,4.912547451450812E-11),H.AddAcceleration(b.a,b.r,this.curr.gravitators[m.Venus].r,7.243452486162703E-10),H.AddAcceleration(b.a,b.r,this.curr.gravitators[m.Earth].r,8.997011346712498E-10),H.AddAcceleration(b.a,b.r,this.curr.gravitators[m.Mars].r,9.549535105779258E-11),H.AddAcceleration(b.a,b.r,this.curr.gravitators[m.Jupiter].r,2.825345909524226E-7),H.AddAcceleration(b.a,b.r,this.curr.gravitators[m.Saturn].r,8.459715185680659E-8),
H.AddAcceleration(b.a,b.r,this.curr.gravitators[m.Uranus].r,1.292024916781969E-8),H.AddAcceleration(b.a,b.r,this.curr.gravitators[m.Neptune].r,1.524358900784276E-8)};H.AddAcceleration=function(a,b,c,d){var f=c.x-b.x,g=c.y-b.y;b=c.z-b.z;c=f*f+g*g+b*b;d/=c*Math.sqrt(c);a.x+=f*d;a.y+=g*d;a.z+=b*d};H.prototype.Duplicate=function(){var a={};for(b in this.curr.gravitators)a[b]=this.curr.gravitators[b].clone();var b=[];for(var c=$jscomp.makeIterator(this.curr.bodies),d=c.next();!d.done;d=c.next())b.push(d.value.clone());
return new kd(this.curr.time,a,b)};$jscomp.global.Object.defineProperties(H.prototype,{OriginBody:{configurable:!0,enumerable:!0,get:function(){return this.originBody}},Time:{configurable:!0,enumerable:!0,get:function(){return this.curr.time}}});e.GravitySimulator=H;var kd=function(a,b,c){this.time=a;this.gravitators=b;this.bodies=c}},{}]},{},[1])(1)});

})(__a, __a.exports);
const Astronomy = __a.exports;
const __m = {};
// ── js/model.js
__m["js/model.js"] = (() => {
// 순수 계산 — 화면·네트워크와 무관. test/model.test.js가 방향·부호까지 고정한다.

const BAD_GRADIENT = 0.5;      // K/100m, 이보다 크면 「불량층」
const TROPO_TOP_HPA = 200;     // 불량층·제트 탐색의 위쪽 한계
const KAPPA = 0.286;
const LAMBDA = 500e-9;                // 시상 계산 파장(m)
const RAD2ARCSEC = 206264.806;

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

/** 온위(K). T는 섭씨, p는 hPa */
function theta(tC, p) {
  return (tC + 273.15) * Math.pow(1000 / p, KAPPA);
}

/**
 * 인접 기압면 사이의 층 목록.
 * levels: [{p, T(℃), z(m), ws(m/s), wd(°)}] — 순서 무관, 지면 아래(z < elev)는 버린다.
 * 반환: 아래→위 [{pMid, zBot, zTop, dz, tMidK, grad(K/100m, 온위 증가가 +), shear(1/s)}]
 */
function layers(levels, elev = 0) {
  const lv = levels
    .filter(l => [l.p, l.T, l.z].every(Number.isFinite) && l.z >= elev)
    .sort((a, b) => a.z - b.z);
  const out = [];
  for (let i = 0; i + 1 < lv.length; i++) {
    const a = lv[i], b = lv[i + 1];
    const dz = b.z - a.z;
    if (!(dz > 0)) continue;
    const thA = theta(a.T, a.p), thB = theta(b.T, b.p);
    const [ua, va] = uv(a), [ub, vb] = uv(b);
    out.push({
      pMid: (a.p + b.p) / 2, zBot: a.z, zTop: b.z, dz,
      tMidK: (a.T + b.T) / 2 + 273.15,
      thMid: (thA + thB) / 2,
      grad: (thB - thA) / dz * 100,
      shear: Number.isFinite(a.ws) && Number.isFinite(b.ws) ? Math.hypot(ub - ua, vb - va) / dz : 0,   // 바람이 빠진 면은 시어 0
    });
  }
  return out;
}

function uv(l) {
  const ws = Number.isFinite(l.ws) ? l.ws : 0;
  const wd = Number.isFinite(l.wd) ? l.wd : 0;
  const r = wd * Math.PI / 180;
  return [-ws * Math.sin(r), -ws * Math.cos(r)];
}

/**
 * 불량층: 대류권(p ≥ 200hPa)에서 온위 기울기가 기준을 넘는 연속 구간 가운데 기울기가 가장 큰 것.
 * 반환: {bot(km), top(km), grad(K/100m)} 또는 null
 */
function badLayer(levels, elev = 0) {
  const ls = layers(levels, elev).filter(l => l.pMid >= TROPO_TOP_HPA);
  let best = null, run = null;
  for (const l of ls) {
    if (l.grad > BAD_GRADIENT) {
      if (!run) run = { bot: l.zBot, top: l.zTop, grad: l.grad };
      else { run.top = l.zTop; run.grad = Math.max(run.grad, l.grad); }
    } else if (run) { if (!best || run.grad > best.grad) best = run; run = null; }
  }
  if (run && (!best || run.grad > best.grad)) best = run;
  return best && { bot: best.bot / 1000, top: best.top / 1000, grad: best.grad };
}

/** 제트기류: 300~200hPa 풍속의 최댓값(m/s) */
function jetSpeed(levels) {
  const v = levels.filter(l => l.p <= 300 && l.p >= TROPO_TOP_HPA && Number.isFinite(l.ws)).map(l => l.ws);
  return v.length ? Math.max(...v) : null;
}

/**
 * 자유대기 시상(″) — Dewan(1993) 식.
 *   Cn² = 2.8 M² L0^(4/3),  M = -(79e-6 P/T) ∂lnθ/∂z
 *   L0^(4/3) = 0.1^(4/3)·10^(1.64+42S) (대류권) / 10^(0.506+50S) (성층권),  S = 바람 시어(1/s)
 *   r0 = (0.423 k² ∫Cn² dz)^(-3/5),  시상 = 0.98 λ / r0
 * 보정 전 값. 화면에는 FREE_SCALE을 곱한 freeSeeing을 쓴다.
 */
function dewanSeeing(levels, elev = 0) {
  let integral = 0;
  const ls = layers(levels, elev);
  if (ls.length < 3) return null;   // 상층 자료가 없으면 「좋음」이 아니라 「모름」
  for (const l of ls) {
    const s = Math.min(l.shear, 0.02);
    const tropo = l.pMid >= TROPO_TOP_HPA;
    const L43 = Math.pow(0.1, 4 / 3) * Math.pow(10, tropo ? 1.64 + 42 * s : 0.506 + 50 * s);
    const dlnTheta = (l.grad / 100) / l.thMid;
    const M = -(79e-6 * l.pMid / l.tMidK) * dlnTheta;
    integral += 2.8 * M * M * L43 * l.dz;
  }
  if (!(integral > 0)) return 0;
  const k = 2 * Math.PI / LAMBDA;
  const r0 = Math.pow(0.423 * k * k * integral, -3 / 5);
  return 0.98 * LAMBDA / r0 * RAD2ARCSEC;
}

/**
 * 자유대기 시상 보정 배율 — ESO 파라날 MASS 관측(2023년 3,233시간)에 맞춘 값.
 * 12개 기압면에서 계산한 Dewan 값은 관측보다 약 18% 크게 나온다(2024년 검증: 치우침 +0.10″ → +0.02″).
 * 기압면을 바꾸면 다시 맞춰야 한다(27개 면에서는 0.74~0.77) — api.js LEVELS가 아래와 다르면 테스트가 실패한다.
 * 다시 맞추는 법: docs/시상보정.md · tools/seeing/
 */
const FREE_SCALE = 0.84;
const FREE_SCALE_LEVELS = [1000, 925, 850, 700, 600, 500, 400, 300, 250, 200, 150, 100];

/**
 * 리처드슨 지표 R(km) — 대류권(p ≥ 200hPa) 층마다 두께(km) × min(1/Ri, 4)를 더한다.
 *   Ri = (g/θ)(∂θ/∂z) / (∂u/∂z)²,  불안정하거나 중립인 층(N² ≤ 0)은 상한 4로 센다.
 * meteoblue가 쓰는 청천난류 기준(Ri ≤ 0.25)을 연속값으로 바꾼 것. 성긴 기압면에서 뭉개진 시어를 보충한다.
 */
function richardsonIndex(levels, elev = 0) {
  let r = 0;
  for (const l of layers(levels, elev)) {
    if (l.pMid < TROPO_TOP_HPA) continue;
    const N2 = 9.81 / l.thMid * l.grad / 100, S2 = l.shear * l.shear;
    r += l.dz / 1000 * (N2 > 0 ? Math.min(S2 / N2, 4) : 4);
  }
  return r;
}
/**
 * 자유대기 = FREE_SCALE × Dewan × e^(RI_COEF·(min(R, RI_MAX) − RI_REF)) — 파라날 2023년에 맞추고 2024년으로 검증(docs/시상보정.md 4절).
 * RI_MAX: 맞춘 자료의 99% 이상이 이 아래(파라날 99% 6.7). 그 위로는 배율을 늘리지 않는다(최대 ×1.23).
 */
const RI_COEF = 0.034, RI_REF = 2, RI_MAX = 8;

/** 자유대기 시상(″) — 보정한 값 */
function freeSeeing(levels, elev = 0) {
  const s = dewanSeeing(levels, elev);
  return s == null ? null : s * FREE_SCALE * Math.exp(RI_COEF * (Math.min(richardsonIndex(levels, elev), RI_MAX) - RI_REF));
}

/**
 * 지표층 시상(″) — 지상풍이 셀수록 나빠지는 경험식.
 * 파라날에서 맞춘 값(0.48 + 0.066×풍속)과 거의 같아 그대로 둔다. 다만 파라날 관측기는 높은 산 위 탑에 있어
 * 낮은 관측지의 지표층은 이보다 클 수 있다(맞출 관측 자료 없음).
 */
function groundSeeing(wind10) {
  return 0.5 + 0.06 * Math.max(0, wind10 || 0);
}

/** 전체 시상(″): 두 성분을 5/3 제곱 합으로 합친다 */
function seeing(levels, wind10, elev = 0) {
  const a = freeSeeing(levels, elev), b = groundSeeing(wind10);
  if (a == null) return null;
  return Math.pow(Math.pow(a, 5 / 3) + Math.pow(b, 5 / 3), 3 / 5);
}

/** 시상 지수 1(나쁨)~5(매우 좋음) */
function seeingIndex(arcsec) {
  if (!Number.isFinite(arcsec)) return null;
  return arcsec < 1.0 ? 5 : arcsec < 1.5 ? 4 : arcsec < 2.0 ? 3 : arcsec < 3.0 ? 2 : 1;
}

// 등급: 'g' 좋음 · 'm' 보통 · 'b' 나쁨
const gradeSeeing = a => !Number.isFinite(a) ? null : a < 1.5 ? 'g' : a < 2.2 ? 'm' : 'b';
const gradeJet = v => !Number.isFinite(v) ? null : v <= 20 ? 'g' : v <= 30 ? 'm' : 'b';
const gradeCloud = c => !Number.isFinite(c) ? null : c <= 20 ? 'g' : c <= 60 ? 'm' : 'b';
const gradeDew = d => !Number.isFinite(d) ? null : d >= 4 ? 'g' : d >= 2 ? 'm' : 'b';
const gradeAod = a => !Number.isFinite(a) ? null : a < 0.15 ? 'g' : a < 0.35 ? 'm' : 'b';
const gradeScore = s => !Number.isFinite(s) ? null : s >= 70 ? 'g' : s >= 40 ? 'm' : 'b';
const GRADE_KO = { g: '좋음', m: '보통', b: '나쁨' };

/**
 * 한 시각의 관측 점수(0~100). 구름이 전체를 깎고, 나머지가 그 안에서 가감한다.
 * h: {cloud(%), seeing(″), aod, moonAlt(°), moonFrac(0~1)}
 */
function hourScore(h) {
  const clear = 1 - clamp((h.cloud ?? 0) / 100, 0, 1);
  const see = Number.isFinite(h.seeing) ? clamp((3 - h.seeing) / 2, 0, 1) : 0.5;
  const trans = Number.isFinite(h.aod) ? clamp(1 - h.aod / 0.5, 0, 1) : 0.7;
  const moonUp = Math.max(0, Math.sin((h.moonAlt ?? -90) * Math.PI / 180));
  const dark = 1 - clamp((h.moonFrac ?? 0) * moonUp, 0, 1);
  return 100 * clear * (0.45 + 0.25 * see + 0.12 * trans + 0.18 * dark);
}

/**
 * 가장 좋은 연속 구간: 최고 점수 시각을 포함하고 최고점의 85% 이상이 이어지는 범위.
 * hours: [{t(ms), score}] 시간순. 반환 {from, to(끝 시각, ms), peak} 또는 null(최고점 40 미만)
 */
function bestWindow(hours, stepMs = 3600e3) {
  if (!hours.length) return null;
  let iMax = 0;
  hours.forEach((h, i) => { if (h.score > hours[iMax].score) iMax = i; });
  const peak = hours[iMax].score;
  if (peak < 40) return null;
  let a = iMax, b = iMax;
  while (a > 0 && hours[a - 1].score >= 0.85 * peak) a--;
  while (b + 1 < hours.length && hours[b + 1].score >= 0.85 * peak) b++;
  return { from: hours[a].t, to: hours[b].t + stepMs, peak };
}

/** 기온 − 이슬점. 어느 한쪽이 없으면 null */
const spread = (t, d) => (Number.isFinite(t) && Number.isFinite(d) ? t - d : null);

const mean = xs => {
  const v = xs.filter(Number.isFinite);
  return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
};

/**
 * 밤 요약. hours: 어두운 시간대의 시각별 자료
 *   {t, cloud, low, mid, high, seeing, jet, temp, dew, wind10, gust, precipProb, aod, score}
 * 반환: {score, grade, window, cloudAvg, seeingAvg, jetMax, dewMin, cloudNote, cautions[]}
 */
function nightSummary(hours) {
  if (!hours.length) return null;
  const score = mean(hours.map(h => h.score));
  const dewMin = Math.min(...hours.map(h => spread(h.temp, h.dew)).filter(Number.isFinite));
  const jetMax = Math.max(...hours.map(h => h.jet).filter(Number.isFinite));
  const cautions = [];
  if (hours.some(h => (h.precipProb ?? 0) >= 40)) cautions.push('강수');
  if (Number.isFinite(dewMin) && dewMin < 2) cautions.push('결로');
  if (Number.isFinite(jetMax) && jetMax > 30) cautions.push('제트기류 강함');
  if (hours.some(h => (h.gust ?? 0) >= 12 || (h.wind10 ?? 0) >= 8)) cautions.push('강풍');
  if (hours.some(h => gradeAod(h.aod) === 'b')) cautions.push('연무·먼지');
  return {
    score, grade: gradeScore(score), window: bestWindow(hours),
    cloudAvg: mean(hours.map(h => h.cloud)), seeingAvg: mean(hours.map(h => h.seeing)),
    jetMax: Number.isFinite(jetMax) ? jetMax : null, dewMin: Number.isFinite(dewMin) ? dewMin : null,
    cloudNote: cloudNote(hours), cautions,
  };
}

/** 구름 한 줄: {kind:'clear'|'overcast'|'in'|'out'|'avg', t?, layer?, avg} */
function cloudNote(hours) {
  const avg = mean(hours.map(h => h.cloud));
  const max = Math.max(...hours.map(h => h.cloud ?? 0));
  const min = Math.min(...hours.map(h => h.cloud ?? 0));
  if (max <= 20) return { kind: 'clear', avg };
  if (min >= 80) return { kind: 'overcast', avg };
  const LAYERS = [['low', '하층운'], ['mid', '중층운'], ['high', '상층운']];
  for (let i = 1; i < hours.length; i++) {
    const p = hours[i - 1], c = hours[i];
    if (p.cloud < 50 && c.cloud >= 50) {
      const top = LAYERS.map(([k, ko]) => [c[k] ?? 0, ko]).sort((x, y) => y[0] - x[0])[0];
      return { kind: 'in', t: c.t, layer: top[1], avg };
    }
    if (p.cloud >= 50 && c.cloud < 50) return { kind: 'out', t: c.t, avg };
  }
  return { kind: 'avg', avg };
}

/** 달 위상 이름. deg: 황경차 0(삭)~360 */
function moonPhaseName(deg) {
  const d = ((deg % 360) + 360) % 360, tol = 6;
  if (d < tol || d > 360 - tol) return '삭';
  if (Math.abs(d - 90) < tol) return '상현달';
  if (Math.abs(d - 180) < tol) return '보름달';
  if (Math.abs(d - 270) < tol) return '하현달';
  return d < 90 ? '초승달' : d < 180 ? '차오르는 달' : d < 270 ? '기우는 달' : '그믐달';
}

/** 시직경(″). radiusKm 천체 반지름, distAu 거리 */
function angularDiameter(radiusKm, distAu) {
  return 2 * Math.atan(radiusKm / (distAu * 149597870.7)) * RAD2ARCSEC;
}

const DIRS = ['북', '북북동', '북동', '동북동', '동', '동남동', '남동', '남남동', '남', '남남서', '남서', '서남서', '서', '서북서', '북서', '북북서'];
const compass = az => DIRS[Math.round((((az % 360) + 360) % 360) / 22.5) % 16];

return { theta, layers, badLayer, jetSpeed, dewanSeeing, richardsonIndex, freeSeeing, groundSeeing, seeing, seeingIndex, hourScore, bestWindow, nightSummary, cloudNote, moonPhaseName, angularDiameter, BAD_GRADIENT, TROPO_TOP_HPA, clamp, FREE_SCALE, FREE_SCALE_LEVELS, RI_COEF, RI_REF, RI_MAX, gradeSeeing, gradeJet, gradeCloud, gradeDew, gradeAod, gradeScore, GRADE_KO, spread, mean, compass };
})();
// ── js/sky.js
__m["js/sky.js"] = (() => {
// astronomy-engine 래퍼. 라이브러리 객체를 주입받는다(브라우저: window.Astronomy, 테스트: require).
const { angularDiameter, moonPhaseName } = __m["js/model.js"];

const BODIES = [
  { id: 'Moon', ko: '달', r: 1737.4 },
  { id: 'Mercury', ko: '수성', r: 2439.7 },
  { id: 'Venus', ko: '금성', r: 6051.8 },
  { id: 'Mars', ko: '화성', r: 3396.2 },
  { id: 'Jupiter', ko: '목성', r: 71492 },
  { id: 'Saturn', ko: '토성', r: 60268 },
  { id: 'Uranus', ko: '천왕성', r: 25559, outer: true },
  { id: 'Neptune', ko: '해왕성', r: 24764, outer: true },
];

const CONST_KO = {
  Ari: '양', Tau: '황소', Gem: '쌍둥이', Cnc: '게', Leo: '사자', Vir: '처녀', Lib: '천칭', Sco: '전갈', Oph: '뱀주인',
  Sgr: '궁수', Cap: '염소', Aqr: '물병', Psc: '물고기', Cet: '고래', Ori: '오리온', Sex: '육분의', Aur: '마차부',
  Crv: '까마귀', Sct: '방패', Peg: '페가수스', Hya: '바다뱀', Crt: '컵', LMi: '작은사자',
};

function makeSky(A) {
  const obs = p => new A.Observer(p.lat, p.lon, p.elev || 0);
  const ms = t => (t ? t.date.getTime() : null);

  /** 그날 밤의 해·박명 시각(ms). noon: 그날 현지 정오(Date|ms) */
  function night(place, noon) {
    const o = obs(place), start = new Date(noon);
    const sunset = A.SearchRiseSet('Sun', o, -1, start, 1);
    const from = sunset ? sunset.date : start;
    const alt = (dir, t0, deg) => ms(A.SearchAltitude('Sun', o, dir, t0, 1, deg));
    return {
      sunset: ms(sunset),
      sunrise: ms(A.SearchRiseSet('Sun', o, +1, from, 1)),
      civilEnd: alt(-1, start, -6), nautEnd: alt(-1, start, -12), astroEnd: alt(-1, start, -18),
      astroStart: alt(+1, from, -18), nautStart: alt(+1, from, -12), civilStart: alt(+1, from, -6),
    };
  }

  /** 고도·방위(°), 대기 굴절 포함 */
  function altAz(body, place, t) {
    const o = obs(place), d = new Date(t);
    const eq = A.Equator(body, d, o, true, true);
    const h = A.Horizon(d, o, eq.ra, eq.dec, 'normal');
    return { alt: h.altitude, az: h.azimuth };
  }

  /** t0~t1 사이 고도 자취 [{t, alt, az}] */
  function track(body, place, t0, t1, stepMin = 10) {
    const out = [], step = stepMin * 60e3;
    for (let t = t0; t <= t1 + 1; t += step) out.push({ t, ...altAz(body, place, t) });
    return out;
  }

  /** 정오 뒤 첫 남중과, 그 남중을 사이에 둔 뜸(앞)·짐(뒤) */
  function events(body, place, noon) {
    const o = obs(place);
    const tr = A.SearchHourAngle(body, o, 0, new Date(noon));
    return {
      rise: ms(A.SearchRiseSet(body, o, +1, tr.time, -1)),
      set: ms(A.SearchRiseSet(body, o, -1, tr.time, 1)),
      transit: ms(tr.time), transitAlt: tr.hor.altitude,
    };
  }

  /** 밝기·크기 제원 */
  function facts(body, place, t) {
    const d = new Date(t), def = BODIES.find(b => b.id === body);
    const il = A.Illumination(body, d);
    const j = A.Equator(body, d, obs(place), false, true);
    const c = A.Constellation(j.ra, j.dec);
    return {
      mag: il.mag, frac: il.phase_fraction, distAu: il.geo_dist,
      diam: angularDiameter(def.r, il.geo_dist),
      ra: j.ra, dec: j.dec,
      constellation: CONST_KO[c.symbol] ? CONST_KO[c.symbol] + '자리' : c.name,
    };
  }

  function moon(t) {
    const d = new Date(t), deg = A.MoonPhase(d);
    return { deg, name: moonPhaseName(deg), frac: A.Illumination('Moon', d).phase_fraction, age: deg / 360 * 29.530588 };
  }

  return { night, altAz, track, events, facts, moon };
}

return { makeSky, BODIES };
})();
// ── js/api.js
__m["js/api.js"] = (() => {
// Open-Meteo 호출과 정규화. 키 없음 · CORS 허용 · CC BY 4.0
const LEVELS = [1000, 925, 850, 700, 600, 500, 400, 300, 250, 200, 150, 100];
const SURFACE = ['temperature_2m', 'dew_point_2m', 'relative_humidity_2m', 'cloud_cover', 'cloud_cover_low',
  'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m',
  'precipitation_probability', 'visibility'];
const LEVEL_VARS = ['temperature', 'geopotential_height', 'wind_speed', 'wind_direction'];
const TTL = 10 * 60e3;   // 화면의 15분 새로 고침보다 짧게

function forecastUrl(lat, lon) {
  const hourly = [...SURFACE, ...LEVELS.flatMap(p => LEVEL_VARS.map(v => `${v}_${p}hPa`))];
  return 'https://api.open-meteo.com/v1/forecast?' + new URLSearchParams({
    latitude: lat.toFixed(3), longitude: lon.toFixed(3), timezone: 'auto', past_days: 1, forecast_days: 6,
    wind_speed_unit: 'ms', hourly: hourly.join(','),
  });
}

function airUrl(lat, lon) {
  return 'https://air-quality-api.open-meteo.com/v1/air-quality?' + new URLSearchParams({
    latitude: lat.toFixed(3), longitude: lon.toFixed(3), timezone: 'auto', past_days: 1, forecast_days: 5,
    hourly: 'aerosol_optical_depth,pm2_5,dust',
  });
}

/** 'YYYY-MM-DDTHH:MM'(현지) + UTC 오프셋(초) → epoch ms */
function localIsoToMs(iso, offsetSec) {
  return Date.parse(iso + ':00Z') - offsetSec * 1000;
}

/** Open-Meteo 응답 → {offsetSec, elev, tz, hours:[{t, cloud, low, mid, high, temp, dew, rh, wind10, windDir, gust, precipProb, vis, levels}]} */
function normalize(fc, air) {
  const off = fc.utc_offset_seconds, H = fc.hourly;
  const aod = new Map();
  if (air?.hourly) air.hourly.time.forEach((iso, i) => aod.set(localIsoToMs(iso, air.utc_offset_seconds), {
    aod: air.hourly.aerosol_optical_depth?.[i] ?? null, pm25: air.hourly.pm2_5?.[i] ?? null, dust: air.hourly.dust?.[i] ?? null,
  }));
  const hours = H.time.map((iso, i) => {
    const t = localIsoToMs(iso, off);
    return {
      t,
      cloud: H.cloud_cover[i], low: H.cloud_cover_low[i], mid: H.cloud_cover_mid[i], high: H.cloud_cover_high[i],
      temp: H.temperature_2m[i], dew: H.dew_point_2m[i], rh: H.relative_humidity_2m[i],
      wind10: H.wind_speed_10m[i], windDir: H.wind_direction_10m[i], gust: H.wind_gusts_10m[i],
      precipProb: H.precipitation_probability?.[i] ?? null, vis: H.visibility?.[i] ?? null,
      levels: LEVELS.map(p => ({
        p, T: H[`temperature_${p}hPa`]?.[i], z: H[`geopotential_height_${p}hPa`]?.[i],
        ws: H[`wind_speed_${p}hPa`]?.[i], wd: H[`wind_direction_${p}hPa`]?.[i],
      })),
      ...(aod.get(t) || { aod: null, pm25: null, dust: null }),
    };
  }).filter(h => h.temp != null);
  return { offsetSec: off, elev: fc.elevation, tz: fc.timezone, hours };
}

/** ms: 이 시간 안에 답이 없으면 그만둔다(없으면 기다린다) */
async function getJson(url, ms) {
  const r = await fetch(url, ms ? { signal: AbortSignal.timeout(ms) } : undefined);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

/** 예보를 받아 정규화한다. 대기질은 실패해도 계속한다. 10분 캐시. */
async function loadForecast(lat, lon) {
  const key = `fc:${lat.toFixed(3)},${lon.toFixed(3)}`;
  try {
    const c = JSON.parse(sessionStorage.getItem(key));
    if (c && Date.now() - c.at < TTL) return c.data;
  } catch { /* 캐시 없음 */ }
  const [fc, air] = await Promise.all([getJson(forecastUrl(lat, lon)), getJson(airUrl(lat, lon)).catch(() => null)]);
  const data = normalize(fc, air);
  try { sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data })); } catch { /* 용량 초과는 무시 */ }
  return data;
}

// ── 지명 ───────────────────────────────────────────────
// 읍·면·동과 천문대 같은 곳은 OpenStreetMap(Nominatim)이, 세계 도시와 해발은 Open-Meteo가 잘 안다. 둘을 함께 쓴다.
const OSM = 'https://nominatim.openstreetmap.org/';
const UNITS = ['neighbourhood', 'quarter', 'hamlet', 'village', 'suburb', 'town', 'city_district', 'borough', 'district',
  'municipality', 'city', 'county', 'state_district', 'province', 'state', 'region'];   // 작은 것부터

/**
 * Nominatim 결과 하나 → {name, region, lat, lon, elev}. 좌표가 없으면 null.
 * 이름은 찾은 곳의 이름(없으면 가장 작은 행정 구역), region은 그 위의 큰 구역 셋 + 나라.
 */
function osmPlace(r) {
  const lat = Number(r?.lat), lon = Number(r?.lon);
  if (!r || r.lat == null || r.lon == null || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const ad = r.address || {}, units = UNITS.map(k => ad[k]).filter(Boolean);
  const name = r.name || units[0];
  if (!name) return null;
  const upper = units.filter(u => u !== name).slice(-3);
  return { name, region: [...upper, ad.country].filter(Boolean).join(' · '), lat, lon, elev: 0 };
}

/**
 * 두 목록을 합친다. 앞 목록이 먼저, 뒤 목록에서는 이미 있는 곳(약 5km 안)을 빼되 해발은 넘겨받는다.
 * 앞 목록 안에서 이름이 같고 자리도 같은 것은 하나만 남긴다.
 */
function mergePlaces(first, second, max = 10) {
  const near = (o, p) => Math.abs(o.lat - p.lat) < 0.05 && Math.abs(o.lon - p.lon) < 0.05;
  const out = [];
  for (const p of first) if (!out.some(o => o.name === p.name && near(o, p))) out.push({ ...p });
  for (const p of second) {
    const o = out.find(x => near(x, p));
    if (!o) out.push({ ...p }); else if (!o.elev && p.elev) o.elev = p.elev;
  }
  return out.slice(0, max);
}

/** 지명 검색 → [{name, region, lat, lon, elev}]. 두 곳 모두 실패하면 던진다. */
async function searchPlace(q) {
  const [osm, om] = await Promise.allSettled([
    getJson(OSM + 'search?' + new URLSearchParams({ q, format: 'jsonv2', addressdetails: 1, limit: 8, 'accept-language': 'ko' }), 6000),
    getJson('https://geocoding-api.open-meteo.com/v1/search?' + new URLSearchParams({ name: q, language: 'ko', count: 8 }), 6000),
  ]);
  if (osm.status === 'rejected' && om.status === 'rejected') throw osm.reason;
  const a = osm.status === 'fulfilled' && Array.isArray(osm.value) ? osm.value.map(osmPlace).filter(Boolean) : [];
  const b = om.status === 'fulfilled' ? (om.value.results || []).map(r => ({
    name: r.name, region: [r.admin2, r.admin1, r.country].filter(Boolean).join(' · '),
    lat: r.latitude, lon: r.longitude, elev: r.elevation ?? 0,
  })) : [];
  return mergePlaces(a, b);
}

/** 좌표 → 그곳의 읍·면·동 이름과 지역. 좌표는 받은 그대로 두고, 밖으로는 약 100m로 뭉뚱그려 보낸다. 못 찾으면 null */
async function reversePlace(lat, lon) {
  const r = await getJson(OSM + 'reverse?' + new URLSearchParams({ lat: lat.toFixed(3), lon: lon.toFixed(3), format: 'jsonv2', addressdetails: 1, zoom: 14, 'accept-language': 'ko' }), 5000);
  const p = osmPlace({ ...r, name: null });          // 건물·길 이름이 아니라 행정 구역 이름을 쓴다
  return p && { ...p, lat, lon };
}

return { forecastUrl, airUrl, localIsoToMs, normalize, loadForecast, osmPlace, mergePlaces, searchPlace, reversePlace, LEVELS };
})();
// ── js/view.js
__m["js/view.js"] = (() => {
// 한 밤의 자료 조립. 화면(main.js)과 위젯(widget/)이 함께 쓴다 — DOM을 모른다.
const { seeing, seeingIndex, jetSpeed, badLayer, spread, hourScore, nightSummary } = __m["js/model.js"];
const { BODIES } = __m["js/sky.js"];

const HOUR = 3600e3;

/** 관측지 시간대(offMs)의 시각 표기 */
function clock(offMs) {
  const local = t => new Date(t + offMs);
  return {
    local,
    hm: t => (t == null ? '–' : local(t).toISOString().slice(11, 16)),
    hh: t => String(local(t).getUTCHours()).padStart(2, '0'),
  };
}

/** 밤 번호 0의 현지 정오(ms). 아침 8시 전에는 지난밤을 「오늘 밤」으로 본다. */
function baseNoon(now, offMs) {
  const d = new Date(now + offMs - 8 * HOUR);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12) - offMs;
}

/**
 * noon(그날 현지 정오)에 시작하는 밤 하나.
 * data: normalize()의 결과 또는 null. bodies: false면 천체 자취·제원을 건너뛴다(여러 밤의 요약만 필요할 때).
 * 반환의 hours는 밤 구간, day는 정오부터 다음 날 정오까지의 시간별 자료다.
 * outer: 천왕성·해왕성을 표에 넣는다. outerTracks: 그 자취까지 계산한다(기본은 outer와 같다).
 */
function nightView(sky, place, data, noon, { outer = false, outerTracks = outer, bodies = true, stepMin = 10 } = {}) {
  const night = sky.night(place, noon);
  const t0 = (night.sunset ?? noon + 6 * HOUR) - 20 * 60e3, t1 = (night.sunrise ?? noon + 18 * HOUR) + 20 * 60e3;
  const mid = (t0 + t1) / 2;
  const list = BODIES.filter(b => (bodies ? outer || !b.outer : b.id === 'Moon'));
  const tracks = bodies ? list.filter(b => outerTracks || !b.outer).map(b => ({ ...b, pts: sky.track(b.id, place, t0, t1, stepMin) })) : [];
  const table = list.map(b => ({ ...b, ...sky.events(b.id, place, noon), ...sky.facts(b.id, place, mid) }));
  const moon = sky.moon(mid), moonEv = table.find(b => b.id === 'Moon');

  const elev = data?.elev ?? place.elev ?? 0;
  const inNight = h => h.t >= t0 - HOUR / 2 && h.t <= t1 + HOUR / 2, inDay = h => h.t >= noon && h.t <= noon + 24 * HOUR;
  const all = (data?.hours ?? []).filter(h => inNight(h) || inDay(h)).map(h => {
    const see = seeing(h.levels, h.wind10, elev);
    const x = {
      ...h, seeing: see, index: seeingIndex(see), jet: jetSpeed(h.levels), bad: badLayer(h.levels, elev),
      spread: spread(h.temp, h.dew), moonAlt: sky.altAz('Moon', place, h.t).alt, moonFrac: moon.frac,
    };
    x.score = hourScore(x);
    return x;
  });
  // hours: 밤(그림의 시간축) · day: 그날 정오부터 다음 날 정오까지(상세 표)
  const hours = all.filter(inNight), day = all.filter(inDay);
  const darkFrom = night.astroEnd ?? night.sunset ?? t0, darkTo = night.astroStart ?? night.sunrise ?? t1;
  const dark = hours.filter(h => h.t >= darkFrom && h.t <= darkTo);
  return { noon, night, t0, t1, tracks, table, moon, moonEv, hours, day, dark, summary: nightSummary(dark), darkFrom, darkTo };
}

/** 달이 그 밤에 지는지·뜨는지 한 마디 */
function moonEvent(sky, place, v, hm) {
  const { moonEv, night } = v, a = night.sunset, b = night.sunrise;
  const within = t => t != null && a != null && b != null && t > a && t < b;
  return within(moonEv.set) ? `${hm(moonEv.set)} 짐` : within(moonEv.rise) ? `${hm(moonEv.rise)} 뜸`
    : sky.altAz('Moon', place, (v.darkFrom + v.darkTo) / 2).alt > 0 ? '밤새 떠 있음' : '밤새 없음';
}

function moonLine(sky, place, v, hm) {
  return `${Math.round(v.moon.frac * 100)}% ${v.moon.name} · ${moonEvent(sky, place, v, hm)}`;
}

function cloudLine(n, hh) {
  if (!n) return '–';
  switch (n.kind) {
    case 'clear': return '밤새 맑음';
    case 'overcast': return '밤새 흐림';
    case 'in': return `${hh(n.t)}시부터 ${n.layer} 유입`;
    case 'out': return `${hh(n.t)}시부터 갬`;
    default: return `평균 ${Math.round(n.avg)}%`;
  }
}

return { clock, baseNoon, nightView, moonEvent, moonLine, cloudLine };
})();
// ── widget/data.js
__m["widget/data.js"] = (() => {
// 위젯이 그릴 자료 — 한 번 계산해 모든 위젯이 나눠 쓴다. 순수 계산.
const { BODIES } = __m["js/sky.js"];
const { baseNoon, nightView, clock, moonEvent } = __m["js/view.js"];
const { compass } = __m["js/model.js"];

const DAY = 86400e3, NIGHTS = 5;
const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

/** 달을 뺀 천체 가운데 t에 가장 높이 뜬 것. 맨눈 행성이 먼저, 없으면 천왕성·해왕성. 없으면 null */
function highestBody(sky, place, t) {
  const up = BODIES.filter(b => b.id !== 'Moon').map(b => ({ ...b, ...sky.altAz(b.id, place, t) })).filter(b => b.alt > 0);
  const best = xs => xs.reduce((a, b) => (a && a.alt >= b.alt ? a : b), null);
  return best(up.filter(b => !b.outer)) || best(up);
}

/** 「지금」 위젯이 볼 시각과 그 저녁의 정오. a: 오늘 밤(또는 지난밤), b: 그다음 밤. 박명이 없는 곳(백야·극야)은 지금 */
function nowTime(now, a, b) {
  const n = a.night;
  if (n.civilEnd == null || n.civilStart == null) return { evalT: now, noon: a.noon };
  if (now < n.civilEnd) return { evalT: n.civilEnd, noon: a.noon };
  if (now <= n.civilStart) return { evalT: now, noon: a.noon };
  return b.night.civilEnd == null ? { evalT: now, noon: b.noon } : { evalT: b.night.civilEnd, noon: b.noon };
}

/** 띠 그림에 쓸 시간별 자료: 해진 뒤 첫 정시부터 n칸 */
function bandHours(v, n = 12) {
  const from = v.night.sunset ?? v.t0;
  return v.hours.filter(h => h.t >= from).slice(0, n);
}

/**
 * place {name, lat, lon, elev}, data: normalize() 결과(없으면 null — 천체만 그린다), now: ms
 */
function widgetModel(sky, place, data, now) {
  const offMs = (data ? data.offsetSec : Math.round(place.lon / 15) * 3600) * 1000;
  const c = clock(offMs), base = baseNoon(now, offMs);
  const nights = Array.from({ length: NIGHTS }, (_, i) => {
    const v = nightView(sky, place, data, base + i * DAY, { bodies: i === 0, outer: true, outerTracks: false });
    const d = c.local(v.noon);
    return { ...v, month: d.getUTCMonth() + 1, day: d.getUTCDate(), wd: WEEK[d.getUTCDay()], moonEvent: moonEvent(sky, place, v, c.hm) };
  });

  // 「지금」: 하늘이 어두울 때는 지금, 낮에는 다가오는 저녁의 시민박명이 끝나는 때를 본다.
  // 새벽 박명 뒤 아침 8시까지는 nights[0]이 지난밤이므로 다음 밤의 저녁을 본다.
  const { evalT, noon } = nowTime(now, nights[0], nights[1]);
  const hb = highestBody(sky, place, evalT);
  const ev = b => ({ ...b, ...sky.events(b.id, place, noon) });
  let nowBody = null, nextRise = null;
  if (hb) nowBody = { ...ev(hb), dir: compass(hb.az), ...sky.facts(hb.id, place, evalT) };
  else nextRise = BODIES.filter(b => b.id !== 'Moon').map(ev).filter(b => b.rise != null && b.rise > evalT).sort((a, b) => a.rise - b.rise)[0] || null;
  return { place, now, offMs, nights, evalT, isNow: evalT === now, nowBody, nextRise, hasData: !!data };
}

return { highestBody, nowTime, bandHours, widgetModel };
})();
// ── widget/theme.js
__m["widget/theme.js"] = (() => {
// 위젯 색 — FLAT은 style.css의 어두운 테마와 같은 값.
// 유리풍(GLASS)은 같은 색에 반투명 칸(#rrggbbaa)을 쓰고, 바탕은 layout.js가 비스듬한 빛으로 칠한다.
const FLAT = {
  glass: false,
  bg: '#020203', card: '#0a0b0d', band: '#101114', line: '#1e2026', edge: '#2a2d35',
  ink: '#d6d9df', ink2: '#989ea9', ink3: '#727986',
  g: '#4d9a80', m: '#b3964e', b: '#bd6a61',
  cell: { g: '#16362f', m: '#3a331d', b: '#402423', p: '#15181f' }, na: '#0c0d10',
  cloud: '#c2c7d0', cbase: '#13151a',
  tw: ['#262b38', '#1d212c', '#151821', '#0e1016', '#07080b'],
  body: {
    Moon: '#c2c6ce', Mercury: '#9589c4', Venus: '#d6b7a4', Mars: '#c96b61',
    Jupiter: '#c08c5e', Saturn: '#c8b15c', Uranus: '#62b0aa', Neptune: '#6e8ecb',
  },
};
const GLASS = {
  glass: true,
  card: '#0c0d10', band: '#ffffff0d', line: '#ffffff14', edge: '#ffffff26',
  cell: { g: '#4d9a8052', m: '#b3964e4d', b: '#bd6a6152', p: '#ffffff12' }, na: '#ffffff08', cbase: '#ffffff12',
};
const T = { ...FLAT };
/** 그리기 전에 색을 고른다. glass: 유리풍 */
function setTheme(glass) { Object.assign(T, FLAT, glass ? GLASS : null); }

return { setTheme, T };
})();
// ── js/charts.js
__m["js/charts.js"] = (() => {
// SVG 문자열을 만든다. 두 그림은 같은 가로 눈금(W, 왼쪽 여백 GUTTER)을 쓴다.
const W = 390, GUTTER = 38, PLOT_H = 150;
const VB_W = W + GUTTER;

const DASH = { Jupiter: '7 4', Mercury: '2 4', Uranus: '10 3 2 3', Neptune: '1 5' };

function scale(t0, t1) {
  return { t0, t1, x: t => (t - t0) / (t1 - t0) * W, t: x => t0 + x / W * (t1 - t0) };
}
const altY = alt => PLOT_H - Math.max(-5, alt) / 90 * (PLOT_H - 10);
const n1 = v => v.toFixed(1);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** 현지 시각 3시간 간격 눈금 [{t, label}] */
function hourTicks(sc, offsetSec, every = 3) {
  const out = [], H = 3600e3, off = offsetSec * 1000;
  let t = Math.ceil((sc.t0 + off) / H) * H - off;
  for (; t <= sc.t1; t += H) {
    const hr = new Date(t + off).getUTCHours();
    if (hr % every === 0) out.push({ t, label: String(hr).padStart(2, '0') });
  }
  return out;
}

function ticksSvg(sc, offsetSec, y0, y1, yText) {
  return hourTicks(sc, offsetSec).map(k => {
    const x = n1(sc.x(k.t));
    return `<line class="grid" x1="${x}" y1="${y0}" x2="${x}" y2="${y1}"/><text x="${x}" y="${yText}" text-anchor="middle">${k.label}</text>`;
  }).join('');
}

/** 박명 띠: 낮(tw0) → 시민(tw1) → 항해(tw2) → 천문(tw3) → 밤(바탕) */
function twilightSvg(sc, n) {
  const seg = (a, b, cls) => {
    if (a == null || b == null) return '';
    const x0 = Math.max(0, sc.x(a)), x1 = Math.min(W, sc.x(b));
    return x1 > x0 ? `<rect class="${cls}" x="${n1(x0)}" y="0" width="${n1(x1 - x0)}" height="${PLOT_H}"/>` : '';
  };
  return seg(sc.t0, n.sunset, 'tw0') + seg(n.sunset, n.civilEnd, 'tw1') + seg(n.civilEnd, n.nautEnd, 'tw2') + seg(n.nautEnd, n.astroEnd, 'tw3')
    + seg(n.astroStart, n.nautStart, 'tw3') + seg(n.nautStart, n.civilStart, 'tw2') + seg(n.civilStart, n.sunrise, 'tw1') + seg(n.sunrise, sc.t1, 'tw0');
}

/**
 * 고도 곡선. tracks: [{id, ko, pts:[{t, alt}]}]
 */
function altitudeChart({ sc, night, tracks, offsetSec }) {
  const placed = [];
  const curves = [], labels = [], dots = [];
  for (const tr of tracks) {
    const vis = tr.pts.filter(p => p.t >= sc.t0 && p.t <= sc.t1);
    const top = vis.reduce((m, p) => (p.alt > m.alt ? p : m), { alt: -99 });
    if (top.alt <= 0) continue;
    const d = tr.pts.map((p, i) => `${i ? 'L' : 'M'}${n1(sc.x(p.t))} ${n1(altY(p.alt))}`).join('');
    const dash = DASH[tr.id] ? ` stroke-dasharray="${DASH[tr.id]}"` : '';
    curves.push(`<path class="curve b-${tr.id}" d="${d}"${dash}/>`);
    dots.push(`<circle class="dot b-${tr.id}" data-body="${tr.id}" r="4.5" cx="-99" cy="-99"/>`);
    // 이름표: 최고점 위. 겹치면 아래로 민다.
    let x = clampN(sc.x(top.t), 14, W - 14), y = Math.max(11, altY(top.alt) - 6);
    for (let k = 0; k < 6 && placed.some(p => Math.abs(p.x - x) < 46 && Math.abs(p.y - y) < 12); k++) y += 12;
    placed.push({ x, y });
    const anchor = x < 40 ? 'start' : x > W - 40 ? 'end' : 'middle';
    labels.push(`<text class="lbl" x="${n1(x)}" y="${n1(y)}" text-anchor="${anchor}">${esc(tr.ko)} ${Math.round(top.alt)}°</text>`);
  }
  return `<svg viewBox="${-GUTTER} 0 ${VB_W} ${PLOT_H + 30}" role="img" aria-label="밤사이 천체 고도 곡선">
<defs><clipPath id="clipAlt"><rect x="0" y="0" width="${W}" height="${PLOT_H}"/></clipPath></defs>
<rect class="tw4" x="0" y="0" width="${W}" height="${PLOT_H}"/>${twilightSvg(sc, night)}
<line class="grid dash" x1="0" y1="${n1(altY(30))}" x2="${W}" y2="${n1(altY(30))}"/><line class="grid dash" x1="0" y1="${n1(altY(60))}" x2="${W}" y2="${n1(altY(60))}"/>
${ticksSvg(sc, offsetSec, 0, PLOT_H, PLOT_H + 20)}
<text class="r" x="-6" y="${n1(altY(30) + 3)}">30°</text><text class="r" x="-6" y="${n1(altY(60) + 3)}">60°</text><text class="r" x="-6" y="${PLOT_H + 3}">지평</text>
<g clip-path="url(#clipAlt)">${curves.join('')}</g>
<line class="horizon" x1="0" y1="${PLOT_H}" x2="${W}" y2="${PLOT_H}"/>
${labels.join('')}
<g class="cursor" visibility="hidden"><line class="cur" x1="0" y1="0" x2="0" y2="${PLOT_H}"/>${dots.join('')}
<rect class="curbox" x="-23" y="2" width="46" height="17" rx="4"/><text class="curtxt" x="0" y="15" text-anchor="middle"></text></g>
</svg>`;
}

const clampN = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

/** 구름 칸 숫자는 이 값(%)부터 어두운 글자로 바꾼다 — 칸이 밝아져 어두운 글자의 대비가 밝은 글자를 앞서는 지점(둘 다 약 3.8:1) */
const CLOUD_INK_FLIP = 48;

/**
 * 시간별 상세 표의 칸. 기상 띠와 같은 규칙으로 칠한다 — 구름은 양만큼 밝아지고(숫자는 CLOUD_INK_FLIP부터 어두운 글자), 등급은 g·m·b.
 * kind: 'cloud' | 'grade'(grade는 'g'·'m'·'b' 또는 null) | 그 밖(칠하지 않음)
 */
function detailCell(text, { kind, value, grade } = {}) {
  if (kind === 'cloud' && Number.isFinite(value)) {
    const c = Math.round(clampN(value, 0, 100));
    return `<td class="cc${Math.round(value) >= CLOUD_INK_FLIP ? ' hi' : ''}" style="--c:${c}%">${esc(text)}</td>`;
  }
  if (kind === 'grade' && grade) return `<td class="g-${grade}">${esc(text)}</td>`;
  return `<td>${esc(text)}</td>`;
}

/**
 * 기상 띠. rows: [{label, kind:'cloud'|'grade'|'plain', value(h), text?(h), grade?(v)}]
 * hours: [{t, ...}] — 각 칸은 그 시각 앞뒤 30분.
 */
function bandChart({ sc, hours, rows, offsetSec }) {
  const RH = 24, GAP = 3, half = 1800e3;
  let y = 0;
  const body = rows.map(r => {
    const top = y + (r.gapBefore ? 5 : 0);
    y = top + RH + GAP;
    const cells = hours.map(h => {
      const x0 = clampN(sc.x(h.t - half), 0, W), x1 = clampN(sc.x(h.t + half), 0, W);
      const w = x1 - x0 - 1;
      if (w <= 1) return '';
      const v = r.value(h);
      if (!Number.isFinite(v)) return `<rect class="cell na" x="${n1(x0)}" y="${top}" width="${n1(w)}" height="${RH}"/>`;
      let rect, txt = '';
      if (r.kind === 'cloud') {
        rect = `<rect class="cell cbase" x="${n1(x0)}" y="${top}" width="${n1(w)}" height="${RH}"/><rect class="cell cloud" x="${n1(x0)}" y="${top}" width="${n1(w)}" height="${RH}" fill-opacity="${(clampN(v, 0, 100) / 100).toFixed(2)}"/>`;
        if (w >= 19) txt = `<text class="v cv${Math.round(v) >= CLOUD_INK_FLIP ? ' hi' : ''}" x="${n1(x0 + w / 2)}" y="${top + 16}">${Math.round(v)}</text>`;
      } else {
        const g = r.kind === 'grade' ? r.grade(v) : 'p';
        rect = `<rect class="cell g-${g}" x="${n1(x0)}" y="${top}" width="${n1(w)}" height="${RH}"/>`;
        if (w >= 19) txt = `<text class="v" x="${n1(x0 + w / 2)}" y="${top + 16}">${esc(r.text(v))}</text>`;
      }
      return rect + txt;
    }).join('');
    return `<text class="r" x="-6" y="${top + 16}">${esc(r.label)}</text>${cells}`;
  }).join('');
  const h = y;
  return `<svg viewBox="${-GUTTER} 0 ${VB_W} ${h + 20}" role="img" aria-label="시간별 구름·시상·제트기류">
${body}${ticksSvg(sc, offsetSec, 0, 0, h + 14)}
<g class="cursor" visibility="hidden"><line class="cur" x1="0" y1="0" x2="0" y2="${h - GAP}"/></g>
</svg>`;
}

return { scale, hourTicks, altitudeChart, detailCell, bandChart, W, GUTTER, PLOT_H, DASH, altY, CLOUD_INK_FLIP };
})();
// ── widget/layout.js
__m["widget/layout.js"] = (() => {
// 위젯 배치 — 자료(widgetModel)를 그리기 명령 목록으로 바꾼다. 순수 계산이라 PC에서 SVG로 미리 본다.
// 명령: rect · line · poly · circle · text (좌표는 pt, 글자의 y는 줄 상자의 위쪽)
const { T, setTheme } = __m["widget/theme.js"];
const { bandHours } = __m["widget/data.js"];
const { clock, cloudLine } = __m["js/view.js"];
const { hourTicks, DASH, CLOUD_INK_FLIP } = __m["js/charts.js"];
const { GRADE_KO, gradeSeeing, gradeJet, gradeDew, gradeAod } = __m["js/model.js"];

const SIZES = { small: [158, 158], medium: [338, 158], large: [338, 354] };
const KINDS = {
  점수: 'small', 달: 'small', 대기: 'small', 지금: 'small', 날씨: 'small',
  판정: 'medium', 고도: 'medium', '5일': 'medium', 시간별: 'medium',
  종합: 'large', 천체: 'large', 예보: 'large', 기상: 'large',
};
const DEFAULT_KIND = { small: '점수', medium: '판정', large: '종합' };

const PAD = 14, HEAD = 26;
const fin = Number.isFinite;

// ── 그리기 명령 모으개 ─────────────────────────────────
function canvas(w, h) {
  const ops = [];
  return {
    w, h, ops,
    rect: (x, y, w, h, o = {}) => ops.push({ op: 'rect', x, y, w, h, r: 0, ...o }),
    line: (x1, y1, x2, y2, color = T.line, sw = 1) => ops.push({ op: 'line', x1, y1, x2, y2, color, sw }),
    poly: (pts, o = {}) => pts.length > 1 && ops.push({ op: 'poly', pts, ...o }),
    circle: (cx, cy, r, o = {}) => ops.push({ op: 'circle', cx, cy, r, ...o }),
    text: (text, x, y, o = {}) => ops.push({ op: 'text', text: String(text), x, y, size: 12, weight: 'm', color: T.ink, align: 'l', ...o }),
  };
}

/** 글자 너비 어림(pt). 한글 1em, 숫자·영문 0.6em */
function textWidth(s, size) {
  let em = 0;
  for (const ch of String(s)) em += /[ᄀ-ᇿ　-鿿가-힣]/.test(ch) ? 1 : ch === ' ' ? 0.3 : /[.,:·°″′]/.test(ch) ? 0.32 : 0.6;
  return em * size;
}

/** 너비 max에 들어가게 앞에서부터 자르고 …을 붙인다 */
function fit(s, size, max) {
  s = String(s);
  if (textWidth(s, size) <= max) return s;
  let out = '';
  for (const ch of s) { if (textWidth(out + ch + '…', size) > max) break; out += ch; }
  return out + '…';
}

/** 등급 모양: 좋음 ●, 보통 ▲, 나쁨 ■ (색 + 모양 + 글자의 「모양」) */
function mark(c, g, cx, cy, s = 4) {
  if (!g) return;
  if (g === 'g') c.circle(cx, cy, s, { fill: T.g });
  else if (g === 'm') c.poly([[cx, cy - s], [cx + s * 1.1, cy + s * 0.85], [cx - s * 1.1, cy + s * 0.85]], { fill: T.m, close: true });
  else c.rect(cx - s * 0.9, cy - s * 0.9, s * 1.8, s * 1.8, { fill: T.b });
}

/** 모양 + 등급 글자를 x부터 나란히. 끝 x를 돌려준다 */
function tag(c, g, x, y, size = 12, label = g ? GRADE_KO[g] : '') {
  if (!g) return x;
  mark(c, g, x + size * 0.42, y + size * 0.62, size * 0.36);
  c.text(label, x + size * 1.05, y, { size, weight: 'b', color: T[g] });
  return x + size * 1.05 + textWidth(label, size);
}

// 유리풍 바탕: 왼쪽 위가 밝은 비스듬한 빛. DrawContext에 그라데이션이 없어 좁은 띠로 나눠 칠한다(판 밖은 잘린다).
const SHEEN = [[0, [38, 41, 48]], [0.42, [15, 16, 19]], [1, [6, 6, 7]]], RIM = '#ffffff24', CORNER = 22;
function sheen(c, w, h) {
  const dx = 0.5, dy = 0.866, U = dx * w + dy * h, L = w + h, N = 36;
  const P = (u, s) => [u * dx - s * dy, u * dy + s * dx];
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N, k = t < SHEEN[1][0] ? 0 : 1, [t0, a] = SHEEN[k], [t1, b] = SHEEN[k + 1], f = (t - t0) / (t1 - t0);
    const u0 = U * i / N, u1 = U * (i + 1) / N + 0.5;
    const fill = '#' + a.map((x, j) => Math.round(x + (b[j] - x) * f).toString(16).padStart(2, '0')).join('');
    c.poly([P(u0, -L), P(u0, L), P(u1, L), P(u1, -L)], { fill, close: true });
  }
}

function frame(kind, title, right) {
  const [w, h] = SIZES[KINDS[kind]];
  const c = canvas(w, h);
  if (T.glass) sheen(c, w, h); else c.rect(0, 0, w, h, { fill: T.card });
  c.rect(0, 0, w, HEAD, { fill: T.band });
  c.line(0, HEAD, w, HEAD, T.edge);
  c.text(title, PAD, 6, { size: 11, weight: 'h' });
  if (right) c.text(fit(right, 11, w - 2 * PAD - textWidth(title, 11) - 8), w - PAD, 6, { size: 11, color: T.ink3, align: 'r' });
  return c;
}

/** 이름표 행들: [[이름, 값 | 그리는 함수(x, y)]] */
function rows(c, list, x, y, w, { rh = 22, size = 12, lw = 36 } = {}) {
  list.forEach(([k, v], i) => {
    const ty = y + i * rh + (rh - size * 1.2) / 2;
    c.text(k, x, ty, { size, weight: 'b', color: T.ink3 });
    if (typeof v === 'function') v(x + lw, ty); else c.text(v, x + lw, ty, { size });
    if (i < list.length - 1) c.line(x, y + (i + 1) * rh, x + w, y + (i + 1) * rh);
  });
}

function scoreBox(c, s, x, y, w, h, numSize, withTag) {
  const col = s ? T[s.grade] : T.ink3;
  c.rect(x, y, w, h, { fill: col, r: 10 });
  c.rect(x + 6, y + 2, w - 8, h - 4, { fill: T.card, r: 8 });
  const cx = x + 3 + w / 2, th = numSize * 1.2 + (withTag ? 15 : 0), ty = y + (h - th) / 2;
  c.text(s ? Math.round(s.score) : '–', cx, ty, { size: numSize, weight: 'h', align: 'c' });
  if (withTag && s) {
    const label = GRADE_KO[s.grade], tw = 11 * 1.05 + textWidth(label, 11);
    tag(c, s.grade, cx - tw / 2, ty + numSize * 1.2 + 1, 11);
  }
}

/** 달 모양 다각형. deg: 황경차(0 삭 → 180 보름 → 360). 북반구에서 차오르는 달은 오른쪽이 밝고, 남반구(south)에서는 왼쪽이 밝다. */
function moonShape(deg, cx, cy, r, n = 24, south = false) {
  const d = ((deg % 360) + 360) % 360, waxing = d <= 180, k = Math.cos((waxing ? d : 360 - d) * Math.PI / 180), sx = (waxing ? 1 : -1) * (south ? -1 : 1);
  const pts = [];
  for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + Math.PI * i / n; pts.push([cx + sx * r * Math.cos(a), cy + r * Math.sin(a)]); }
  for (let i = n; i >= 0; i--) { const a = -Math.PI / 2 + Math.PI * i / n; pts.push([cx + sx * r * k * Math.cos(a), cy + r * Math.sin(a)]); }
  return pts;
}

function moonDisc(c, deg, cx, cy, r, south) {
  c.circle(cx, cy, r, { fill: T.band, stroke: T.edge });
  c.poly(moonShape(deg, cx, cy, r, 24, south), { fill: T.body.Moon, close: true });
}

/** 꺾은선을 점선 조각들로 나눈다. pattern: [그리기, 띄우기, …] */
function dashes(pts, pattern) {
  const out = [];
  let cur = [pts[0]], pi = 0, left = pattern[0], on = true;
  for (let i = 1; i < pts.length; i++) {
    let [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    let seg = Math.hypot(x1 - x0, y1 - y0);
    while (seg > left) {
      const f = left / seg, x = x0 + (x1 - x0) * f, y = y0 + (y1 - y0) * f;
      if (on) { cur.push([x, y]); out.push(cur); }
      seg -= left; x0 = x; y0 = y;
      pi = (pi + 1) % pattern.length; left = pattern[pi]; on = !on;
      cur = on ? [[x, y]] : [];
    }
    left -= seg;
    if (on) cur.push([x1, y1]);
  }
  if (on && cur.length > 1) out.push(cur);
  return out;
}

// ── 그림: 고도 곡선 ────────────────────────────────────
function altChart(c, m, v, bx, by, bw, bh) {
  const GX = 22, x0 = bx + GX, x1 = bx + bw - 4, ph = bh - 14, yb = by + ph;
  const X = t => x0 + (t - v.t0) / (v.t1 - v.t0) * (x1 - x0), Y = a => yb - a / 90 * (ph - 6);
  const n = v.night;
  const seg = (a, b, i) => { if (a != null && b != null && b > a) c.rect(X(a), by, X(b) - X(a), ph, { fill: T.tw[i] }); };
  c.rect(x0, by, x1 - x0, ph, { fill: T.tw[4] });
  seg(v.t0, n.sunset, 0); seg(n.sunset, n.civilEnd, 1); seg(n.civilEnd, n.nautEnd, 2); seg(n.nautEnd, n.astroEnd, 3);
  seg(n.astroStart, n.nautStart, 3); seg(n.nautStart, n.civilStart, 2); seg(n.civilStart, n.sunrise, 1); seg(n.sunrise, v.t1, 0);
  for (const a of [30, 60]) { c.line(x0, Y(a), x1, Y(a), T.line); c.text(a + '°', x0 - 4, Y(a) - 6, { size: 9, color: T.ink3, align: 'r' }); }
  c.line(x0, yb, x1, yb, T.edge);
  for (const k of hourTicks({ t0: v.t0, t1: v.t1 }, m.offMs / 1000)) c.text(k.label, X(k.t), yb + 2, { size: 9, color: T.ink3, align: 'c' });

  const placed = [];
  for (const tr of v.tracks.filter(t => !t.outer)) {
    const col = T.body[tr.id], pat = DASH[tr.id] ? DASH[tr.id].split(' ').map(Number) : null;
    // 지평선 위 구간만. 지평선을 넘는 자리는 보간한다
    let run = [], top = null;
    const flush = () => { if (run.length > 1) (pat ? dashes(run, pat) : [run]).forEach(p => c.poly(p, { stroke: col, sw: 1.8 })); run = []; };
    tr.pts.forEach((p, i) => {
      const q = tr.pts[i - 1];
      if (q && (q.alt >= 0) !== (p.alt >= 0)) { const f = q.alt / (q.alt - p.alt); run.push([X(q.t + (p.t - q.t) * f), yb]); }
      if (p.alt >= 0) { run.push([X(p.t), Y(p.alt)]); if (!top || p.alt > top.alt) top = p; } else flush();
    });
    flush();
    if (top && top.alt > 8) {
      const w = textWidth(tr.ko, 10), lx = Math.min(Math.max(X(top.t), x0 + w / 2 + 1), x1 - w / 2 - 1);
      const hit = y => placed.some(p => Math.abs(p.x - lx) < (p.w + w) / 2 + 2 && Math.abs(p.y - y) < 11);
      let ly = Math.max(by, Y(top.alt) - 14);
      if (hit(ly)) ly = Y(top.alt) + 3;
      if (!hit(ly)) { placed.push({ x: lx, y: ly, w }); c.text(tr.ko, lx, ly, { size: 10, weight: 'b', color: col, align: 'c' }); }
    }
  }
  if (m.now > v.t0 && m.now < v.t1) c.line(X(m.now), by, X(m.now), yb, T.ink, 1);
}

// ── 그림: 시간별 기상 띠 ───────────────────────────────
// 띠의 줄: [이름, 값, 등급 함수 | 'cloud' | 'plain', 글자, 앞을 띄울지, 여러 시간을 한 칸으로 묶는 법]
const BAND_ROWS = [
  ['구름', h => h.cloud, 'cloud', v => Math.round(v), false, 'mean'],
  ['시상', h => h.seeing, gradeSeeing, v => v.toFixed(1), false, 'max'],
  ['제트', h => h.jet, gradeJet, v => Math.round(v), false, 'max'],
  ['이슬', h => h.spread, gradeDew, v => v.toFixed(1), false, 'min'],
];
/** 여러 시간의 값을 한 칸으로: 구름은 평균, 등급이 있는 것은 나쁜 쪽(시상·제트는 큰 값, 이슬점 차는 작은 값). 값이 없으면 NaN */
function blockValue(values, how) {
  const xs = values.filter(fin);
  if (!xs.length) return NaN;
  return how === 'max' ? Math.max(...xs) : how === 'min' ? Math.min(...xs) : xs.reduce((a, b) => a + b, 0) / xs.length;
}
// 본판 「관측 기상」과 같은 줄
const WEATHER_ROWS = [
  ['상층', h => h.high, 'cloud', v => Math.round(v)],
  ['중층', h => h.mid, 'cloud', v => Math.round(v)],
  ['하층', h => h.low, 'cloud', v => Math.round(v)],
  ['시상', h => h.seeing, gradeSeeing, v => v.toFixed(1), true],
  ['제트', h => h.jet, gradeJet, v => Math.round(v)],
  ['투명', h => h.aod, gradeAod, v => v.toFixed(2).replace(/^0/, '')],
  ['이슬', h => h.spread, gradeDew, v => v.toFixed(0)],
  ['기온', h => h.temp, 'plain', v => Math.round(v), true],
  ['바람', h => h.wind10, 'plain', v => Math.round(v)],
];

/** 기상 띠. step: 몇 시간을 한 칸으로 묶을지(작은 위젯은 3) */
function bandChart(c, m, v, bx, by, bw, bh, list = BAND_ROWS, { step = 1, GX = 30, GAP = 5 } = {}) {
  const { hh } = clock(m.offMs), all = bandHours(v), hours = [];
  for (let i = 0; i < all.length; i += step) hours.push(all.slice(i, i + step));
  if (!hours.length) { c.text('예보 자료 없음', bx + bw / 2, by + bh / 2 - 8, { size: 12, color: T.ink3, align: 'c' }); return; }
  const gaps = list.filter(r => r[4]).length;
  const cw = (bw - GX - 4) / (12 / step), rh = (bh - 13 - gaps * GAP) / list.length;
  let y = by;
  list.forEach(([name, val, kind, fmt, gap, how]) => {
    if (gap) y += GAP;
    const ty = y + (rh - 1 - 9.5 * 1.2) / 2, grade = typeof kind === 'function' ? kind : null;
    c.text(name, bx + 4, y + (rh - 1 - 12) / 2, { size: 10, weight: 'b', color: T.ink3 });
    hours.forEach((h, i) => {
      const x = bx + GX + i * cw, x_ = x + 0.5, w = cw - 1, hgt = rh - 1, value = blockValue(h.map(val), how);
      if (!fin(value)) { c.rect(x_, y, w, hgt, { fill: T.na, r: 3 }); return; }
      const g = grade ? grade(value) : null;
      if (g) c.rect(x_, y, w, hgt, { fill: T.cell[g], r: 3 });
      else if (kind === 'plain') c.rect(x_, y, w, hgt, { fill: T.cell.p, r: 3 });
      else { c.rect(x_, y, w, hgt, { fill: T.cbase, r: 3 }); c.rect(x_, y, w, hgt, { fill: T.cloud, r: 3, alpha: Math.min(1, Math.max(0, value / 100)) }); }
      c.text(fmt(value), x + cw / 2, ty, { size: 9.5, color: kind === 'cloud' && Math.round(value) >= CLOUD_INK_FLIP ? T.bg : T.ink, align: 'c' });
      if (g && g !== 'g') mark(c, g, x + cw - 4.5, y + 4.5, 2);
    });
    y += rh;
  });
  hours.forEach((h, i) => c.text(hh(h[0].t), bx + GX + i * cw + cw / 2, by + bh - 12, { size: 9, color: T.ink3, align: 'c' }));
}

// ── 글귀 ───────────────────────────────────────────────
const dateText = (m, v) => `${m.place.name} · ${v.month}.${v.day} ${v.wd}`;
function winShort(m, v) {
  const { hh, hm } = clock(m.offMs), w = v.summary && v.summary.window;
  if (!w) return '없음';
  const to = Math.min(w.to, v.darkTo);
  return hh(w.from) === hh(to) ? `${hm(w.from)}–${hm(to)}` : `${hh(w.from)}–${hh(to)}시`;   // 한 시간이 안 되면 분까지
}
function winLong(m, v) {
  const { hm } = clock(m.offMs), w = v.summary && v.summary.window;
  return w ? `${hm(w.from)}–${hm(Math.min(w.to, v.darkTo))}` : '없음';
}
const pct = x => (fin(x) ? `${Math.round(x)}%` : '–');
const cautionRow = (c, s) => (x, y) => {
  if (!s || !s.cautions.length) { c.text('없음', x, y); return; }
  tag(c, 'b', x, y, 12, s.cautions.join(' · '));
};

// ── 위젯 13종 ──────────────────────────────────────────
const LAYOUTS = {
  점수(m) {
    const v = m.nights[0], s = v.summary, c = frame('점수', '오늘 밤', m.place.name);
    scoreBox(c, s, PAD, 36, 62, 54, 28, false);
    if (s) tag(c, s.grade, 86, 43, 15);
    c.text('관측 점수', 86, 65, { size: 11, color: T.ink2 });
    rows(c, [['최적', winShort(m, v)], ['구름', pct(s && s.cloudAvg)]], PAD, 100, 130);
    return c;
  },
  달(m) {
    const v = m.nights[0], { hm } = clock(m.offMs), c = frame('달', '달', `월령 ${v.moon.age.toFixed(1)}`);
    moonDisc(c, v.moon.deg, 41, 63, 25, m.place.lat < 0);
    c.text(v.moon.name, 78, 45, { size: 15, weight: 'b' });
    c.text(`밝은 면 ${Math.round(v.moon.frac * 100)}%`, 78, 66, { size: 11, color: T.ink2 });
    rows(c, [['뜸', hm(v.moonEv.rise)], ['짐', hm(v.moonEv.set)]], PAD, 100, 130);
    return c;
  },
  대기(m) {
    const v = m.nights[0], s = v.summary, c = frame('대기', '대기', m.place.name);
    const see = s && fin(s.seeingAvg) ? s.seeingAvg.toFixed(1) : '–';
    c.text(see, PAD, 33, { size: 30, weight: 'h' });
    c.text('″', PAD + textWidth(see, 30) + 1, 36, { size: 15, weight: 'b' });
    if (s) tag(c, gradeSeeing(s.seeingAvg), PAD + textWidth(see, 30) + 14, 47, 13);
    c.text('시상 평균', PAD, 71, { size: 11, color: T.ink2 });
    const val = (txt, g, extra) => (x, y) => { c.text(txt, x, y); if (g) tag(c, g, x + textWidth(txt, 12) + 5, y, 12, extra || GRADE_KO[g]); };
    rows(c, [
      ['제트', s && fin(s.jetMax) ? val(`${Math.round(s.jetMax)}m/s`, gradeJet(s.jetMax)) : '–'],
      ['이슬', s && fin(s.dewMin) ? val(`${s.dewMin.toFixed(1)}°`, gradeDew(s.dewMin), gradeDew(s.dewMin) === 'b' ? '결로' : null) : '–'],
    ], PAD, 92, 130);
    return c;
  },
  지금(m) {
    const { hm } = clock(m.offMs), b = m.nowBody, c = frame('지금', m.isNow ? '지금' : '해진 뒤', hm(m.evalT));
    if (b) {
      c.text(b.ko, PAD, 33, { size: 30, weight: 'h', color: T.body[b.id] });
      c.text(`${b.mag.toFixed(1)}등급 · ${b.constellation}`, PAD, 71, { size: 11, color: T.ink2 });
      rows(c, [['고도', `${Math.round(b.alt)}° ${b.dir}`], ['짐', hm(b.set)]], PAD, 92, 130);
    } else {
      c.text('없음', PAD, 33, { size: 30, weight: 'h', color: T.ink3 });
      c.text('떠 있는 행성', PAD, 71, { size: 11, color: T.ink2 });
      const n = m.nextRise;
      rows(c, [['다음', n ? n.ko : '–'], ['뜸', n ? hm(n.rise) : '–']], PAD, 92, 130);
    }
    return c;
  },
  판정(m) {
    const v = m.nights[0], s = v.summary, { hh } = clock(m.offMs), c = frame('판정', '오늘 밤 판정', dateText(m, v));
    scoreBox(c, s, PAD, 40, 86, 96, 36, true);
    rows(c, [
      ['최적', winLong(m, v)],
      ['달', `${v.moon.name} · ${v.moonEvent}`],
      ['구름', s ? `평균 ${pct(s.cloudAvg)}${s.cloudNote.kind === 'avg' ? '' : ' · ' + cloudLine(s.cloudNote, hh)}` : '–'],
      ['주의', cautionRow(c, s)],
    ], 114, 40, 210, { rh: 24 });
    return c;
  },
  고도(m) {
    // 곡선 아래 한 줄: 일몰 · 일출 · (달 모양) 밝은 면 % 위상 이름
    const v = m.nights[0], { hm } = clock(m.offMs), c = frame('고도', '밤하늘', dateText(m, v));
    altChart(c, m, v, 8, 32, 322, 98);
    const y = 135, R = 338 - PAD, t = x => (x != null ? hm(x) : '–');
    c.line(8, 131, 330, 131, T.line);
    c.text('일몰', PAD, y, { size: 10.5, weight: 'b', color: T.ink3 });
    c.text(t(v.night.sunset), PAD + 26, y, { size: 12, weight: 'h' });
    c.text('일출', 92, y, { size: 10.5, weight: 'b', color: T.ink3 });
    c.text(t(v.night.sunrise), 118, y, { size: 12, weight: 'h' });
    const label = `${Math.round(v.moon.frac * 100)}% ${v.moon.name}`;
    c.text(label, R, y, { size: 12, weight: 'b', align: 'r' });
    moonDisc(c, v.moon.deg, R - textWidth(label, 12) - 16, y + 7.5, 7, m.place.lat < 0);
    return c;
  },
  '5일'(m) {
    const c = frame('5일', '5일 밤', m.place.name), cw = (338 - 20) / 5, top = 44, base = 106;
    m.nights.forEach((v, i) => {
      const s = v.summary, cx = 10 + i * cw + cw / 2;
      c.rect(cx - 15, top, 30, base - top, { fill: T.band, r: 4 });
      if (s) {
        const bh = Math.max(3, s.score / 100 * (base - top));
        c.rect(cx - 15, base - bh, 30, bh, { fill: T[s.grade], r: 4 });
        c.text(Math.round(s.score), cx, Math.max(base - bh - 17, top - 15), { size: 13, weight: 'h', align: 'c' });
        const label = GRADE_KO[s.grade], tw = 10 * 1.05 + textWidth(label, 10);
        tag(c, s.grade, cx - tw / 2, 110, 10);
      } else c.text('–', cx, top - 15, { size: 13, weight: 'h', align: 'c', color: T.ink3 });
      c.text(`${v.day} ${v.wd}`, cx, 126, { size: 10.5, weight: i ? 'm' : 'h', color: i ? T.ink3 : T.ink, align: 'c' });
    });
    return c;
  },
  시간별(m) {
    const v = m.nights[0], c = frame('시간별', '시간별', dateText(m, v));
    bandChart(c, m, v, 8, 34, 322, 118);
    return c;
  },
  날씨(m) {
    const v = m.nights[0], c = frame('날씨', '관측 기상', m.place.name);
    bandChart(c, m, v, 4, 34, 150, 118, BAND_ROWS, { step: 3, GX: 28 });
    return c;
  },
  기상(m) {
    const v = m.nights[0], c = frame('기상', '관측 기상', dateText(m, v));
    bandChart(c, m, v, 8, 36, 322, 312, WEATHER_ROWS);
    return c;
  },
  종합(m) {
    const v = m.nights[0], s = v.summary, c = frame('종합', '오늘 밤', dateText(m, v));
    scoreBox(c, s, PAD, 36, 70, 66, 28, true);
    rows(c, [['최적', winLong(m, v)], ['달', `${v.moon.name} · ${v.moonEvent}`], ['주의', cautionRow(c, s)]], 98, 36, 226);
    altChart(c, m, v, 8, 110, 322, 122);
    bandChart(c, m, v, 8, 238, 322, 110);
    return c;
  },
  천체(m) {
    const v = m.nights[0], { hm } = clock(m.offMs), c = frame('천체', '천체', dateText(m, v));
    const cols = [[PAD, 'l', '천체'], [122, 'r', '뜸'], [172, 'r', '남중'], [216, 'r', '고도'], [272, 'r', '짐'], [324, 'r', '등급']];
    cols.forEach(([x, align, name]) => c.text(name, x, 35, { size: 10.5, weight: 'b', color: T.ink3, align }));
    const rh = (354 - 52 - 6) / 8;
    v.table.forEach((b, i) => {
      const y = 52 + i * rh, ty = y + (rh - 12 * 1.2) / 2;
      c.line(PAD, y, 324, y);
      const cells = [b.ko, hm(b.rise), hm(b.transit), `${Math.round(b.transitAlt)}°`, hm(b.set), (b.mag < 0 ? '−' : '') + Math.abs(b.mag).toFixed(1)];
      cells.forEach((t, k) => c.text(t, cols[k][0], ty, k ? { align: 'r' } : { weight: 'h', color: T.body[b.id] }));
    });
    return c;
  },
  예보(m) {
    const c = frame('예보', '5일 예보', m.place.name);
    const cols = [[PAD, 'l', '밤'], [112, 'r', '점수'], [164, 'r', '구름'], [208, 'r', '시상'], [252, 'r', '달'], [324, 'r', '최적']];
    cols.forEach(([x, align, name]) => c.text(name, x, 35, { size: 10.5, weight: 'b', color: T.ink3, align }));
    const rh = (354 - 52 - 6) / 5;
    m.nights.forEach((v, i) => {
      const s = v.summary, y = 52 + i * rh, ty = y + (rh - 12 * 1.2) / 2;
      c.line(PAD, y, 324, y);
      c.text(`${v.day} ${v.wd}`, PAD, ty, { weight: 'h' });
      c.text(s ? Math.round(s.score) : '–', 100, y + (rh - 17 * 1.2) / 2, { size: 17, weight: 'h', align: 'r' });
      if (s) mark(c, s.grade, 108, y + rh / 2, 4);
      c.text(pct(s && s.cloudAvg), 164, ty, { align: 'r' });
      c.text(s && fin(s.seeingAvg) ? `${s.seeingAvg.toFixed(1)}″` : '–', 208, ty, { align: 'r' });
      c.text(`${Math.round(v.moon.frac * 100)}%`, 252, ty, { align: 'r' });
      c.text(s && s.window ? winShort(m, v) : '—', 324, ty, { align: 'r' });
    });
    return c;
  },
};

/** kind의 위젯을 그리기 명령으로. glass: 유리풍. 반환 {w, h, ops} */
function layout(kind, model, { glass = false } = {}) {
  let c;
  setTheme(glass);
  try {
    c = LAYOUTS[kind](model);
    if (glass) c.rect(0.5, 0.5, c.w - 1, c.h - 1, { stroke: RIM, r: CORNER });
  } finally { setTheme(false); }
  return { w: c.w, h: c.h, ops: c.ops };
}

/** 잠금 화면용 짧은 글귀 */
function lockText(m) {
  const v = m.nights[0], s = v.summary;
  if (!s) return { score: null, grade: null, title: '관측 –', lines: ['예보 자료 없음'], inline: '관측 –', moonDeg: v.moon.deg };
  const sc = Math.round(s.score), cloud = `구름 ${pct(s.cloudAvg)}`, best = s.window ? winShort(m, v) : '최적 시간 없음';
  return {
    score: sc, grade: s.grade, moonDeg: v.moon.deg,
    title: `관측 ${sc} · ${GRADE_KO[s.grade]}`,
    lines: [s.window ? `최적 ${best}` : best, s.cautions.length ? `${cloud} · ${s.cautions[0]} 주의` : cloud],
    inline: `관측 ${sc} · ${best} · ${cloud}`,
  };
}

/** 잠금 화면 원형 위젯(66pt). 단색으로 물들므로 흰색의 진하기만 쓴다. kind가 '달'이면 달 모양, 아니면 점수 고리 */
function lockCircle(kind, m) {
  const c = canvas(66, 66), L = lockText(m), WHITE = '#ffffff';
  if (kind === '달') {
    c.circle(33, 33, 21, { stroke: WHITE, sw: 2 });
    c.poly(moonShape(L.moonDeg, 33, 33, 21, 24, m.place.lat < 0), { fill: WHITE, close: true });
  } else {
    const R = 28, arc = (f0, f1) => {
      const k = Math.max(2, Math.round(48 * (f1 - f0)) + 1);
      return Array.from({ length: k }, (_, i) => {
        const t = (f0 + (f1 - f0) * i / (k - 1)) * 2 * Math.PI;
        return [33 + R * Math.sin(t), 33 - R * Math.cos(t)];
      });
    };
    c.poly(arc(0, 1), { stroke: WHITE, sw: 5, alpha: 0.3, close: true });
    if (L.score > 0) c.poly(arc(0, L.score / 100), { stroke: WHITE, sw: 5 });
    c.text(L.score == null ? '–' : L.score, 33, 17, { size: 20, weight: 'h', color: WHITE, align: 'c' });
    c.text('관측', 33, 40, { size: 9, weight: 'b', color: WHITE, align: 'c' });
  }
  return { w: c.w, h: c.h, ops: c.ops };
}

return { textWidth, fit, moonShape, dashes, blockValue, layout, lockText, lockCircle, SIZES, KINDS, DEFAULT_KIND };
})();
// ── js/places.js
__m["js/places.js"] = (() => {
// 관측지·즐겨찾기·테마 저장(localStorage)
const DEFAULT_PLACE = { name: '포항', region: '경상북도 · 대한민국', lat: 36.019, lon: 129.343, elev: 20 };

const get = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 저장 불가 환경 */ } };

const samePlace = (a, b) => Math.abs(a.lat - b.lat) < 0.005 && Math.abs(a.lon - b.lon) < 0.005;

const loadPlace = () => get('place', DEFAULT_PLACE);
const savePlace = p => set('place', p);
const loadFavorites = () => get('favorites', [DEFAULT_PLACE]);
const isFavorite = p => loadFavorites().some(f => samePlace(f, p));
function toggleFavorite(p) {
  const list = loadFavorites();
  const next = list.some(f => samePlace(f, p)) ? list.filter(f => !samePlace(f, p)) : [...list, p];
  set('favorites', next);
  return next;
}
const loadTheme = () => get('theme', 'dark');
const saveTheme = t => set('theme', t);

/**
 * 현재 위치 → {lat, lon}. 먼저 GPS로 새 위치를 재고(1분 넘은 것은 안 쓴다),
 * 실내·PC처럼 GPS가 안 잡히면 대강의 위치(10분 안의 것 포함)로 한 번 더 잰다.
 */
function locate(geo = globalThis.navigator?.geolocation) {
  const ask = opt => new Promise((res, rej) => geo.getCurrentPosition(p => res({ lat: p.coords.latitude, lon: p.coords.longitude }), rej, opt));
  if (!geo) return Promise.reject(new Error('위치 기능 없음'));
  return ask({ enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 })
    .catch(e => (e.code === 1 ? Promise.reject(e) : ask({ enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 })))
    .catch(e => Promise.reject(new Error(e.code === 1 ? '위치 권한이 꺼져 있습니다' : '위치를 찾지 못했습니다')));
}

/**
 * '36.02, 129.34' · '36.02N 129.34E' · 'E129.34 N36.02' → {lat, lon}. 좌표가 아니면 null.
 * 방위 글자가 없으면 위도, 경도 순서로 읽는다.
 */
function parseCoords(q) {
  const m = String(q).trim().toUpperCase().replace(/°/g, '')
    .match(/^([NSEW])?\s*([+-]?\d+(?:\.\d+)?)\s*([NSEW])?\s*[,\s]\s*([NSEW])?\s*([+-]?\d+(?:\.\d+)?)\s*([NSEW])?$/);
  if (!m) return null;
  if ((m[1] && m[3]) || (m[4] && m[6])) return null;
  const part = (letter, num) => ({ letter: letter || '', v: +num, signed: /^[+-]/.test(num) });
  let a = part(m[1] || m[3], m[2]), b = part(m[4] || m[6], m[5]);
  if (!a.letter !== !b.letter) return null;                     // 한쪽만 방위 글자
  if (a.letter) {
    if (a.signed || b.signed) return null;                      // 글자와 부호를 함께 쓰지 않는다
    const isLat = x => x.letter === 'N' || x.letter === 'S';
    if (isLat(a) === isLat(b)) return null;
    if (!isLat(a)) [a, b] = [b, a];
    if (a.letter === 'S') a.v = -a.v;
    if (b.letter === 'W') b.v = -b.v;
  }
  if (Math.abs(a.v) > 90 || Math.abs(b.v) > 180) return null;
  return { lat: a.v, lon: b.v };
}

const coordText =p => `${Math.abs(p.lat).toFixed(2)}°${p.lat >= 0 ? 'N' : 'S'} ${Math.abs(p.lon).toFixed(2)}°${p.lon >= 0 ? 'E' : 'W'}`;

return { toggleFavorite, locate, parseCoords, DEFAULT_PLACE, samePlace, loadPlace, savePlace, loadFavorites, isFavorite, loadTheme, saveTheme, coordText };
})();
// ── widget/param.js
__m["widget/param.js"] = (() => {
// 위젯 설정값(Parameter) 읽기: 「종류 | 좌표 | 이름 | 유리」를 아무 순서로, |·;·쉼표 어느 것으로 나눠도 된다.
// 예) 천체 | 36.17, 128.98 | 보현산   이름만 적고 좌표가 없으면 관측지는 포항 그대로다(위젯 머리에 포항이라고 나온다).
const { DEFAULT_PLACE, parseCoords } = __m["js/places.js"];
const { KINDS, DEFAULT_KIND } = __m["widget/layout.js"];

// 기상만 보여 주는 위젯은 크기마다 이름이 다르다 — 어느 이름을 적어도 그 크기의 것으로
const WEATHER = { small: '날씨', medium: '시간별', large: '기상' };
const ALIAS = { 띠: '시간별', 곡선: '고도', 밤하늘: '고도', 출몰: '천체', 행성: '지금', 시상: '대기', '5일밤': '5일' };

/**
 * text: 위젯 설정값(없으면 null), family: small|medium|large|extraLarge|accessory…
 * 반환 {kind, place, glass}. 종류가 없거나 그 크기에 맞지 않으면 그 크기의 기본 위젯. 「유리」가 있으면 glass.
 */
function parseParam(text, family) {
  const size = family === 'extraLarge' ? 'large' : family;
  let kind = null, coords = null, name = null, glass = false;
  const toks = String(text ?? '').split(/[|;,\n]/).map(t => t.trim()).filter(Boolean);
  for (let i = 0; i < toks.length; i++) {
    const tok = toks[i], bare = tok.replace(/\s/g, '');
    if (bare === '유리') { glass = true; continue; }
    let k = ALIAS[bare] || bare;
    if (Object.values(WEATHER).includes(k) && WEATHER[size]) k = WEATHER[size];
    const pair = i + 1 < toks.length ? parseCoords(tok + ', ' + toks[i + 1]) : null;   // 쉼표로 갈라진 위도, 경도
    if (KINDS[k]) kind = kind || k;
    else if (pair) { coords = coords || pair; i++; }
    else if (parseCoords(tok)) coords = coords || parseCoords(tok);
    else name = name || tok;
  }
  if (DEFAULT_KIND[size] && (!kind || KINDS[kind] !== size)) kind = DEFAULT_KIND[size];
  const place = coords ? { name: name || '관측지', lat: coords.lat, lon: coords.lon, elev: 0 } : { ...DEFAULT_PLACE };
  return { kind, place, glass };
}

return { parseParam };
})();
// ── widget/app.js
__m["widget/app.js"] = (() => {
// Scriptable에서 도는 부분: 자료 받기 · 그리기 명령을 DrawContext로 옮기기 · 위젯 내놓기.
// 계산과 배치는 data.js·layout.js에 있고 여기서는 Scriptable API만 다룬다.
/* global Astronomy, config, args, Script, Request, FileManager, ListWidget, DrawContext, Size, Rect, Point, Path, Color, Font */
const { makeSky } = __m["js/sky.js"];
const { forecastUrl, airUrl, normalize } = __m["js/api.js"];
const { widgetModel } = __m["widget/data.js"];
const { layout, lockText, lockCircle } = __m["widget/layout.js"];
const { parseParam } = __m["widget/param.js"];

const SITE = 'https://chan7881.github.io/astronomy/';
const TTL = 30 * 60e3;

/** 예보를 받는다. 30분 안에 받은 것이 있으면 그것을, 못 받으면 예전 것이라도 쓴다. 아무것도 없으면 null */
async function loadData(place) {
  const fm = FileManager.local();
  const path = fm.joinPath(fm.cacheDirectory(), `astro-${place.lat.toFixed(3)}_${place.lon.toFixed(3)}.json`);
  let old = null;
  try { if (fm.fileExists(path)) old = JSON.parse(fm.readString(path)); } catch (e) { old = null; }
  if (old && Date.now() - old.at < TTL) return normalize(old.fc, old.air);
  try {
    const fc = await new Request(forecastUrl(place.lat, place.lon)).loadJSON();
    if (!fc || !fc.hourly) throw new Error('예보 응답이 비었다');
    let air = null;
    try { air = await new Request(airUrl(place.lat, place.lon)).loadJSON(); if (!air || !air.hourly) air = null; } catch (e) { air = null; }
    try { fm.writeString(path, JSON.stringify({ at: Date.now(), fc, air })); } catch (e) { /* 캐시는 없어도 된다 */ }
    return normalize(fc, air);
  } catch (e) {
    return old ? normalize(old.fc, old.air) : null;
  }
}

// '#rrggbb' 또는 '#rrggbbaa'
const col = (hex, a = 1) => (hex.length === 9 ? new Color(hex.slice(0, 7), a * parseInt(hex.slice(7), 16) / 255) : new Color(hex, a));

const FONT = { m: s => Font.mediumSystemFont(s), b: s => Font.boldSystemFont(s), h: s => Font.heavySystemFont(s) };

function trace(o) {
  const p = new Path();
  if (o.op === 'rect') {
    const r = Math.min(o.r, o.w / 2, o.h / 2), box = new Rect(o.x, o.y, o.w, o.h);
    if (r > 0) p.addRoundedRect(box, r, r); else p.addRect(box);
  } else if (o.op === 'circle') p.addEllipse(new Rect(o.cx - o.r, o.cy - o.r, o.r * 2, o.r * 2));
  else if (o.op === 'line') { p.move(new Point(o.x1, o.y1)); p.addLine(new Point(o.x2, o.y2)); }
  else {
    p.move(new Point(o.pts[0][0], o.pts[0][1]));
    for (let i = 1; i < o.pts.length; i++) p.addLine(new Point(o.pts[i][0], o.pts[i][1]));
    if (o.close) p.closeSubpath();
  }
  return p;
}

/** 그리기 명령 → Image */
function paint({ w, h, ops }, opaque) {
  const d = new DrawContext();
  d.size = new Size(w, h); d.opaque = opaque; d.respectScreenScale = true;
  for (const o of ops) {
    if (o.op === 'text') {
      const BIG = 400, x = o.align === 'l' ? o.x : o.align === 'c' ? o.x - BIG / 2 : o.x - BIG;
      d.setFont(FONT[o.weight](o.size)); d.setTextColor(col(o.color));
      if (o.align === 'l') d.setTextAlignedLeft(); else if (o.align === 'c') d.setTextAlignedCenter(); else d.setTextAlignedRight();
      d.drawTextInRect(o.text, new Rect(x, o.y, BIG, o.size * 1.4));
      continue;
    }
    if (o.op === 'rect' && !(o.w > 0 && o.h > 0)) continue;
    const a = o.alpha == null ? 1 : o.alpha;
    if (o.op === 'line') { d.addPath(trace(o)); d.setStrokeColor(col(o.color)); d.setLineWidth(o.sw); d.strokePath(); continue; }
    if (o.fill) { d.addPath(trace(o)); d.setFillColor(col(o.fill, a)); d.fillPath(); }
    if (o.stroke) { d.addPath(trace(o)); d.setStrokeColor(col(o.stroke, a)); d.setLineWidth(o.sw == null ? 1 : o.sw); d.strokePath(); }
  }
  return d.getImage();
}

function lockWidget(family, kind, model) {
  const w = new ListWidget(), L = lockText(model);
  if (family === 'accessoryInline') { w.addText(L.inline); return w; }
  w.addAccessoryWidgetBackground = true;
  if (family === 'accessoryCircular') {
    w.setPadding(0, 0, 0, 0);
    w.addImage(paint(lockCircle(kind, model), false)).centerAlignImage();
    return w;
  }
  const t = w.addText(L.title); t.font = Font.boldSystemFont(13); t.lineLimit = 1;
  for (const s of L.lines) { const x = w.addText(s); x.font = Font.systemFont(12); x.lineLimit = 1; }
  return w;
}

async function run() {
  const family = config.widgetFamily || 'large';
  const { kind, place, glass } = parseParam(args.widgetParameter, family);
  const data = await loadData(place);
  const model = widgetModel(makeSky(Astronomy), place, data, Date.now());
  let w;
  if (family.startsWith('accessory')) w = lockWidget(family, kind, model);
  else {
    w = new ListWidget();
    w.setPadding(0, 0, 0, 0);
    w.backgroundImage = paint(layout(kind, model, { glass }), true);
  }
  w.url = SITE;
  w.refreshAfterDate = new Date(Date.now() + TTL);
  if (config.runsInWidget) Script.setWidget(w);
  else if (family === 'small') await w.presentSmall();
  else if (family === 'medium') await w.presentMedium();
  else await w.presentLarge();
  Script.complete();
}

return { run };
})();
await __m["widget/app.js"].run();
