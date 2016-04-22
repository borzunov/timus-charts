class Submit {
    getProblemID () {
        return this.space + ',' + this.problemNo;
    }

    getCacheKey () {
        return 'problem' + this.space + '_' + this.problemNo;
    }

    isConsidered () {
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
    }

    queryWhetherConsidered (resultCallback, failCallback) {
        var address = 'http://acm.timus.ru/problem.aspx?space=' +
                this.space + '&num=' + this.problemNo;
        $.get(address, data => {
            var problemID = this.getProblemID();
            var cacheKey = this.getCacheKey();
            var match = /<A HREF="problem\.aspx\?space=1(&amp;|&)num=(\d{4})"><nobr>\d{4}. .*?<\/nobr><\/A>/i.exec(data);
            if (match !== null) {
                var archiveNo = match[2];
                Submit.problemsFromContests[problemID] = archiveNo;
                setValue(cacheKey, archiveNo);

                this.space = 1;
                this.problemNo = archiveNo;
                resultCallback(true);
            } else {
                this.problemsFromContests[problemID] = "null";
                setValue(cacheKey, "null");

                resultCallback(false);
            }
        }).fail(failCallback);
    }
}

// This dictionary duplicates some "problem*_*" records of local storage
// because it can be full or inaccessible
Submit.problemsFromContests = {};
