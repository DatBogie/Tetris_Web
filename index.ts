// const canvas = document.getElementById("canvas") as HTMLCanvasElement;
// const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

export namespace Enum {
    export enum BlockShape { I, O, T, S, Z, J, L }
    export enum Operation { Addition, Subtraction, Multiplication, Division }
    const ops:Record<string, Operation> = { ["+"]: Operation.Addition, ["-"]: Operation.Subtraction, ["*"]: Operation.Multiplication, ["/"]: Operation.Division };
    export function OperationFromString(op:string) : Operation {
        return ops[op] ?? Operation.Addition;
    }
    export class Level {
        constructor(id:number, speed:number, nameFormat:string="Level ${id}") {
            this.Id = id;
            this.Name = nameFormat
            .replaceAll("\$\{id\}",id.toString())
            .replaceAll("\$\{speed\}",speed.toString());
            this.Speed = speed;
        }
        readonly Id:number;
        readonly Speed:number;
        readonly Name:string;
    }
    export const Levels = [
        new Level(1,1.0),
        new Level(2,1.2),
        new Level(3,1.5),
        new Level(4,2.0),
        new Level(5,2.5),
        new Level(6,3.0)
    ]
}

class Utils {
    static OverflowOperate(n0:number, n1:number, underflow:number, overflow:number, operation:Enum.Operation|string=Enum.Operation.Addition) : number {
        if (typeof operation === "string") operation = Enum.OperationFromString(operation);
        if (operation === Enum.Operation.Addition)
            n0+=n1;
        else if (operation === Enum.Operation.Subtraction)
            n0-=n1;
        else if (operation === Enum.Operation.Multiplication)
            n0*=n1;
        else if (operation === Enum.Operation.Division)
            n0/=n1;
        if (n0 < underflow)
            return overflow;
        if (n0 > overflow)
            return underflow;
        return n0;
    }
    static RandomRange(min:number, max:number) : number {
        return Math.floor(Math.random()*max-min) + min;
    }
    static PickRandomFromArray(arr:Array<any>) {
        return arr[this.RandomRange(0,arr.length-1)];
    }
    static PickRandomFromDict(dict:Record<any,any>) {
        return dict[this.PickRandomFromArray(Object.keys(dict))];
    }
}

class Canvas2D {
    constructor(canvas:HTMLCanvasElement, ctx?:CanvasRenderingContext2D) {
        this.Canvas = canvas;
        this.Context = ctx ?? canvas.getContext("2d") as CanvasRenderingContext2D;
    }
    Canvas:HTMLCanvasElement;
    Context:CanvasRenderingContext2D;
    ClearCanvas() {
        this.Context.clearRect(0,0,this.Canvas.width,this.Canvas.height);
    }
}

