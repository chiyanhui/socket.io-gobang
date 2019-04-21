class ChessBoard {
    constructor() {
        this.arr = new Uint32Array(15);
    }
    check(i, j) {
        var flag = 0;
        if (0 <= i && i < 15 && 0 <= j && j < 15) {
            flag = this.arr[i] >>> j * 2 & 3;
        }
        return flag;
    }
    step(i, j, black) {
        var flag = false;
        if (0 <= i && i < 15 && 0 <= j && j < 15 && (this.arr[i] >>> j * 2 & 3) === 0) {
            this.arr[i] |= (black ? 1 : 2) << j * 2;
            flag = true;
        }
        return flag;
    }
    judge(i, j) {
        var flag = this.check(i, j);
        if (flag === 0) {
            return 0;
        }
        if (this._judge1(i, j, flag) || this._judge2(i, j, flag) || this._judge3(i, j, flag) || this._judge4(i, j, flag)) {
            return flag;
        }
        return 0;
    }
    _judge1(i, j, flag) { // 横向
        var k = 0, n = 1;
        for (k = 1; k < 5; k++) {
            if (this.check(i + k, j) !== flag) {
                break;
            }
            n++;
        }
        for (k = 1; k < 5; k++) {
            if (this.check(i - k, j) !== flag) {
                break;
            }
            n++;
        }
        return n >= 5;
    }
    _judge2(i, j, flag) { // 纵向
        var k = 0, n = 1;
        for (k = 1; k < 5; k++) {
            if (this.check(i, j + k) !== flag) {
                break;
            }
            n++;
        }
        for (k = 1; k < 5; k++) {
            if (this.check(i, j - k) !== flag) {
                break;
            }
            n++;
        }
        return n >= 5;
    }
    _judge3(i, j, flag) {
        var k = 0, n = 1;
        for (k = 1; k < 5; k++) {
            if (this.check(i + k, j + k) !== flag) {
                break;
            }
            n++;
        }
        for (k = 1; k < 5; k++) {
            if (this.check(i - k, j - k) !== flag) {
                break;
            }
            n++;
        }
        return n >= 5;
    }
    _judge4(i, j, flag) {
        var k = 0, n = 1;
        for (k = 1; k < 5; k++) {
            if (this.check(i - k, j + k) !== flag) {
                break;
            }
            n++;
        }
        for (k = 1; k < 5; k++) {
            if (this.check(i + k, j - k) !== flag) {
                break;
            }
            n++;
        }
        return n >= 5;
    }
}

module.exports = ChessBoard;
