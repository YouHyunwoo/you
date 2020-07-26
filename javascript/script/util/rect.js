export default class Rectangle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    enlarge(width, height) {
        return new Rectangle(...this.position.subv([width, height].divs(2)), this.width + width, this.height + height);
    }

    set left(value) {
        this.x = value;
    }
    get left() {
        return this.x;
    }

    set right(value) {
        this.width = value - this.x;
    }
    get right() {
        return this.x + this.width;
    }

    set top(value) {
        this.y = value;
    }
    get top() {
        return this.y;
    }

    set bottom(value) {
        this.height = value - this.y;
    }
    get bottom() {
        return this.y + this.height;
    }

    get ltrb() {
        return [this.x, this.y, this.x + this.width, this.y + this.height];
    }

    get center() {
        return [this.x + this.width / 2, this.y + this.height / 2];
    }

    set position(value) {
        [this.x, this.y] = value;
    }
    get position() {
        return [this.x, this.y];
    }

    set size(value) {
        [this.width, this.height] = value;
    }
    get size() {
        return [this.width, this.height];
    }
}