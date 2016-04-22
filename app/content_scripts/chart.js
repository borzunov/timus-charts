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

class Chart {
    constructor () {
        this.matchId = /id=(\d+)/i.exec(location.href);
        this.matchCompareto = /compareto=(\d+)/i.exec(location.href);

        this.ready = false;
        this.visible = false;

        this.lines = [];
        this.linesExpected = 0;

        this.animateComplete = false;
        this.loadingState = false;
        this.hasCriticalError = false;
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

    showQueryError () {
        this.loading(false);
        $('.chart_legend_open').hide();
        $('.chart_legend').hide();
        $('#chart').hide();
        $('#chart_loading').show();
        $('#chart_query_error').show();
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
    }

    showJudgeIDError (message) {
        this.loading(false);
        $('#chart_loading_error_judge_id').html(message).slideDown(50);
    }

    addUser (judgeID, name, color,
            expectedAcceptedProblemsCount, isCritical, callback) {
        this.linesExpected++;
        var author = new Author(judgeID);
        author.retrieve(expectedAcceptedProblemsCount, () => {
            var line = new Line(author, name, color);
            line.make();
            if (line.points.length < 2) {
                if (isCritical) {
                    this.hasCriticalError = true;
                    this.showQueryError();
                } else
                    this.showJudgeIDError(locale.judgeIDNotEnoughOfAccepted);
                this.linesExpected--;
                return;
            }

            this.lines.push(line);
            if (this.lines.length === this.linesExpected) {
                if (this.animateComplete)
                    this.redraw();
                if (callback !== undefined)
                    callback();
            }
        }, () => {
            if (isCritical) {
                this.hasCriticalError = true;
                this.showQueryError();
            } else
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

        var address = 'http://acm.timus.ru/author.aspx?id=' + judgeID;
        $.get(address, data => {
            var match = /<H2 CLASS="author_name">(<A HREF=".*?" TARGET="_blank">)?(.+?)(<\/A>)?<\/H2>/i.exec(data);
            if (match === null) {
                this.showJudgeIDError(locale.judgeIDDoesntExist);
                return;
            }
            var name = match[2];

            var color = $('#chart_new_user_color').css('background-color');
            this.addUser(judgeID, name, color, null, false, () => {
                $('.chart_judge_id_input').val('');
                $('#chart_new_user_color')
                        .css('background-color', randomColor());
            });
        }).fail(() => this.showJudgeIDError(locale.queryFailed));
    }

    showLegend () {
        $('.chart_legend_open').hide();
        $('.chart_legend').slideDown(150);
        $('.chart_judge_id_input').focus();
    }

    areEnoughDataPresent () {
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
    }

    createToggleLink (expectedVisibility) {
        var label = expectedVisibility ? locale.hideChart : locale.showChart;
        $('.author_links')
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
        $('.author_links').after(TEMPLATE_CHART);
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

        this.spinner = new Spinner();
    }

    loadInitialData () {
        var link = $('h2.author_name a');
        var profileName = link.length ?
            link.html() : $('h2.author_name').html();
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
    }

    hide () {
        if (!this.visible)
            return;
        this.visible = false;
        setValue('chart_visible', '0');

        $('.chart_toggle').html(locale.showChart);
        $('#chart_place').slideUp(300);
    }

    show () {
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
        $('#chart_place')
            .width($('.solved_map_box').width())
            .slideDown(300, () => {
                this.animateComplete = true;
                if (!this.hasCriticalError &&
                        this.lines.length === this.linesExpected)
                    this.redraw();
            });
    }

    getDefaultVisibility () {
        try {
            if (getValue('chart_visible') === '0')
                return false;
        } catch (err) {}
        return true;
    }
}
