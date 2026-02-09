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
        return (Math.random()*max-min) + min;
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
    static readonly Width:number = 20;
    static readonly Height:number = 10;
    static Paused:boolean = true;
    static CurrentBlock?:BlockInstance;
    static readonly GameCanvas:Canvas2D = new Canvas2D(document.getElementById("game") as HTMLCanvasElement);
    static readonly BlockCanvas:Canvas2D = new Canvas2D(document.getElementById("block") as HTMLCanvasElement);
    private static Level:Enum.Level;
    private static Running:boolean;
    private static _data:number[][];
    private static _time:number;
    private static _thread_id:number|null;
    static get Data() : readonly (readonly number[])[] {
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
        this._thread_id = setInterval(()=>{
            setTimeout(()=>{

            }, this.Level.Speed)
        },0);
    }
    static RandomBlock() : BlockInstance {
        return new BlockInstance(Utils.PickRandomFromDict(Blocks));
    }
}

class BlockData {
    constructor(color:string="black") {
        this.Color = color;
    }
    Color:string;
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
    Rotation:number = 0;
    private GetCurrentShape() : number[][] {
        return this.Shapes[this.Rotation];
    }
    private IsValidPosition(x:number=this._x, y:number=this._y, shape:number[][]=this.GetCurrentShape()) {
        for (const [oX, row] of shape.entries()) {
            for (const [oY, col] of row.entries()) {
                if (col === 0) continue;
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
        let dir:number = (reverse) ? 1 : -1;
        this.Rotation = Utils.OverflowOperate(this.Rotation,dir,0,270);
        this.Draw();
    }
    Draw() {
        if (!this.IsValidPosition()) return;
        Game.BlockCanvas.ClearCanvas();
        for (const [oX, row] of this.GetCurrentShape().entries()) {
            for (const [oY, col] of row.entries()) {
                if (col === 0) continue;
                Game.BlockCanvas.Context.fillStyle = this.Data.Color;
                Game.BlockCanvas.Context.fillRect(this._x+(oX*Game.PixelSize),this._y+(oY*Game.PixelSize),Game.PixelSize,Game.PixelSize);
            }
        }
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
        default: return;
    }
    event.preventDefault();
}, true);