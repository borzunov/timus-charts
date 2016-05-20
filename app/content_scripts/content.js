var pageParser = new PageParser();
var dataRetriever = new DataRetriever(pageParser);

new Chart(pageParser, dataRetriever).arrange();