class Game {
    static readonly PixelSize:number = 16;
    static readonly Width:number = 10;
    static readonly Height:number = 20;
    static readonly BaseSpeedMs:number = 1000.0;
    static Paused:boolean = true;
    static CurrentBlock?:BlockInstance;
    static readonly GameCanvas:Canvas2D = new Canvas2D(document.getElementById("game") as HTMLCanvasElement);
    static readonly BlockCanvas:Canvas2D = new Canvas2D(document.getElementById("block") as HTMLCanvasElement);
    static readonly StaleCanvas:Canvas2D = new Canvas2D(document.getElementById("stale") as HTMLCanvasElement);
    private static Level:Enum.Level;
    private static Running:boolean;
    private static _data:(number|BlockData)[][];
    private static _time:number;
    private static _thread_id:number|null;
    private static GridDrawn:boolean = false;
    static get Speed() : number {
        return this.BaseSpeedMs / this.Level.Speed;
    }
    static get Data() : readonly (readonly (number|BlockData)[])[] {
        return this._data;
    }
    static get Time() : number {
        return this._time;
    }
    private static Reset() {
        this.Running = false;
        this.Paused = true;
        this._time = 0;
        this.Level = Enum.Levels[0];
        if (!this.GridDrawn)
            this.DrawGrid();
    }
    static NewGame() {
        this.Reset();
        this._data = [];
        for (let y=0; y<this.Height; y++) {
            this._data[y] = [];
            for (let x=0; x<this.Width; x++)
                this._data[y][x] = 0;
        }
    }
    static StartGame() {
        if (this.Running) return;
        this.Running = true;
        this.Paused = false;
        if (this._thread_id !== null) clearInterval(this._thread_id);
        // this._thread_id = setInterval(()=>{
        //     setTimeout(()=>{
        //         if (this.CurrentBlock && !this.CurrentBlock.Move(0,-1)) {
        //             this.CurrentBlock.Stamp();
        //             this.CurrentBlock = this.RandomBlock();
        //         }
        //     }, this.Level.Speed)
        // });
    }
    static RandomBlock() : BlockInstance {
        return new BlockInstance(Utils.PickRandomFromDict(Blocks));
    }
    static DrawGrid() {
        this.GridDrawn = true;
        this.GameCanvas.Context.strokeStyle = "white";
        this.GameCanvas.Context.lineWidth = 1;
        for (let x=0; x<this.Width; x++) {
            this.GameCanvas.Context.beginPath();
            this.GameCanvas.Context.moveTo(x*this.PixelSize,0);
            this.GameCanvas.Context.lineTo(x*this.PixelSize,this.Height*this.PixelSize);
            this.GameCanvas.Context.stroke();
        }
        for (let y=0; y<this.Height; y++) {
            this.GameCanvas.Context.beginPath();
            this.GameCanvas.Context.moveTo(0,y*this.PixelSize);
            this.GameCanvas.Context.lineTo(this.Width*this.PixelSize,y*this.PixelSize);
            this.GameCanvas.Context.stroke();
        }
    }
    static EraseShape(self:BlockInstance|Game, x?:number, y?:number, shape?:number[][]) {
        if (this !== self && self !== this.CurrentBlock) return;
        if (self instanceof BlockInstance) {
            x??=self.X;
            y??=self.Y;
            shape??=self.CurrentShape;
        } else {
            x??=0;
            y??=0;
            shape??=[];
        }
        for (const [oY, row] of shape.entries()) {
            for (const [oX, col] of row.entries()) {
                if (col === 0) continue;
                this._data[y+oY][x+oX] = 0;
            }
        }
    }
    static WriteShape(self:BlockInstance|Game, x?:number, y?:number, shape?:number[][]) {
        if (this !== self && self !== this.CurrentBlock) return;
        let data;
        if (self instanceof BlockInstance) {
            x??=self.X;
            y??=self.Y;
            shape??=self.CurrentShape;
            data = self.Data;
        } else {
            x??=0;
            y??=0;
            shape??=[];
            data = new BlockData("white");
        }
        for (const [oY, row] of shape.entries()) {
            for (const [oX, col] of row.entries()) {
                if (col === 0) continue;
                this._data[y+oY][x+oX] = data;
            }
        }
    }
    static EraseLine(self:BlockInstance|Game, y?:number) {
        if (this !== self && self !== this.CurrentBlock) return;
        if (self instanceof BlockInstance)
            y??=self.Y;
        else
            y??=0;
        for (let x=0; x<this.Width; x++) {
            this._data[y][x] = 0;
        }
    }
    static RedrawCanvas() {
        this.StaleCanvas.ClearCanvas();
        for (let y=0; y<this.Height; y++) {
            for (let x=0; x<this.Width; x++) {
                const col = this._data[y][x];
                if (col === 0) continue;
                this.StaleCanvas.Context.fillStyle = (col instanceof BlockData) ? col.Color.RGBA : "white";
                this.StaleCanvas.Context.fillRect(x*this.PixelSize,y*this.PixelSize,this.PixelSize,this.PixelSize);
            }
        }
    }
    static BlockStamped(self:BlockInstance) {
        if (self !== this.CurrentBlock) return;
        for (let y = 0; y < this.Height; y++) {
            if (this._data[y].every(col=>col!==0)) {
                this.EraseLine(this, y);
                for (let oY=y-1; oY>=0; oY--) {
                    for (let x=0; x<this.Width; x++) {
                        this._data[oY+1][x] = this._data[oY][x];
                    }
                }
            }
        }
        this.RedrawCanvas();
        this.CurrentBlock = this.RandomBlock();
        this.CurrentBlock.Draw();
    }
}

