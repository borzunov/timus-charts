var observer = new ElementObserver();
var pageParser = new PageParser();
var dataRetriever = new DataRetriever(pageParser);

addStyles(observer);

updateLocale(observer, () => {
    new Chart(observer, pageParser, dataRetriever).arrange();
    new LastACHighlighter(observer, pageParser, dataRetriever).arrange();
});
