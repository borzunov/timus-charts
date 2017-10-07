function zfill(str, width) {
    while (str.length < width)
        str = '0' + str;
    return str;
}

function randomColor() {
    return '#' + zfill(Math.floor(Math.random() * 0x1000).toString(16), 3);
}

const YAXIS_SMALLEST_MAX = 10;
const XAXIS_CRITICAL_DIFF = 1000 * 60 * 60 * 24 * 3;

const MIN_PROBLEMS_TO_SHOW_USER = 2;

class Chart {
    constructor (observer, pageParser, dataRetriever) {
        this.observer = observer;
        this.pageParser = pageParser;
        this.dataRetriever = dataRetriever;

        this.ready = false;
        this.visible = false;

        this.lines = [];
        this.linesExpected = 0;

        this.loadingState = false;
        this.errorShown = false;
    }

    loading (state) {
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
    }

    showError (html) {
        this.errorShown = true;
        this.loading(false);
        $('.chart_legend_open').hide();
        $('.chart_legend').hide();
        $('#chart').hide();
        $('#chart_loading').show();
        $('#chart_error').html(html);
        $('#chart_error').show();
    }

    showQueryError () {
        this.showError(locale.queryFailed + '<br />' + locale.refreshPage);
    }

    static getLegendRowID (line) {
        return 'chart_user_' + line.author.judgeID;
    }

    redrawLegend () {
        var severalLines = this.lines.length > 1;
        var code = '';
        this.lines.forEach(line => {
            code += substTemplateVariables(TEMPLATE_USER_BEGIN, {
                row_id: Chart.getLegendRowID(line),
                color: line.color,
                judge_id: line.author.judgeID,
                name: line.name,
            });
            if (severalLines)
                code += substTemplateVariables(TEMPLATE_USER_SEVERAL_LINES, {
                    problems_count: line.author.acceptedProblemsCount,
                });
            code += TEMPLATE_USER_END;
        });
        $('.chart_users_table').html(code);

        if (!severalLines)
            return;
        this.lines.forEach(line => {
            $('#' + Chart.getLegendRowID(line) + ' .chart_user_remove').click(
                    event => {
                this.removeUser(line.author.judgeID);
                event.preventDefault();
            });
        });
    }

    fixPlot (plot) {
        var needReplot = false;
        // Fix non-integer ticks on X axis when maximal value is small
        if (plot.axes.yaxis.max < YAXIS_SMALLEST_MAX) {
            plot.axes.yaxis.reset();
            plot.axes.yaxis.max = YAXIS_SMALLEST_MAX;
            needReplot = true;
        }
        // Fix inadequate behavior of ticks when Y axis dates range is small
        if (plot.axes.xaxis.max - plot.axes.xaxis.min <=
                XAXIS_CRITICAL_DIFF) {
            plot.axes.xaxis.numberTicks = 5;
            plot.axes.xaxis.tickOptions.formatString += ', %H:%M';
            needReplot = true;
        }
        if (needReplot)
            plot.replot();
    }

    redraw () {
        this.lines.sort((a, b) =>
            b.author.acceptedProblemsCount - a.author.acceptedProblemsCount);
        this.redrawLegend();

        var points = this.lines.map(line => line.points).reverse();
        var colors = this.lines.map(line => line.color).reverse();

        if (!$('.chart_legend').is(':visible'))
            $('.chart_legend_open').show();
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
    }

    showJudgeIDError (message) {
        this.loading(false);
        $('#chart_loading_error_judge_id').html(message).show();
    }

    expectUsers (count) {
        this.linesExpected += count;
    }

    addUser (judgeID, name, color, isCritical, callback) {
        this.dataRetriever.retrieve(judgeID, author => {
            var line = new Line(author, name, color);
            line.make();
            if (line.points.length < MIN_PROBLEMS_TO_SHOW_USER) {
                if (isCritical)
                    this.showQueryError();
                else
                    this.showJudgeIDError(locale.judgeIDNotEnoughOfAccepted);
                this.linesExpected--;
                return;
            }

            this.lines.push(line);
            if (this.lines.length === this.linesExpected) {
                this.redraw();
                if (callback !== undefined)
                    callback();
            }
        }, () => {
            if (isCritical)
                this.showQueryError();
            else
                this.showJudgeIDError(locale.queryFailed);
            this.linesExpected--;
        });
    }

