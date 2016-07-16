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

    retrieve (expectedAcProblems, resultCallback, failCallback) {
        this.loadFromCache();
        if (this.cacheAvailable && this.cachedAcceptedProblemsCount ==
                expectedAcProblems) {
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

        // Timus API used to throw an exception if the author have submits on
        // deleted problems (e.g. in private contests). If we got an exception,
        // just skip additional problem spaces.
        $.get(url + '&space=1').then(resultCallback, failCallback);
    }

    parseSubmitsPage (fromSubmitID) {
        var submitsQueried = (this.cacheAvailable ? 200 : 1000);
        var query = this.submitsQuery + '&count=' + submitsQueried;
        if (fromSubmitID !== null)
            query += '&from=' + fromSubmitID;
        var author = this;
        this.getSubmitsPage(query, data => {
            var lines = data.split('\n')
                .filter(line => line !== '');
            if (!lines.length || !lines[0].startsWith('submit')) {
                this.failCallback();
                return;
            }

            lines = lines.slice(1);
            if (lines.length < submitsQueried)
                this.noMorePages = true;
            try {
                this.submits = lines.map(line => {
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
                this.failCallback();
                return;
            }
            this.processSubmitsFrom(0);
        }, this.failCallback);
    }

    considerSubmit (submit) {
        var seconds = Math.floor(submit.time / MSEC_PER_SEC);
        var alreadyAccepted = submit.problemNo in this.acceptedProblems;
        if (!alreadyAccepted)
            this.acceptedProblemsCount++;
        if (!alreadyAccepted ||
                seconds < this.acceptedProblems[submit.problemNo])
            this.acceptedProblems[submit.problemNo] = seconds;
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
            if (isConsidered === null) {
                this.queryAndProcessSubmitsFrom(index);
                return;
            }
            if (isConsidered === true)
                this.considerSubmit(submit);
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

    queryAndProcessSubmitsFrom (index) {
        var submit = this.submits[index];
        submit.queryWhetherConsidered(result => {
            if (result)
                this.considerSubmit(submit);
            this.processSubmitsFrom(index + 1);
        }, this.failCallback);
    }
}
