// ==UserScript==
// @name         Timus Charts
// @namespace    timus_charts
// @description  Adds charts to Timus Online Judge profiles
// @copyright    Alexander Borzunov, 2012-2013, 2015-2016
// @version      1.6
// @icon         http://acm.timus.ru/favicon.ico
// @downloadURL  https://openuserjs.org/install/hx0/Timus_Charts.user.js
// @updateURL    https://openuserjs.org/install/hx0/Timus_Charts.user.js
// @match        http://acm.timus.ru/author.aspx*
// @match        http://acm-judge.urfu.ru/author.aspx*
// @match        http://timus.online/author.aspx*
// @match        https://acm.timus.ru/author.aspx*
// @match        https://acm-judge.urfu.ru/author.aspx*
// @match        https://timus.online/author.aspx*
// @grant        GM_getValue
// @grant        GM_setValue
// @require      http://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.2/jquery.min.js
// @require      http://cdnjs.cloudflare.com/ajax/libs/jqPlot/1.0.8/jquery.jqplot.min.js
// @require      http://cdnjs.cloudflare.com/ajax/libs/jqPlot/1.0.8/plugins/jqplot.dateAxisRenderer.min.js
// ==/UserScript==

var SCRIPT_VERSION = '1.6';
var CACHE_VERSION = 2;
