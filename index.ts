import { sfxr } from "jsfxr";
import click from "./Sounds/click.json" with { type: 'json' };
import { Tween, Easing } from "@tweenjs/tween.js";

const clickWar = document.getElementById("click-req");
clickWar?.addEventListener("click",()=>{
    updateSelectionButtons();
    clickWar.style.pointerEvents = "none !important";
    clickWar.style.opacity = "0";
    setTimeout(()=>{
        clickWar?.remove();
    },600);
});

class Sound {
    constructor(json:Record<string,any>) {
        this.sound = sfxr.toAudio(json);
        this.json = json;
        this.vol = 1;
        this.gain = json.sound_vol;
    }
    private sound:jsfxrSound;
    private json:Record<string,any>;
    private vol:number;
    private readonly gain:number;
    play() : void {
        this.sound.play();
    }
    get volume() : number {
        return this.vol;
    }
    set volume(vol:number) {
        this.vol = vol;
        this.json.sound_vol = this.gain*vol;
        this.sound = sfxr.toAudio(this.json);
    }
}

var clickSound:Sound;

var PauseMenuSel = 0;
var PauseBtns:HTMLElement[] = Array.from(document.querySelectorAll("#pause-btns > .keyboard-selectable"));

var __sfx_loaded = false;
function loadSFX() {
    __sfx_loaded = true;
    clickSound = new Sound(click);
    window.removeEventListener("click",loadSFX);
}

function playSound(sound:Sound) : boolean {
    if (!__sfx_loaded) return false;
    sound.volume = Game.AudioVol/100;
    sound.play();
    return true;
}

function updateSelectionButtons(detailsSel?:HTMLDetailsElement) : void {
    const modal = document.querySelector(".modal.active");
    const btns:HTMLElement[] = Array.from(modal? modal.querySelectorAll(".modal-content .keyboard-selectable") : document.querySelectorAll("#pause-btns > .keyboard-selectable"));
    const tBtns:HTMLElement[] = [];
    for (const btn of btns.values()) {
        let details:HTMLDetailsElement = btn.parentElement?.parentElement?.parentElement?.parentElement as HTMLDetailsElement;
        if (!details || !(details instanceof HTMLDetailsElement))
            details = btn.parentElement?.parentElement?.parentElement?.parentElement?.parentElement as HTMLDetailsElement;
        if (!btn.classList.contains("hidden") && (!details || !(details instanceof HTMLDetailsElement) || details.open)) {
            tBtns.push(btn);
        }
    }
    PauseMenuSel = !detailsSel? 0 : tBtns.indexOf(detailsSel.querySelector("summary") ?? detailsSel) ?? 0;
    PauseBtns = tBtns;
    focusButton();
}

function focusButton() {
    setTimeout(()=>{
        PauseBtns[PauseMenuSel]?.focus();
        if (__sfx_loaded)
            playSound(clickSound);
    },1);
}

function getAttr(instance:any,attr:string) : any {
    return instance[attr];
}
function setAttr(instance:any,attr:string,value:any) : void {
    instance[attr] = value;
}

