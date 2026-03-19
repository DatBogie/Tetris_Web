// const canvas = document.getElementById("canvas") as HTMLCanvasElement;
// const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

var PauseMenuSel = 0;
var PauseBtns:HTMLElement[] = Array.from(document.querySelectorAll("#pause-btns > .keyboard-selectable"));

function updateSelectionButtons(detailsSel?:HTMLDetailsElement) : void {
    const modal = document.querySelector(".modal.active");
    const btns:HTMLElement[] = Array.from(modal? modal.querySelectorAll(".modal-content .keyboard-selectable") : document.querySelectorAll("#pause-btns > .keyboard-selectable"));
    const tBtns:HTMLElement[] = [];
    for (const btn of btns.values()) {
        const details:HTMLDetailsElement = btn.parentElement?.parentElement?.parentElement?.parentElement as HTMLDetailsElement;
        if (!btn.classList.contains("hidden") && (!details || !(details instanceof HTMLDetailsElement) || details.open)) {
            tBtns.push(btn);
        }
    }
    PauseMenuSel = !detailsSel? 0 : tBtns.indexOf(detailsSel.querySelector("summary") ?? detailsSel) ?? 0;
    PauseBtns = tBtns;
    focusButton();
}

function isChildOverflown(el:HTMLElement,parent:HTMLElement=el.parentElement as HTMLElement) : boolean {
    if (!parent) return true;
    const cRect = el.getBoundingClientRect();
    const pRect = parent.getBoundingClientRect();
    return (
        cRect.top >= pRect.bottom ||
        cRect.right <= pRect.left ||
        cRect.bottom <= pRect.top ||
        cRect.left >= pRect.right
    );
}

function focusButton() {
    setTimeout(()=>{
        PauseBtns[PauseMenuSel]?.focus();
    },1);
}

function getAttr(instance:any,attr:string) : any {
    return instance[attr];
}
function setAttr(instance:any,attr:string,value:any) : void {
    instance[attr] = value;
}

