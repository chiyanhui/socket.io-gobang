var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

class ChessBoard {
    constructor() {
        this.arr = new Uint32Array(15);
        this._drawLine();
    }
    _drawLine() {
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
    _drawStep(i, j, black, focus) {
        if (focus) {
            ctx.beginPath();
            ctx.arc(15+i*30, 15+j*30, 14, 0, 2*Math.PI);
            ctx.closePath();
            ctx.strokeStyle = "#f00";
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(15+i*30, 15+j*30, 13, 0, 2*Math.PI);
        ctx.closePath();
        var gradient = ctx.createRadialGradient(15+i*30, 15+j*30, 15, 15+i*30, 15+j*30, 0);
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
    _init(arr) {
        if (arr) {
            this.arr = arr;
        }
        var flag;
        this._drawLine();
        for (var i = 0; i < 15; i++) {
            for (var j = 0; j < 15; j++) {
                flag = this.check(i, j);
                if (flag !== 0) {
                    this._drawStep(i, j, flag === 1);
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
            this._init();
            this._drawStep(i, j, black, true);
            this.arr[i] |= (black ? 1 : 2) << j * 2;
            flag = true;
        }
        return flag;
    }
}
