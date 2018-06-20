function $(s) {
    return document.querySelectorAll(s);
}

var lis = $("#list li");
var size = 64
var box = $("#box")[0];
var height, width;
var Dots = []; // 定义随即色
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var line;


var mv = new MusicVisualize({
    size: size,
    viual: draw
});

for (var i = 0; i < lis.length; i++) {

    lis[i].onclick = function () {

        for (var j = 0; j < lis.length; j++) {
            lis[j].className = "";
        }
        this.className = "selected";

        // load("/media/" + this.title);
        mv.play("/media/" + this.title);

    }

}

function random(m, n) {
    return Math.round(Math.random() * (n - m) + m)
}

function getDots() {
    Dots = [];
    for (var i = 0; i < size; i++) {
        var x = random(0, width);
        var y = random(0, height);
        var color = "rgba(" + random(0, 255) + " , " + random(0, 255) + "," + random(0, 255) + ", 0)";
        Dots.push({
            x: x,
            y: y,
            dx: random(1,3),
            color: color,
            cap: 0 // 小帽距离底端的距离默认为零
        })
    }
}

function resize() {
    height = box.clientHeight;
    width = box.clientWidth;
    canvas.height = height;
    canvas.width = width;
    line = context.createLinearGradient(0, 0, 0, height); // 纵向渐变
    line.addColorStop(0, "red"); // 渐变色
    line.addColorStop(0.5, "yellow"); // 渐变色
    line.addColorStop(1, "green"); // 渐变色
    // context.fillStyle = line;
    getDots()
}

resize();

window.onresize = resize

function draw(arr) {
    context.clearRect(0, 0, width, height);
    var w = width / size
    var cw = w * 0.8 // 小帽宽度
    var capH = cw > 8 ? 8 : cw// 小帽的高度
    context.fillStyle = line;
    for (var i = 0; i < size; i++) {
        var o = Dots[i]
        if (draw.type == "column") {
            var h = arr[i] / 256 * height
            context.fillRect(w * i, height - h, w * 0.8, h)
            // 绘制小帽
            context.fillRect(w * i, height - (o.cap + capH), w * 0.8, capH)
            o.cap--;
            if(o.cap < 0){
                o.cap = 0
            }
            if( h > 0 && o.cap < h + 10){
                o.cap = h + 10 > height - capH ? height - capH : h + 10
            }
        } else {
            context.beginPath()
            var r = 10 + arr[i] / 256 * (height > width ? width: height) /10;
            context.arc(o.x, o.y, r, 0, 2 * Math.PI)
            var g = context.createRadialGradient(o.x, o.y, 0, o.x, o.y, r)
            g.addColorStop(0, "#fff");
            g.addColorStop(1, o.color);
            context.fillStyle = g;
            context.fill()
            o.x += o.dx
            o.x = o.x > width ? 0 : o.x
            // context.strokeStyle = "white"
            // context.stroke()
        }

    }
}
draw.type = "column";

// 改变音量大小函数


$("#volume")[0].onchange = function () {
   mv.changeVolume(this.value / this.max);
}

$("#volume")[0].onchange() // 先调用一下 让60 生效


// 图形变换
var types = $("#type li");
for (let i = 0; i < types.length; i++) {
    types[i].onclick = function () {
        for (let j = 0; j < types.length; j++) {
            types[j].className = ""
        }
        this.className = "selected"
        draw.type = this.getAttribute("data-type");
    }
}