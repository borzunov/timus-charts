const AC_FRACTION_TO_HIGHLIGHT = 0.1;

class LastACHighlighter {
    constructor (pageParser, dataRetriever) {
        this.pageParser = pageParser;
        this.dataRetriever = dataRetriever;
    }

    show () {
        this.dataRetriever.retrieve(this.pageParser.ourId, author => {
            var highlightedCount = Math.ceil(this.pageParser.ourCount *
                AC_FRACTION_TO_HIGHLIGHT);
            var times = author.acceptedProblems;
            Object.keys(times)
                .sort((a, b) => times[b] - times[a])
                .slice(0, highlightedCount)
                .forEach((probId, i) => {
                    var td = $('.attempt_list ' +
                        'td.accepted:contains("' + probId + '")');
                    var hue = 120 + (1 - i / highlightedCount) * 60;
                    td.css('background-color', 'hsl(' + hue + ', 100%, 78%)');
                });
        });
    }

    hide () {
        $('.attempt_list td.accepted')
            .css('background-color', 'hsl(120, 100%, 78%)');
    }

    createToggler () {
        var checkbox = $('<input type="checkbox">');
        var label = $('<label>')
            .append(checkbox)
            .append(document.createTextNode(locale.highlightLastSolvedProblems));
        var td = $('<td align="right">').append(label);
        $('.solved_map_links td').after(td);

        checkbox.prop('checked', this.visible);
        checkbox.change(() => this.setVisibility(checkbox.is(':checked')));
    }

    getDefaultVisibility () {
        try {
            if (getValue('highlight_last_solved_problems') === '0')
                return false;
        } catch (err) {}
        return true;
    }

    setVisibility (visibility) {
        setValue('highlight_last_solved_problems', visibility ? '1' : '0');
        this.visible = visibility;
        if (visibility)
            this.show();
        else
            this.hide();
    }

    arrange () {
        $(() => {
            this.pageParser.parse();
            if (this.pageParser.rivalId !== null)
                return;

            this.visible = this.getDefaultVisibility();
            this.createToggler();
            if (this.visible)
                this.show();
        });
    }
}
