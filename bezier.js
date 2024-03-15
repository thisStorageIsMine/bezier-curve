var config = {
    waveSpeed: 1,
    wavesToMerge: 4,
};
// Благодаря этой штуке я буду динамически менять кривые
var WaveNoise = /** @class */ (function () {
    function WaveNoise() {
        this.waveSet = [];
    }
    WaveNoise.prototype.addWaves = function (n) {
        for (var i = 0; i < n; i++) {
            var randomAngle = Math.random() * 360;
            this.waveSet.push(randomAngle);
        }
    };
    WaveNoise.prototype.mergeWaves = function () {
        var mergedWaves = this.waveSet.reduce(function (sum, x) { return Math.sin(x / 180 * Math.PI); }, 0);
        return (mergedWaves / this.waveSet.length + 1) / 2;
    };
    WaveNoise.prototype.update = function () {
        var _this = this;
        this.waveSet.forEach(function (e, i) {
            var randomNumber = Math.random() * (i + 1) * config.waveSpeed;
            _this.waveSet[i] = (e + randomNumber) % 360;
        });
    };
    return WaveNoise;
}());
var BezierAnimation = /** @class */ (function () {
    function BezierAnimation(x, y) {
        this.cnv = document.createElement("canvas");
        this.ctx = this.cnv.getContext("2d");
        this.size = {
            w: 0,
            h: 0,
            cx: 0,
            cy: 0
        };
        this.controls = [];
        this.controlsNum = 4;
        this.start = {
            x: 0,
            y: 0
        };
        this.start.x = x;
        this.start.y = y;
    }
    BezierAnimation.prototype.createControls = function () {
        for (var index = 0; index < this.controlsNum; index++) {
            var control = new WaveNoise();
            control.addWaves(config.wavesToMerge);
            this.controls.push(control);
        }
    };
    BezierAnimation.prototype.createCanvas = function () {
        this.cnv.classList.add("block", "bg-gray-900");
        document.body.append(this.cnv);
    };
    BezierAnimation.prototype.setCanvasSize = function () {
        this.size.w = this.cnv.width = window.innerWidth;
        this.size.h = this.cnv.height = window.innerHeight;
        this.size.cx = this.size.w / 2;
        this.size.cy = this.size.h / 2;
    };
    BezierAnimation.prototype.updateCurves = function () {
        var curveParam = {
            startX: this.start.x,
            startY: this.start.y,
            controlX1: this.controls[0].mergeWaves() * this.size.w,
            controlY1: this.controls[1].mergeWaves() * this.size.h,
            controlX2: this.controls[2].mergeWaves() * this.size.w,
            controlY2: this.controls[3].mergeWaves() * this.size.h,
            endX: this.size.w,
            endY: this.size.h
        };
        this.drawCurve(curveParam);
    };
    BezierAnimation.prototype.updateControls = function () {
        this.controls.forEach(function (i) { return i.update(); });
    };
    BezierAnimation.prototype.drawCurve = function (_a) {
        var _b, _c, _d, _e;
        var startX = _a.startX, startY = _a.startY, controlX1 = _a.controlX1, controlY1 = _a.controlY1, controlX2 = _a.controlX2, controlY2 = _a.controlY2, endX = _a.endX, endY = _a.endY;
        this.ctx.strokeStyle = "#172554";
        (_b = this.ctx) === null || _b === void 0 ? void 0 : _b.beginPath();
        (_c = this.ctx) === null || _c === void 0 ? void 0 : _c.moveTo(startX, startY);
        (_d = this.ctx) === null || _d === void 0 ? void 0 : _d.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, endX, endY);
        (_e = this.ctx) === null || _e === void 0 ? void 0 : _e.stroke();
    };
    BezierAnimation.prototype.init = function () {
        this.createCanvas();
        this.setCanvasSize();
        this.createControls();
        this.updateCurves();
        this.animateThisShit();
    };
    BezierAnimation.prototype.updateCanvas = function () {
        var _a;
        this.ctx.fillStyle = "#111827";
        (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.fillRect(0, 0, this.size.w, this.size.h);
    };
    BezierAnimation.prototype.animateThisShit = function () {
        var _this = this;
        this.updateCanvas();
        this.updateCurves();
        this.updateControls();
        requestAnimationFrame(function () { return _this.animateThisShit(); });
    };
    return BezierAnimation;
}());
var bezier = new BezierAnimation();
bezier.init();
window.addEventListener("resize", function () {
    bezier.setCanvasSize();
});
