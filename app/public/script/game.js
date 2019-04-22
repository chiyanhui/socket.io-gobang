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