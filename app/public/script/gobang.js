var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function drawLine() {
    ctx.clearRect(0, 0, 450, 450);
    ctx.save();
    ctx.fillStyle = '#d5ac7a';
    ctx.fillRect(0, 0, 450, 450);
    ctx.strokeStyle = "#000";
    for (var i=0; i<15; i++) {
        ctx.beginPath();
        ctx.moveTo(15,15+i*30);
        ctx.lineTo(435,15+i*30);
        ctx.stroke();
        ctx.moveTo(15+i*30,15);
        ctx.lineTo(15+i*30,435);
        ctx.stroke();
        ctx.closePath();
    }
    ctx.restore();
}
drawLine();

function oneStep(i, j, black) {
    ctx.beginPath();
    ctx.arc(15+i*30, 15+j*30, 13, 0, 2*Math.PI);
    ctx.closePath();
    var gradient = ctx.createRadialGradient(15+i*30+2, 15+j*30-2, 15, 15+i*30, 15+j*30, 0);
    if(black){
        gradient.addColorStop(0, "#0a0a0a");
        gradient.addColorStop(1, "#636766");
    }else{
        gradient.addColorStop(0, "#D1D1D1");
        gradient.addColorStop(1, "#F9F9F9");
    }
    ctx.fillStyle = gradient ;
    ctx.fill();
}

class ChessBoard {
    constructor() {
        this.arr = new Uint32Array(15);
    }
    init(arr) {
        this.arr = arr;
        var flag;
        drawLine();
        for (var i = 0; i < 15; i++) {
            for (var j = 0; j < 15; j++) {
                flag = this.check(i, j);
                if (flag !== 0) {
                    oneStep(i, j, flag === 1);
                }
            }
        }
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

var chessBoard = new ChessBoard();
var black = true, over = false;
canvas.onclick = function(e) {
    if (over) {
        return;
    }
    var i = Math.floor(e.offsetX / 30);
    var j = Math.floor(e.offsetY / 30);
    if (0 <= i && i < 15 && 0 <= j && j < 15 && chessBoard.check(i, j) === 0) {
        oneStep(i, j, black);
        chessBoard.step(i, j, black);
        black = !black;
        var flag = chessBoard.judge(i, j);
        if (flag > 0) {
            switch(flag) {
                case 1:
                    setTimeout(() => alert('黑方胜利'), 0);
                    break;
                case 2:
                    setTimeout(() => alert('白方胜利'), 0);
                break;
            }
            over = true;
        }
    }
}