class Color {
    constructor(r:number, g:number, b:number, opacity:number=1.0) {
        this._rgb = `rgba(${r},${g},${b}`;
        this.Opacity = opacity;
    }
    static fromHex(hex:string) {
        hex.replace("#","");
        const r = parseInt(hex.substring(0,2),16);
        const g = parseInt(hex.substring(2,4),16);
        const b = parseInt(hex.substring(4,6),16);
        const o = parseInt(hex.substring(6,8),16);
        return new Color(r,g,b,o/255);
    }
    private _rgb:string;
    Opacity:number;
    get RGBA() : string {
        console.log(`${this._rgb},${this.Opacity})`)
        return `${this._rgb},${this.Opacity})`;
    }
    toString() : string {
        return this.RGBA;
    }
}

class BlockData {
    constructor(color:Color|string=Color.fromHex("#FFFFFF")) {
        if (typeof color === "string") color = Color.fromHex(color);
        this.Color = color;
    }
    Color:Color;
}

class Block {
    constructor(blockShapes:number[][][], blockData:BlockData) {
        this.Shapes = blockShapes;
        this.Data = blockData;
    }
    readonly Shapes:number[][][];
    readonly Data:BlockData;
}

class BlockInstance extends Block {
    constructor(block:Block) {
        super(block.Shapes, block.Data);
    }
    private _x:number = 0;
    private _y:number = 0;
    get X() : number {
        return this._x;
    }
    get Y() : number {
        return this._y;
    }
    get CurrentShape() : number[][] {
        return this.Shapes[this.Rotation];
    }
    Rotation:number = 0;
    private IsValidPosition(x:number=this._x, y:number=this._y, shape:number[][]=this.CurrentShape) : boolean {
        for (const [oY, row] of shape.entries()) {
            for (const [oX, col] of row.entries()) {
                if (col === 0) continue;
                if (Game.Data[y+oY] === undefined || Game.Data[x+oX] === undefined) return false;
                if (Game.Data[y+oY][x+oX] !== 0)
                    return false;
            }
        }
        return true;
    }
    Move(x:number=0, y:number=0) : boolean {
        x+=this._x;y+=this._y;
        if (!this.IsValidPosition(x,y)) return false;
        this._x = x;this._y = y;
        this.Draw();
        return true;
    }
    Rotate(reverse:boolean=true) {
        let dir:number = (reverse) ? -1 : 1;
        const oldRot = this.Rotation;
        this.Rotation = Utils.OverflowOperate(this.Rotation,dir,0,3);
        if (!this.IsValidPosition()) {
            this.Rotation = oldRot;
            return false;
        }
        this.Draw();
        return true;
    }
    Draw(canvas:Canvas2D=Game.BlockCanvas) {
        if (!this.IsValidPosition()) return;
        if (canvas === Game.BlockCanvas) canvas.ClearCanvas();
        canvas.Context.fillStyle = this.Data.Color.RGBA;
        for (const [oY, row] of this.CurrentShape.entries()) {
            for (const [oX, col] of row.entries()) {
                if (col === 0) continue;
                canvas.Context.fillRect(this._x*Game.PixelSize+oX*Game.PixelSize,this._y*Game.PixelSize+oY*Game.PixelSize,Game.PixelSize,Game.PixelSize);
            }
        }
    }
    Stamp() {
        this.Draw(Game.StaleCanvas);
        Game.WriteShape(this, this._x, this._y, this.CurrentShape);
        Game.BlockStamped(this);
    }
    InstantDrop() {
        while (this.Move(0,1)) {}
        this.Stamp();
    }
}

