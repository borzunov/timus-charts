function Submit() {}

// This dictionary duplicates some "problem*_*" records of local storage
// because it can be full or inaccessible
Submit.problemsFromContests = {};

Submit.prototype.getProblemID = function() {
    return this.space + ',' + this.problemNo;
};

Submit.prototype.getCacheKey = function () {
    return 'problem' + this.space + '_' + this.problemNo;
};

Submit.prototype.isConsidered = function () {
    if (this.verdict !== 'Accepted')
        return false;
    if (this.space == 1)
        return true;

    // Check whether the online-contest problem is
    // copied to the main archive
    var problemID = this.getProblemID();
    var archiveNo;
    if (problemID in Submit.problemsFromContests) {
        archiveNo = Submit.problemsFromContests[problemID];
    } else {
        try {
            archiveNo = getValue(this.getCacheKey());
            Submit.problemsFromContests[problemID] = archiveNo;
        } catch (err) {}
    }
    if (archiveNo !== undefined) {
        if (archiveNo == "null")
            return false;
        this.space = 1;
        this.problemNo = archiveNo;
        return true;
    }
    return null;
};

Submit.prototype.queryWhetherConsidered = function (
        resultCallback, failCallback) {
    var address = 'http://acm.timus.ru/problem.aspx?space=' +
            this.space + '&num=' + this.problemNo;
    var submit = this;
    $.get(address, function (data) {
        var problemID = submit.getProblemID();
        var cacheKey = submit.getCacheKey();
        var match = /<A HREF="problem\.aspx\?space=1(&amp;|&)num=(\d{4})"><nobr>\d{4}. .*?<\/nobr><\/A>/i.exec(data);
        if (match !== null) {
            var archiveNo = match[2];
            Submit.problemsFromContests[problemID] = archiveNo;
            setValue(cacheKey, archiveNo);

            submit.space = 1;
            submit.problemNo = archiveNo;
            resultCallback(true);
        } else {
            Submit.problemsFromContests[problemID] = "null";
            setValue(cacheKey, "null");

            resultCallback(false);
        }
    }).fail(failCallback);
};
