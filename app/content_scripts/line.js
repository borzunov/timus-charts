function Line(author, name, color) {
    this.author = author;
    this.rowID = 'chart_user_' + author.judgeID;
    this.name = name;
    this.color = color;
}

Line.prototype.make = function () {
    var dates = [];
    for (var key in this.author.acceptedProblems) {
        var value = this.author.acceptedProblems[key] * MSEC_PER_SEC;
        if (value !== true)
            dates.push(value);
    }
    dates.sort(function (a, b) {
        return a - b;
    });
    this.points = [];
    for (var i = 0; i < dates.length; i++)
        this.points.push([new Date(dates[i]), i + 1]);
};
