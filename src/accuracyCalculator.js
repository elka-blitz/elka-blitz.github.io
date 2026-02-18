// Accuracy calculator class

export class AccuracyCalculator {
    constructor(target, current) {
        this.target = target;
        this.current = current;
        this.accuracy = 0;
    }

    update() {
        this.accuracy = this.target / this.current;
    }
}