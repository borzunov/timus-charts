const MSEC_PER_SEC = 1e3;

class Author {
    constructor (judgeID) {
        this.judgeID = judgeID;
        this.acceptedProblems = {};
        this.acceptedProblemsCount = 0;
        this.submitsQuery = '?author=' + judgeID + '&status=accepted';
        this.lastSubmitID = null;
        this.noMorePages = false;
        this.hasDeletedProblems = false;
    }

    getCacheKeyPrefix () {
        return 'author' + this.judgeID;
    }

    saveToCache () {
        var keyPrefix = this.getCacheKeyPrefix();
        setValue(keyPrefix + '_cacheVer', CACHE_VERSION);

        setValue(keyPrefix + '_acceptedProblems',
                JSON.stringify(this.acceptedProblems));
        setValue(keyPrefix + '_acceptedProblemsCount',
                this.acceptedProblemsCount);
        setValue(keyPrefix + '_lastKnownSubmitID',
                this.lastSubmitID);
    }

    loadFromCache () {
        var keyPrefix = this.getCacheKeyPrefix();
        try {
            var cacheVersion = parseInt(getValue(keyPrefix + '_cacheVer'));
            if (cacheVersion !== CACHE_VERSION)
                throw new Error('Incompatible cache version');

            this.acceptedProblems = JSON.parse(getValue(
                    keyPrefix + '_acceptedProblems'));
            this.cachedAcceptedProblemsCount = parseInt(getValue(
                    keyPrefix + '_acceptedProblemsCount'));
            this.cachedLastSubmitID = parseInt(getValue(
                    keyPrefix + '_lastKnownSubmitID'));
            this.cacheAvailable = true;
        } catch (err) {
            this.cacheAvailable = false;
        }
    }

    retrieve (expectedAcceptedProblemsCount, resultCallback, failCallback) {
        this.loadFromCache();
        if (this.cacheAvailable && this.cachedAcceptedProblemsCount ==
                expectedAcceptedProblemsCount) {
            this.acceptedProblemsCount = this.cachedAcceptedProblemsCount;
            this.lastSubmitID = this.cachedLastSubmitID;

            if (resultCallback !== undefined)
                resultCallback();
            return;
        }

        this.retrieveCallback = resultCallback;
        this.failCallback = failCallback;
        this.parseSubmitsPage(null);
    }

    static _getPublicSubmitsPage_Chrome (url, resultCallback, failCallback) {
        chrome.runtime.sendMessage({action: 'stash_cookies'}, function () {
            $.get(url).then(resultCallback, failCallback);
            chrome.runtime.sendMessage({action: 'expose_cookies'});
        });
    }

    static _getPublicSubmitsPage_Greasemonkey (
            query, resultCallback, failCallback) {
        GM_xmlhttpRequest({
            method: "GET",
            url: 'http://acm.timus.ru./textstatus.aspx' + query,
            headers: {
                'Host': 'acm.timus.ru',
            },
            onload (response) {
                resultCallback(response.responseText);
            },
            onabort (response) {
                failCallback();
            },
            onerror (response) {
                failCallback();
            },
        });
    }

    getSubmitsPage (query, resultCallback, failCallback) {
        var url = 'http://acm.timus.ru/textstatus.aspx' + query;
        if (!this.hasDeletedProblems) {
            $.get(url, data => {
                var expr = /<HTML>/i;
                if (expr.test(data)) {
                    this.hasDeletedProblems = true;
                    this.getSubmitsPage(query, resultCallback, failCallback);
                    return;
                }
                resultCallback(data);
            }).fail(failCallback);
            return;
        }
        // Timus API throws an exception if the author have submits on
        // deleted problems (e.g. in private contests).

        if (isChrome)
            Author._getPublicSubmitsPage_Chrome(
                    url, resultCallback, failCallback);
        else
        if (isGreasemonkey)
            Author._getPublicSubmitsPage_Greasemonkey(
                    query, resultCallback, failCallback);
        else
            // If there's no appropriate workaround,
            // just skip additional problem spaces
            $.get(url + '&space=1').then(resultCallback, failCallback);
    }

    parseSubmitsPage (fromSubmitID) {
        var submitsQueried = (this.cacheAvailable ? 200 : 1000);
        var query = this.submitsQuery + '&count=' + submitsQueried;
        if (fromSubmitID !== null)
            query += '&from=' + fromSubmitID;
        var author = this;
        this.getSubmitsPage(query, function (data) {
            var lines = data.split('\n')
                            .filter(function (line) {
                                return line !== '';
                            });
            if (!lines.length || !lines[0].startsWith('submit')) {
                author.failCallback();
                return;
            }

            lines = lines.slice(1);
            if (lines.length < submitsQueried)
                author.noMorePages = true;
            try {
                author.submits = lines.map(function (line) {
                    var fields = line.split('\t');
                    var submit = new Submit();

                    submit.id        = parseInt(fields[0]);
                    submit.space     = parseInt(fields[3]);
                    submit.problemNo = parseInt(fields[4]);
                    var elems = fields[1]
                            .replace(/-/g, ' ').replace(/:/g, ' ').split(' ');
                    submit.time      = new Date(
                            elems[0], elems[1] - 1, elems[2],
                            elems[3], elems[4], elems[5]).getTime();
                    submit.verdict   = fields[6];
                    if (
                        isNaN(submit.id) || isNaN(submit.space) ||
                        isNaN(submit.problemNo) || isNaN(submit.time)
                    )
                        throw new Error(
                                "Failed to parse information about submit");
                    return submit;
                });
            } catch (err) {
                author.failCallback();
                return;
            }
            author.processSubmitsFrom(0);
        }, this.failCallback);
    }

    considerSubmit (submit) {
        if (submit.problemNo in this.acceptedProblems)
            return;
        this.acceptedProblems[submit.problemNo] = Math.floor(
                submit.time / MSEC_PER_SEC);
        this.acceptedProblemsCount++;
    }

    processSubmitsFrom (index) {
        while (index < this.submits.length) {
            var submit = this.submits[index];
            if (this.lastSubmitID === null)
                this.lastSubmitID = submit.id;
            if (this.cacheAvailable && submit.id <= this.cachedLastSubmitID) {
                this.acceptedProblemsCount += this.cachedAcceptedProblemsCount;
                this.noMorePages = true;
                break;
            }

            var isConsidered = submit.isConsidered();
            if (isConsidered === true)
                this.considerSubmit(submit);
            else
            if (isConsidered === null) {
                var author = this;
                submit.queryWhetherConsidered(function (result) {
                    if (result)
                        author.considerSubmit(submit);
                    author.processSubmitsFrom(index + 1);
                }, this.failCallback);
                return;
            }
            index++;
        }

        if (this.noMorePages) {
            this.saveToCache();

            if (this.retrieveCallback !== undefined)
                this.retrieveCallback();
        } else
            this.parseSubmitsPage(
                    this.submits[this.submits.length - 1].id - 1);
    }
}
