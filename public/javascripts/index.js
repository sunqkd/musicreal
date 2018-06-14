function $(s){
    return document.querySelectorAll(s);
}

var lis = $("#list li");

for(var i = 0;i<lis.length;i++){

    lis[i].onclick = function(){

        for(var j=0;j<lis.length;j++){
            lis[j].className = "";
        }
        this.className = "selected";

        load("/media/"+ this.title);

    }

}

// ajax 请求
var xhr = new XMLHttpRequest();

var ac = new (window.AudioContext || window.webkitAudioContext)(); //创建对象
var gainNode = ac[ac.createGain?"createGain":"createGainNode"]()   //控制音量
var analyser = ac.createAnalyser(); // 分析数据
var size = 128
analyser.fftSize = size * 2; // 频率长度

analyser.connect(gainNode);

gainNode.connect(ac.destination);


var source= null;
var count = 0; // 计数器

var box = $("#box")[0];
var height,width;
var Dots = []; // 定义随即色

function random(m,n){
    return Math.round( Math.random()*(n-m) + m )
}
function getDots(){
    Dots = [];
    for(var i = 0;i< size;i++){
        var x = random(0,width);
        var y = random(0,height);
        var color = "rgb("+ random(0,255)+" , " +random(0,255) + ","+ random(0,255)+")";
        Dots.push({
            x:x,
            y:y,
            color: color
        })
    }
}

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var line;
function resize(){
    height = box.clientHeight;
    width = box.clientWidth;
    canvas.height = height;
    canvas.width = width;
    line = context.createLinearGradient(0,0,0,height); // 纵向渐变
    line.addColorStop(0,"red"); // 渐变色
    line.addColorStop(0.5,"yellow"); // 渐变色
    line.addColorStop(1,"green"); // 渐变色
    // context.fillStyle = line;

    getDots()
}

resize();

window.onresize = resize



function load(url){
    var n = ++count;
    source && source[source.stop ? "stop" : "noteOff"](); // 停止播放音乐 
    xhr.abort(); // 终止掉上一次请求

    xhr.open("GET",url);  // 打开一个请求
    xhr.responseType = "arraybuffer"  // 请求返回数据类型 （）
    xhr.onload= function(){ // 请求成功 回调
        // 解码音频数据  成功回调 错误回调
        if(n != count){ return; }
          
        ac.decodeAudioData(xhr.response, function(buffer){
            if(n != count) return;
            console.log("解码成功")
            // 创建对象
            var bufferSource = ac.createBufferSource();
            bufferSource.buffer = buffer; // 存储域
            // 控制音量 
            
            bufferSource.connect(analyser);
            // bufferSource.connect(gainNode); 没必要在连接了
           
            // bufferSource.connect(ac.destination);  没有必要在连接了
            bufferSource[bufferSource.start?"start": "noteOn"](0); // 播放

            source = bufferSource // 暂时保存下来
           

        }, function(err){
            console.log(err)
        })

    }
    xhr.send(); // 发送请求
}

// 分析音频数据
function visualizer(){
    var arr = new Uint8Array(analyser.frequencyBinCount);
    
    requestAnimationFrame = window.requestAnimationFrame || 
                            window.webkitRequestAnimationFrame ||
                            window.mozRequestAnimationFrame

    function v(){
        analyser.getByteFrequencyData(arr)  // 分析得到的数据复制到 arr中
        draw(arr) // 绘制canvas
        requestAnimationFrame(v)
    }
    requestAnimationFrame(v)
}

visualizer()


function draw(arr){
    context.clearRect(0,0,width,height);
    var w = width /size
    context.fillStyle = line;
    for(var i=0;i<size;i++){

        if(draw.type == "column"){
            var h = arr[i] / 256 * height
            context.fillRect(w*i, height -h, w*0.8, h)
        }else{
            context.beginPath()
            var o = Dots[i]
            var r = arr[i] / 256 * 50;
            context.arc(o.x,o.y,r,0,2*Math.PI)
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
function changeVolume(percent){
    gainNode.gain.value = percent*percent
}


$("#volume")[0].onchange = function(){
    changeVolume(this.value/this.max);
}

$("#volume")[0].onchange() // 先调用一下 让60 生效


// 图形变换
var types = $("#type li");
for(let i = 0;i<types.length;i++){
    types[i].onclick = function(){
        for(let j = 0;j< types.length;j++){
            types[j].className = ""
        }
        this.className = "selected"
        draw.type= this.getAttribute("data-type");
    }
}