const Blocks = {
    [Enum.BlockShape.I]: new Block(
        [
            [
                [0,0,0,0],
                [1,1,1,1],
                [0,0,0,0],
                [0,0,0,0]
            ],
            [
                [0,0,1,0],
                [0,0,1,0],
                [0,0,1,0],
                [0,0,1,0]
            ],
            [
                [0,0,0,0],
                [0,0,0,0],
                [1,1,1,1],
                [0,0,0,0]
            ],
            [
                [0,1,0,0],
                [0,1,0,0],
                [0,1,0,0],
                [0,1,0,0]
            ]
        ],
        new BlockData("#31C7EF")
    ),
    [Enum.BlockShape.O]: new Block(
        [
            [
                [1,1],
                [1,1]
            ],
            [
                [1,1],
                [1,1]
            ],
            [
                [1,1],
                [1,1]
            ],
            [
                [1,1],
                [1,1]
            ]
        ],
        new BlockData("#F7D308")
    ),
    [Enum.BlockShape.T]: new Block(
        [
            [
                [0,1,0],
                [1,1,1],
                [0,0,0]
            ],
            [
                [0,1,0],
                [0,1,1],
                [0,1,0]
            ],
            [
                [0,0,0],
                [1,1,1],
                [0,1,0]
            ],
            [
                [0,1,0],
                [1,1,0],
                [0,1,0]
            ]
        ],
        new BlockData("#AD4D9C")
    ),
    [Enum.BlockShape.S]: new Block(
        [
            [
                [0,1,1],
                [1,1,0],
                [0,0,0]
            ],
            [
                [0,1,0],
                [0,1,1],
                [0,0,1]
            ],
            [
                [0,0,0],
                [0,1,1],
                [1,1,0]
            ],
            [
                [0,1,0],
                [0,1,1],
                [0,0,1]
            ]
        ],
        new BlockData("#42B642")
    ),
    [Enum.BlockShape.Z]: new Block(
        [
            [
                [1,1,0],
                [0,1,1],
                [0,0,0]
            ],
            [
                [0,0,1],
                [0,1,1],
                [0,1,0]
            ],
            [
                [0,0,0],
                [1,1,0],
                [0,1,1]
            ],
            [
                [0,1,0],
                [1,1,0],
                [1,0,0]
            ]
        ],
        new BlockData("#EF2029")
    ),
    [Enum.BlockShape.J]: new Block(
        [
            [
                [1,0,0],
                [1,1,1],
                [0,0,0]
            ],
            [
                [0,1,1],
                [0,1,0],
                [0,1,0]
            ],
            [
                [0,0,0],
                [1,1,1],
                [0,0,1]
            ],
            [
                [0,1,0],
                [0,1,0],
                [1,1,0]
            ]
        ],
        new BlockData("#5A65AD")
    ),
    [Enum.BlockShape.L]: new Block(
        [
            [
                [0,0,1],
                [1,1,1],
                [0,0,0]
            ],
            [
                [0,1,0],
                [0,1,0],
                [0,1,1]
            ],
            [
                [0,0,0],
                [1,1,1],
                [1,0,0]
            ],
            [
                [1,1,0],
                [0,1,0],
                [0,1,0]
            ]
        ],
        new BlockData("#EF7921")
    )
}

function onResize() {
    document.querySelectorAll<HTMLElement>(".game-canvas").forEach(canvas=>{
        if (window.innerWidth >= window.innerHeight) {
            canvas.style.height = "100%";
            canvas.style.width = "auto";
        } else {
            canvas.style.height = "auto";
            canvas.style.width = "100%";
        }
    });
}

const resizeObserver = new ResizeObserver(onResize);
resizeObserver.observe(document.body);
window.addEventListener("resize",onResize);

window.addEventListener("keydown", event=>{
    if (event.defaultPrevented) return;
    switch (event.key) {
        case " ":
            Game.CurrentBlock = Game.RandomBlock();
            Game.CurrentBlock.Draw();
            break;
        case "Enter":
            Game.CurrentBlock?.Stamp();
            break;
        case "ArrowLeft":
            Game.CurrentBlock?.Move(-1, 0);
            break;
        case "ArrowRight":
            Game.CurrentBlock?.Move(1, 0);
            break;
        case "ArrowDown":
            Game.CurrentBlock?.Move(0, 1);
            break;
        case "ArrowUp":
            Game.CurrentBlock?.Rotate(false);
            break;
        case "z":
            Game.CurrentBlock?.InstantDrop();
            break;
        default: return console.log(event.key);
    }
    event.preventDefault();
}, true);

Game.DrawGrid();
Game.NewGame();
Game.StartGame();