export namespace Enum {
    export enum BlockShape { I, O, T, S, Z, J, L }
    export class CustomBlockShape {
        static get length() : number {
            let i = 0;
            for (const _ of Object.keys(Blocks))
                i++;
            return i;
        }
        constructor(symbol:string,block:Block) {
            this.Symbol = symbol;
            this.Block = block;
            this.index = CustomBlockShape.length;
            Blocks[this.index] = block;
        }
        Symbol:string;
        Block:Block;
        readonly index:number;
    }
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
    export enum ThemeStyle { Dark, Light }
    export enum UIThemeKey { olc, rosewater, flamingo, pink, mauve, red, maroon, peach, yellow, green, teal, sky, sapphire, blue, lavender, text, subtext1, subtext0, overlay2, overlay1, overlay0, surface2, surface1, surface0, base, mantle, crust, accent }
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
        return Math.floor(Math.random()*(max+1)-min) + min;
    }
    static PickRandomFromArray(arr:Array<any>) : any {
        return arr[this.RandomRange(0,arr.length-1)];
    }
    static PickRandomFromDict(dict:Record<any,any>) : any {
        return dict[this.PickRandomFromArray(Object.keys(dict))];
    }
    static MergeDicts(x:Record<any,any>, d:Record<any,any>) : Record<any,any> {
        for (const [k,v] of Object.entries(d)) {
            x[k] ??= v;
        }
        return x;
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

class Point {
    constructor(x:number, y:number) {
        this.X = x;
        this.Y = y;
    }
    readonly X:number;
    readonly Y:number;
}

class ColorPalette {
    constructor(name:string,blocktheme?:Record<Enum.BlockShape|number,Color>,uitheme?:UITheme,style:Enum.ThemeStyle=Enum.ThemeStyle.Dark) {
        this.Name = name;
        this.BlockTheme = blocktheme;
        this.Style = style;
        if (uitheme?.Name === undefined || uitheme?.Style === undefined)
            uitheme?.setPropertiesFromPalette(this);
        this.UITheme = uitheme;
    }
    readonly Name:string;
    readonly BlockTheme?:Record<Enum.BlockShape|number,Color>;
    readonly UITheme?:UITheme;
    readonly Style:Enum.ThemeStyle;
}

class UITheme {
    constructor(name:string|undefined,data:Record<Enum.UIThemeKey,Color>,style?:Enum.ThemeStyle) {
        this.name = name;
        this.Data = data;
        this.style = style;
    }
    private name?:string;
    get Name() : string|undefined {
        return this.name;
    }
    readonly Data:Record<Enum.UIThemeKey,Color>;
    private style?:Enum.ThemeStyle;
    get Style() : Enum.ThemeStyle|undefined {
        return this.style;
    }
    setPropertiesFromPalette(palette:ColorPalette) : void {
        this.name ??= palette.Name;
        this.style ??= palette.Style;
    }
}

class Color {
    constructor(r:number, g:number, b:number, opacity:number=1.0) {
        this._rgb = `rgba(${r},${g},${b}`;
        this.Opacity = opacity;
    }
    static fromHex(hex:string) {
        hex = hex.replace("#","");
        const r = parseInt(hex.substring(0,2),16);
        const g = parseInt(hex.substring(2,4),16);
        const b = parseInt(hex.substring(4,6),16);
        let o = 255;
        if (hex.length > 6)
            o = parseInt(hex.substring(6,8),16);
        return new Color(r,g,b,o/255);
    }
    /*
     * Adapted version of https://gist.github.com/mjackson/5311256 > hslToRgb()
     */
    static fromHSLA(h:number,s:number,l:number,a?:number) {
        s/=100; l/=100;
        if (s === 0) {
            l*=255;
            return new Color(l,l,l,a);
        } else {
            function hue2rgb(p:number, q:number, t:number) : number {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            return new Color(hue2rgb(p, q, h + 1/3),hue2rgb(p, q, h),hue2rgb(p, q, h - 1/3),a);
        }
    }
    private _rgb:string;
    Opacity:number;
    get RGBA() : string {
        return `${this._rgb},${this.Opacity})`;
    }
    WithOpacity(opacity:number) : string {
        let o = this.Opacity;
        this.Opacity = opacity;
        const s = this.RGBA;
        this.Opacity = o;
        return s;
    }
    toString() : string {
        return this.RGBA;
    }
}

// Source - https://stackoverflow.com/a/39914235
// Posted by Dan Dascalescu, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-18, License - CC BY-SA 4.0
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

class Game {
    static Anims:boolean = true;
    static Physics:boolean = false;
    static KeyBinds:Record<string,string> = {}
    static ColorPalettes:ColorPalette[] = [
        new ColorPalette("Catpuccin Macchiato",{
            [Enum.BlockShape.I]: Color.fromHex("#91d7e3"),
            [Enum.BlockShape.J]: Color.fromHex("#eed49f"),
            [Enum.BlockShape.L]: Color.fromHex("#c6a0f6"),
            [Enum.BlockShape.O]: Color.fromHex("#a6da95"),
            [Enum.BlockShape.S]: Color.fromHex("#ed8796"),
            [Enum.BlockShape.T]: Color.fromHex("#b7bdf8"),
            [Enum.BlockShape.Z]: Color.fromHex("#f5a97f")
        },new UITheme(undefined,{
            [Enum.UIThemeKey.olc]: Color.fromHSLA(0,0,100,.25),
            [Enum.UIThemeKey.rosewater]: Color.fromHex("#f4dbd6"),
            [Enum.UIThemeKey.flamingo]: Color.fromHex("#f0c6c6"),
            [Enum.UIThemeKey.pink]: Color.fromHex("#f5bde6"),
            [Enum.UIThemeKey.mauve]: Color.fromHex("#c6a0f6"),
            [Enum.UIThemeKey.red]: Color.fromHex("#ed8796"),
            [Enum.UIThemeKey.maroon]: Color.fromHex("#ee99a0"),
            [Enum.UIThemeKey.peach]: Color.fromHex("#f5a97f"),
            [Enum.UIThemeKey.yellow]: Color.fromHex("#eed496"),
            [Enum.UIThemeKey.green]: Color.fromHex("#a6da95"),
            [Enum.UIThemeKey.teal]: Color.fromHex("#8bd5ca"),
            [Enum.UIThemeKey.sky]: Color.fromHex("#91d7e3"),
            [Enum.UIThemeKey.sapphire]: Color.fromHex("#7dc4e4"),
            [Enum.UIThemeKey.blue]: Color.fromHex("#8aadf4"),
            [Enum.UIThemeKey.lavender]: Color.fromHex("#b7bdf8"),
            [Enum.UIThemeKey.text]: Color.fromHex("#cad3f5"),
            [Enum.UIThemeKey.subtext1]: Color.fromHex("#b8c0e0"),
            [Enum.UIThemeKey.subtext0]: Color.fromHex("#a5adcb"),
            [Enum.UIThemeKey.overlay2]: Color.fromHex("#939ab7"),
            [Enum.UIThemeKey.overlay1]: Color.fromHex("#8087a2"),
            [Enum.UIThemeKey.overlay0]: Color.fromHex("#6e738d"),
            [Enum.UIThemeKey.surface2]: Color.fromHex("#5b6078"),
            [Enum.UIThemeKey.surface1]: Color.fromHex("#494d64"),
            [Enum.UIThemeKey.surface0]: Color.fromHex("#363a4f"),
            [Enum.UIThemeKey.base]: Color.fromHex("#24273a"),
            [Enum.UIThemeKey.mantle]: Color.fromHex("#1e2030"),
            [Enum.UIThemeKey.crust]: Color.fromHex("#181926"),
            [Enum.UIThemeKey.accent]: Color.fromHex("#b7bdf8")
        }),Enum.ThemeStyle.Dark)
    ];
    // static readonly PixelSize:number = 32;
    // (320 + 640) / (10 + 20)
    // ((10 + 20) / (320 + 640)) * 1024
    // 32 + (height/)
    static get PixelSize() : number {
        return Math.min(Game.GameCanvas.Canvas.width/Game.Width,Game.GameCanvas.Canvas.height/Game.Height);
        // return (Game.GameCanvas.Canvas.width/Game.Width);
        // return clamp(((Game.Width + Game.Height) / (Game.GameCanvas.Canvas.width + Game.GameCanvas.Canvas.height)) * 1024,0,32);
        // return clamp((Game.GameCanvas.Canvas.width + Game.GameCanvas.Canvas.height) / (Game.Width + Game.Height),0,32);
    }
    static Width:number = 10;
    static Height:number = 20;
    static readonly BaseSpeedMs:number = 1000.0;
    static GhostBlockOpacity:number = 0.25;
    static Paused:boolean = true;
    static CurrentBlock?:BlockInstance;
    static readonly BgCanvas:Canvas2D = new Canvas2D(document.getElementById("bg") as HTMLCanvasElement);
    static readonly GameCanvas:Canvas2D = new Canvas2D(document.getElementById("game") as HTMLCanvasElement);
    static readonly BlockCanvas:Canvas2D = new Canvas2D(document.getElementById("block") as HTMLCanvasElement);
    static readonly StaleCanvas:Canvas2D = new Canvas2D(document.getElementById("stale") as HTMLCanvasElement);
    private static Level:Enum.Level;
    static get Running() : boolean {
        return Game._running
    }
    private static _running:boolean;
    private static _data:(number|BlockData)[][];
    private static _time:number;
    private static _thread_id:number|null;
    private static GridDrawn:boolean = false;
    static get CenterPoint() : Point {
        return new Point(
            Game.GameCanvas.Canvas.width/2,
            Game.GameCanvas.Canvas.height/2,
        );
    }
    static get GameOffset() : Point {
        return new Point(
            Game.CenterPoint.X-(Game.Width*Game.PixelSize)/2,
            Game.CenterPoint.Y-(Game.Height*Game.PixelSize)/2,
        );
    }
    static get Speed() : number {
        return Game.BaseSpeedMs / Game.Level.Speed;
    }
    static get Data() : readonly (readonly (number|BlockData)[])[] {
        return Game._data;
    }
    static get Time() : number {
        return Game._time;
    }
    static Reset() {
        Game._running = false;
        Game.TogglePause(true);
        Game._time = 0;
        Game.Level = Enum.Levels[0];
        if (!Game.GridDrawn)
            Game.DrawGrid();
        Game.BlockCanvas.ClearCanvas();
        Game.StaleCanvas.ClearCanvas();
        Game._data = [];
        for (let y=0; y<Game.Height; y++) {
            Game._data[y] = [];
            for (let x=0; x<Game.Width; x++)
                Game._data[y][x] = 0;
        }
    }
    static NewGame() {
        Game.Reset();
    }
    private static GameTick() {
        if (Game.Paused) return;
        if (Game.CurrentBlock && !Game.CurrentBlock.Move(0,1)) {
            Game.CurrentBlock.Stamp();
        }
    }
    static StartGame() {
        if (Game._running) return;
        Game._running = true;
        Game.TogglePause(false);
        Game.CurrentBlock = Game.RandomBlock();
        Game.CurrentBlock.Draw();
        if (Game._thread_id !== null) clearInterval(Game._thread_id);
        Game._thread_id = setInterval(Game.GameTick,Game.Speed);
    }
    static RandomBlock() : BlockInstance {
        return new BlockInstance(Utils.PickRandomFromDict(Blocks));
    }
    static DrawGrid() {
        Game.GridDrawn = true;
        Game.GameCanvas.ClearCanvas();
        Game.BgCanvas.ClearCanvas();
        Game.BgCanvas.Context.fillStyle = "#1e2030";
        Game.BgCanvas.Context.fillRect(Game.GameOffset.X,Game.GameOffset.Y,Game.Width*Game.PixelSize,Game.Height*Game.PixelSize);
        Game.GameCanvas.Context.strokeStyle = "#18192680";
        Game.GameCanvas.Context.lineWidth = 1;
        for (let x=0; x<=Game.Width; x++) {
            Game.GameCanvas.Context.beginPath();
            Game.GameCanvas.Context.moveTo(Game.GameOffset.X+x*Game.PixelSize,Game.GameOffset.Y);
            Game.GameCanvas.Context.lineTo(Game.GameOffset.X+x*Game.PixelSize,Game.GameOffset.Y+Game.Height*Game.PixelSize);
            Game.GameCanvas.Context.stroke();
        }
        for (let y=0; y<=Game.Height; y++) {
            Game.GameCanvas.Context.beginPath();
            Game.GameCanvas.Context.moveTo(Game.GameOffset.X,Game.GameOffset.Y+y*Game.PixelSize);
            Game.GameCanvas.Context.lineTo(Game.GameOffset.X+Game.Width*Game.PixelSize,Game.GameOffset.Y+y*Game.PixelSize);
            Game.GameCanvas.Context.stroke();
        }
    }
    static EraseShape(self:BlockInstance|Game, x?:number, y?:number, shape?:number[][]) {
        if (Game !== self && self !== Game.CurrentBlock) return;
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
                Game._data[y+oY][x+oX] = 0;
            }
        }
    }
    static WriteShape(self:BlockInstance|Game, x?:number, y?:number, shape?:number[][]) {
        if (Game !== self && self !== Game.CurrentBlock) return;
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
                Game._data[y+oY][x+oX] = data;
            }
        }
    }
    static EraseLine(self:BlockInstance|Game, y?:number) {
        if (this !== self && self !== Game.CurrentBlock) return;
        if (self instanceof BlockInstance)
            y??=self.Y;
        else
            y??=0;
        for (let x=0; x<Game.Width; x++) {
            Game._data[y][x] = 0;
        }
    }
    static RedrawCanvas() {
        Game.StaleCanvas.ClearCanvas();
        for (let y=0; y<Game.Height; y++) {
            for (let x=0; x<Game.Width; x++) {
                const col = Game._data[y][x];
                if (col === 0) continue;
                Game.StaleCanvas.Context.fillStyle = (col instanceof BlockData) ? col.Color.RGBA : "white";
                Game.StaleCanvas.Context.fillRect(Game.GameOffset.X+x*Game.PixelSize,Game.GameOffset.Y+y*Game.PixelSize,Game.PixelSize,Game.PixelSize);
            }
        }
    }
    static async InstantDrop(px:number,py:number) {
        if (py >= Game.Height-1 || Game._data[py][px] === undefined) return;
        for (let y = py+1; y<Game.Height; y++) {
            if (Game._data[y][px] !== 0) return;
            Game._data[y][px] = Game._data[py][px];
            Game._data[py][px] = 0;
            py++;
            if (Game.Anims) {
                Game.RedrawCanvas();
                await sleep(20);
            }
        }
    }
    private static async handleClears() : Promise<boolean> {
        var cFlag = false;
        for (let y=0; y < Game.Height; y++) {
            if (Game._data[y].every(col=>col!==0)) {
                Game.EraseLine(Game, y);
                for (let oY=y-1; oY>=0; oY--) {
                    for (let x=0; x<Game.Width; x++) {
                        Game._data[oY+1][x] = Game._data[oY][x];
                        cFlag = true;
                    }
                }
            }
        }
        if (Game.Physics) {
            for (let y=Game.Height-1; y>0; y--) {
                for (let x=0; x<Game.Width; x++) {
                    Game.InstantDrop(x,y);
                    cFlag = true;
                }
            }
        }
        return cFlag;
    }
    static async BlockStamped(self:BlockInstance) {
        if (self !== Game.CurrentBlock) return;
        if (await Game.handleClears())
            await Game.handleClears();
        Game.RedrawCanvas();
        Game.CurrentBlock = Game.RandomBlock();
        if (!Game.CurrentBlock.IsValidPosition()) {
            Game.Reset();
        }
        Game.CurrentBlock.Draw();
    }
    static TogglePause(paused?:boolean) {
        document.querySelectorAll(".modal.active").forEach(el=>{
            el.classList.remove("active");
        });
        if (paused === undefined)
            Game.Paused = !Game.Paused;
        else
            Game.Paused = paused;
        if (Game.Paused)
            document.getElementById("pause-ind")?.classList.add("paused");
        else
            document.getElementById("pause-ind")?.classList.remove("paused");
        document.querySelectorAll(".game-canvas").forEach(canvas=>{
            if (Game.Paused)
                canvas.classList.add("paused");
            else
                canvas.classList.remove("paused");
        });
        if (!Game._running) {
            (document.getElementById("pause-text") as HTMLElement).innerText = "Game Over!";
            (document.getElementById("pause-resume") as HTMLElement).classList.add("hidden");
            (document.getElementById("pause-restart") as HTMLElement).innerText = "Start";
        } else {
            (document.getElementById("pause-text") as HTMLElement).innerText = "Paused...";
            (document.getElementById("pause-resume") as HTMLElement).classList.remove("hidden");
            (document.getElementById("pause-restart") as HTMLElement).innerText = "Restart";
        }
        if (Game.Paused) {
            PauseMenuSel = 0;
            updateSelectionButtons();
        }
    }
}

