class LastACHighlighter {
    constructor (pageParser, dataRetriever) {
        this.pageParser = pageParser;
        this.dataRetriever = dataRetriever;
    }

    arrange () {
        if (this.pageParser.rivalId !== null)
            return;

        this.dataRetriever.retrieve(this.pageParser.ourId, author => {
            var times = author.acceptedProblems;
            Object.keys(times)
                .sort((a, b) => times[b] - times[a])
                .forEach((probId, i) => {
                    var td = $('.attempt_list ' +
                        'td.accepted:contains("' + probId + '")');
                    var hue = 120 + (1 - Math.min(1, i / 60)) * 60;
                    td.css('background-color', 'hsl(' + hue + ', 100%, 78%)');
                });
        });
    }
}
