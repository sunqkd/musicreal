
function MusicVisualize(obj) {
    this.source = null;
    this.count = 0;
    this.analyser = MusicVisualize.ac.createAnalyser(); // 分析数据
    this.size = obj.size; // 长度
    this.analyser.fftSize = this.size * 2;
    this.gainNode = MusicVisualize.ac[MusicVisualize.ac.createGain ? "createGain" : "createGainNode"]();   //控制音量
    this.gainNode.connect(MusicVisualize.ac.destination); // 连接扬声器
    this.analyser.connect(this.gainNode); // 连接节点
    this.xhr = new XMLHttpRequest(); // ajax 对象
    this.viual = obj.viual
    this.visualize();
}

MusicVisualize.ac = new (window.AudioContext || window.webkitAudioContext)(); // 创建根对象

// 请求数据
MusicVisualize.prototype.load = function (url, fun) {
    this.xhr.abort(); // 终止请求
    this.xhr.open("GET", url);
    this.xhr.responseType = "arraybuffer";
    var self = this;
    this.xhr.onload = function () {
        fun(self.xhr.response)
    }
    this.xhr.send()
}
// 解码数据
MusicVisualize.prototype.decode = function (arraybuffer, fun) {
    MusicVisualize.ac.decodeAudioData(arraybuffer, function (buffer) {
        fun(buffer)
    }, function (err) {
        console.log(err)
    });
}
// 播放
MusicVisualize.prototype.play = function (url) {
    var n = ++this.count; // 计数 换歌曲的时候做一个区别
    var self = this;
    // this.source && this.stop()
    if(this.source){
        self.stop()
    }
    this.load(url, function (arraybuffer) {
        if (n != self.count) {
            return;
        }
        self.decode(arraybuffer, function (buffer) {
            if (n != self.count) {
                return;
            }
            var bs = MusicVisualize.ac.createBufferSource();
            bs.buffer = buffer;
            bs.connect(self.analyser);
            bs[bs.start ? "start" : "noteOn"](0); // 播放
            self.source = bs; // 记录当前正在播放的音频
        })
    }); // 加载数据
}

// 结束播放
MusicVisualize.prototype.stop = function () {
    this.source[this.source.stop ? "stop" : "noteOff"](0);
}
// 音量控制
MusicVisualize.prototype.changeVolume = function (value) {
    this.gainNode.gain.value = value * value
}
// 可视化效果
MusicVisualize.prototype.visualize = function () {
    var arr = new Uint8Array(this.analyser.frequencyBinCount); // 分析得到的数据是fftsize的一半
    requestAnimationFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame

    var self = this;

    function v() {
        self.analyser.getByteFrequencyData(arr)  // 分析得到的数据复制到 arr中
        self.viual(arr)
        requestAnimationFrame(v)
    }
    requestAnimationFrame(v)
}