    removeUser (judgeID) {
        var index = this.lines.findIndex(
            line => line.author.judgeID == judgeID);
        if (index == -1)
            return;

        this.lines.splice(index, 1);
        this.linesExpected--;
        this.redraw();
    }

    loadJudgeID () {
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

        if (this.lines.some(line => line.author.judgeID == judgeID)) {
            this.showJudgeIDError(locale.judgeIDIsAlreadyAdded);
            return;
        }

        var address = document.location.origin + '/author.aspx?id=' + judgeID;
        $.get(address, data => {
            var match = /<H2 CLASS="author_name">(<A HREF=".*?" TARGET="_blank">)?(.+?)(<\/A>)?<\/H2>/i.exec(data);
            if (match === null) {
                this.showJudgeIDError(locale.judgeIDDoesntExist);
                return;
            }
            var name = match[2];

            var color = $('#chart_new_user_color').css('background-color');
            this.expectUsers(1);
            this.addUser(judgeID, name, color, false, () => {
                $('.chart_judge_id_input').val('');
                $('#chart_new_user_color')
                        .css('background-color', randomColor());
            });
        }).fail(() => this.showJudgeIDError(locale.queryFailed));
    }

    showLegend () {
        $('.chart_legend_open').hide();
        $('.chart_legend').show();
        $('.chart_judge_id_input').focus();
    }

    areEnoughDataPresent () {
        return this.pageParser.ourCount >= MIN_PROBLEMS_TO_SHOW_USER ||
            (this.pageParser.rivalId !== null &&
            this.pageParser.rivalCount >= MIN_PROBLEMS_TO_SHOW_USER);
    }

    createToggleLink (authorLinksElem, expectedVisibility) {
        var label = expectedVisibility ? locale.hideChart : locale.showChart;
        $(authorLinksElem)
            .append(substTemplateVariables(TEMPLATE_TOGGLE_LINK, {
                label: label,
            }));
        $('.chart_toggle').click(event => {
            if (this.visible)
                this.hide();
            else
                this.show();
            event.preventDefault();
        });
    }

    createChartPlace () {
        $('.author_links').after(substTemplateVariables(TEMPLATE_CHART, {}));
        $('#chart_new_user_color').click(function () {
            $(this).css('background-color', randomColor());
        });
        $('.chart_legend_open').click(event => {
            this.showLegend();
            event.preventDefault();
        });
        $('.chart_judge_id_input').keypress(event => {
            if (event.which === 13) {
                this.loadJudgeID();
                event.preventDefault();
            }
        });
        $('.chart_user_add').click(event => {
            this.loadJudgeID();
            event.preventDefault();
        });

        var Spinner = makeSpinner();
        this.spinner = new Spinner();
    }

    loadInitialData () {
        var showUs = this.pageParser.ourCount >= MIN_PROBLEMS_TO_SHOW_USER;
        var showRival = this.pageParser.rivalId !== null &&
            this.pageParser.rivalCount >= MIN_PROBLEMS_TO_SHOW_USER;
        this.expectUsers(showUs + showRival);

        if (showUs)
            this.addUser(this.pageParser.ourId, this.pageParser.ourName,
                COLOR_GREEN, true);
        if (showRival)
            this.addUser(this.pageParser.rivalId, this.pageParser.rivalName,
                COLOR_RED, true);
    }

    hide () {
        if (!this.visible)
            return;
        this.visible = false;
        setValue('chart_visible', '0');

        $('.chart_toggle').html(locale.showChart);
        $('#chart_place').hide();
    }

    show () {
        if (this.visible)
            return;
        this.visible = true;
        setValue('chart_visible', '1');

        $('.chart_toggle').html(locale.hideChart);
        if (!this.ready) {
            this.createChartPlace();
            this.loading(true);
            $(() => {
                this.pageParser.parse();
                if (this.areEnoughDataPresent())
                    this.loadInitialData();
                else
                    this.showError(locale.notEnoughData);
            });

            this.ready = true;
        } else {
            $('#chart_place').show();
            if (!this.loadingState) {
                // If the last redrawing happened when the chart was hidden,
                // jqPlot wouldn't accomplish it correctly,
                // so we need run to redraw the chart again
                this.redraw();
            }
        }
    }

    getDefaultVisibility () {
        try {
            if (getValue('chart_visible') === '0')
                return false;
        } catch (err) {}
        return true;
    }

    arrange () {
        this.observer.forEach('.author_links', elem => {
            var visible = this.getDefaultVisibility();
            this.createToggleLink(elem, visible);
            if (visible)
                this.show();
        });
    }
}
