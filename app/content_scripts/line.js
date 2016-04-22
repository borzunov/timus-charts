class Line {
    constructor (author, name, color) {
        this.author = author;
        this.name = name;
        this.color = color;
    }

    make () {
        this.points = Object.keys(this.author.acceptedProblems)
            .map(key => this.author.acceptedProblems[key] * MSEC_PER_SEC)
            .sort((a, b) => a - b)
            .map((date, i) => [new Date(date), i + 1]);
    }
}
