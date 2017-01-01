class PageParser {
    constructor () {
        this.parsed = false;

        var match = /id=(\d+)/i.exec(location.href);
        var id = match !== null ? match[1] : null;
        match = /compareto=(\d+)/i.exec(location.href);
        var compareto = match !== null ? match[1] : null;
        if (compareto === null) {
            this.ourId = id;
            this.rivalId = null;
        } else {
            this.ourId = compareto;
            this.rivalId = id;
        }
    }

    parse () {
        if (this.parsed)
            return;
        this.parsed = true;

        var link = $('h2.author_name a');
        var profileName = link.length ?
            link.html() : $('h2.author_name').contents().get(0).nodeValue;
        if (this.rivalId !== null) {
            var bothCount = $('td.both').length - 1;
            this.ourCount = $('td.accepted').length + bothCount - 1;
            this.rivalCount = $('td.cmpac').length + bothCount - 1;

            this.ourName =
                $('.author_comparison_legend .padright:first').html();
            this.rivalName = profileName;
        } else {
            this.ourCount = $('td.accepted').length;

            this.ourName = profileName;
        }
    }
}
