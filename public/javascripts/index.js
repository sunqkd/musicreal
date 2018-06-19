function $(s) {
    return document.querySelectorAll(s);
}

var lis = $("#list li");
var size = 128
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
        var color = "rgb(" + random(0, 255) + " , " + random(0, 255) + "," + random(0, 255) + ")";
        Dots.push({
            x: x,
            y: y,
            color: color
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
    context.fillStyle = line;
    for (var i = 0; i < size; i++) {

        if (draw.type == "column") {
            var h = arr[i] / 256 * height
            context.fillRect(w * i, height - h, w * 0.8, h)
        } else {
            context.beginPath()
            var o = Dots[i]
            var r = arr[i] / 256 * 50;
            context.arc(o.x, o.y, r, 0, 2 * Math.PI)
            var g = context.createRadialGradient(o.x, o.y, 0, o.x, o.y, r)
            g.addColorStop(0, "#fff");
            g.addColorStop(1, o.color);
            context.fillStyle = g;
            context.fill()
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