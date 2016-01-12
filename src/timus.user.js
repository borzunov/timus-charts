// ==UserScript==
// @name         Timus Charts
// @namespace    timus_charts
// @description  Adds charts to Timus Online Judge's profiles
// @copyright    Alexander Borzunov, 2012-2013, 2015-2016
// @version      1.2
// @icon         http://acm.timus.ru/favicon.ico
// @downloadURL  https://openuserjs.org/install/hx0/Timus_Charts.user.js
// @updateURL    https://openuserjs.org/install/hx0/Timus_Charts.user.js
// @include      http://acm.timus.ru/author.aspx*
// @match        http://acm.timus.ru/author.aspx*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @require      http://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.2/jquery.min.js
// @require      http://cdnjs.cloudflare.com/ajax/libs/jqPlot/1.0.8/jquery.jqplot.min.js
// @require      http://cdnjs.cloudflare.com/ajax/libs/jqPlot/1.0.8/plugins/jqplot.dateAxisRenderer.min.js
// @require      http://cdnjs.cloudflare.com/ajax/libs/spin.js/2.0.1/spin.min.js
// ==/UserScript==

/* jshint multistr: true, -W083 */

(function () {
    /* Engine-dependent functions */

    var isGreasemonkey = (
        typeof GM_getValue !== "undefined" &&
        typeof GM_setValue !== "undefined" &&
        typeof GM_xmlhttpRequest !== "undefined"
    );
    var isChrome = (typeof chrome !== "undefined");

    function getValue(key) {
        var value;
        if (isGreasemonkey)
            value = GM_getValue(key);
        else
            value = localStorage[key];

        if (value === undefined)
            throw new Error("Storage doesn't contain this key");
        return value;
    }

    function setValue(key, value) {
        try {
            if (isGreasemonkey)
                GM_setValue(key, value);
            else
                localStorage[key] = value;
        } catch (err) {}
    }


    /* Styles */


    // jquery.jqplot.min.css
    var style = document.createElement('style');
    style.textContent = '.jqplot-target{position:relative;color:#666;font-family:"Trebuchet MS",Arial,Helvetica,sans-serif;font-size:1em;}.jqplot-axis{font-size:.75em;}.jqplot-xaxis{margin-top:10px;}.jqplot-x2axis{margin-bottom:10px;}.jqplot-yaxis{margin-right:10px;}.jqplot-y2axis,.jqplot-y3axis,.jqplot-y4axis,.jqplot-y5axis,.jqplot-y6axis,.jqplot-y7axis,.jqplot-y8axis,.jqplot-y9axis,.jqplot-yMidAxis{margin-left:10px;margin-right:10px;}.jqplot-axis-tick,.jqplot-xaxis-tick,.jqplot-yaxis-tick,.jqplot-x2axis-tick,.jqplot-y2axis-tick,.jqplot-y3axis-tick,.jqplot-y4axis-tick,.jqplot-y5axis-tick,.jqplot-y6axis-tick,.jqplot-y7axis-tick,.jqplot-y8axis-tick,.jqplot-y9axis-tick,.jqplot-yMidAxis-tick{position:absolute;white-space:pre;}.jqplot-xaxis-tick{top:0;left:15px;vertical-align:top;}.jqplot-x2axis-tick{bottom:0;left:15px;vertical-align:bottom;}.jqplot-yaxis-tick{right:0;top:15px;text-align:right;}.jqplot-yaxis-tick.jqplot-breakTick{right:-20px;margin-right:0;padding:1px 5px 1px 5px;z-index:2;font-size:1.5em;}.jqplot-y2axis-tick,.jqplot-y3axis-tick,.jqplot-y4axis-tick,.jqplot-y5axis-tick,.jqplot-y6axis-tick,.jqplot-y7axis-tick,.jqplot-y8axis-tick,.jqplot-y9axis-tick{left:0;top:15px;text-align:left;}.jqplot-yMidAxis-tick{text-align:center;white-space:nowrap;}.jqplot-xaxis-label{margin-top:10px;font-size:11pt;position:absolute;}.jqplot-x2axis-label{margin-bottom:10px;font-size:11pt;position:absolute;}.jqplot-yaxis-label{margin-right:10px;font-size:11pt;position:absolute;}.jqplot-yMidAxis-label{font-size:11pt;position:absolute;}.jqplot-y2axis-label,.jqplot-y3axis-label,.jqplot-y4axis-label,.jqplot-y5axis-label,.jqplot-y6axis-label,.jqplot-y7axis-label,.jqplot-y8axis-label,.jqplot-y9axis-label{font-size:11pt;margin-left:10px;position:absolute;}.jqplot-meterGauge-tick{font-size:.75em;color:#999;}.jqplot-meterGauge-label{font-size:1em;color:#999;}table.jqplot-table-legend{margin-top:12px;margin-bottom:12px;margin-left:12px;margin-right:12px;}table.jqplot-table-legend,table.jqplot-cursor-legend{background-color:rgba(255,255,255,0.6);border:1px solid #ccc;position:absolute;font-size:.75em;}td.jqplot-table-legend{vertical-align:middle;}td.jqplot-seriesToggle:hover,td.jqplot-seriesToggle:active{cursor:pointer;}.jqplot-table-legend .jqplot-series-hidden{text-decoration:line-through;}div.jqplot-table-legend-swatch-outline{border:1px solid #ccc;padding:1px;}div.jqplot-table-legend-swatch{width:0;height:0;border-top-width:5px;border-bottom-width:5px;border-left-width:6px;border-right-width:6px;border-top-style:solid;border-bottom-style:solid;border-left-style:solid;border-right-style:solid;}.jqplot-title{top:0;left:0;padding-bottom:.5em;font-size:1.2em;}table.jqplot-cursor-tooltip{border:1px solid #ccc;font-size:.75em;}.jqplot-cursor-tooltip{border:1px solid #ccc;font-size:.75em;white-space:nowrap;background:rgba(208,208,208,0.5);padding:1px;}.jqplot-highlighter-tooltip,.jqplot-canvasOverlay-tooltip{border:1px solid #ccc;font-size:.75em;white-space:nowrap;background:rgba(208,208,208,0.5);padding:1px;}.jqplot-point-label{font-size:.75em;z-index:2;}td.jqplot-cursor-legend-swatch{vertical-align:middle;text-align:center;}div.jqplot-cursor-legend-swatch{width:1.2em;height:.7em;}.jqplot-error{text-align:center;}.jqplot-error-message{position:relative;top:46%;display:inline-block;}div.jqplot-bubble-label{font-size:.8em;padding-left:2px;padding-right:2px;color:rgb(20%,20%,20%);}div.jqplot-bubble-label.jqplot-bubble-label-highlight{background:rgba(90%,90%,90%,0.7);}div.jqplot-noData-container{text-align:center;background-color:rgba(96%,96%,96%,0.3);}';
    document.body.appendChild(style);

    var STYLE_CONTENT = '#chart {\
    width: 100%;\
}\
.chart_box {\
    height: 255px;\
}\
\
.chart_comment {\
    color: #555;\
    font-size: 15;\
}\
\
#chart_loading_error_judge_id {\
    margin-top: 5px;\
}\
\
.chart_judge_id_input {\
    height: 20px;\
    width: 80px;\
}\
\
.chart_legend_box {\
    font-size: 15;\
    margin: -5px 7px 10px 25px;\
    min-height: 20px;\
    overflow: auto;\
}\
\
.chart_users_table {\
    border-spacing: 0;\
    font-size: 15;\
}\
\
.chart_users_table td {\
    padding: 0 3px;\
}\
\
.chart_users_table td:first-child {\
    padding-left: 2px;\
}\
\
.chart_users_table td:last-child {\
    padding-right: 2px;\
}\
\
.chart_legend_open {\
    float: right;\
}\
\
.chart_spin {\
    position: relative;\
    top: 130px;\
}\
\
#chart_query_error {\
    clear: right;\
    position: relative;\
    top: 40%;\
}\
\
.chart_new_user {\
    margin-top: 5px;\
}\
\
.chart_user_add {\
    margin-left: 8px;\
}\
\
.chart_user_color {\
    border: 1px solid black;\
    float: left;\
    height: 11px;\
    width: 11px;\
}\
\
#chart_new_user_color {\
    border-style: dashed;\
    cursor: pointer;\
    margin: 2px;\
    margin-right: 7px;\
}\
\
.chart_user_judge_id {\
    color: #707070;\
}\
\
.chart_user_problems_count {\
    color: #707070;\
    text-align: right;\
}\
\
.chart_legend {\
    border: 1px solid #1a5cc8;\
    float: right;\
    margin-bottom: 10px;\
    padding: 5px;\
    text-align: left;\
}\
\
.chart_toggle {\
    display: inline-block;\
    margin-top: 15px;\
}\
\
.chart_user_remove {\
    float: right;\
}\
\
.chart_version {\
    float: right;\
}';

    function applyStyle() {
        var style = document.createElement('style');
        style.textContent = STYLE_CONTENT;
        document.head.appendChild(style);
    }

    applyStyle();


    /* Chart in profile */


    var LOCALES = {
        "en": {
            add: "Add",
            addUsers: "Add users",
            del: "Delete",
            hideChart: "Hide chart",
            judgeIDDoesntExists: "This user doesn't exists!",
            judgeIDNotEnoughOfAccepted: "The user must have at least two solved problems!",
            judgeIDIncorrectFormat: "Incorrect Judge ID format (there's no digits)!",
            judgeIDIsAlreadyAdded: "This Judge ID has already been added!",
            judgeIDLabel: "Judge ID or link:",
            queryFailed: "An error occured on the request to the server.",
            refreshPage: "Try to refresh the page.",
            showChart: "Show chart",
            version: "version",
            wrongJudgeID: "There's no submits on this Judge ID",
        },
        "ru": {
            add: "Добавить",
            addUsers: "Добавить пользователей",
            del: "Удалить",
            hideChart: "Скрыть график",
            judgeIDDoesntExists: "Такого пользователя не существует!",
            judgeIDNotEnoughOfAccepted: "Пользователь должен иметь не менее двух решённых задач!",
            judgeIDIncorrectFormat: "Некорректный формат Judge ID (нет цифр)!",
            judgeIDIsAlreadyAdded: "Этот Judge ID уже присутствует на графике!",
            judgeIDLabel: "Judge ID или ссылка:",
            queryFailed: "Произошла ошибка при запросе к серверу. ",
            refreshPage: "Попробуйте обновить страницу.",
            showChart: "Показать график",
            version: "версия",
            wrongJudgeID: "Не найдено посылок по этому Judge ID",
        },
    };

    function isRussianLocale() {
        return /Задачи/.test($('body').html());
    }

    var locale = LOCALES[isRussianLocale() ? "ru" : "en"];


    function Submit() {}

    // This dictionary duplicates some "problem*_*" records of local storage
    // because it can be full or inaccessible
    Submit.problemsFromContests = {};

    Submit.prototype.getProblemID = function() {
        return this.space + ',' + this.problemNo;
    };

    Submit.prototype.getCacheKey = function () {
        return 'problem' + this.space + '_' + this.problemNo;
    };

    Submit.prototype.isConsidered = function () {
        if (this.verdict !== 'Accepted')
            return false;
        if (this.space == 1)
            return true;

        // Check whether the online-contest problem is
        // copied to the main archive
        var problemID = this.getProblemID();
        var archiveNo;
        if (problemID in Submit.problemsFromContests) {
            archiveNo = Submit.problemsFromContests[problemID];
        } else {
            try {
                archiveNo = getValue(this.getCacheKey());
                Submit.problemsFromContests[problemID] = archiveNo;
            } catch (err) {}
        }
        if (archiveNo !== undefined) {
            if (archiveNo == "null")
                return false;
            this.space = 1;
            this.problemNo = archiveNo;
            return true;
        }
        return null;
    };

    Submit.prototype.queryWhetherConsidered = function (
            resultCallback, failCallback) {
        var address = 'http://acm.timus.ru/problem.aspx?space=' +
                this.space + '&num=' + this.problemNo;
        var submit = this;
        $.get(address, function (data) {
            var problemID = submit.getProblemID();
            var cacheKey = submit.getCacheKey();
            var match = /<A HREF="problem\.aspx\?space=1(&amp;|&)num=(\d{4})"><nobr>\d{4}. .*?<\/nobr><\/A>/i.exec(data);
            if (match !== null) {
                var archiveNo = match[2];
                Submit.problemsFromContests[problemID] = archiveNo;
                setValue(cacheKey, archiveNo);

                submit.space = 1;
                submit.problemNo = archiveNo;
                resultCallback(true);
            } else {
                Submit.problemsFromContests[problemID] = "null";
                setValue(cacheKey, "null");

                resultCallback(false);
            }
        }).fail(failCallback);
    };


    function Author(judgeID) {
        this.judgeID = judgeID;
        this.acceptedProblems = {};
        this.acceptedProblemsCount = 0;
        this.submitsQuery = '?author=' + judgeID + '&status=accepted';
        this.lastSubmitID = null;
        this.noMorePages = false;
        this.hasDeletedProblems = false;
    }

    Author.prototype.getCacheKeyPrefix = function() {
        return 'author' + this.judgeID;
    };

    Author.prototype.saveToCache = function () {
        var keyPrefix = this.getCacheKeyPrefix();
        setValue(keyPrefix + '_acceptedProblems',
                JSON.stringify(this.acceptedProblems));
        setValue(keyPrefix + '_acceptedProblemsCount',
                this.acceptedProblemsCount);
        setValue(keyPrefix + '_lastKnownSubmitID',
                this.lastSubmitID);
    };

    Author.prototype.loadFromCache = function () {
        var keyPrefix = this.getCacheKeyPrefix();
        try {
            this.acceptedProblems = JSON.parse(getValue(
                    keyPrefix + '_acceptedProblems'));
            this.cachedAcceptedProblemsCount = parseInt(getValue(
                    keyPrefix + '_acceptedProblemsCount'));
            this.cachedLastSubmitID = parseInt(getValue(
                    keyPrefix + '_lastKnownSubmitID'));
            this.cacheAvailable = true;
        } catch (err) {
            this.cacheAvailable = false;
        }
    };

    Author.prototype.retrieve = function (
            expectedAcceptedProblemsCount, resultCallback, failCallback) {
        this.loadFromCache();
        if (this.cacheAvailable && this.cachedAcceptedProblemsCount ==
                expectedAcceptedProblemsCount) {
            this.acceptedProblemsCount = this.cachedAcceptedProblemsCount;
            this.lastSubmitID = this.cachedLastSubmitID;

            if (resultCallback !== undefined)
                resultCallback();
            return;
        }

        this.retrieveCallback = resultCallback;
        this.failCallback = failCallback;
        this.parseSubmitsPage(null);
    };

    Author._getPublicSubmitsPage_Chrome = function (
            url, resultCallback, failCallback) {
        chrome.runtime.sendMessage({action: 'stash_cookies'}, function () {
            $.get(url).then(resultCallback, failCallback);
            chrome.runtime.sendMessage({action: 'expose_cookies'});
        });
    };

    Author._getPublicSubmitsPage_Greasemonkey = function (
            query, resultCallback, failCallback) {
        GM_xmlhttpRequest({
            method: "GET",
            url: 'http://acm.timus.ru./textstatus.aspx' + query,
            headers: {
                'Host': 'acm.timus.ru',
            },
            onload: function (response) {
                resultCallback(response.responseText);
            },
            onabort: function (response) {
                failCallback();
            },
            onerror: function (response) {
                failCallback();
            },
        });
    };

    Author.prototype.getSubmitsPage = function (
            query, resultCallback, failCallback) {
        var author = this;
        var url = 'http://acm.timus.ru/textstatus.aspx' + query;
        if (!this.hasDeletedProblems) {
            $.get(url, function (data) {
                var expr = /<HTML>/i;
                if (expr.test(data)) {
                    author.hasDeletedProblems = true;
                    author.getSubmitsPage(query, resultCallback, failCallback);
                    return;
                }
                resultCallback(data);
            }).fail(failCallback);
            return;
        }
        // Timus API throws an exception if the author have submits on
        // deleted problems (e.g. in private contests).

        if (isChrome)
            Author._getPublicSubmitsPage_Chrome(
                    url, resultCallback, failCallback);
        else
        if (isGreasemonkey)
            Author._getPublicSubmitsPage_Greasemonkey(
                    query, resultCallback, failCallback);
        else
            // If there's no appropriate workaround,
            // just skip additional problem spaces
            $.get(url + '&space=1').then(resultCallback, failCallback);
    };

    Author.prototype.parseSubmitsPage = function (fromSubmitID) {
        var submitsQueried = (this.cacheAvailable ? 200 : 1000);
        var query = this.submitsQuery + '&count=' + submitsQueried;
        if (fromSubmitID !== null)
            query += '&from=' + fromSubmitID;
        var author = this;
        this.getSubmitsPage(query, function (data) {
            var lines = data.split('\n')
                            .filter(function (line) {
                                return line !== '';
                            });
            if (!lines.length || !lines[0].startsWith('submit')) {
                author.failCallback();
                return;
            }

            lines = lines.slice(1);
            if (lines.length < submitsQueried)
                author.noMorePages = true;
            try {
                author.submits = lines.map(function (line) {
                    var fields = line.split('\t');
                    var submit = new Submit();

                    submit.id        = parseInt(fields[0]);
                    submit.space     = parseInt(fields[3]);
                    submit.problemNo = parseInt(fields[4]);
                    var elems = fields[1]
                            .replace(/-/g, ' ').replace(/:/g, ' ').split(' ');
                    submit.time      = new Date(
                            elems[0], elems[1] - 1, elems[2],
                            elems[3], elems[4], elems[5]).getTime();
                    submit.verdict   = fields[6];
                    if (
                        isNaN(submit.id) || isNaN(submit.space) ||
                        isNaN(submit.problemNo) || isNaN(submit.time)
                    )
                        throw new Error(
                                "Failed to parse information about submit");
                    return submit;
                });
            } catch (err) {
                author.failCallback();
                return;
            }
            author.processSubmitsFrom(0);
        }, this.failCallback);
    };

    var MSEC_PER_SEC = 1e3;

    Author.prototype.considerSubmit = function (submit) {
        if (!(submit.problemNo in this.acceptedProblems)) {
            this.acceptedProblems[submit.problemNo] = Math.floor(
                    submit.time / MSEC_PER_SEC);
            this.acceptedProblemsCount++;
        }
    };

    Author.prototype.processSubmitsFrom = function (index) {
        while (index < this.submits.length) {
            var submit = this.submits[index];
            if (this.lastSubmitID === null)
                this.lastSubmitID = submit.id;
            if (this.cacheAvailable && submit.id <= this.cachedLastSubmitID) {
                this.acceptedProblemsCount += this.cachedAcceptedProblemsCount;
                this.noMorePages = true;
                break;
            }

            var isConsidered = submit.isConsidered();
            if (isConsidered === true)
                this.considerSubmit(submit);
            else
            if (isConsidered === null) {
                var author = this;
                submit.queryWhetherConsidered(function (result) {
                    if (result)
                        author.considerSubmit(submit);
                    author.processSubmitsFrom(index + 1);
                }, this.failCallback);
                return;
            }
            index++;
        }

        if (this.noMorePages) {
            this.saveToCache();

            if (this.retrieveCallback !== undefined)
                this.retrieveCallback();
        } else
            this.parseSubmitsPage(
                    this.submits[this.submits.length - 1].id - 1);
    };


    function Line(author, name, color) {
        this.author = author;
        this.rowID = 'chart_user_' + author.judgeID;
        this.name = name;
        this.color = color;
    }

    Line.prototype.make = function () {
        var dates = [];
        for (var key in this.author.acceptedProblems) {
            var value = this.author.acceptedProblems[key] * MSEC_PER_SEC;
            if (value !== true)
                dates.push(value);
        }
        dates.sort(function (a, b) {
            return a - b;
        });
        this.points = [];
        for (var i = 0; i < dates.length; i++)
            this.points.push([new Date(dates[i]), i + 1]);
    };


    function substTemplateVariables(template, variables) {
        for (var name in variables)
            template = template.replace(
                    new RegExp('\{% ' + name + ' %\}', 'g'), variables[name]);
        return template;
    }

    var COLOR_GREEN = '#4f4';
    var COLOR_RED = '#f99';
    var COLOR_BLUE = '#88f';

    var TEMPLATE_TOGGLE_LINK = '<br /><a href="#" class="chart_toggle">{% label %}</a>';

    var TEMPLATE_USER_BEGIN = '<tr id="{% row_id %}">\
    <td><div class="chart_user_color" style="background: {% color %};"></div></td>\
    <td class="chart_user_judge_id">{% judge_id %}</td>\
    <td>{% name %}</td>';
    var TEMPLATE_USER_SEVERAL_LINES = '<td class="chart_user_problems_count">{% problems_count %}</td>\
<td><a href="#" class="chart_user_remove">' + locale.del + '</a></td>';
    var TEMPLATE_USER_END = '</tr>';

    var TEMPLATE_CHART = '<div id="chart_place" style="display: none;">\
    <div id="chart_loading" class="chart_box">\
        <div class="chart_comment chart_version">\
            Timus Charts, ' + locale.version + ' 1.1\
        </div>\
        <div class="chart_spin"></div>\
        <div id="chart_query_error" style="display: none;">\
            <div class="chart_comment">\
                ' + locale.queryFailed + '<br />\
                ' + locale.refreshPage + '\
            </div>\
        </div>\
    </div>\
    <div id="chart" class="chart_box" style="display: none;"></div>\
    <div class="chart_legend_box" style="display: none;">\
        <a href="#" class="chart_legend_open">\
            ' + locale.addUsers + '\
        </a>\
        <div class="chart_legend" style="display: none;">\
            <table class="chart_users_table"></table>\
            <div class="chart_new_user">\
                <div id="chart_new_user_color" class="chart_user_color" style="background: ' + COLOR_BLUE + ';"></div>\
                ' + locale.judgeIDLabel + ' <input type="text" class="chart_judge_id_input" />\
                <a href="#" class="chart_user_add">' + locale.add + '</a>\
                <div id="chart_loading_error_judge_id" class="chart_comment" style="display: none;"></div>\
            </div>\
        </div>\
    </div>\
</div>';

    function Chart() {
        this.ready = false;
        this.visible = false;

        this.lines = [];
        this.linesExpected = 0;

        this.animateComplete = false;
        this.loadingState = false;
        this.hasCriticalError = false;
    }

    Chart.prototype.loading = function (state) {
        if (state === false) {
            this.spinner.stop();
            $('#chart_loading').hide();
            $('#chart').show();
            this.loadingState = false;
            return;
        }
        if (state === true) {
            this.loadingState = true;
            $('#chart').hide();
            $('#chart_loading').show();
            this.spinner.spin($('.chart_spin')[0]);
            return;
        }
        return this.loadingState;
    };

    Chart.prototype.showQueryError = function () {
        this.loading(false);
        $('.chart_legend_open').hide();
        $('.chart_legend').hide();
        $('#chart').hide();
        $('#chart_loading').show();
        $('#chart_query_error').show();
    };

    Chart.prototype.sortLines = function () {
        this.lines.sort(function (a, b) {
            return b.author.acceptedProblemsCount -
                    a.author.acceptedProblemsCount;
        });
    };

    Chart.prototype.makeRemoveUserHandler = function (judgeID) {
        var chart = this;
        return function (event) {
            chart.removeUser(judgeID);
            event.preventDefault();
        };
    };

    Chart.prototype.redrawLegend = function () {
        var severalLines = this.lines.length > 1;
        var code = '';
        var i, curLine;
        for (i = 0; i < this.lines.length; i++) {
            curLine = this.lines[i];
            code += substTemplateVariables(TEMPLATE_USER_BEGIN, {
                row_id: curLine.rowID,
                color: curLine.color,
                judge_id: curLine.author.judgeID,
                name: curLine.name,
            });
            if (severalLines)
                code += substTemplateVariables(TEMPLATE_USER_SEVERAL_LINES, {
                    problems_count: curLine.author.acceptedProblemsCount,
                });
            code += TEMPLATE_USER_END;
        }
        $('.chart_users_table').html(code);
        if (severalLines) {
            for (i = 0; i < this.lines.length; i++) {
                curLine = this.lines[i];
                $('#' + curLine.rowID + ' .chart_user_remove').click(
                    this.makeRemoveUserHandler(curLine.author.judgeID)
                );
            }
        }
    };

    var CHART_YAXIS_SMALLEST_MAX = 10;
    var CHART_XAXIS_CRITICAL_DIFF = 1000 * 60 * 60 * 24 * 3;

    Chart.prototype.fixPlot = function (plot) {
        var needReplot = false;
        // Fix non-integer ticks on X axis when maximal value is small
        if (plot.axes.yaxis.max < CHART_YAXIS_SMALLEST_MAX) {
            plot.axes.yaxis.reset();
            plot.axes.yaxis.max = CHART_YAXIS_SMALLEST_MAX;
            needReplot = true;
        }
        // Fix inadequate behavior of ticks when Y axis dates range is small
        if (plot.axes.xaxis.max - plot.axes.xaxis.min <=
                CHART_XAXIS_CRITICAL_DIFF) {
            plot.axes.xaxis.numberTicks = 5;
            plot.axes.xaxis.tickOptions.formatString += ', %H:%M';
            needReplot = true;
        }
        if (needReplot)
            plot.replot();
    };

    Chart.prototype.redraw = function () {
        this.sortLines();
        this.redrawLegend();

        var points = [];
        var colors = [];
        for (var i = 0; i < this.lines.length; i++) {
            var curLine = this.lines[i];
            points.push(curLine.points);
            colors.push(curLine.color);
        }
        points.reverse();
        colors.reverse();

        $('.chart_legend_box').show();
        $('#chart').html('');
        this.loading(false);
        var plot = $.jqplot('chart', points, {
            gridPadding: {
                bottom: 50,
            },
            grid: {
                shadow: false,
            },
            axes: {
                xaxis: {
                    renderer: $.jqplot.DateAxisRenderer,
                    tickOptions: {formatString: '%#d %b %Y'},
                },
                yaxis: {
                    min: 0,
                    tickOptions: {formatString: '%d'},
                },
            },
            seriesDefaults: {
                shadow: false,
                showMarker: false,
                lineWidth: 2,
            },
            seriesColors: colors,
        });
        this.fixPlot(plot);
    };

    function zfill(str, width) {
        while (str.length < width)
            str = '0' + str;
        return str;
    }

    function randomColor() {
        return '#' + zfill(Math.floor(Math.random() * 0x1000).toString(16), 3);
    }

    Chart.prototype.showJudgeIDError = function (message) {
        this.loading(false);
        $('#chart_loading_error_judge_id').html(message).slideDown(50);
    };

    Chart.prototype.addUser = function (judgeID, name, color,
            expectedAcceptedProblemsCount, isCritical, callback) {
        this.linesExpected++;
        var chart = this;
        var author = new Author(judgeID);
        author.retrieve(expectedAcceptedProblemsCount, function() {
            var line = new Line(author, name, color);
            line.make();
            if (line.points.length < 2) {
                if (isCritical) {
                    chart.hasCriticalError = true;
                    chart.showQueryError();
                } else
                    chart.showJudgeIDError(locale.judgeIDNotEnoughOfAccepted);
                chart.linesExpected--;
                return;
            }

            chart.lines.push(line);
            if (chart.lines.length === chart.linesExpected) {
                if (chart.animateComplete)
                    chart.redraw();
                if (callback !== undefined)
                    callback();
            }
        }, function () {
            if (isCritical) {
                chart.hasCriticalError = true;
                chart.showQueryError();
            } else
                chart.showJudgeIDError(locale.queryFailed);
            chart.linesExpected--;
        });
    };

    Chart.prototype.removeUser = function (judgeID) {
        for (var i = 0; i < this.lines.length; i++)
            if (this.lines[i].author.judgeID === judgeID) {
                this.lines.splice(i, 1);
                this.linesExpected--;
                this.redraw();
                break;
            }
    };

    Chart.prototype.loadJudgeID = function () {
        if (this.loading())
            return;
        this.loading(true);
        $('#chart_loading_error_judge_id').hide();

        var judgeID = $('.chart_judge_id_input').val();
        var match = /(\d+)[^\d]*$/.exec(judgeID);
        if (match === null) {
            this.showJudgeIDError(locale.judgeIDIncorrectFormat);
            return;
        }
        judgeID = match[1];

        for (var i = 0; i < this.lines.length; i++)
            if (this.lines[i].author.judgeID === judgeID) {
                this.showJudgeIDError(locale.judgeIDIsAlreadyAdded);
                return;
            }

        var address = 'http://acm.timus.ru/author.aspx?id=' + judgeID;
        var chart = this;
        $.get(address, function (data) {
            var match = /<H2 CLASS="author_name">(<A HREF=".*?" TARGET="_blank">)?(.+?)(<\/A>)?<\/H2>/i.exec(data);
            if (match === null) {
                chart.showJudgeIDError(locale.judgeIDDoesntExists);
                return;
            }
            var name = match[2];

            var color = $('#chart_new_user_color').css('background-color');
            chart.addUser(judgeID, name, color, null, false, function () {
                $('.chart_judge_id_input').val('');
                $('#chart_new_user_color')
                        .css('background-color', randomColor());
            });
        }).fail(function () {
            chart.showJudgeIDError(locale.queryFailed);
        });
    };

    Chart.prototype.showLegend = function () {
        $('.chart_legend_open').hide();
        $('.chart_legend').slideDown(150);
        $('.chart_judge_id_input').focus();
    };

    Chart.prototype.areEnoughDataPresent = function () {
        this.matchId = /id=(\d+)/i.exec(location.href);
        this.matchCompareto = /compareto=(\d+)/i.exec(location.href);

        // Handle empty accounts
        if (this.matchCompareto !== null) {
            var bothCount = $('td.both').length - 1;
            this.greenCount = $('td.accepted').length + bothCount - 1;
            this.redCount = $('td.cmpac').length + bothCount - 1;
            if (this.greenCount < 2 && this.redCount < 2)
                return false;
        } else {
            this.problemsCount = $('td.accepted').length;
            if (this.problemsCount < 2)
                return false;
        }
        return true;
    };

    Chart.prototype.createToggleLink = function (expectedVisibility) {
        var label = expectedVisibility ? locale.hideChart : locale.showChart;
        $('.author_links')
            .append(substTemplateVariables(TEMPLATE_TOGGLE_LINK, {
                label: label,
            }));
        var chart = this;
        $('.chart_toggle').click(function (event) {
            if (chart.visible)
                chart.hide();
            else
                chart.show();
            event.preventDefault();
        });
    };

    Chart.prototype.createChartPlace = function () {
        var chart = this;
        $('.author_links').after(TEMPLATE_CHART);
        $('#chart_new_user_color').click(function() {
            $(this).css('background-color', randomColor());
        });
        $('.chart_legend_open').click(function (event) {
            chart.showLegend();
            event.preventDefault();
        });
        $('.chart_judge_id_input').keypress(function (event) {
            if (event.which === 13) {
                chart.loadJudgeID();
                event.preventDefault();
            }
        });
        $('.chart_user_add').click(function (event) {
            chart.loadJudgeID();
            event.preventDefault();
        });

        this.spinner = new Spinner();
    };

    Chart.prototype.loadInitialData = function () {
        var profileName;
        var link = $('h2.author_name a');
        if (link.length)
            profileName = link.html();
        else
            profileName = $('h2.author_name').html();
        if (this.matchCompareto !== null) {
            var otherName =
                    $('.author_comparison_legend .padright:first').html();
            if (this.greenCount >= 2)
                this.addUser(this.matchCompareto[1], otherName, COLOR_GREEN,
                        this.greenCount, true);
            if (this.redCount >= 2)
                this.addUser(this.matchId[1], profileName, COLOR_RED,
                        this.redCount, true);
        } else
            this.addUser(this.matchId[1], profileName, COLOR_GREEN,
                    this.problemsCount, true);
    };

    Chart.prototype.hide = function () {
        if (!this.visible)
            return;
        this.visible = false;
        setValue('chart_visible', '0');

        $('.chart_toggle').html(locale.showChart);
        $('#chart_place').slideUp(300);
    };

    Chart.prototype.show = function () {
        if (this.visible)
            return;
        this.visible = true;
        setValue('chart_visible', '1');

        $('.chart_toggle').html(locale.hideChart);
        if (!this.ready)
            this.createChartPlace();
        this.loading(true);
        if (!this.ready) {
            this.loadInitialData();
            this.ready = true;
        }
        var chart = this;
        $('#chart_place')
            .width($('.solved_map_box').width())
            .slideDown(300, function() {
                chart.animateComplete = true;
                if (!chart.hasCriticalError &&
                        chart.lines.length === chart.linesExpected)
                    chart.redraw();
            });
    };

    Chart.prototype.getDefaultVisibility = function () {
        try {
            if (getValue('chart_visible') === '0')
                return false;
        } catch (err) {}
        return true;
    };

    var chart = new Chart();
    if (chart.areEnoughDataPresent()) {
        var expectedVisibility = chart.getDefaultVisibility();
        chart.createToggleLink(expectedVisibility);
        if (expectedVisibility)
            $(function () {
                chart.show();
            });
    }
})();