function clamp(x:number,min:number,max:number) : number {
    return Math.min(Math.max(x,min),max);
}

function dummy(x:any) : any {
    return x;
}

const settingsWin = document.getElementById("settings");
const Settings = {
    Anims: settingsWin?.querySelector("#settings-anims"),
    GhostBlockOpacity: settingsWin?.querySelector("#settings-ghost-opacity"),
    Width: settingsWin?.querySelector("#settings-game-width"),
    Height: settingsWin?.querySelector("#settings-game-height"),
    Physics: settingsWin?.querySelector("#settings-physics")
} as Record<string, HTMLElement|HTMLInputElement>
function handleSettings() : void {
    for (const [k, el] of Object.entries(Settings)) {
        if (el instanceof HTMLInputElement) {
            switch (el.type) {
                case "number":
                    if (el.classList.contains("percent"))
                        el.valueAsNumber = getAttr(Game,k)*100;
                    else
                        el.valueAsNumber = getAttr(Game,k);
                    const funcs:string[] = (el.dataset.funcs ?? "").split(",");
                    el.addEventListener("change",()=>{
                        const min = parseFloat(el.dataset.min ?? "0");
                        const max = parseFloat(el.dataset.max ?? "100");
                        const val = (el.classList.contains("int")? Math.trunc : dummy)(clamp(el.valueAsNumber,min,max));
                        setAttr(Game,k,el.classList.contains("percent")? val/max : val);
                        if (funcs.length !== 0) {
                            for (const f of funcs) {
                                let x:Function|undefined = getAttr(Game,f);
                                if (x === undefined) continue;
                                x();
                            }
                        }
                        el.valueAsNumber = getAttr(Game,k) * (el.classList.contains("percent")? 100 : 1);
                    })
                    break;
                case "checkbox":
                    el.checked = getAttr(Game,k);
                    el.addEventListener("change",()=>{
                        setAttr(Game,k,el.checked);
                    });
                    break;
                default:
                    el.value = getAttr(Game,k);
                    el.addEventListener("change",()=>{
                        setAttr(Game,k,el.value);
                    });
                    break;
            }
        }
    }
}
handleSettings();

