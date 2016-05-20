class DataRetriever {
    constructor (pageParser) {
        this._pageParser = pageParser;

        this._authorStates = {};
    }

    _getExpectedAcProblems(judgeID) {
        switch (judgeID) {
        case this._pageParser.ourId:
            return this._pageParser.ourCount;
        case this._pageParser.rivalId:
            return this._pageParser.rivalCount;
        default:
            return null;
        }
    }

    static _pushCallbacks (state, resultCb, failCb) {
        if (resultCb !== undefined)
            state.resultCallbacks.push(resultCb);
        if (failCb !== undefined)
            state.failCallbacks.push(failCb);
    }

    _startRetrieval (judgeID, resultCb, failCb) {
        var resultCallbacks = [];
        var failCallbacks = [];
        var author = new Author(judgeID);
        var state = {
            status: 'process',
            resultCallbacks: resultCallbacks,
            failCallbacks: failCallbacks,
            author: author,
        };
        DataRetriever._pushCallbacks(state, resultCb, failCb);
        this._authorStates[judgeID] = state;

        author.retrieve(this._getExpectedAcProblems(judgeID),
            () => {
                this._authorStates[judgeID] = {
                    status: 'success',
                    author: author,
                };
                resultCallbacks.forEach(cb => cb(author));
            },
            () => {
                this._authorStates[judgeID] = {
                    status: 'fail',
                    author: author,
                };
                failCallbacks.forEach(cb => cb(author));
            });
    }

    retrieve (judgeID, resultCb, failCb) {
        var state = this._authorStates[judgeID];
        if (state === undefined) {
            this._startRetrieval(judgeID, resultCb, failCb);
            return;
        }

        switch (state.status) {
        case 'process':
            DataRetriever._pushCallbacks(state, resultCb, failCb);
            break;
        case 'success':
            resultCb(state.author);
            break;
        case 'fail':
            failCb(state.author);
            break;
        default:
            throw new Error("Unknown retrieval state " + state.status);
        }
    }
}
