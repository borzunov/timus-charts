(function () {
    var chart = new Chart();
    if (chart.areEnoughDataPresent()) {
        var expectedVisibility = chart.getDefaultVisibility();
        chart.createToggleLink(expectedVisibility);
        if (expectedVisibility) {
            $(function () {
                chart.show();
            });
        }
        if (chart.matchCompareto === null) {
            $(function () {
                var times = chart.lines[0].author.acceptedProblems;
                Object.keys(times).sort(function(a, b) {
                    return times[b] - times[a];
                }).forEach(function (probId, i) {
                    var td = $('.attempt_list td.accepted:contains("' + probId + '")');
                    var hue = 120 + (1 - Math.min(1, i / 60)) * 60;
                    td.css('background-color', 'hsl(' + hue + ', 100%, 78%)');
                });
            });
        }
    }
})();
