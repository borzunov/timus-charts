var isGreasemonkey = (
    typeof GM_getValue !== "undefined" &&
    typeof GM_setValue !== "undefined" &&
    typeof GM_xmlhttpRequest !== "undefined"
);
var isChrome = (typeof chrome !== "undefined");

function getValue(key) {
    var value;
    if (isGreasemonkey)
        value = GM_getValue(key);
    else
        value = localStorage[key];

    if (value === undefined)
        throw new Error("Storage doesn't contain this key");
    return value;
}

function setValue(key, value) {
    try {
        if (isGreasemonkey)
            GM_setValue(key, value);
        else
            localStorage[key] = value;
    } catch (err) {}
}