namespace Enum {
    export type ModeOperationFunction = (initialValue:number,modifyingValue:number)=>number;
    export class ModeOperation {
        static readonly Set:ModeOperationFunction = (x:number,y:number)=>y;
        static readonly Add:ModeOperationFunction = (x:number,y:number)=>x+y;
        static readonly Multiply:ModeOperationFunction = (x:number,y:number)=>x*y;
    }
    export enum GridMode { BG, Grid, Both }
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
    static BiasedRound(x:number,dir:number=0) : number {
        if (x > Math.floor(x) && dir > 0)
            return Math.floor(x) + 1;
        return Math.floor(x);
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
    constructor(name:string,blocktheme?:BlockTheme,uitheme?:UITheme,style:Enum.ThemeStyle=Enum.ThemeStyle.Dark) {
        this.Name = name;
        this.BlockTheme = blocktheme;
        this.Style = style;
        if (uitheme?.Name === undefined || uitheme?.Style === undefined)
            uitheme?.setPropertiesFromPalette(this);
        this.UITheme = uitheme;
    }
    readonly Name:string;
    readonly BlockTheme?:BlockTheme;
    readonly UITheme?:UITheme;
    readonly Style:Enum.ThemeStyle;
    private enabled:boolean = false;
    get Enabled() : boolean {
        return this.enabled;
    }
    set Enabled(enabled:boolean|undefined) {
        if (enabled === this.enabled) return;
        this.enabled = enabled === undefined? !this.enabled : enabled;
        Game.ApplyColorPalettes();
    }
}

class BlockTheme {
    constructor(name:string|undefined,data:Record<string,Color>) {
        this.name = name;
        this.Data = data;
    }
    private name?:string;
    get Name() : string|undefined {
        return this.Name;
    }
    readonly Data:Record<string,Color>;
    private enabled:boolean = false;
    get Enabled() : boolean {
        return this.enabled;
    }
    set Enabled(enabled:boolean|undefined) {
        if (enabled === this.enabled) return;
        this.enabled = enabled === undefined? !this.enabled : enabled;
        Game.ApplyBlockThemes();
    }
}

class UITheme {
    constructor(name:string|undefined,data:Record<Enum.UIThemeKey,Color>,style?:Enum.ThemeStyle,css?:string) {
        this.name = name;
        this.Data = data;
        this.style = style;
        this.CSS = css;
    }
    private name?:string;
    get Name() : string|undefined {
        return this.name;
    }
    readonly Data:Record<Enum.UIThemeKey,Color>;
    readonly CSS?:string;
    private style?:Enum.ThemeStyle;
    get Style() : Enum.ThemeStyle|undefined {
        return this.style;
    }
    setPropertiesFromPalette(palette:ColorPalette) : void {
        this.name ??= palette.Name;
        this.style ??= palette.Style;
    }
    private enabled:boolean = false;
    get Enabled() : boolean {
        return this.enabled;
    }
    set Enabled(enabled:boolean|undefined) {
        if (enabled === this.enabled) return;
        this.enabled = enabled === undefined? !this.enabled : enabled;
        Game.ApplyUIThemes();
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
    static parseCSSNumber(n:string,retInt:boolean=false) : number {
        if (n.endsWith("deg")) {
            return (!retInt? parseFloat : parseInt)(n) / 360;
        }
        if (n.endsWith("turn")) {
            return (!retInt? parseFloat : parseInt)(n) * 180;
        }
        if (n.endsWith("%")) {
            return (!retInt? parseFloat : parseInt)(n) / 100;
        }
        return (!retInt? parseFloat : parseInt)(n);
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
    static fromCSS(s:string) {
        if (s.startsWith("rgb")) {
            let r:number,g:number,b:number,a:number|undefined;
            let data:string[];
            if (s.startsWith("rgba"))
                data = s.substring(5,s.length-1).split(",",4);
            else
                data = s.substring(4,s.length-1).split(",",3);
            r = parseInt(data[0]);
            g = parseInt(data[1]);
            b = parseInt(data[2]);
            if (data.length > 3)
                a = parseFloat(data[3]);
            return new Color(r,g,b,a);
        }
        if (s.startsWith("#")) {
            return Color.fromHex(s);
        }
        if (s.startsWith("hsl")) {
            let h:number,_s:number,l:number,a:number|undefined;
            let data:string[];
            if (s.startsWith("hsla"))
                data = s.substring(5,s.length-1).split(",",4)
            else
                data = s.substring(4,s.length-1).split(",",3)
            h = Color.parseCSSNumber(data[0],true);
            _s = Color.parseCSSNumber(data[1],true);
            l = Color.parseCSSNumber(data[2],true);
            return Color.fromHSLA(h,_s,l,a);
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

type easeStyle = "Linear"|"Sinusoidal"|"Quadratic"|"Cubic"|"Quartic"|"Quintic"|"Circular"|"Exponential"|"Back"|"Bounce"|"Elastic";
type easeDir = "In"|"Out"|"InOut";

class ArrayWrapper<T> {
    constructor(data:T[]) {
        this.data = Array.from(data);
    }
    protected readonly data:Array<T>;
    get length() : number {
        return this.data.length;
    }
    push(...items:never) {
        this.data.push(items);
    }
    pop() : T|undefined {
        return this.data.pop();
    }
    get(index:number) : T {
        return this.data[index];
    }
    set(index:number, value:T) {
        this.data[index] = value;
    }
    indexOf(searchElement:never, fromIndex?:number) : number {
        return this.data.indexOf(searchElement,fromIndex);
    }
}

class InfiniteArray<T> extends ArrayWrapper<T> {
    override get(index: number) : T {
        if (new NumberRange(0,this.length).inRange(index))
            return this.data[index];
        return this.data[this.length-1];
    }
}

class FeedtapeArray<T> {
    constructor(length:number) {
        this.data = new Array(length);
        this.data.fill(undefined);
        Object.seal(this.data);
    }
    private data:Array<T|undefined>;
    get length() : number {
        return this.data.length;
    }
    private feed() : void {
        for (let i=0; i<this.length-1; i++)
            this.data[i] = this.data[i+1];
    }
    push(value:T) : void {
        this.feed();
        this.data[this.length-1] = value;
    }
    get(index:number) : T|undefined {
        return this.data[index];
    }
    set(index:number,value:T) {
        this.data[index] = value;
    }
    fill(value:T|(()=>T),startIndex:number=0,endIndex:number=this.length) : void {
        for (let i=startIndex; i<endIndex; i++)
            this.data[i] = typeof value === "function"? (value as (()=>T))() : value;
    }
    toString() : string {
        let s = "";
        for (const [i, val] of this.data.entries())
            if (i !== 0)
                s+=`, ${val}`;
            else s+=`${val}`;
        return s;
    }
}

const levelText:HTMLElement = document.getElementById("level") as HTMLElement;
const scoreText:HTMLElement = document.getElementById("score") as HTMLElement;
const scoreGateText:HTMLElement = document.getElementById("score-gate") as HTMLElement;
const scoreGateRelText:HTMLElement = document.getElementById("score-gate-rel") as HTMLElement;
const scoreGatePercentText:HTMLElement = document.getElementById("score-gate-percent") as HTMLElement;

class Game {
    private static score:number = 0;
    static set Score(score:number) {
        this.score = score*this.Level.ScoreMultiplier();
        scoreText.textContent = score.toString();
        scoreGateRelText.textContent = (this.ScoreGate-score).toString();
        scoreGatePercentText.textContent = Math.trunc((score/this.ScoreGate)*100).toString();
    }
    static get Score() : number {
        return this.score;
    }
    static ScoreGate:number;
    static KeyRepeatInterval:number = 75;
    static KeyRepeatDelay:number = 125;
    static AudioVol:number = 100;
    static DisableGrid:boolean = false;
    static AnimMoveTime:number = 60;
    static AnimDropTime:number = Game.AnimMoveTime*2;
    static AnimClearTime:number = Math.trunc((Game.AnimMoveTime/2)*10);
    static FixedAnimClearTime:boolean = true;
    static MoveEaseStyle:easeStyle = "Linear";
    static MoveEaseDirection:easeDir = "InOut";
    static DropEaseStyle:easeStyle = "Circular";
    static DropEaseDirection:easeDir = "In";
    static get MoveEase() : typeof Easing.Sinusoidal.InOut {
        return Easing[this.MoveEaseStyle][this.MoveEaseDirection];
    }
    static get DropEase() : typeof Easing.Sinusoidal.InOut {
        return Easing[this.DropEaseStyle][this.DropEaseDirection];
    }
    static Anims:boolean = true;
    static Physics:boolean = false;
    static KeyBinds:Record<string,string> = {};
    static BlockThemes:Record<string,BlockTheme> = {
        "Default": new BlockTheme(undefined,{
            "I": Color.fromHex("#91d7e3"),
            "J": Color.fromHex("#eed49f"),
            "L": Color.fromHex("#c6a0f6"),
            "O": Color.fromHex("#a6da95"),
            "S": Color.fromHex("#ed8796"),
            "T": Color.fromHex("#b7bdf8"),
            "Z": Color.fromHex("#f5a97f")
        })
    };
    static UIThemes:Record<string,UITheme> = {
        "Default": new UITheme(undefined,{
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
        })
    };
    static ColorPalettes:Record<string,ColorPalette> = {
        "Default": new ColorPalette("Catppuccin Macchiato",Game.BlockThemes.Default,Game.UIThemes.Default,Enum.ThemeStyle.Dark)
    };
    private static filterActive(dict:Record<any,any>,callback?:(k:string, theme:any) => void,invert:boolean=false) : Record<any,any> {
        const ret:Record<any,any> = {};
        for (const [k, theme] of Object.entries(dict))
            if ((theme.Enabled && !invert) || (!theme.Enabled && invert)) {
                ret[k] = theme;
                if (callback) callback(k, theme);
            }
        return ret;
    }
    static get ActiveUIThemes() : Record<string,ColorPalette> {
        return Game.filterActive(Game.UIThemes);
    }
    static get ActiveBlockThemes() : Record<string,ColorPalette> {
        return Game.filterActive(Game.BlockThemes);
    }
    static get ActiveColorPalettes() : Record<string,ColorPalette> {
        return Game.filterActive(Game.ColorPalettes);
    }
    static ApplyUIThemes() {

    }
    static ApplyBlockThemes() {
        
    }
    static ApplyColorPalettes() {
        Game.filterActive(Game.ColorPalettes,(k:string, theme:ColorPalette)=>{
            if (theme.BlockTheme) theme.BlockTheme.Enabled = true;
            if (theme.UITheme) theme.UITheme.Enabled = true;
        });
    }
    static get PixelSize() : number {
        return Math.min(Game.GameCanvas.Canvas.width/Game.Width,Game.GameCanvas.Canvas.height/Game.Height);
    }
    static Width:number = 10;
    static Height:number = 20;
    static SpeedMul:number = 1.0;
    static readonly BaseSpeedMs:number = 1000.0;
    static GhostBlockOpacity:number = 0.25;
    static AnimGhostBlock:boolean = true;
    static RawBlockOpacity:number = 0.0;
    static Paused:boolean = true;
    static CurrentBlock?:BlockInstance;
    static readonly BgCanvas:Canvas2D = new Canvas2D(document.getElementById("bg") as HTMLCanvasElement);
    static readonly GameCanvas:Canvas2D = new Canvas2D(document.getElementById("game") as HTMLCanvasElement);
    static readonly BlockCanvas:Canvas2D = new Canvas2D(document.getElementById("block") as HTMLCanvasElement);
    static readonly StaleCanvas:Canvas2D = new Canvas2D(document.getElementById("stale") as HTMLCanvasElement);
    static readonly HoldCanvas:Canvas2D = new Canvas2D(document.getElementById("hold") as HTMLCanvasElement);
    static readonly NextCanvas:Canvas2D = new Canvas2D(document.getElementById("next") as HTMLCanvasElement);
    private static LevelIndex:number;
    private static get Level() : Level {
        return Levels.get(this.LevelIndex);
    }
    private static get NextLevel() : Level {
        return Levels.get(this.LevelIndex+1);
    }
    private static set Level(level:number) {
        this.LevelIndex = level;
        this.LevelSpeed = this.Level.Speed;
        this.ScoreGate = this.NextLevel.ScoreGate;
        levelText.textContent = this.LevelIndex.toString();
        scoreGateText.textContent = this.ScoreGate.toString();
        scoreGateRelText.textContent = (this.ScoreGate-this.score).toString();
        scoreGatePercentText.textContent = Math.trunc((this.score/this.ScoreGate)*100).toString();
    }
    static get Running() : boolean {
        return Game._running
    }
    private static _running:boolean;
    private static _data:(number|BlockData)[][];
    private static _time:number;
    private static _thread_id:number|null;
    private static GridDrawn:boolean = false;
    private static _centerPoint(canvas:Canvas2D) : Point {
        return new Point(
            canvas.Canvas.width/2,
            canvas.Canvas.height/2
        );
    }
    static get CenterPoint() : Point {
        return Game._centerPoint(Game.GameCanvas);
    }
    static CanvasOffset(canvas:Canvas2D) {
        return new Point(
            Game._centerPoint(canvas).X-(Game.Width*Game.PixelSize)/2,
            Game._centerPoint(canvas).Y-(Game.Height*Game.PixelSize)/2,
        );
    }
    static get GameOffset() : Point {
        return Game.CanvasOffset(Game.GameCanvas);
    }
    static LevelSpeed:number = 1.0;
    static get Speed() : number {
        return Game.BaseSpeedMs / Game.LevelSpeed / Game.SpeedMul;
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
        Game.Level = 0;
        Game.Score = 0;
        Game.LevelSpeed = 1;
        Game.LevelSpeed = this.Level.Speed;
        Game.ScoreGate = this.NextLevel.ScoreGate;
        if (!Game.GridDrawn)
            Game.DrawGrid();
        Game.BlockCanvas.ClearCanvas();
        Game.StaleCanvas.ClearCanvas();
        Game._data = [];
        Game.heldBlock = undefined;
        Game.holdCooldown = false;
        Game.HoldCanvas.ClearCanvas();
        for (let y=0; y<Game.Height; y++) {
            Game._data[y] = [];
            for (let x=0; x<Game.Width; x++)
                Game._data[y][x] = 0;
        }
    }
    static NewGame() {
        Game.Reset();
    }
    private static async GameTick() {
        if (Game.Paused) return;
        const moveRes:boolean|undefined = await Game.CurrentBlock?.Move(0,1);
        if (Game.CurrentBlock && moveRes === false) {
            await Game.CurrentBlock.Stamp();
        }
    }
    static StartGame() {
        if (Game._running) return;
        Game._running = true;
        Game.TogglePause(false);
        Game.blockFeed = new FeedtapeArray(4);
        Game.blockFeed.fill(Game.randBlock,1);
        Game.CurrentBlock = Game.RandomBlock();
        Game.CurrentBlock?.Draw();
        if (Game._thread_id !== null) clearInterval(Game._thread_id);
        Game._thread_id = setInterval(Game.GameTick,Game.Speed);
    }
    private static blockFeed:FeedtapeArray<Block>;
    private static randBlock() : Block {
        return Utils.PickRandomFromDict(Blocks);
    }
    private static heldBlock:Block|undefined;
    private static holdCooldown:boolean = false;
    static HoldBlock() : void {
        if (Game.holdCooldown) return;
        Game.holdCooldown = true;
        if (!Game.heldBlock) {
            Game.heldBlock = Game.CurrentBlock?.toBlock();
            Game.CurrentBlock = Game.RandomBlock();
        } else {
            const buffer = Game.heldBlock;
            Game.heldBlock = Game.CurrentBlock?.toBlock();
            Game.CurrentBlock = new BlockInstance(buffer);
        }
        Game.CurrentBlock?.Draw();
        Game.HoldCanvas.ClearCanvas();
        if (!Game.heldBlock) return;
        const block = new BlockInstance(Game.heldBlock).Clone();
        let [lY, hY] = [block.LowestPoint.Y, block.HighestPoint.Y];
        if (lY === hY) hY = 0;
        BlockInstance.Draw(block,Game.HoldCanvas,Game.Width/2-block.CurrentShape[0].length/2,(Game.Height/2)-(lY-hY),true); // Draw hold block
        if (!Game.DisableGrid) {
            Game.HoldCanvas.Context.strokeStyle = "#18192680";
            BlockInstance.Draw(block,Game.HoldCanvas,Game.Width/2-block.CurrentShape[0].length/2,(Game.Height/2)-(lY-hY),true,true);
        }
        Game.HoldCanvas.Canvas.animate([{ scale:.9 },{ scale:1 }],{easing:"ease",duration:100});
    }
    static RandomBlock() : BlockInstance|undefined {
        Game.blockFeed.push(Game.randBlock());
        const newBlock:BlockInstance|undefined = Game.blockFeed.get(0)? new BlockInstance(Game.blockFeed.get(0) as Block) : undefined;
        Game.NextCanvas.ClearCanvas();
        const positions:Point[] = [];
        for (let i=1; i<Game.blockFeed.length; i++) {
            const blockShape:Block|undefined = Game.blockFeed.get(i);
            if (!blockShape) continue;
            const block:BlockInstance = new BlockInstance(blockShape).Clone();
            let [lY, hY] = [block.LowestPoint.Y, block.HighestPoint.Y];
            const prevBlock:BlockInstance|undefined = Game.blockFeed.get(i-1) && positions[i-1]? new BlockInstance(Game.blockFeed.get(i-1) as Block) : undefined;
            const [pX, pY] = [Game.Width/2-block.CurrentShape[0].length/2,(positions[i-1]?.Y ?? 5)+(prevBlock?.LowestPoint.Y ?? -1)+1-hY+1];
            positions[i] = new Point(pX,pY);
            BlockInstance.Draw(block,Game.NextCanvas,pX,pY,true); // Draw next block
            if (!Game.DisableGrid) {
                Game.NextCanvas.Context.strokeStyle = "#18192680";
                BlockInstance.Draw(block,Game.NextCanvas,pX,pY,true,true);
            }
            Game.NextCanvas.Canvas.animate([{ scale:.9 },{ scale:1 }],{easing:"ease",duration:100});
        }
        return newBlock;
    }
    static get NextBlock() : Block|undefined {
        return Game.blockFeed.get(Game.blockFeed.length-1);
    }
    static DrawGrid(canvas?:Canvas2D,mode:Enum.GridMode=Enum.GridMode.Both,width?:number,height?:number,sX:number=0,sY:number=0) {
        const gameCanvas = canvas ?? Game.GameCanvas;
        const bgCanvas = canvas ?? Game.BgCanvas;
        if (!canvas) {
            Game.GridDrawn = true;
            gameCanvas.ClearCanvas();
            bgCanvas.ClearCanvas();
        }
        if (mode === Enum.GridMode.BG || mode === Enum.GridMode.Both) {
            bgCanvas.Context.fillStyle = "#1e2030";
            bgCanvas.Context.fillRect(Game.GameOffset.X,Game.GameOffset.Y,Game.Width*Game.PixelSize,Game.Height*Game.PixelSize);
        }
        if ((!canvas && Game.DisableGrid) || (mode === Enum.GridMode.BG)) return;
        gameCanvas.Context.strokeStyle = "#18192680";
        gameCanvas.Context.lineWidth = 1;
        for (let x=sX; x<=(width? sX+width : Game.Width); x++) {
            gameCanvas.Context.beginPath();
            gameCanvas.Context.moveTo(Game.GameOffset.X+x*Game.PixelSize,Game.GameOffset.Y+sY);
            gameCanvas.Context.lineTo(Game.GameOffset.X+x*Game.PixelSize,Game.GameOffset.Y+sY+(height ?? Game.Height)*Game.PixelSize);
            gameCanvas.Context.stroke();
        }
        for (let y=sY; y<=(height? sY+height : Game.Height); y++) {
            gameCanvas.Context.beginPath();
            gameCanvas.Context.moveTo(Game.GameOffset.X+sX,Game.GameOffset.Y+y*Game.PixelSize);
            gameCanvas.Context.lineTo(Game.GameOffset.X+sX+(width ?? Game.Width)*Game.PixelSize,Game.GameOffset.Y+y*Game.PixelSize);
            gameCanvas.Context.stroke();
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
    static async EraseLine(self:BlockInstance|Game, y?:number) {
        if (this !== self && self !== Game.CurrentBlock) return;
        if (self instanceof BlockInstance)
            y??=self.Y;
        else
            y??=0;
        for (let x=0; x<Game.Width; x++) {
            Game._data[y][x] = 0;
            if (Game.Anims) {
                await sleep(Game.FixedAnimClearTime? Game.AnimClearTime/Game.Width : Game.AnimClearTime);
                Game.RedrawCanvas();
            }
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
                await sleep(Game.FixedAnimClearTime? Game.AnimClearTime/Game.Width : Game.AnimClearTime);
            }
        }
    }
    private static async handleClears() : Promise<boolean> {
        var cFlag = false;
        Game.BlockCanvas.ClearCanvas();
        for (let y=0; y < Game.Height; y++) {
            if (Game._data[y].every(col=>col!==0)) {
                await Game.EraseLine(Game, y);
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
        Game.holdCooldown = false;
        if (self !== Game.CurrentBlock) return;
        await Game.handleClears();
        Game.RedrawCanvas();
        Game.CurrentBlock = Game.RandomBlock();
        if (!Game.CurrentBlock?.IsValidPosition()) {
            Game.Reset();
        }
        Game.CurrentBlock?.Draw();
    }
    static TogglePause(paused?:boolean) {
        document.querySelectorAll(".modal.active").forEach(el=>{
            el.classList.remove("active");
            if (el.id === "settings")
                RejectSettingsBuffer.Fire();
        });
        if (paused === undefined)
            Game.Paused = !Game.Paused;
        else
            Game.Paused = paused;
        if (Game.Paused)
            document.getElementById("pause-ind")?.classList.add("paused");
        else
            document.getElementById("pause-ind")?.classList.remove("paused");
        document.querySelectorAll(".game-canvas, .right-stack, .left-stack").forEach(canvas=>{
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

function dummy(x?:any) : any {
    return x;
}

class Signal {
    private subs:(Function|undefined)[] = [];
    Connect(func:Function) : number {
        return this.subs.push(func);
    }
    Disconnect(id:number) : void {
        this.subs[id] = undefined;
    }
    Fire() : void {
        for (const f of this.subs.values()) {
            if (f === undefined) continue;
            f();
        }
    }
}

const settingsWin = document.getElementById("settings");
const Settings = {
    KeyRepeatDelay: settingsWin?.querySelector("#settings-key-repeat-delay"),
    KeyRepeatInterval: settingsWin?.querySelector("#settings-key-repeat-int"),
    AudioVol: settingsWin?.querySelector("#settings-audio-vol"),
    DisableGrid: settingsWin?.querySelector("#settings-grid-disabled"),
    SpeedMul: settingsWin?.querySelector("#settings-game-speed-mul"),
    Anims: settingsWin?.querySelector("#settings-anims"),
    AnimMoveTime: settingsWin?.querySelector("#settings-anim-move-time"),
    AnimDropTime: settingsWin?.querySelector("#settings-anim-drop-time"),
    AnimClearTime: settingsWin?.querySelector("#settings-anim-clear-time"),
    FixedAnimClearTime: settingsWin?.querySelector("#settings-anim-clear-time-fixed"),
    GhostBlockOpacity: settingsWin?.querySelector("#settings-ghost-opacity"),
    AnimGhostBlock: settingsWin?.querySelector("#settings-ghost-anims"),
    RawBlockOpacity: settingsWin?.querySelector("#settings-raw-opacity"),
    Width: settingsWin?.querySelector("#settings-game-width"),
    Height: settingsWin?.querySelector("#settings-game-height"),
    Physics: settingsWin?.querySelector("#settings-physics"),
    MoveEaseStyle: settingsWin?.querySelector("#settings-ease-style-move"),
    MoveEaseDirection: settingsWin?.querySelector("#settings-ease-dir-move"),
    DropEaseStyle: settingsWin?.querySelector("#settings-ease-style-drop"),
    DropEaseDirection: settingsWin?.querySelector("#settings-ease-dir-drop")
} as Record<string, HTMLElement|HTMLInputElement>
const SettingsBuffer:Map<string,Record<string,string[]|HTMLInputElement|HTMLSelectElement|any>> = new Map<string,any>();
const settingsTitle:HTMLDivElement = document.getElementById("settings-title") as HTMLDivElement;
type bufferData = {
    value:any,
    el:HTMLSelectElement|HTMLInputElement,
    funcs:string[]
}
function UpdateSettingsBuffer(k:string, data:bufferData) : void {
    const label:HTMLElement|null = document.getElementById(data.el.id+"-label");
    if (label) label.textContent = data.value;
    if (getAttr(Game,k) === data.value) {
        SettingsBuffer.delete(k);
        if (SettingsBuffer.size === 0)
            settingsTitle.textContent = "Settings";
        return
    }
    SettingsBuffer.set(k,data);
    settingsTitle.textContent = "Settings*";
}
function WriteSettingsBuffer() : void {
    for (const [k,v] of SettingsBuffer.entries()) {
        setAttr(Game,k,v.value);
        if (v.funcs && v.funcs.length !== 0) {
            for (const f of v.funcs) {
                let x:Function|undefined = getAttr(Game,f);
                if (x === undefined) continue;
                x();
            }
        }
    }
    SettingsBuffer.clear();
    settingsTitle.textContent = "Settings";
}
const RejectSettingsBuffer = new Signal();
RejectSettingsBuffer.Connect(()=>{
    settingsTitle.textContent = "Settings";
});
function handleSettings() : void {
    for (const [k, el] of Object.entries(Settings)) {
        const label:HTMLElement|null = document.getElementById(el.id+"-label");
        if (label) label.textContent = getAttr(Game,k);
        if (el instanceof HTMLInputElement) {
            if (el.type === "number" || el.type === "range") {
                const min = parseFloat(el.min ?? "0");
                const max = parseFloat(el.max ?? "100");
                const defaultVal:number = getAttr(Game,k);
                if (el.classList.contains("percent"))
                    el.valueAsNumber = getAttr(Game,k)*max;
                else
                    el.valueAsNumber = getAttr(Game,k);
                const funcs:string[] = (el.dataset.funcs ?? "").split(",");
                el.addEventListener("change",()=>{
                    if (isNaN(el.valueAsNumber)) {
                        el.valueAsNumber = SettingsBuffer.get(k)?.value ?? (getAttr(Game,k) ?? defaultVal)*(el.classList.contains("percent")? max : 1);
                        return;
                    }
                    const val = (el.classList.contains("int")? Math.trunc : dummy)(clamp(el.valueAsNumber,min,max));
                    UpdateSettingsBuffer(k,{ value:(el.classList.contains("percent")? val/max : val), funcs:funcs, el:el });
                    el.valueAsNumber = val;
                })
                RejectSettingsBuffer.Connect(()=>{
                    el.valueAsNumber = (getAttr(Game,k) ?? defaultVal)*(el.classList.contains("percent")? max : 1);
                });
            } else if (el.type === "checkbox") {
                el.checked = getAttr(Game,k);
                const defaultVal:boolean = el.checked;
                const funcs:string[] = (el.dataset.funcs ?? "").split(",");
                el.addEventListener("change",()=>{
                    UpdateSettingsBuffer(k,{ value:el.checked, el:el, funcs:funcs });
                });
                RejectSettingsBuffer.Connect(()=>{
                    el.checked = getAttr(Game,k) ?? defaultVal;
                });
            } else {
                el.value = getAttr(Game,k);
                const defaultVal:string = el.value;
                const funcs:string[] = (el.dataset.funcs ?? "").split(",");
                el.addEventListener("change",()=>{
                    UpdateSettingsBuffer(k,{ value:el.value, el:el, funcs:funcs });
                });
                RejectSettingsBuffer.Connect(()=>{
                    el.value = getAttr(Game,k) ?? defaultVal;
                });
            }
        } else if (el instanceof HTMLSelectElement) {
            if (el.classList.contains("ease")) {
                el.value = getAttr(Game,k);
                const defaultVal:string = el.value;
                const funcs:string[] = (el.dataset.funcs ?? "").split(",");
                el.addEventListener("change",()=>{
                    UpdateSettingsBuffer(k,{ value:el.value, el:el, funcs:funcs });
                });
                RejectSettingsBuffer.Connect(()=>{
                    el.value = getAttr(Game,k) ?? defaultVal;
                });
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

class NumberRange {
    constructor(min:number, max:number) {
        this.Min = Math.min(min,max);
        this.Max = Math.max(min,max);
    }
    inRange(x:number) : boolean {
        return (x >= this.Min) && (x <= this.Max);
    }
    readonly Min:number;
    readonly Max:number;
    static readonly infinite = new NumberRange(-Infinity,Infinity);
}

class Level {
    constructor(name:string, speed:number, scoreGate:number, speedMode:Enum.ModeOperationFunction=Enum.ModeOperation.Multiply, scoreGateMode:Enum.ModeOperationFunction=Enum.ModeOperation.Multiply, speedRange:NumberRange=NumberRange.infinite, scoreGateRange:NumberRange=NumberRange.infinite, scoreMultiplier?:(index:number)=>number) {
        this.Name = name;
        this.speed = speed;
        this.scoreGate = scoreGate;
        this.SpeedMode = speedMode;
        this.ScoreGateMode = scoreGateMode;
        this.SpeedRange = speedRange;
        this.ScoreGateRange = scoreGateRange;
        if (scoreMultiplier) this.scoreMultiplier = scoreMultiplier;
    }
    readonly Name:string;
    private readonly speed:number;
    private readonly scoreGate:number;
    private readonly scoreMultiplier:(index:number)=>number = function(index:number) : number {
        return 1+index/25;
    };
    public ScoreMultiplier() {
        return this.scoreMultiplier(Levels.indexOf(this as never));
    }
    readonly SpeedMode:Enum.ModeOperationFunction;
    readonly ScoreGateMode:Enum.ModeOperationFunction;
    readonly SpeedRange:NumberRange;
    readonly ScoreGateRange:NumberRange;
    get Speed() : number {
        return clamp(this.SpeedMode(Game.LevelSpeed,this.speed),this.SpeedRange.Min,this.SpeedRange.Max);
    }
    get ScoreGate() : number {
        return clamp(this.ScoreGateMode(Game.ScoreGate,this.scoreGate),this.ScoreGateRange.Min,this.ScoreGateRange.Max);
    }
}

class Block {
    constructor(blockShapes:number[][][], blockData:BlockData, symbol:string) {
        if (blockShapes.length < 4)
            for (let i=blockShapes.length; i<4; i++)
                blockShapes[i] = blockShapes[i-1];
        this.Shapes = blockShapes;
        this.Data = blockData;
        this.Symbol = symbol;
    }
    readonly Shapes:number[][][];
    readonly Data:BlockData;
    readonly Symbol:string
    toString() : string {
        return this.Symbol;
    }
}

class BlockInstance extends Block {
    constructor(block:Block) {
        super(block.Shapes, block.Data, block.Symbol);
        this._x = Math.floor(Game.Width/2-this.CurrentShape[0].length/2);
        this._y = 0-this.HighestPoint.Y;
        this.targetPos = new Point(this._x,this._y);
    }
    private _x:number = 0;
    private _y:number = 0;
    get X() : number {
        return this._x;
    }
    get Y() : number {
        return this._y;
    }
    get Width() : number {
        return this.CurrentShape[0].length;
    }
    get Height() : number {
        return this.CurrentShape.length;
    }
    get VisualHeight() : number {
        return (this.LowestPoint.Y-this.HighestPoint.Y)+1;
    }
    get CurrentShape() : number[][] {
        return this.Shapes[this.Rotation];
    }
    Rotation:number = 0;
    IsValidPosition(x:number=this.targetPos?.X ?? 0, y:number=this.targetPos?.Y ?? 0, shape:number[][]=this.CurrentShape) : boolean {
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
    private tween:Tween = new Tween([]);
    private targetPos:Point|undefined;
    private dropping:boolean = false;
    private isFake:boolean = false;
    Clone() : BlockInstance {
        const clone = new BlockInstance(this.toBlock());
        clone.isFake = true;
        clone._x = this._x;
        clone._y = this._y;
        clone.targetPos = this.targetPos;
        clone.Rotation = this.Rotation;
        clone.tween = this.tween;
        clone.dropping = this.dropping;
        clone.stamping = this.stamping;
        return clone;
    }
    get IsDropping() : boolean {
        return this.dropping;
    }
    async Move(x:number=0, y:number=0,isInstantDrop:boolean=false) : Promise<boolean|undefined> {
        if (this.dropping) return undefined;
        x+=this.targetPos?.X ?? 0; y+=this.targetPos?.Y ?? 0;
        if (!this.IsValidPosition(x,y)) return !this.dropping? false : undefined;
        if (isInstantDrop) this.dropping = true;
        this.targetPos = new Point(x,y);
        if (Game.Anims) {
            const tData = {s:new Point(this._x,this._y),e:this.targetPos};
            const { promise: comp, resolve } = Promise.withResolvers();
            if (this.tween && this.tween.isPlaying())
                this.tween.stop();
            this.tween = new Tween(tData.s)
            .to(tData.e,!isInstantDrop? Game.AnimMoveTime : Game.AnimDropTime)
            .easing(!isInstantDrop? Game.MoveEase : Game.DropEase)
            .dynamic(true)
            .onUpdate(data=>{
                this._x=data.X;
                this._y=data.Y;
                this.Draw(undefined);
            });
            var isComplete = false;
            const fin = ()=>{
                if (isInstantDrop) this.dropping = false;
                isComplete = true;
                resolve(undefined);
            };
            this.tween.onComplete(fin);
            this.tween.onStop(fin);
            this.tween.start();
            const updateFunc = ()=>{
                const t = performance.now();
                this.tween.update(t);
                if (!isComplete)
                    requestAnimationFrame(updateFunc);
            };
            requestAnimationFrame(updateFunc);
            await comp;
            await sleep(2);
        } else {
            [this._x, this._y] = [this.targetPos.X, this.targetPos.Y];
            this.Draw();
            if (isInstantDrop)
                this.dropping = false;
        }
        return !this.dropping? true : false;
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
    static Draw(block:BlockInstance,canvas?:Canvas2D,x?:number,y?:number,drawColor?:boolean,outline?:boolean,width?:number,height?:number) {
        if (!block.isFake) return;
        block._draw(canvas,x,y,drawColor,outline,width,height);
    }
    private _draw(canvas:Canvas2D=Game.BlockCanvas, x:number=this._x, y:number=this._y,drawColor:boolean=false,outline:boolean=false,width:number=1,height:number=1) {
        if (drawColor) canvas.Context.fillStyle = this.Data.Color.RGBA;
        for (const [oY, row] of this.CurrentShape.entries()) {
            for (const [oX, col] of row.entries()) {
                if (col === 0) continue;
                const [_x,_y,_w,_h] = [Game.CanvasOffset(canvas).X+x*Game.PixelSize+oX*Game.PixelSize,Game.CanvasOffset(canvas).Y+y*Game.PixelSize+oY*Game.PixelSize,Game.PixelSize*width,Game.PixelSize*height];
                if (!outline)
                    canvas.Context.fillRect(_x,_y,_w,_h);
                else
                    canvas.Context.strokeRect(_x,_y,_w,_h);
            }
        }
    }
    Draw(canvas:Canvas2D=Game.BlockCanvas) {
        if (!this.IsValidPosition()) return;
        if (canvas === Game.BlockCanvas) canvas.ClearCanvas();
        canvas.Context.fillStyle = this.Data.Color.RGBA;
        this._draw(canvas);
        // Draw ghost block
        if (Game.GhostBlockOpacity > 0 && canvas === Game.BlockCanvas && this.LowestValidY > this._y) {
            canvas.Context.fillStyle = this.Data.Color.WithOpacity(Game.GhostBlockOpacity);
            this._draw(canvas,!Game.AnimGhostBlock? this.targetPos?.X : this._x,this.LowestValidY);
        }
        // Draw accublock
        if (Game.RawBlockOpacity > 0 && canvas === Game.BlockCanvas) {
            canvas.Context.fillStyle = this.Data.Color.WithOpacity(Game.RawBlockOpacity);
            this._draw(canvas,this.targetPos?.X,this.targetPos?.Y);
        }
    }
    private stamping:boolean = false;
    async Stamp() {
        if (this.dropping || this.stamping) return;
        this.stamping = true;
        [this._x, this._y] = [this.targetPos?.X ?? 0, this.targetPos?.Y ?? 0];
        this.Draw(Game.StaleCanvas);
        Game.WriteShape(this, this._x, this._y, this.CurrentShape);
        await Game.BlockStamped(this);
        this.stamping = false;
    }
    async InstantDrop() {
        await this.Move(0,this.LowestValidY-(this.targetPos?.Y ?? 0),true);
        await this.Stamp();
    }
    private get LowestValidY() : number {
        let y = this.targetPos?.Y ?? 0;
        while (true) {
            y++;
            if (!this.IsValidPosition(undefined,y)) {
                y--;
                break
            }
        }
        return y;
    }
    get HighestPoint() : Point {
        let highestPoint = new Point(0,0);
        for (const [oY, row] of this.CurrentShape.entries()) {
            for (const [oX, col] of row.entries()) {
                if (col === 0) continue;
                return new Point(oX,oY);
            }
        }
        return highestPoint;
    }
    get LowestPoint() : Point {
        let lowestPoint = new Point(0,0);
        for (const [oY, row] of this.CurrentShape.entries()) {
            if (oY < lowestPoint.Y) break;
            for (const [oX, col] of row.entries()) {
                if (col === 0) continue;
                lowestPoint = new Point(oX,oY);
            }
        }
        return lowestPoint;
    }
    toBlock() : Block {
        return new Block(this.Shapes,this.Data,this.Symbol);
    }
}

const Levels:InfiniteArray<Level> = new InfiniteArray([
    new Level("Level 0",1.0,0,Enum.ModeOperation.Set,Enum.ModeOperation.Set),
    new Level("Level 1",1.25,1000,Enum.ModeOperation.Multiply,Enum.ModeOperation.Set),
])

const Blocks:Record<string,Block> = {
    "I": new Block(
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
        new BlockData("#91d7e3"), "I"
    ),
    "O": new Block(
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
        new BlockData("#eed49f"), "O"
    ),
    "T": new Block(
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
        new BlockData("#c6a0f6"), "T"
    ),
    "S": new Block(
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
        new BlockData("#a6da95"), "S"
    ),
    "Z": new Block(
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
        new BlockData("#ed8796"), "Z"
    ),
    "J": new Block(
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
        new BlockData("#b7bdf8"), "J"
    ),
    "L": new Block(
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
        new BlockData("#f5a97f"), "L"
    )
}

class ModEngine {
    private static ModList:Record<string,Mod> = {};
    static LoadMod(mod:Mod) : boolean {
        if (this.ModList[mod.Name] !== undefined) return false;
        this.ModList[mod.Name] = mod;
        return true;
    }
}

class Mod {
    constructor(modData:Record<string,any>) {
        this.Name = modData.Name;
        this.Description = modData.Description ?? "";
        this.Blocks = modData["Custom Blocks"];
    };
    readonly Name:string;
    readonly Description:string;
    readonly Blocks?:Record<number, Block>;
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

// const resizeObserver = new ResizeObserver(onResize);
// resizeObserver.observe(document.body);
// window.addEventListener("resize",onResize);

window.addEventListener("click",loadSFX)

function getRangeStep(range:HTMLInputElement) {
    const int:boolean = range.classList.contains("int");
    let step = ((int? parseInt : parseFloat)(range.step)) || 1;
    if (heldKeys.Shift && (heldKeys.Control || heldKeys.Meta))
        step=Math.abs(parseFloat(range.max))+Math.abs(parseFloat(range.min));
    else if (heldKeys.Shift)
        step = parseFloat(range.dataset.shiftStep ?? "") || (step*5);
    else if (heldKeys.Control || heldKeys.Meta)
        step = (Math.abs(parseFloat(range.max))+Math.abs(parseFloat(range.min)))/2;
    return (int? Math.round : dummy)(step);
}
function stepRange(range:HTMLInputElement,dir:number=1) : number {
    const int:boolean = range.classList.contains("int");
    return clamp((int? parseInt : parseFloat)(range.value)+(getRangeStep(range)*dir),(int? parseInt : parseFloat)(range.min),(int? parseInt : parseFloat)(range.max));
}

const heldKeys:Record<string,boolean> = { "Shift":false, "Control":false, "Meta":false };

async function handleKeypress(event:KeyboardEvent) {
    let eventKey = event.key;
    if (eventKey === "Tab" && heldKeys.Shift)
        eventKey = "ShiftTab";
    if (event.defaultPrevented || !__sfx_loaded) return;
    if (!Game.Running || Game.Paused) {
        if (document.activeElement?.classList.contains("keybind") && document.activeElement.textContent === "...")
            return event.preventDefault();
        switch(eventKey) {
            case "ArrowLeft":
                if (PauseBtns[PauseMenuSel] instanceof HTMLInputElement) {
                    if ((PauseBtns[PauseMenuSel] as HTMLInputElement).type !== "range") {
                        return;
                    } else {
                        const val:HTMLInputElement = (PauseBtns[PauseMenuSel] as HTMLInputElement);
                        val.valueAsNumber = stepRange(val,-1);
                        val.dispatchEvent(new Event("change"));
                        return event.preventDefault();
                    }
                }
            case "ShiftTab":
            case "ArrowUp":
                PauseMenuSel = Utils.OverflowOperate(PauseMenuSel,-1,0,PauseBtns.length-1);
                return focusButton();
            case "ArrowRight":
                if (PauseBtns[PauseMenuSel] instanceof HTMLInputElement) {
                    if ((PauseBtns[PauseMenuSel] as HTMLInputElement).type !== "range") {
                        return;
                    } else {
                        const val:HTMLInputElement = (PauseBtns[PauseMenuSel] as HTMLInputElement);
                        val.valueAsNumber = stepRange(val);
                        val.dispatchEvent(new Event("change"));
                        return event.preventDefault();
                    }
                }
            case "Tab":
            case "ArrowDown":
                PauseMenuSel = Utils.OverflowOperate(PauseMenuSel,1,0,PauseBtns.length-1);
                return focusButton();
            case "z":
            case "c":
            case " ":
            case "Enter":
                if (!(document.activeElement instanceof HTMLSelectElement)) {
                    if (document.activeElement?.classList.contains("keybind")) await sleep(2);
                    (document.activeElement as HTMLElement|undefined)?.click();
                } else
                    (document.activeElement as HTMLSelectElement|undefined)?.showPicker();
                return;
            case "Backspace":
                if (PauseBtns[PauseMenuSel] instanceof HTMLInputElement)
                    if ((PauseBtns[PauseMenuSel] as HTMLInputElement).type !== "range")
                        return;
            case "Escape":
                for (const el of PauseBtns.values()) {
                    if (el?.classList?.contains("modal-back"))
                        return el?.click();
                }
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
        case Game.KeyBinds.Hold:
            Game.HoldBlock();
            break;
        case "Backspace":
        case "Escape":
            Game.TogglePause();
            break;
        default: return console.log(event.key);
    }
    event.preventDefault();
}

window.addEventListener("keyup",event=>{
    heldKeys[event.key] = false;
});
window.addEventListener("keydown", async event=>{
    if (heldKeys[event.key]) return;
    heldKeys[event.key] = true;
    handleKeypress(event);
    setTimeout(()=>{
        if (!heldKeys[event.key]) return;
        var id:number;
        id = setInterval(()=>{
            if (!heldKeys[event.key]) return clearInterval(id);
            handleKeypress(new KeyboardEvent("keydown",{key:event.key}));
        },Game.KeyRepeatInterval);
    },Game.KeyRepeatDelay);
}, true);

Game.DrawGrid();
Game.NewGame();

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
    SettingsBuffer.clear();
    document.getElementById("settings")?.classList.add("active");
    updateSelectionButtons();
});
document.getElementById("settings-back")?.addEventListener("click",()=>{
    document.getElementById("settings")?.classList.remove("active");
    updateSelectionButtons();
    WriteSettingsBuffer();
});
document.getElementById("settings-quit")?.addEventListener("click",()=>{
    document.getElementById("settings")?.classList.remove("active");
    updateSelectionButtons();
    RejectSettingsBuffer.Fire();
});

const detailsArr = [];
document.querySelectorAll("details").forEach(el=>{
    const style = document.createElement("style");
    const ind = detailsArr.length;
    detailsArr.push(style);
    document.head.appendChild(style);
    el.classList.add(`details-${ind}`);
    const summary = el.querySelector("summary");
    summary?.addEventListener("click",()=>{
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
    " ": "Space"
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
        if (event.key === "Escape") {
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
        el.textContent = "..."
        document.addEventListener("keydown",click);
    });
});

function preventKeyEvents(el:HTMLInputElement|HTMLElement) {
    el.addEventListener("keydown",event=>{
        if (!el.classList.contains("keybind") || el.textContent !== "...") {
            switch ((event as KeyboardEvent).key) {
                case "Enter":
                case " ":
                case "ArrowUp":
                case "ArrowDown":
                    return event.preventDefault();
                case "Tab":
                case "ArrowLeft":
                case "ArrowRight":
                    return !(el instanceof HTMLInputElement)? event.preventDefault() : undefined;
                default:
                    return;
            }
        }
    });
    if (el instanceof HTMLInputElement) {
        el.addEventListener("focus",()=>{
            el.select();
        });
    }
}

(document.querySelectorAll(".keyboard-selectable") as NodeListOf<HTMLElement>).forEach(el=>{
    preventKeyEvents(el);
});