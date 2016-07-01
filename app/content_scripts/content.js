var observer = new ElementObserver();
var pageParser = new PageParser();
var dataRetriever = new DataRetriever(pageParser);

ensureStyleAdding(observer);
ensureLocaleUpdate(observer);

new Chart(observer, pageParser, dataRetriever).arrange();
new LastACHighlighter(observer, pageParser, dataRetriever).arrange();
