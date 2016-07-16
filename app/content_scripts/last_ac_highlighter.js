const SECS_PER_DAY = 60 * 60 * 24;
const SECS_TO_HIGHLIGHT = 60 * SECS_PER_DAY;

class LastACHighlighter {
    constructor (observer, pageParser, dataRetriever) {
        this.observer = observer;
        this.pageParser = pageParser;
        this.dataRetriever = dataRetriever;
    }

    show () {
        this.pageParser.parse();
        var curTime = Date.now() / MSEC_PER_SEC;
        this.dataRetriever.retrieve(this.pageParser.ourId, author => {
            var acTimes = author.acceptedProblems;
            for (var problem of Object.keys(acTimes)
                .sort((a, b) => acTimes[b] - acTimes[a])) {
                var acTime = acTimes[problem];
                if (curTime - acTime > SECS_TO_HIGHLIGHT)
                    break;
                var ratio = (curTime - acTime) / SECS_TO_HIGHLIGHT;

                var td = $(`.attempt_list td.accepted:contains("${problem}")`);
                var hue = 120 + (1 - ratio) * 60;
                td.css('background-color', `hsl(${hue}, 100%, 78%)`);
            }
        });
    }

    hide () {
        $('.attempt_list td.accepted')
            .css('background-color', 'hsl(120, 100%, 78%)');
    }

    createToggler (prevCell) {
        var checkbox = $('<input type="checkbox">');
        var label = $('<label>')
            .append(checkbox)
            .append(document.createTextNode(locale.highlightLastSolvedProblems));
        var td = $('<td align="right">').append(label);
        $(prevCell).after(td);

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
        if (this.pageParser.rivalId !== null)
            return;
        this.observer.forEach('.solved_map_links td:first-child', elem => {
            this.visible = this.getDefaultVisibility();
            this.createToggler(elem);
        });
        $(() => {
            if (this.visible)
                this.show();
        });
    }
}
