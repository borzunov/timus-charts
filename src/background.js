var COOKIE_COMMON_DETAILS = [
    'name', 'value', 'domain', 'path', 'secure', 'httpOnly', 'expirationDate',
    'storeId',
];

function cookieToSetDetails(url, cookie) {
    var selector = {url: url};
    for (var i = 0; i < COOKIE_COMMON_DETAILS.length; i++) {
        var key = COOKIE_COMMON_DETAILS[i];
        selector[key] = cookie[key];
    }
    return selector;
}

var COOKIES_URL = 'http://acm.timus.ru';
var SESSION_COOKIE_NAME = 'ASP.NET_SessionId';
var AUTHOR_COOKIE_NAME  = 'AuthorID';

var sessionCookie, authorCookie;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.action) {
        case 'stash_cookies':
            chrome.cookies.get({
                url: COOKIES_URL, name: SESSION_COOKIE_NAME
            }, function (cookie) {
                sessionCookie = cookie;
                chrome.cookies.get({
                    url: COOKIES_URL, name: AUTHOR_COOKIE_NAME
                }, function (cookie) {
                    authorCookie = cookie;
                    chrome.cookies.remove({
                        url: COOKIES_URL, name: SESSION_COOKIE_NAME
                    }, function () {
                        chrome.cookies.remove({
                            url: COOKIES_URL, name: AUTHOR_COOKIE_NAME
                        }, function () {
                            sendResponse();
                        });
                    });
                });
            });
            break;
        case 'expose_cookies':
            sessionCookie.url = COOKIES_URL;
            chrome.cookies.set(cookieToSetDetails(
                COOKIES_URL, sessionCookie
            ), function () {
                chrome.cookies.set(cookieToSetDetails(
                    COOKIES_URL, authorCookie
                ), function () {
                    sendResponse();
                });
            });
            break;
    }
    return true;
});
