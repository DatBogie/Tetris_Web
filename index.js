// const canvas = document.getElementById("canvas") as HTMLCanvasElement;
// const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
export var Enum;
(function (Enum) {
    let BlockShape;
    (function (BlockShape) {
        BlockShape[BlockShape["I"] = 0] = "I";
        BlockShape[BlockShape["O"] = 1] = "O";
        BlockShape[BlockShape["T"] = 2] = "T";
        BlockShape[BlockShape["S"] = 3] = "S";
        BlockShape[BlockShape["Z"] = 4] = "Z";
        BlockShape[BlockShape["J"] = 5] = "J";
        BlockShape[BlockShape["L"] = 6] = "L";
    })(BlockShape = Enum.BlockShape || (Enum.BlockShape = {}));
    let Operation;
    (function (Operation) {
        Operation[Operation["Addition"] = 0] = "Addition";
        Operation[Operation["Subtraction"] = 1] = "Subtraction";
        Operation[Operation["Multiplication"] = 2] = "Multiplication";
        Operation[Operation["Division"] = 3] = "Division";
    })(Operation = Enum.Operation || (Enum.Operation = {}));
    const ops = { ["+"]: Operation.Addition, ["-"]: Operation.Subtraction, ["*"]: Operation.Multiplication, ["/"]: Operation.Division };
    function OperationFromString(op) {
        return ops[op] ?? Operation.Addition;
    }
    Enum.OperationFromString = OperationFromString;
    class Level {
        constructor(id, speed, nameFormat = "Level ${id}") {
            this.Id = id;
            this.Name = nameFormat
                .replaceAll("\$\{id\}", id.toString())
                .replaceAll("\$\{speed\}", speed.toString());
            this.Speed = speed;
        }
        Id;
        Speed;
        Name;
    }
    Enum.Level = Level;
    Enum.Levels = [
        new Level(1, 1.0),
        new Level(2, 1.2),
        new Level(3, 1.5),
        new Level(4, 2.0),
        new Level(5, 2.5),
        new Level(6, 3.0)
    ];
})(Enum || (Enum = {}));
class Utils {
    static OverflowOperate(n0, n1, underflow, overflow, operation = Enum.Operation.Addition) {
        if (typeof operation === "string")
            operation = Enum.OperationFromString(operation);
        if (operation === Enum.Operation.Addition)
            n0 += n1;
        else if (operation === Enum.Operation.Subtraction)
            n0 -= n1;
        else if (operation === Enum.Operation.Multiplication)
            n0 *= n1;
        else if (operation === Enum.Operation.Division)
            n0 /= n1;
        if (n0 < underflow)
            return overflow;
        if (n0 > overflow)
            return underflow;
        return n0;
    }
    static RandomRange(min, max) {
        return (Math.random() * max - min) + min;
    }
    static PickRandomFromArray(arr) {
        return arr[this.RandomRange(0, arr.length - 1)];
    }
    static PickRandomFromDict(dict) {
        return dict[this.PickRandomFromArray(Object.keys(dict))];
    }
}
class Canvas2D {
    constructor(canvas, ctx) {
        this.Canvas = canvas;
        this.Context = ctx ?? canvas.getContext("2d");
    }
    Canvas;
    Context;
    ClearCanvas() {
        this.Context.clearRect(0, 0, this.Canvas.width, this.Canvas.height);
    }
}
class Game {
    static PixelSize = 16;
    static Width = 20;
    static Height = 10;
    static Paused = true;
    static CurrentBlock;
    static GameCanvas = new Canvas2D(document.getElementById("game"));
    static BlockCanvas = new Canvas2D(document.getElementById("block"));
    static Level;
    static Running;
    static _data;
    static _time;
    static _thread_id;
    static get Data() {
        return this._data;
    }
    static get Time() {
        return this._time;
    }
    static Reset() {
        this.Running = false;
        this.Paused = true;
        this._time = 0;
        this.Level = Enum.Levels[0];
    }
    static NewGame() {
        this.Reset();
        this._data = [];
        for (let y = 0; y < this.Height; y++) {
            this._data[y] = [];
            for (let x = 0; x < this.Width; x++)
                this._data[y][x] = 0;
        }
    }
    static StartGame() {
        if (this.Running)
            return;
        this.Running = true;
        this.Paused = false;
        if (this._thread_id !== null)
            clearInterval(this._thread_id);
        this._thread_id = setInterval(() => {
            setTimeout(() => {
            }, this.Level.Speed);
        }, 0);
    }
    static RandomBlock() {
        return new BlockInstance(Utils.PickRandomFromDict(Blocks));
    }
}
class BlockData {
    constructor(color = "black") {
        this.Color = color;
    }
    Color;
}
class Block {
    constructor(blockShapes, blockData) {
        this.Shapes = blockShapes;
        this.Data = blockData;
    }
    Shapes;
    Data;
}
class BlockInstance extends Block {
    constructor(block) {
        super(block.Shapes, block.Data);
    }
    _x = 0;
    _y = 0;
    get X() {
        return this._x;
    }
    get Y() {
        return this._y;
    }
    Rotation = 0;
    GetCurrentShape() {
        return this.Shapes[this.Rotation];
    }
    IsValidPosition(x = this._x, y = this._y, shape = this.GetCurrentShape()) {
        for (const [oX, row] of shape.entries()) {
            for (const [oY, col] of row.entries()) {
                if (col === 0)
                    continue;
                if (Game.Data[y + oY][x + oX] !== 0)
                    return false;
            }
        }
        return true;
    }
    Move(x = 0, y = 0) {
        x += this._x;
        y += this._y;
        if (!this.IsValidPosition(x, y))
            return false;
        this._x = x;
        this._y = y;
        this.Draw();
        return true;
    }
    Rotate(reverse = true) {
        let dir = (reverse) ? 1 : -1;
        this.Rotation = Utils.OverflowOperate(this.Rotation, dir, 0, 270);
        this.Draw();
    }
    Draw() {
        if (!this.IsValidPosition())
            return;
        Game.BlockCanvas.ClearCanvas();
        for (const [oX, row] of this.GetCurrentShape().entries()) {
            for (const [oY, col] of row.entries()) {
                if (col === 0)
                    continue;
                Game.BlockCanvas.Context.fillStyle = this.Data.Color;
                Game.BlockCanvas.Context.fillRect(this._x + (oX * Game.PixelSize), this._y + (oY * Game.PixelSize), Game.PixelSize, Game.PixelSize);
            }
        }
    }
}
const Blocks = {
    [Enum.BlockShape.I]: new Block([
        [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0]
        ],
        [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ]
    ], new BlockData("#31C7EF")),
    [Enum.BlockShape.O]: new Block([
        [
            [1, 1],
            [1, 1]
        ],
        [
            [1, 1],
            [1, 1]
        ],
        [
            [1, 1],
            [1, 1]
        ],
        [
            [1, 1],
            [1, 1]
        ]
    ], new BlockData("#F7D308")),
    [Enum.BlockShape.T]: new Block([
        [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        [
            [0, 1, 0],
            [0, 1, 1],
            [0, 1, 0]
        ],
        [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0]
        ],
        [
            [0, 1, 0],
            [1, 1, 0],
            [0, 1, 0]
        ]
    ], new BlockData("#AD4D9C")),
    [Enum.BlockShape.S]: new Block([
        [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        [
            [0, 1, 0],
            [0, 1, 1],
            [0, 0, 1]
        ],
        [
            [0, 0, 0],
            [0, 1, 1],
            [1, 1, 0]
        ],
        [
            [0, 1, 0],
            [0, 1, 1],
            [0, 0, 1]
        ]
    ], new BlockData("#42B642")),
    [Enum.BlockShape.Z]: new Block([
        [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        [
            [0, 0, 1],
            [0, 1, 1],
            [0, 1, 0]
        ],
        [
            [0, 0, 0],
            [1, 1, 0],
            [0, 1, 1]
        ],
        [
            [0, 1, 0],
            [1, 1, 0],
            [1, 0, 0]
        ]
    ], new BlockData("#EF2029")),
    [Enum.BlockShape.J]: new Block([
        [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        [
            [0, 1, 1],
            [0, 1, 0],
            [0, 1, 0]
        ],
        [
            [0, 0, 0],
            [1, 1, 1],
            [0, 0, 1]
        ],
        [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 0]
        ]
    ], new BlockData("#5A65AD")),
    [Enum.BlockShape.L]: new Block([
        [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 1]
        ],
        [
            [0, 0, 0],
            [1, 1, 1],
            [1, 0, 0]
        ],
        [
            [1, 1, 0],
            [0, 1, 0],
            [0, 1, 0]
        ]
    ], new BlockData("#EF7921"))
};
function onResize() {
    document.querySelectorAll(".game-canvas").forEach(canvas => {
        if (window.innerWidth >= window.innerHeight) {
            canvas.style.height = "100%";
            canvas.style.width = "auto";
        }
        else {
            canvas.style.height = "auto";
            canvas.style.width = "100%";
        }
    });
}
const resizeObserver = new ResizeObserver(onResize);
resizeObserver.observe(document.body);
window.addEventListener("resize", onResize);
window.addEventListener("keydown", event => {
    if (event.defaultPrevented)
        return;
    switch (event.key) {
        case " ":
            Game.CurrentBlock = Game.RandomBlock();
            Game.CurrentBlock.Draw();
            break;
        default: return;
    }
    event.preventDefault();
}, true);
