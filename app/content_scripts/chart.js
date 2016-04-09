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
            chart.showJudgeIDError(locale.judgeIDDoesntExist);
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
