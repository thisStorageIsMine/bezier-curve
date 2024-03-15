const config = {
    waveSpeed: 1,
    wavesToMerge: 4,
    curvesNum: 40,
    framesToMove: 200
}

// Благодаря этой штуке я буду динамически менять кривые
class WaveNoise {
    waveSet: number[] = [];
    
    addWaves(n: number) {
        for (let i = 0; i < n; i++) {
            let randomAngle = Math.random() * 360;
            this.waveSet.push(randomAngle);
        }
    }

    mergeWaves(){
        let mergedWaves = this.waveSet.reduce((sum, x) => Math.sin(x / 180 * Math.PI), 0);

        return (mergedWaves / this.waveSet.length + 1) / 2;
    }

    update() {
        this.waveSet.forEach((e, i) => {
            let randomNumber = Math.random() * (i + 1) * config.waveSpeed;
            this.waveSet[i] = (e + randomNumber) % 360; 
        })
    }
}




interface curve {
    startX: number;
    startY: number;

    controlX1: number;
    controlY1: number;

    controlX2: number;
    controlY2: number;

    endX: number;
    endY: number;

    alpha: number;
}

class BezierAnimation {
    cnv: HTMLCanvasElement  = document.createElement("canvas");
    ctx: CanvasRenderingContext2D | null= this.cnv.getContext("2d");
    size = {
        w: 0,
        h: 0,
        cx: 0,
        cy: 0
    };
    controls: WaveNoise[] = [];
    controlsNum: number = 3;

    start: {x:number, y:number} = {
        x: 0,
        y: 0
    }

    framesCounter = 0;
    time4Start = 0;
    time4End = 0;

    updateFrameCounter() {
        this.framesCounter = (this.framesCounter + 1) % config.framesToMove;

        if(this.framesCounter === 0 ) {
            this.time4Start = Math.random();
            this.time4End = Math.random();

        }
    }

    getYPlacementType(type: number, i: number) {
        if(type > .6) {
            return this.size.h / config.curvesNum * i;
        } else if (type > .4) {
            return this.size.h;
        } else if (type > .2) {
            return this.size.cy;
        } else {
            return 0;
        }
    }

    constructor(x: number = 0, y: number = 0) {
        this.start.x = x;
        this.start.y = y;
    }

    createControls() {
        for (let index = 0; index < this.controlsNum + config.curvesNum; index++) {
            const control = new WaveNoise();

            control.addWaves(config.wavesToMerge);

            this.controls.push(control);
        }
    }

    createCanvas() {
        this.cnv.classList.add("block" , "bg-gray-900");

        document.body.append(this.cnv);
    }

    setCanvasSize() {
        this.size.w  = this.cnv.width = window.innerWidth;
        this.size.h = this.cnv.height = window.innerHeight;

        this.size.cx = this.size.w / 2;
        this.size.cy = this.size.h / 2;

    }

    updateCurves() {
        const x1 = this.controls[0].mergeWaves() * this.size.w,
              x2 = this.controls[2].mergeWaves() * this.size.w,
              y1 = this.controls[1].mergeWaves() * this.size.h;
        
        for (let index = 0; index < config.curvesNum; index++) {
            
            let curveParam: curve = {
                startX:  0,
                startY:  this.getYPlacementType(this.time4Start, index),
    
                controlX1: x1,
                controlY1: y1,
    
                controlX2: x2,
                controlY2: this.controls[3 + index].mergeWaves() * this.size.h,
    
                endX: this.size.w,
                endY: this.getYPlacementType(this.time4End, index),
                alpha: this.controls[3 + index].mergeWaves()
            }
    
            this.drawCurve(curveParam);
            
        }

    }

    updateControls() {
        this.controls.forEach(i => i.update());
    }

    drawCurve({startX, startY, controlX1, controlY1, controlX2, controlY2, endX, endY, alpha}: curve) {
        this.ctx!.strokeStyle = `rgba(23, 37, 84, ${alpha})`;

        this.ctx?.beginPath();
        this.ctx?.moveTo(startX, startY);
        this.ctx?.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, endX, endY);
        this.ctx?.stroke()
    }

    init() {
        this.createCanvas();
        this.setCanvasSize();
        this.createControls();
        this.updateCurves();

        this.animateThisShit();
    }

    updateCanvas() {
        this.ctx!.fillStyle = "#111827";
        this.ctx?.fillRect(0,0, this.size.w, this.size.h)

    }

    animateThisShit() {
        this.updateFrameCounter();
        this.updateCanvas();
        this.updateCurves();
        this.updateControls();
        requestAnimationFrame(() => this.animateThisShit());
    }
}

const bezier = new BezierAnimation();
bezier.init();

window.addEventListener("resize", () => {
    bezier.setCanvasSize();
})