class BlockData {
    constructor(color:Color|string=Color.fromHex("#FFFFFFFF")) {
        if (typeof color === "string") color = Color.fromHex(color+"FF");
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
        this._x = Math.floor(Game.Width/2-this.CurrentShape[0].length/2);
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
    IsValidPosition(x:number=this._x, y:number=this._y, shape:number[][]=this.CurrentShape) : boolean {
        for (const [oY, row] of shape.entries()) {
            for (const [oX, col] of row.entries()) {
                if (col === 0) continue;
                if (Game.Data[y+oY] === undefined || Game.Data[0][x+oX] === undefined) return false;
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
    Rotate(reverse:boolean=false) {
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
    private _draw(canvas:Canvas2D=Game.BlockCanvas, x:number=this._x, y:number=this._y) {
        for (const [oY, row] of this.CurrentShape.entries()) {
            for (const [oX, col] of row.entries()) {
                if (col === 0) continue;
                canvas.Context.fillRect(Game.GameOffset.X+x*Game.PixelSize+oX*Game.PixelSize,Game.GameOffset.Y+y*Game.PixelSize+oY*Game.PixelSize,Game.PixelSize,Game.PixelSize);
            }
        }
    }
    Draw(canvas:Canvas2D=Game.BlockCanvas) {
        if (!this.IsValidPosition()) return;
        if (canvas === Game.BlockCanvas) canvas.ClearCanvas();
        canvas.Context.fillStyle = this.Data.Color.RGBA;
        this._draw(canvas);
        // Draw ghost block
        if (canvas === Game.BlockCanvas && this.LowestValidY > this._y) {
            canvas.Context.fillStyle = this.Data.Color.WithOpacity(Game.GhostBlockOpacity);
            this._draw(canvas,undefined,this.LowestValidY);
        }
    }
    Stamp() {
        this.Draw(Game.StaleCanvas);
        Game.WriteShape(this, this._x, this._y, this.CurrentShape);
        Game.BlockStamped(this);
    }
    async InstantDrop() {
        if (!Game.Anims)
            this.Move(0,this.LowestValidY-this._y);
        else {
            for (let i=this._y; i<this.LowestValidY; i++) {
                this.Move(0,1);
                await sleep(2);
            }
        }
        this.Stamp();
    }
    private get LowestValidY() : number {
        let y = this._y;
        while (true) {
            y++;
            if (!this.IsValidPosition(undefined,y)) {
                y--;
                break
            }
        }
        return y;
    }
    private get LowestPoint() : {x:number, y:number} {
        let lowestPoint = { x: 0, y: 0 };
        for (const [oY, row] of this.CurrentShape.entries()) {
            if (oY < lowestPoint.y) continue;
            for (const [oX, col] of row.entries()) {
                if (col === 0) continue;
                lowestPoint = { x: oX, y: oY };
            }
        }
        return lowestPoint;
    }
}

const Blocks:Record<Enum.BlockShape|number,Block> = {
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
        new BlockData("#91d7e3")
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
        new BlockData("#eed49f")
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
        new BlockData("#c6a0f6")
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
        new BlockData("#a6da95")
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
        new BlockData("#ed8796")
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
        new BlockData("#b7bdf8")
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
        new BlockData("#f5a97f")
    )
}

class ModEngine {
    private static ModList:Record<string,Mod> = {};
    static LoadMod(mod:Mod) : boolean {
        if (this.ModList[mod.Namespace] !== undefined) return false;
        this.ModList[mod.Namespace] = mod;
        mod.Load();
        return true;
    }
}

class Mod {
    constructor(ns:string, name:string, desc:string="", onLoad:VoidFunction, blocks?:Record<Enum.BlockShape, Block>) {
        this.Namespace = ns;
        this.Name = name;
        this.Description = desc;
        this.Blocks = blocks;
        this.Load = onLoad;
    };
    readonly Name:string;
    readonly Description:string;
    readonly Namespace:string;
    readonly Blocks?:Record<number, Block>;
    readonly Load:VoidFunction;
}

function onResize() {
    const cond = document.documentElement.scrollWidth <= window.innerWidth || document.documentElement.scrollHeight <= window.innerHeight;
    document.querySelectorAll<HTMLElement>(".game-canvas, .modal").forEach(canvas=>{
        if (cond) {
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
    if (!Game.Running || Game.Paused) {
        switch(event.key) {
            case "ArrowLeft":
            case "ArrowRight":
            case "ArrowUp":
            case "ArrowDown":
            case "Escape":
            case " ":
            case "z":
            case "Enter":
            case "c": break;
            default: return;
        }
        switch(event.key) {
            case "ArrowLeft":
                if (PauseBtns[PauseMenuSel] instanceof HTMLInputElement)
                    break;
            case "ArrowUp":
                PauseMenuSel = Utils.OverflowOperate(PauseMenuSel,-1,0,PauseBtns.length-1);
                return focusButton();
            case "ArrowRight":
                if (PauseBtns[PauseMenuSel] instanceof HTMLInputElement)
                    break;
            case "ArrowDown":
                PauseMenuSel = Utils.OverflowOperate(PauseMenuSel,1,0,PauseBtns.length-1);
                return focusButton();
            case "z":
            case "c":
            case "Enter":
                (document.activeElement as HTMLElement|undefined)?.click();
                return;
            case " ":
            case "Escape":
                if (!Game.Running) return;
                break;
            default: return;
        }
    }
    if (Game.Paused && event.key !== "Escape") return;
    switch (event.key) {
        case Game.KeyBinds.Left:
            Game.CurrentBlock?.Move(-1, 0);
            break;
        case Game.KeyBinds.Right:
            Game.CurrentBlock?.Move(1, 0);
            break;
        case Game.KeyBinds.Soft:
            Game.CurrentBlock?.Move(0, 1);
            break;
        case Game.KeyBinds.RC:
            Game.CurrentBlock?.Rotate();
            break;
        case Game.KeyBinds.RCC:
            Game.CurrentBlock?.Rotate(true);
            break;
        case Game.KeyBinds.Hard:
            Game.CurrentBlock?.InstantDrop();
            break;
        case "Enter":
        case "Escape":
            Game.TogglePause();
            break;
        default: return console.log(event.key);
    }
    event.preventDefault();
}, true);

Game.DrawGrid();
Game.NewGame();
// Game.StartGame();

document.getElementById("pause-resume")?.addEventListener("click",()=>{
    if (!Game.Running) {
        Game.StartGame();
        return;
    }
    Game.TogglePause(false);
});

document.getElementById("pause-restart")?.addEventListener("click",()=>{
    Game.Reset();
    Game.StartGame();
});

document.getElementById("pause-mods")?.addEventListener("click",()=>{
    if (document.querySelector(".modal.active")) return;
    document.getElementById("mods")?.classList.add("active");
    updateSelectionButtons();
});
document.getElementById("mods-back")?.addEventListener("click",()=>{
    document.getElementById("mods")?.classList.remove("active");
    updateSelectionButtons();
});

document.getElementById("pause-settings")?.addEventListener("click",()=>{
    if (document.querySelector(".modal.active")) return;
    document.getElementById("settings")?.classList.add("active");
    updateSelectionButtons();
});
document.getElementById("settings-back")?.addEventListener("click",()=>{
    document.getElementById("settings")?.classList.remove("active");
    updateSelectionButtons();
});

const detailsArr = [];
document.querySelectorAll("details").forEach(el=>{
    const style = document.createElement("style");
    const ind = detailsArr.length;
    detailsArr.push(style);
    document.head.appendChild(style);
    el.classList.add(`details-${ind}`);
    el.addEventListener("click",()=>{
        setTimeout(()=>{
            updateSelectionButtons(el);
        },1);
        var height = (el.children.item(1)?.children.item(0)?.clientHeight ?? 0) * (el.children.item(1)?.children.length ?? 1);
        style.textContent = `
        details[open].details-${ind}::details-content {
            height: ${height}px;
        }
        `;
    });
});

const keyTranslationMap:Record<string,string> = {
    " ": "Space",

}
function translateKey(k:string,reverse:boolean=false) : string {
    if (keyTranslationMap[k]) return keyTranslationMap[k];
    if (!reverse) {
        if (k.length === 1) return k.toUpperCase();
        if (k.startsWith("Arrow"))
            return `${k.substring(5)} Arrow`;
    } else {
        if (k.length === 1) return k.toLowerCase();
        if (k.endsWith(" Arrow"))
            return `Arrow${k.substring(0,k.lastIndexOf(" Arrow"))}`;
    }
    return k;
}
(document.querySelectorAll("button.keybind") as NodeListOf<HTMLButtonElement>).forEach(el=>{
    Game.KeyBinds[el.dataset.bind ?? ""] = el.dataset.key ?? "";
    function click(event:KeyboardEvent) {
        if (event.defaultPrevented || event.key === "Escape") {
            el.textContent = translateKey(el.dataset.key ?? "");
            return;
        }
        el.dataset.key = event.key;
        event.preventDefault();
        document.removeEventListener("keydown",click);
        el.textContent = translateKey(event.key);
        Game.KeyBinds[el.dataset.bind ?? ""] = el.dataset.key ?? "";
    }
    el.textContent = translateKey(el.dataset.key ?? "");
    el.addEventListener("click",()=>{
        el.textContent = "…"
        document.addEventListener("keydown",click);
    });
});

(document.querySelectorAll("input.keyboard-selectable") as NodeListOf<HTMLInputElement>).forEach(el=>{
    el.addEventListener("keydown",event=>{
        switch (event.key) {
            case "Enter":
            case "ArrowUp":
            case "ArrowDown":
                return event.preventDefault();
            default:
                return;
        }
    });
    el.addEventListener("focus",()=>{
        el.select();
    });
});

window.addEventListener("load",()=>{
    updateSelectionButtons();
});

// export default { Enum, Game, Color, BlockData, Block, BlockInstance }