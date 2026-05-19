// Import libraries
import { sfxr } from "jsfxr"; // SFX
import { Tween, Easing } from "@tweenjs/tween.js"; // Easing/Tweening properties
import { marked } from "marked"; // Markdown renderer

// Import SFX data from JSON files
import __sfx_click from "./Sounds/click.json" with { type: 'json' }; // UI selection
import __sfx_clear from "./Sounds/clear.json" with { type: 'json' }; // Line clear
import __sfx_gameover from "./Sounds/game-over.json" with { type: 'json' }; // Game over
import __sfx_levelup from "./Sounds/level-up.json" with { type: 'json' }; // Level increase
import __sfx_harddrop from "./Sounds/hard-drop.json" with { type: 'json' }; // Hard drop
import __sfx_newbest from "./Sounds/new-best.json" with { type: 'json' }; // New highscore
import __sfx_block_rotate from "./Sounds/block-rotate.json" with { type: 'json' }; // Rotate block
import __sfx_negative from "./Sounds/negative.json" with { type: 'json' }; // Rotation failure/invalid rotation
import __sfx_block_move from "./Sounds/block-move.json" with { type: 'json' }; // Move block/block fall
import __sfx_hold from "./Sounds/hold.json" with { type: 'json' }; // Hold block

// Wrapper for sfxr sounds implementing dynamic volume via reconstruction
class Sound {
    constructor(json:Record<string,any>) {
        if (__sfx_is_loaded) this.sound = sfxr.toAudio(json); // Only create <audio> if doing so wouldn't error
        this.json = json; // Store audio parameters
        this.sound_vol = json.sound_vol; // Store original volume
    }
    private sound:jsfxrSound|undefined;
    private json:Record<string,any>;
    private vol:number = 1;
    private readonly sound_vol:number;
    private get sfxrAudio() : jsfxrSound {
        return sfxr.toAudio(this.json); // Construct new sfxr sound based on stored audio parameters
    }
    play() : void {
        if (!__sfx_is_loaded) return; // Only try to play if <audio> should be allowed to initialize
        const vol:number = Game.AudioVol/100; // Convert from %/100 -> %/1
        if (vol <= 0) return; // Don't run any tasks if the audio is muted
        this.volume = vol; // Reconstruct sound to incorporate new volume
        if (!this.sound) this.sound = this.sfxrAudio; // Initialize <audio> in case it hasn't been already
        this.sound.play();
    }
    get volume() : number {
        return this.vol;
    }
    set volume(vol:number) {
        if (this.vol === vol) return; // Skip if already at `vol`
        this.vol = vol;
        this.json.sound_vol = this.sound_vol*vol; // Update sound_vol parameter relative to its initial value
        this.sound = this.sfxrAudio; // Reconstruct with the new sound_vol parameter
    }
}

// Declare Sounds
var SFX = {
    click: new Sound(__sfx_click),
    clear: new Sound(__sfx_clear),
    gameover: new Sound(__sfx_gameover),
    levelup: new Sound(__sfx_levelup),
    harddrop: new Sound(__sfx_harddrop),
    newbest: new Sound(__sfx_newbest),
    blockrotate: new Sound(__sfx_block_rotate),
    negative: new Sound(__sfx_negative),
    blockMove: new Sound(__sfx_block_move),
    hold: new Sound(__sfx_hold)
};
var __sfx_is_loaded:boolean = false; // Variable tracking whether or not `clickWar` has been clicked and if sfxr SFX can be played by proxy

// 'Click to Enable Audio' prompt (needed to make sfxr not error, since <audio>s need a proper *mouse* input before working)
var clickWar:HTMLElement = document.getElementById("click-req") as HTMLElement; // as `HTMLElement` since this will *always* exist until it's manually deleted *later* (same reason for similar future syntax)
clickWar.addEventListener("click",()=>{
    updateSelectionButtons();
    clickWar.style.pointerEvents = "none !important"; // Allow inputs to be passed through to the menu
    clickWar.style.opacity = "0"; // Smoothly fade out click warning (thanks to the CSS `transition` property)
    setTimeout(()=>{
        clickWar.remove(); // Delete click warning.
        clickWar = undefined as unknown as HTMLElement; // Get around deleting `clickWar` after explicitly declaring it as always an `HTMLElement`. Otherwise, lines 69–70 would need to check if `clickWar` exists before executing
    },600); // 600ms transition duration defined in file://./style.css
});
function loadSFX() : void {
    __sfx_is_loaded = true;
    window.removeEventListener("click",loadSFX); // Prevent this function from being run again on the next click
}
window.addEventListener("click",loadSFX); // Bind `loadSFX` to clicking anywhere on-screen (not just on `clickWar`)

var PauseMenuSel:number = 0; // Index of the currently selected menu element
var PauseBtns:HTMLElement[] = Array.from(document.querySelectorAll("#pause-btns > .keyboard-selectable")); // Array of the currently selectable menu elements

// Refresh `PauseBtns` based on the currently focused menu's selectable elements, optionally taking the selected collapsable menu as a parameter
function updateSelectionButtons(detailsSel?:HTMLDetailsElement) : void {
    const modal:Element|null = document.querySelector(".modal.active"); // Find currently focused modal
    const btns:HTMLElement[] = Array.from(modal? modal.querySelectorAll(".modal-content .keyboard-selectable") : document.querySelectorAll("#pause-btns > .keyboard-selectable")); // Get selectable elements if it's a modal, else get selectable pause buttons since it's the main pause menu and therefore uses a different layout scheme because I made it much earlier on in development (and if it ain't broke, don't fix it)
    const tBtns:HTMLElement[] = [];
    // Filter out any explicitly hidden elements and elements inside of a collapsed collapsable section
    for (const btn of btns.values()) {
        let details:HTMLDetailsElement = btn.parentElement?.parentElement?.parentElement?.parentElement as HTMLDetailsElement; // Hacky way to get the parent details menu (always works under the exact layout present in this project, though*)
        if (!details || !(details instanceof HTMLDetailsElement)) // *except the times where we have to go up an additional element =)
            details = btn.parentElement?.parentElement?.parentElement?.parentElement?.parentElement as HTMLDetailsElement;
        if (!btn.classList.contains("hidden") && (!details || !(details instanceof HTMLDetailsElement) || details.open)) {
            tBtns.push(btn);
        }
    }
    PauseMenuSel = !detailsSel? 0 : tBtns.indexOf(detailsSel.querySelector("summary") ?? detailsSel) ?? 0; // If a collapsable menu wasn't passed, select the first element, else select the same element as was previously selected before collapsing/expanding the menu
    PauseBtns = tBtns;
    focusButton();
}
// Focus currently selected element
function focusButton() : void {
    setTimeout(()=>{
        PauseBtns[PauseMenuSel]?.focus();
        SFX.click.play();
    },1); // Delay 1ms to prevent horrible bugs (race conditions)
}

// Quickly shrink and restore an element to hide ugly, instant updates (like the width changes of a `.canvas-box` when its descendants' text gets too long)
function bounceAnim(el:HTMLElement) : void {
    if (!Game.Anims) return; // Respect global animation preferences (since it's more distracting than most other CSS animations)
    el.animate([{ scale:.925 },{ scale:1 }],{easing:"ease",duration:100}); // Initial scale: 92.5%, final scale: 100%, with 'ease' over 100ms
}

// Both below attr functions made purely to avoid TypeScript type indexing "issues"
function getAttr(instance:any,attr:string) : any {
    return instance[attr];
}
function setAttr(instance:any,attr:string,value:any) : void {
    instance[attr] = value;
}

// Base wrapper for an Array to make implementing Array "subclass wrappers" standardized and easier
class ArrayWrapper<T> { // Generic type <T> ensures this can be constructed with any single type (including `any`/`unknown`)
    constructor(data:Iterable<T>) {
        this.data = Array.from(data);
    }
    protected data:Array<T>;
    get length() : number {
        return this.data.length;
    }
    push(...items:T[]) : void {
        this.data.push(...items);
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
    indexOf(searchElement:T, fromIndex?:number) : number {
        return this.data.indexOf(searchElement,fromIndex);
    }
    toString() : string {
        return this.data.toString();
    }
    values() : T[] {
        return Object.values(this.data);
    }
}

// Array artificially ranging from [0,Infinity) by returning the value at the last index past its real range
class InfiniteArray<T> extends ArrayWrapper<T> {
    override get(index:number) : T {
        if (new NumberRange(0,this.length-1).inRange(index))
            return this.data[index];
        return this.data[this.length-1];
    }
}

// `InfiniteArray` handling exclusively `Level`s which simply clones the `Level` to ensure it knows its correct index (since indexOf would always return the wrong index past the InfiniteArray's real range)
class InfiniteLevelArray extends InfiniteArray<Level> {
    override get(index:number) : Level {
        if (new NumberRange(0,this.length-1).inRange(index))
            return this.data[index];
        this.data[index] = this.data[this.length-1].Clone(index);
        return this.data[index];
    }
}

// An Array acting as a refillable bag, with `pick` calls removing random items from it until there are no more, in which case it refills the bag from the provided pool
class BagArray<T> extends ArrayWrapper<T> {
    private dataPool:T[];
    constructor(pool:Iterable<T>) {
        super(pool);
        this.dataPool = Array.from(pool);
    }
    refill() : void {
        this.data = [...this.dataPool];
    }
    pick() : T {
        if (this.length <= 0) this.refill();
        return this.data.splice(Utils.RandomRange(0,this.length-1),1)[0];
    }
}

// An Array that shifts its values left continuously upon `push()`ing, deleting values that underflow based on the specified length (eg. [1,2,3,4].push(5) => [2,3,4,5])
class FeedtapeArray<T> {
    constructor(length:number) {
        this.data = new Array(length);
        this.data.fill(undefined);
    }
    private data:Array<T|undefined>;
    get length() : number {
        return this.data.length;
    }
    // Shift data left 1 index
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
    set(index:number,value:T) : void {
        this.data[index] = value;
    }
    // Fill each index of Array with value
    fill(value:T|(()=>T),startIndex:number=0,endIndex:number=this.length) : void {
        for (let i=startIndex; i<endIndex; i++)
            this.data[i] = typeof value === "function"? (value as (()=>T))() : value;
    }
    toString() : string {
        return this.data.toString();
    }
}

// Organize Enum and Enum-like classes via an 'Enum' prefix
namespace Enum {
    export type bufferData = {
        value:any,
        el:HTMLSelectElement|HTMLInputElement,
        funcs:string[]
    }
    export type easeStyle = "Linear"|"Sinusoidal"|"Quadratic"|"Cubic"|"Quartic"|"Quintic"|"Circular"|"Exponential"|"Back"|"Bounce"|"Elastic";
    export type easeDir = "In"|"Out"|"InOut";
    export class BaseScores {
        static readonly Soft:number = 1; // Soft drop base point value
        static readonly Hard:number = 2; // Hard drop base point value
        static readonly Clears:InfiniteArray<number> = new InfiniteArray([100,300,500,800]); // Base point values for 1, 2, 3, & 4 line clears respectively
    }
    export type ModeOperationFunction = (index:number,initialValue:number,modifyingValue:number)=>number; // Type allowing custom functions to be used for mode operations (eg. on levels' speeds)
    // Define default operations
    export class ModeOperation {
        static readonly Set:ModeOperationFunction = (i:number,x:number,y:number)=>y; // x => y
        static readonly Add:ModeOperationFunction = (i:number,x:number,y:number)=>x+y; // x => x+y
        static readonly Multiply:ModeOperationFunction = (i:number,x:number,y:number)=>x*y; // x => x*y
    }
    export enum GridMode { BG, Grid, Both }
    export enum Operation { Addition, Subtraction, Multiplication, Division }
    const ops:Record<string, Operation> = { ["+"]: Operation.Addition, ["-"]: Operation.Subtraction, ["*"]: Operation.Multiplication, ["/"]: Operation.Division }; // Define shorthands for Operation enums
    export function OperationFromString(op:string) : Operation { // Return enum operation from shorthand (if applicable, else returns addition)
        return ops[op] ?? Operation.Addition;
    }
}

// Organize utility functions via a 'Utils' prefix
class Utils {
    static RoundNumber(x:number,d:number) {
        return Math.round(x*(10**d))/(10**d);
    }
    static ShortenNumber(x:number) : string {
        const suffixes = [
            { Range: new NumberRange(0,1e3-1), Suffix: "" },
            { Range: new NumberRange(1e3,1e6-1), Suffix: "K" },
            { Range: new NumberRange(1e6,1e9-1), Suffix: "M" },
            { Range: new NumberRange(1e9,1e12-1), Suffix: "B" },
            { Range: new NumberRange(1e12,1e15-1), Suffix: "T" },
            { Range: new NumberRange(1e15,Infinity), Suffix: "Q" }
        ];
        for (const v of suffixes)
            if (v.Range.inRange(Math.abs(x)))
                return `${Utils.RoundNumber(x/(v.Range.Min > 0? v.Range.Min : 1),2)}${v.Suffix}`;
        return x.toString();
    }
    // Perform the operation `operation` on `n0` and `n1`, with the result wrapping around to `overflow` or `underflow` if it's too small or too large, respectively
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
    // Return a random number from [`min`,`max`]
    static RandomRange(min:number, max:number) : number {
        return Math.floor(Math.random()*(max+1)-min) + min;
    }
    // Return a random value from an Array
    static PickRandomFromArray(arr:Array<any>) : any {
        return arr[this.RandomRange(0,arr.length-1)];
    }
    // Return a random value from a Record
    static PickRandomFromDict(dict:Record<any,any>) : any {
        return dict[this.PickRandomFromArray(Object.keys(dict))];
    }
    // Merge key/value pairs from `x` and `d`, prioritizing `x` (eg. MergeDicts({a:true},{a:false}) => {a:true})
    static MergeDicts(x:Record<any,any>, d:Record<any,any>) : Record<any,any> {
        for (const [k,v] of Object.entries(d)) {
            x[k] ??= v;
        }
        return x;
    }
    // Parse a CSS number for certain units (degrees, turn, and percent/100), returning an int if retInt is optionally passed as true
    static parseCSSNumber(n:string,retInt:boolean=false) : number {
        if (n.endsWith("deg"))
            return (!retInt? parseFloat : parseInt)(n) / 360;
        if (n.endsWith("turn"))
            return (!retInt? parseFloat : parseInt)(n) * 180;
        if (n.endsWith("%"))
            return (!retInt? parseFloat : parseInt)(n) / 100;
        return (!retInt? parseFloat : parseInt)(n);
    }
    // Clamp a number within [`min`,`max`]
    static clamp(x:number,min:number,max:number) : number {
        return Math.min(Math.max(x,min),max);
    }
    // Do nothing; used to condense logical conditions
    static dummy(x?:any) : any {
        return x;
    }
}

// Wrapper combining `HTMLCanvasElement`s and `CanvasRenderingContext2D`s into one instance (also providing a top-level clear method)
class Canvas2D {
    constructor(canvas:HTMLCanvasElement, ctx?:CanvasRenderingContext2D) {
        this.Canvas = canvas;
        this.Context = ctx ?? canvas.getContext("2d") as CanvasRenderingContext2D;
    }
    Canvas:HTMLCanvasElement;
    Context:CanvasRenderingContext2D;
    ClearCanvas() : void {
        this.Context.clearRect(0,0,this.Canvas.width,this.Canvas.height); // Clear a rectangle covering the whole of the canvas
    }
}

// Readonly X/Y pair
class Point {
    constructor(x:number, y:number) {
        this.X = x;
        this.Y = y;
    }
    readonly X:number;
    readonly Y:number;
}

// Class representing a color, with the ability to dynamically modify the opacity, which is also able to be formatted to rgba() to be used in CSS
class Color {
    constructor(r:number, g:number, b:number, opacity:number=1.0) {
        this._rgb = `rgba(${r},${g},${b}`;
        this.Opacity = opacity;
    }
    // Convert hexa to rgba, then return that as a Color instance
    static fromHex(hex:string) : Color {
        hex = hex.replace("#","");
        // Convert each from string hexadecimal (radix/base-16) to decimal (radix/base-10)
        const [r,g,b]:number[] = [parseInt(hex.substring(0,2),16),parseInt(hex.substring(2,4),16),parseInt(hex.substring(4,6),16)];
        let o:number = 255; // Define default opacity in case a hex is provided rather than a hexa
        if (hex.length > 6)
            o = parseInt(hex.substring(6,8),16);
        return new Color(r,g,b,o/255); // `o/255` to convert opacity/255 to opacity/1
    }
    // Adapted* version of https://gist.github.com/mjackson/5311256 > hslToRgb()
    // Uses fancy math formulas to convert hsla to rgba, then return that as a Color instance
    // *adapted to both the TypeScript language and also to fit my use case better
    static fromHSLA(h:number,s:number,l:number,a?:number) : Color {
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
            let q:number = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p:number = 2 * l - q;
            return new Color(hue2rgb(p, q, h + 1/3),hue2rgb(p, q, h),hue2rgb(p, q, h - 1/3),a);
        }
    }
    // Convert css color strings (rgb(a), hex(a), hsl(a)) to a Color instance
    static fromCSS(s:string) : Color|undefined {
        if (s.startsWith("rgb")) {
            let r:number,g:number,b:number,a:number|undefined;
            // Get [red,green,blue] or [red,green.blue,alpha] depending on whether an rgb or rgba value has been passed
            let data:string[];
            if (s.startsWith("rgba"))
                data = s.substring(5,s.length-1).split(",",4);
            else
                data = s.substring(4,s.length-1).split(",",3);
            [r,g,b] = [r = parseInt(data[0]),g = parseInt(data[1]),b = parseInt(data[2])];
            if (data.length > 3) // Use provided alpha when applicable
                a = parseFloat(data[3]);
            return new Color(r,g,b,a);
        }
        if (s.startsWith("#"))
            return Color.fromHex(s);
        if (s.startsWith("hsl")) {
            let h:number,_s:number,l:number,a:number|undefined;
            // Get [hue,saturation,lightness] or [hue,saturation,lightness,alpha] depending on whether an hsl or hsla value has been passed
            let data:string[];
            if (s.startsWith("hsla"))
                data = s.substring(5,s.length-1).split(",",4);
            else
                data = s.substring(4,s.length-1).split(",",3);
            [h,_s,l] = [Utils.parseCSSNumber(data[0],true),Utils.parseCSSNumber(data[1],true),Utils.parseCSSNumber(data[2],true)];
            return Color.fromHSLA(h,_s,l,a);
        }
    }
    private _rgb:string; // Incomplete CSS rgba string (eg. "rgba(r,g,b"
    Opacity:number;
    get RGBA() : string {
        return `${this._rgb},${this.Opacity})`; // Return complete CSS rgba string
    }
    // Return CSS string with specified opacity value
    WithOpacity(opacity:number) : string {
        let o:number = this.Opacity;
        this.Opacity = opacity;
        const s:string = this.RGBA;
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

// Define scoreboard text elements
const levelText:HTMLElement = document.getElementById("level") as HTMLElement;
const scoreText:HTMLElement = document.getElementById("score") as HTMLElement;
const lineClearRelText:HTMLElement = document.getElementById("line-clear-rel") as HTMLElement;
const highScoreText:HTMLElement = document.getElementById("highscore") as HTMLElement;
const newHighScoreBadge:HTMLElement = document.getElementById("new-highscore") as HTMLElement;

var maxMovement:number = 0; // The overall maximum vertical movement in `Game.InstantDrop` (used when `Game.Gravity` is `true`)
class Game {
    static AutoPause:boolean = true; // Automatically pause upon the tab/window losing focus
    static LockMovement:boolean = false; // Prevent the current block from being moved
    static ResetHighScore:boolean = false;
    static ResetSettings:boolean = false;
    // Define canvases upon which blocks and other game elements are rendered
    static readonly BgCanvas:Canvas2D = new Canvas2D(document.getElementById("bg") as HTMLCanvasElement);
    static readonly GameCanvas:Canvas2D = new Canvas2D(document.getElementById("game") as HTMLCanvasElement);
    static readonly BlockCanvas:Canvas2D = new Canvas2D(document.getElementById("block") as HTMLCanvasElement);
    static readonly StaleCanvas:Canvas2D = new Canvas2D(document.getElementById("stale") as HTMLCanvasElement);
    static readonly HoldCanvas:Canvas2D = new Canvas2D(document.getElementById("hold") as HTMLCanvasElement);
    static readonly NextCanvas:Canvas2D = new Canvas2D(document.getElementById("next") as HTMLCanvasElement);
    // Load highscore from localStorage
    static loadHighScore() : void {
        let highscore:string|null = localStorage.getItem("HighScore");
        Game.highScore = highscore? parseInt(highscore) : 0;
        highScoreText.textContent = Utils.ShortenNumber(Game.highScore);
    }
    // Update the text of all scoreboard info elements
    private static drawScoreText() : void {
        levelText.textContent = Game.LevelNumber.toString();
        scoreText.textContent = Utils.ShortenNumber(Game.Score);
        lineClearRelText.textContent = (Game.NextLevel.ClearGate-Game.linesCleared).toString()+" line(s)";
        bounceAnim(document.getElementById("score-box") as HTMLElement);
    }
    private static linesCleared:number = 0; // Total lines cleared in a run (used for tracking when to go up to the next level)
    static get LinesCleared() : number {
        return Game.linesCleared;
    }
    static set LinesCleared(lines:number) {
        Game.linesCleared = lines;
        Game.drawScoreText();
    }
    static BlockScale:number = 1.0;
    static LockDelay:number = 500;
    private static highScore:number;
    static get HighScore() : number {
        return Game.highScore;
    }
    // Set highscore to score if it's greater, save highscore to localStorage, update/reset visuals
    static set HighScore(score:number) {
        Game.highScore = Math.max(score,Game.highScore);
        localStorage.setItem("HighScore",Game.highScore.toString());
        highScoreText.textContent = Utils.ShortenNumber(Game.highScore);
        newHighScoreBadge.classList.remove("new-highscore");
    }
    private static score:number = 0;
    static addScore(score:number) {
        Game.Score += score*Game.Level.ScoreMultiplier;
    }
    static set Score(score:number) {
        Game.score = Math.round(score); // Ensure score is always an int
        if (Game.linesCleared >= Game.NextLevel.ClearGate) // If score reaches the line clear gate, update it
            Game.Level = Game.LevelIndex+1;
        Game.drawScoreText();
        // Update highscore and show the new best badge if it's a PB, else ensure the badge is hidden and the highscore field displays the highscore
        if (Game.score > Game.highScore) {
            highScoreText.textContent = Utils.ShortenNumber(Game.score);
            if (!newHighScoreBadge.classList.contains("new-highscore")) {
                newHighScoreBadge.classList.add("new-highscore");
                SFX.newbest.play();
            }
        } else {
            highScoreText.textContent = Utils.ShortenNumber(Game.HighScore ?? 0);
            newHighScoreBadge.classList.remove("new-highscore");
        }
    }
    static get Score() : number {
        return Game.score;
    }
    static KeyRepeatInterval:number = 150; // Time (ms) between repeated presses
    static KeyRepeatDelay:number = 250; // Delay (ms) before repeating keys starts
    static MoveKeyRepeatInterval:number = 75;
    static MoveKeyRepeatDelay:number = 125;
    static AudioVol:number = 100;
    static DisableGrid:boolean = false; // Whether the grid should be drawn
    static AnimMoveTime:number = 60; // Animation duration for the block being moved
    static AnimDropTime:number = Game.AnimMoveTime*2; // Animation duration for the block being hard dropped
    static AnimClearTime:number = Math.trunc((Game.AnimMoveTime/2)*10); // Animation duration for a line being cleared
    static FixedAnimClearTime:boolean = true; // Whether `AnimClearTime` should be applied such that clearing one line takes `AnimClearTime` ms, or whether it should take `AnimClearTime`ms per block (meaning at higher game widths it'd take longer and vice versa)
    static MoveEaseStyle:Enum.easeStyle = "Linear"; // Easing function
    static MoveEaseDirection:Enum.easeDir = "InOut"; // Easing direction
    static DropEaseStyle:Enum.easeStyle = "Circular";
    static DropEaseDirection:Enum.easeDir = "In";
    static get MoveEase() : typeof Easing.Sinusoidal.InOut {
        return Easing[Game.MoveEaseStyle][Game.MoveEaseDirection]; // Get `EasingFunction` instance based on easing function and direction
    }
    static get DropEase() : typeof Easing.Sinusoidal.InOut {
        return Easing[Game.DropEaseStyle][Game.DropEaseDirection];
    }
    static Anims:boolean = true; // Global animation toggle
    static Physics:boolean = false; // When enabled, blocks won't keep their shape after falling, ensuring that no block pixel will ever be floating (gravity)
    static KeyBinds:Record<string,string> = {};
    private static pixelSize(gameWidth:number=Game.Width,gameHeight:number=Game.Height,canvasWidth:number=Game.GameCanvas.Canvas.width,canvasHeight:number=Game.GameCanvas.Canvas.height) : number {
        return Math.min(canvasWidth/gameWidth,canvasHeight/gameHeight);
    }
    static get PixelSize() : number {
        return Game.pixelSize(); // Get the maximum size of a pixel based on screen and game dimensions
    }
    static BasePixelSize:number;
    static Width:number = 10;
    static Height:number = 20;
    static readonly BaseWidth:number = Game.Width;
    static readonly BaseHeight:number = Game.Height;
    static SpeedMul:number = 1.0;
    static readonly BaseSpeedMs:number = 1000.0; // Base time (ms) for a block to drop 1 row
    static GhostBlockOpacity:number = 0.25; // The ghost block appears at the lowest possible position of the current block (where it'd end up upon hard dropping)
    static AnimGhostBlock:boolean = true; // Ease the ghost block's horizontal movements
    static RawBlockOpacity:number = 0.0; // The AccuBlock shows exactly where the current block actually is, ignoring all animations (useful when `AnimMoveTime` is very high)
    static Paused:boolean = true; // Game starts paused on the main menu screen
    static CurrentBlock?:BlockInstance;
    private static LevelIndex:number; // Index of the current level (0-based)
    static get LevelNumber() : number {
        return Game.LevelIndex+1; // 1-based index of the current level
    }
    private static get Level() : Level {
        return Levels.get(Game.LevelIndex);
    }
    private static get LastLevel() : Level {
        return Levels.get(Game.LevelIndex-1); // Returns the previous level
    }
    private static get NextLevel() : Level {
        return Levels.get(Game.LevelIndex+1);
    }
    // Play the levelup sound (if applicable) and update level index/speed (and visuals)
    private static set Level(level:number) {
        if (level > Game.LevelIndex) SFX.levelup.play();
        Game.LevelIndex = level;
        Game.LevelSpeed = Game.Level.Speed;
        Game.drawScoreText();
    }
    static get Running() : boolean {
        return Game._running;
    }
    private static _running:boolean;
    private static _data:(number|BlockData)[][];
    private static _thread_id:number|null; // Game tick setTimeout id
    private static _lock_thread_id:number|null; // Block lock delay setTimeout id
    private static GridDrawn:boolean = false; // Whether the grid has already been drawn (as it doesn't need to be redrawn upon resetting)
    // Get the exact center real pixel of the passed canvas
    private static _centerPoint(canvas:Canvas2D) : Point {
        return new Point(
            canvas.Canvas.width/2,
            canvas.Canvas.height/2
        );
    }
    // Get the exact center real pixel of the `GameCanvas`
    static get CenterPoint() : Point {
        return Game._centerPoint(Game.GameCanvas);
    }
    // Get the center of the passed canvas based on pixels being `Game.PixelSize`
    static CanvasOffset(canvas:Canvas2D,width:number=Game.Width,height:number=Game.Height,pxsz:number=Game.PixelSize) : Point {
        return new Point(
            Game._centerPoint(canvas).X-(width*pxsz)/2,
            Game._centerPoint(canvas).Y-(height*pxsz)/2,
        );
    }
    // Get the center of the `GameCanvas` based on pixels being `Game.PixelSize`
    static get GameOffset() : Point {
        return Game.CanvasOffset(Game.GameCanvas);
    }
    static LevelSpeed:number = 1.0; // The current speed multiplier based on the current level
    static get Speed() : number {
        return Game.BaseSpeedMs / Game.LevelSpeed / Game.SpeedMul; // Calculate game speed based on base speed, current level speed multiplier, and generic speed multiplier (from Settings)
    }
    static get Data() : readonly (readonly (number|BlockData)[])[] {
        return Game._data;
    }
    // Reset game logic to prepare for a new game
    static Reset() : void {
        if (Game.score > Game.HighScore) Game.HighScore = Game.score;
        Game._running = false;
        Game.TogglePause(true);
        Game.LockMovement = false;
        Game.Level = 0;
        Game.linesCleared = 0;
        Game.LevelSpeed = 1;
        Game.LevelSpeed = Game.Level.Speed;
        Game.Score = 0;
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
    static ReloadPage = ()=>window.location.reload(); // Needed alias due to how the settings system works
    // Reschedule GameTick thread when there's nothing more to do Game tick
    private static rgt() : void {
        Game._thread_id = setTimeout(Game.GameTick,Game.Speed);
    }
    // Run every tick based on the current speed
    private static async GameTick() : Promise<void> {
        if (Game.Paused || Game.LockMovement) return Game.rgt(); // Can't move; try again later
        const moveRes:boolean|undefined = await Game.CurrentBlock?.Move(0,1,undefined,true); // Result of trying to make the current block fall one row
        if (Game.CurrentBlock && moveRes === false && !Game._lock_thread_id) { // If falling explicitly failed, the current block exists, and we're not waiting on the lock delay, start the lock delay
            const curBlock:BlockInstance|undefined = Game.CurrentBlock; // Store current block to make sure we didn't already stamp later
            Game._lock_thread_id = setTimeout(async ()=>{
                if (curBlock !== Game.CurrentBlock || Game.CurrentBlock?.IsValidPosition(undefined,(Game.CurrentBlock?.TargetPos?.Y ?? 0)+1)) return; // If we've already stamped, or we can now move down 1 row, cancel the stamping
                await Game.CurrentBlock?.Stamp();
                Game._lock_thread_id = null;
            },Game.LockDelay);
        } else if (Game.CurrentBlock && moveRes && Game._lock_thread_id) { // Else, if the current block exists, falling explicit succeeded, and we're still waiting for the lock delay, stop waiting for it
            clearInterval(Game._lock_thread_id);
            Game._lock_thread_id = null;
        }
        return Game.rgt();
    }
    // Start the game and set up various variables as well as starting the GameTick loop
    static StartGame() : void {
        if (Game._running) return;
        Game._running = true;
        Game.TogglePause(false);
        Game.blockFeed = new FeedtapeArray(4);
        Game.blockFeed.fill(Game.randBlock,1);
        Game.CurrentBlock = Game.RandomBlock();
        Game.CurrentBlock?.Draw();
        if (Game._thread_id !== null) clearTimeout(Game._thread_id);
        Game.rgt();
    }
    private static blockFeed:FeedtapeArray<Block>; // Conveyor of future blocks
    private static randomBag:BagArray<Block>; // Bag of blocks to randomly pick from
    // Pick a random block from the bag
    private static randBlock() : Block {
        if (!Game.randomBag) Game.randomBag = new BagArray(Object.values(Blocks)); // Construct `Game.randomBag` if it hasn't been already
        return Game.randomBag.pick();
    }
    private static heldBlock:Block|undefined;
    private static holdCooldown:boolean = false; // Debounce for the cooldown between being able to hold the current block again (one block being stamped)
    // Store away the current block to use at a later time, either swapping for the previously held block or the next block in line
    static HoldBlock() : void {
        if (Game.holdCooldown) return;
        Game.holdCooldown = true;
        if (!Game.heldBlock) { // Pick from the next block in line
            Game.heldBlock = Game.CurrentBlock?.toBlock();
            Game.CurrentBlock = Game.RandomBlock();
        } else { // Pick from the previously held block
            const buffer:Block|undefined = Game.heldBlock; // Buffer to allow swapping values
            Game.heldBlock = Game.CurrentBlock?.toBlock();
            Game.CurrentBlock = new BlockInstance(buffer);
        }
        Game.CurrentBlock?.Draw();
        Game.RedrawHeldBlock();
        if (!Game.heldBlock) return;
        SFX.hold.play();
        bounceAnim(Game.HoldCanvas.Canvas);
    }
    // Choose a random block and prep it to be immediately used as the next current block
    static RandomBlock() : BlockInstance|undefined {
        Game.LockMovement = false; // Allow new block to be moved
        Game.blockFeed.push(Game.randBlock());
        const newBlock:BlockInstance|undefined = Game.blockFeed.get(0)? new BlockInstance(Game.blockFeed.get(0) as Block) : undefined; // Get newest randomly chosen block
        Game.RedrawNextBlocks();
        bounceAnim(Game.NextCanvas.Canvas);
        return newBlock;
    }
    static get NextBlock() : Block|undefined {
        return Game.blockFeed.get(Game.blockFeed.length-1);
    }
    // Draw the grid, either covering the whole canvas or a specific portion (namely on top of the held and next blocks in their respective canvases), and draw the background depending upon the passed enum
    static DrawGrid(canvas?:Canvas2D,mode:Enum.GridMode=Enum.GridMode.Both,width?:number,height?:number,sX:number=0,sY:number=0) : void {
        const gameCanvas:Canvas2D = canvas ?? Game.GameCanvas;
        const bgCanvas:Canvas2D = canvas ?? Game.BgCanvas;
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
        // Draw each grid column
        for (let x=sX; x<=(width? sX+width : Game.Width); x++) {
            gameCanvas.Context.beginPath();
            gameCanvas.Context.moveTo(Game.GameOffset.X+x*Game.PixelSize,Game.GameOffset.Y+sY);
            gameCanvas.Context.lineTo(Game.GameOffset.X+x*Game.PixelSize,Game.GameOffset.Y+sY+(height ?? Game.Height)*Game.PixelSize);
            gameCanvas.Context.stroke();
        }
        // Draw each grid row
        for (let y=sY; y<=(height? sY+height : Game.Height); y++) {
            gameCanvas.Context.beginPath();
            gameCanvas.Context.moveTo(Game.GameOffset.X+sX,Game.GameOffset.Y+y*Game.PixelSize);
            gameCanvas.Context.lineTo(Game.GameOffset.X+sX+(width ?? Game.Width)*Game.PixelSize,Game.GameOffset.Y+y*Game.PixelSize);
            gameCanvas.Context.stroke();
        }
    }
    // Write shape to the game state for collisions
    static WriteShape(self:BlockInstance|Game, x?:number, y?:number, shape?:number[][]) : void {
        if (Game !== self && self !== Game.CurrentBlock) return;
        let data:BlockData;
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
    // Erase a line of blocks from the game state
    static async EraseLine(self:BlockInstance|Game, y?:number) : Promise<void> {
        if (Game !== self && self !== Game.CurrentBlock) return;
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
    // Draw the held block in the HoldCanvas
    static RedrawHeldBlock() : void {
        Game.HoldCanvas.ClearCanvas();
        if (!Game.heldBlock) return;
        const block:BlockInstance = new BlockInstance(Game.heldBlock as Block).Clone();
        let [lY, hY]:number[] = [block.LowestPoint.Y, block.HighestPoint.Y];
        if (lY === hY) hY = 0;
        BlockInstance.Draw(block,Game.HoldCanvas,Game.BaseWidth/2-block.CurrentShape[0].length/2,(Game.BaseHeight/2)-(lY-hY),true); // Draw hold block
        if (!Game.DisableGrid) {
            Game.HoldCanvas.Context.strokeStyle = "#18192680";
            BlockInstance.Draw(block,Game.HoldCanvas,Game.BaseWidth/2-block.CurrentShape[0].length/2,(Game.BaseHeight/2)-(lY-hY),true,true);
        }
    }
    // Draw the next 3 blocks in the NextCanvas
    static RedrawNextBlocks() : void {
        Game.NextCanvas.ClearCanvas();
        if (!Game.blockFeed) return;
        const positions:Point[] = [];
        for (let i=1; i<Game.blockFeed.length; i++) {
            const blockShape:Block|undefined = Game.blockFeed.get(i);
            if (!blockShape) continue;
            const block:BlockInstance = new BlockInstance(blockShape).Clone();
            let hY:number = block.HighestPoint.Y;
            const prevBlock:BlockInstance|undefined = Game.blockFeed.get(i-1) && positions[i-1]? new BlockInstance(Game.blockFeed.get(i-1) as Block) : undefined;
            const [pX, pY]:number[] = [Game.BaseWidth/2-block.CurrentShape[0].length/2,(positions[i-1]?.Y ?? 5)+(prevBlock?.LowestPoint.Y ?? -1)+1-hY+1];
            positions[i] = new Point(pX,pY);
            BlockInstance.Draw(block,Game.NextCanvas,pX,pY,true); // Draw next block
            if (!Game.DisableGrid) {
                Game.NextCanvas.Context.strokeStyle = "#18192680";
                BlockInstance.Draw(block,Game.NextCanvas,pX,pY,true,true);
            }
        }
    }
    // Redraw the game state
    static RedrawCanvas() : void {
        Game.StaleCanvas.ClearCanvas();
        for (let y=0; y<Game.Height; y++) {
            for (let x=0; x<Game.Width; x++) {
                const col:BlockData|number = Game._data[y][x];
                if (col === 0) continue;
                Game.StaleCanvas.Context.fillStyle = (col instanceof BlockData) ? col.Color.RGBA : "white";
                let [_x,_y,_w,_h]:number[] = [Game.GameOffset.X+x*Game.PixelSize,Game.GameOffset.Y+y*Game.PixelSize,Game.PixelSize*Game.BlockScale,Game.PixelSize*Game.BlockScale];
                _x-=(_w-_w/Game.BlockScale)/2;
                _y-=(_h-_h/Game.BlockScale)/2;
                Game.StaleCanvas.Context.fillRect(_x,_y,_w,_h);
            }
        }
    }
    // Instantly drop the column at `px`, starting at `py`
    static async InstantDrop(px:number,py:number) : Promise<void> {
        if (py >= Game.Height-1 || Game._data[py][px] === undefined) return;
        let movement:number = 0;
        for (let y=py+1; y<Game.Height; y++) {
            if (Game._data[y][px] !== 0) break;
            if (Game._data[py][px] === 0) continue;
            movement++;
        }
        if (movement > maxMovement) maxMovement = movement;
        for (let y = py+1; y<Game.Height; y++) {
            if (Game._data[y][px] !== 0) break;
            if (Game._data[py][px] === 0) continue;
            Game._data[y][px] = Game._data[py][px];
            Game._data[py][px] = 0;
            py++;
            if (Game.Anims) {
                Game.RedrawCanvas();
                await sleep(Game.FixedAnimClearTime? Game.AnimClearTime/Game.Width : Game.AnimClearTime);
            }
        }
    }
    // Detect and handle line clears
    private static async handleClears() : Promise<boolean> {
        var cFlag:boolean = false;
        let lineCount:number = 0;
        Game.BlockCanvas.ClearCanvas();
        for (let y=0; y < Game.Height; y++) {
            if (Game._data[y].every(col=>col!==0)) {
                SFX.clear.play();
                lineCount++;
                Game.LinesCleared++;
                await Game.EraseLine(Game, y);
                for (let oY=y-1; oY>=0; oY--) {
                    for (let x=0; x<Game.Width; x++) {
                        Game._data[oY+1][x] = Game._data[oY][x];
                        if (!cFlag) cFlag = true;
                    }
                }
            }
        }
        if (Game.Physics) {
            maxMovement = 0;
            for (let y=Game.Height-1; y>0; y--) {
                for (let x=0; x<Game.Width; x++) {
                    Game.InstantDrop(x,y);
                }
            }
            await sleep((Game.FixedAnimClearTime? Game.AnimClearTime/Game.Width : Game.AnimClearTime)*maxMovement);
            for (let y=Game.Height-1; y>0;  y--) {
                if (Game._data[y].every(col=>col!==0)) {
                    cFlag = true;
                    break;
                }
            }
        }
        if (lineCount > 0) Game.addScore(Enum.BaseScores.Clears.get(lineCount-1));
        return cFlag;
    }
    // Handle line clears, redraw the canvas, choose a new block, and potentially end the game if a new block cannot be placed upon the current block being stamped
    static async BlockStamped(self:BlockInstance) : Promise<void> {
        Game.holdCooldown = false;
        if (self !== Game.CurrentBlock) return;
        while (await Game.handleClears());
        Game.RedrawCanvas();
        Game.CurrentBlock = Game.RandomBlock();
        if (!Game.CurrentBlock?.IsValidPosition()) {
            Game.Reset();
        }
        Game.CurrentBlock?.Draw();
    }
    // Pause/unpause the game, either toggling or setting the paused state to the passed parameter
    static TogglePause(paused?:boolean) : void {
        // Hide all current modals (excluding the pause menu, since it's technically not a `.modal`)
        document.querySelectorAll(".modal.active").forEach(el=>{
            el.classList.remove("active");
            if (el.id === "settings")
                RejectSettingsBuffer.Fire();
        });
        const wasPaused:boolean = Game.Paused; // Whether or not the game was previously paused at the time of calling Game function
        Game.Paused = paused === undefined? !Game.Paused : paused;
        if (Game.Paused)
            document.getElementById("pause-ind")?.classList.add("paused");
        else
            document.getElementById("pause-ind")?.classList.remove("paused");
        // Blur/unblur game elements
        document.querySelectorAll(".game-canvas, .right-stack").forEach(canvas=>{
            if (Game.Paused)
                canvas.classList.add("paused");
            else
                canvas.classList.remove("paused");
        });
        // Set pause text based on whether the game has ended or it just being paused
        if (!Game._running) {
            (document.getElementById("pause-text") as HTMLElement).innerText = "Game Over!";
            (document.getElementById("pause-resume") as HTMLElement).classList.add("hidden");
            (document.getElementById("pause-restart") as HTMLElement).innerText = "Start";
            if (!wasPaused) SFX.gameover.play();
        } else {
            (document.getElementById("pause-text") as HTMLElement).innerText = "Paused...";
            (document.getElementById("pause-resume") as HTMLElement).classList.remove("hidden");
            (document.getElementById("pause-restart") as HTMLElement).innerText = "Restart";
        }
        if (Game.Paused)
            updateSelectionButtons();
    }
}

// Runs all given functions when fired
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

const settingsWin:HTMLElement|null = document.getElementById("settings"); // Settings window; the parent/most common ancestor of all settings elements
const Settings = { // All settings keys/attribute names of `Game` mapped to their input element
    AutoPause: settingsWin?.querySelector("#settings-auto-pause"),
    ResetSettings: settingsWin?.querySelector("#settings-advanced-reset-settings"),
    ResetHighScore: settingsWin?.querySelector("#settings-advanced-reset-highscore"),
    BlockScale: settingsWin?.querySelector("#settings-fun-block-scale"),
    LockDelay: settingsWin?.querySelector("#settings-game-lock-delay"),
    KeyRepeatDelay: settingsWin?.querySelector("#settings-key-repeat-delay"),
    KeyRepeatInterval: settingsWin?.querySelector("#settings-key-repeat-int"),
    MoveKeyRepeatDelay: settingsWin?.querySelector("#settings-key-repeat-move-delay"),
    MoveKeyRepeatInterval: settingsWin?.querySelector("#settings-key-repeat-move-int"),
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
const SettingsBuffer:Map<string,Enum.bufferData> = new Map<string,Enum.bufferData>(); // Stores potential setting changes before pushing them (allowing for discarding changes)
const settingsTitle:HTMLDivElement = document.getElementById("settings-title") as HTMLDivElement;
// Load (or reset) settings (and other data) from localStorage and display their saved values
function LoadSettings() : void {
    Game.BasePixelSize = Game.PixelSize;
    // Reset highscore if we find the ResetHighScore setting was checked
    if (localStorage.getItem("SETTINGS/ResetHighScore")) {
        localStorage.removeItem("SETTINGS/ResetHighScore"); // Remove the ResetHighScore setting from localStorage to ensure it doesn't get unintentionally reset next time
        localStorage.removeItem("HighScore"); // Reset highscore by removing it from localStorage before it's read in two lines
    }
    Game.loadHighScore();
    // Reset all settings if we find the ResetSettings setting was checked
    if (localStorage.getItem("SETTINGS/ResetSettings")) {
        // Store all saved settings keys to ensure the for loop doesn't produce errors from newly missing indicies
        const keys:string[] = [];
        for (let i=0; i<localStorage.length; i++) {
            let k:string|null = localStorage.key(i);
            if (!k || !k.startsWith("SETTINGS/")) continue; // All settings are prefixed by "SETTINGS/"; don't reset the highscore for example here
            keys.push(k);
        }
        for (const k of keys)
            localStorage.removeItem(k);
    }
    // Load all settings
    for (let i=0; i<localStorage.length; i++) {
        let k:string|null = localStorage.key(i);
        if (!k || !k.startsWith("SETTINGS/")) continue; // Only load settings
        const strValue:string|null = localStorage.getItem(k); // Stringified JSON of data
        if (!strValue) continue;
        k = k.slice("SETTINGS/".length); // Remove the "SETTINGS/" prefix from the key (since Game's attributes aren't prefixed)
        const jsonValue:{value:any,el:string} = JSON.parse(strValue); // Parsed object from the saved stringified JSON containing the saved value and the input element's id
        const el:HTMLElement|null = document.getElementById(jsonValue.el); // Get input element
        if (!el) continue;
        setAttr(Game,k,jsonValue.value); // Update the setting's value in Game
        // Display setting's value formatted based on `el`'s attributes
        // Some settings (volume slider) have an additional label to provide more precise feedback
        const label:HTMLElement|null = document.getElementById(jsonValue.el+"-label");
        if (label) label.textContent = jsonValue.value.toString();
        // If <input>, then set `value(AsNumber)`/`checked` property, else set `textContent`
        if (el instanceof HTMLInputElement) {
            switch (el.type) {
                case "range":
                case "number":
                    if (el.classList.contains("percent"))
                        el.valueAsNumber = jsonValue.value*parseFloat(el.max);
                    else
                        el.valueAsNumber = jsonValue.value;
                    break;
                case "checkbox":
                    el.checked = jsonValue.value
                    break;
                default:
                    el.value = jsonValue.value;
                    break;
            }
        } else {
            el.textContent = jsonValue.value;
        }
    }
}
// Add newly changed settings to the buffer
function UpdateSettingsBuffer(k:string, data:Enum.bufferData) : void {
    // Update the setting's label if its present
    const label:HTMLElement|null = document.getElementById(data.el.id+"-label");
    if (label) label.textContent = data.value;
    // Don't add to the buffer if we've set the setting back to its current value
    if (getAttr(Game,k) === data.value) {
        SettingsBuffer.delete(k);
        if (SettingsBuffer.size === 0)
            settingsTitle.textContent = "Settings"; // Show visually that the buffer is empty
        return
    }
    SettingsBuffer.set(k,data);
    settingsTitle.textContent = "Settings*"; // Show visually that the buffer isn't empty
}
const DestructiveFuncs:Function[] = [Game.ReloadPage]; // Define function(s) that make other code not able to be run; these need to be run last
// Commit the buffer to Game
function WriteSettingsBuffer() : void {
    // Get functions that should run when updating each setting (do everything otuside of the loops to avoid repeated runs and to ensure destructive functions can be run last)
    const funcs:Function[] = [];
    for (const [k,v] of SettingsBuffer.entries()) {
        setAttr(Game,k,v.value); // Commit setting
        localStorage.setItem(`SETTINGS/${k}`,JSON.stringify({value:v.value,el:v.el.id})); // Save the setting's new value and its id
        // Store functions to `funcs` should they exist and have not already been added
        if (v.funcs && v.funcs.length !== 0) {
            for (const f of v.funcs) {
                let x:Function|undefined = getAttr(Game,f);
                if (x === undefined || funcs.indexOf(x) !== -1) continue;
                funcs.push(x);
            }
        }
    }
    SettingsBuffer.clear(); // Clear buffer
    settingsTitle.textContent = "Settings"; // Show visually that the buffer is empty
    const destructiveFuncs:Function[] = []; // Destructive funcs found in this buffer
    for (const f of funcs) {
        // Check if this function is defined in `DestructiveFuncs`, adding it to `destructiveFuncs` if true
        const dI:number = DestructiveFuncs.indexOf(f);
        if (dI !== -1) {
            destructiveFuncs[dI] = f;
            continue;
        }
        f(); // Run the non-destructive function
    }
    for (const f of destructiveFuncs) f(); // Run each destructive function
}
const RejectSettingsBuffer:Signal = new Signal(); // Signal for the discard button to reset settings' labels
RejectSettingsBuffer.Connect(()=>{
    settingsTitle.textContent = "Settings";
});
// Handle all settings elements
function handleSettings() : void {
    for (const [k, el] of Object.entries(Settings)) {
        const li:HTMLElement = el.parentElement as HTMLElement; // Find the element's parent <li>
        li.title = `${li.title !== ""? `${li.title}\n` : ""}Default: ${getAttr(Game,k)}`; // Append the default value to the tooltip
        const label:HTMLElement|null = document.getElementById(el.id+"-label");
        if (label) label.textContent = getAttr(Game,k);
        if (el instanceof HTMLInputElement) {
            if (el.type === "number" || el.type === "range") {
                const [min, max]:number[] = [parseFloat(el.min ?? "0"),parseFloat(el.max ?? "100")]; // Find the setting's range [`min`,`max`]
                const defaultVal:number = getAttr(Game,k); // Get the default value
                el.valueAsNumber = getAttr(Game,k)*(el.classList.contains("percent")? max : 1) // Conver to percent/`max` if it's a percent-type setting
                const funcs:string[] = (el.dataset.funcs ?? "").split(","); // Get Array of passed method names
                // Update buffer when value changed
                el.addEventListener("change",()=>{
                    if (isNaN(el.valueAsNumber)) { // User tries to set it to an invalid/blank value
                        el.valueAsNumber = SettingsBuffer.get(k)?.value ?? (getAttr(Game,k) ?? defaultVal)*(el.classList.contains("percent")? max : 1); // Set to either: current buffer value, current value, or default value depending on which isn't `undefined|null` (and convert to percent/`max` if applicable)
                        return;
                    }
                    const val:any = (el.classList.contains("int")? Math.trunc : Utils.dummy)(Utils.clamp(el.valueAsNumber,min,max)); // Convert to int if applicable, and clamp value to [`min`,`max`]
                    UpdateSettingsBuffer(k,{ value:(el.classList.contains("percent")? val/max : val), funcs:funcs, el:el }); // Update buffer, passing the value as a normal value (not percent/`max`), the funcs Array, and the element
                    el.valueAsNumber = val; // Update setting's text
                })
                // Reset to either current value or default value (formatted as a percent/`max` if needed) when discarding
                RejectSettingsBuffer.Connect(()=>{
                    el.valueAsNumber = (getAttr(Game,k) ?? defaultVal)*(el.classList.contains("percent")? max : 1);
                });
            } else if (el.type === "checkbox") { // Same as number/range, just simpler since it's just a boolean value
                el.checked = getAttr(Game,k);
                const defaultVal:boolean = el.checked;
                const funcs:string[] = (el.dataset.funcs ?? "").split(",");
                el.addEventListener("change",()=>{
                    UpdateSettingsBuffer(k,{ value:el.checked, el:el, funcs:funcs });
                });
                RejectSettingsBuffer.Connect(()=>{
                    el.checked = getAttr(Game,k) ?? defaultVal;
                });
            } else { // Same as above, just for a generic string
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
        } else if (el instanceof HTMLSelectElement) { // Same, but for combo boxes
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
handleSettings();

// Contains the color of a block (useful for drawing stale/stamped pixels correctly)
class BlockData {
    constructor(color:Color|string=Color.fromHex("#FFFFFFFF")) {
        if (typeof color === "string") color = Color.fromHex(color+"FF");
        this.Color = color;
    }
    Color:Color;
}

// Easily check if a number is between two other constant numbers (eg. define a range once, easily check it with different numbers)
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

const Levels:InfiniteLevelArray = new InfiniteLevelArray([]); // Push levels later since `Level` references `Levels`, and defining the levels in here would reference `Level`, meaning it would always error
// Class representing a level, with a name (so duplicate levels can still be correctly detected in `Levels`), and the ability to modify the speed, total line clear gate, and score multiplier
class Level {
    // Default clearGate function simply makes the gate 10 line clears each level (it's not relative so this simple math function is needed)
    constructor(name:string, speed:number, clearGate:(LevelNumber:number)=>number=(LevelNumber:number)=>10*(LevelNumber-1), speedMode:Enum.ModeOperationFunction=Enum.ModeOperation.Multiply, speedRange:NumberRange=NumberRange.infinite, scoreMultiplier:(index:number)=>number=(index:number)=>1+(index-1)/100) {
        this.Name = name;
        this.speed = speed;
        this.clearGate = clearGate;
        this.SpeedMode = speedMode;
        this.SpeedRange = speedRange;
        this.scoreMultiplier = scoreMultiplier;
    }
    // Clone a level with a specified index. Needed since an element's index cannot be naturally found via indexOf() in an InfiniteArray after reaching past it's real length
    Clone(index:number) : Level {
        const lvl:Level = new Level(this.Name,this.Speed,this.clearGate,this.SpeedMode,this.SpeedRange,this.scoreMultiplier);
        lvl.levelIndex = index;
        return lvl;
    }
    private levelIndex:number|undefined;
    // Index+1 (for human readability/math purposes)
    get LevelNumber() : number {
        return (this.levelIndex ?? Levels.indexOf(this))+1;
    }
    readonly Name:string;
    private readonly speed:number;
    private readonly clearGate:(LevelNumber:number)=>number;
    private readonly scoreMultiplier:(index:number)=>number;
    get ScoreMultiplier() : number {
        return this.scoreMultiplier(this.LevelNumber);
    }
    readonly SpeedMode:Enum.ModeOperationFunction;
    readonly SpeedRange:NumberRange;
    get Speed() : number {
        return Utils.clamp(this.SpeedMode(this.LevelNumber,Game.LevelSpeed,this.speed),this.SpeedRange.Min,this.SpeedRange.Max);
    }
    get ClearGate() : number {
        return this.clearGate(this.LevelNumber);
    }
    toString() : string {
        return `Level ${this.LevelNumber}: ${this.Speed}x Speed, ${this.ScoreMultiplier}x Score, ${this.ClearGate} Line(s)`;
    }
}

// Infinite levels, since level 2 exponentially increases speed based on current LevelNumber
Levels.push(
    new Level("1",1.0,undefined,Enum.ModeOperation.Set),
    new Level("2..",1.15,undefined,(i:number,x:number,y:number)=>(y)*(1+(.025*i)))
);

// Represents a block and its shapes/color
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

// Represents an in-play block
class BlockInstance extends Block {
    constructor(block:Block) {
        super(block.Shapes, block.Data, block.Symbol);
        this._x = Math.floor(Game.Width/2-this.CurrentShape[0].length/2);
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
    // Check if block is/would be in an invalid position (outside game bounds or inside stamped pixels) at either the current or a passed position/shape
    IsValidPosition(x:number=this.targetPos?.X ?? 0, y:number=this.targetPos?.Y ?? 0, shape:number[][]=this.CurrentShape) : boolean {
        for (const [oY, row] of shape.entries()) {
            for (const [oX, col] of row.entries()) {
                if (col === 0) continue; // Only check where the block actually has pixels
                if (Game.Data[y+oY] === undefined || Game.Data[0][x+oX] === undefined || Game.Data[y+oY][x+oX] !== 0) return false;
            }
        }
        return true;
    }
    private tween:Tween = new Tween([]);
    private targetPos:Point|undefined; // The integer point the block is actually at for collision purposes (mirror of _x,_y when animations are disabled)
    get TargetPos() : Point|undefined {
        return this.targetPos;
    }
    private dropping:boolean = false;
    private isFake:boolean = false; // Tell if a block is a clone
    get IsClone() : boolean {
        return this.isFake;
    }
    Clone() : BlockInstance {
        const clone:BlockInstance = new BlockInstance(this.toBlock());
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
    // Move a block by (x,y) pixels
    async Move(x:number=0, y:number=0, isInstantDrop:boolean=false, isTickedDrop:boolean=false) : Promise<boolean|undefined> {
        if (this.dropping) return undefined;
        x+=this.targetPos?.X ?? 0; y+=this.targetPos?.Y ?? 0; // Convert from relative to absolute coordinates
        if (!this.IsValidPosition(x,y)) return !this.dropping? false : undefined; // Stop if desired position is invalid
        if (isInstantDrop)
            this.dropping = true; // Start hard drop
        else
            SFX.blockMove.play(); // Play move sound when not hard drop
        this.targetPos = new Point(x,y); // Update int target pos
        if (Game.Anims) {
            const tData = {s:new Point(this._x,this._y),e:this.targetPos}; // Tween data (start pos -> end pos)
            const { promise: comp, resolve } = Promise.withResolvers(); // Only return this function once tweens are finished when hard dropping (otherwise game speed is tied to animation speed)
            if (this.tween && this.tween.isPlaying()) // Stop stale tween
                this.tween.stop();
            this.tween = new Tween(tData.s) // Create/setup new team
            .to(tData.e,!isInstantDrop? Game.AnimMoveTime : Game.AnimDropTime)
            .easing(!isInstantDrop? Game.MoveEase : Game.DropEase)
            .dynamic(true)
            .onUpdate(data=>{
                this._x=data.X;
                this._y=data.Y;
                this.Draw();
            });
            var isComplete = false;
            const fin = ()=>{
                isComplete = true;
                if (isInstantDrop) {
                    this.dropping = false;
                    resolve(undefined); // Resolve once tweens are complete with hard drop
                }
            };
            this.tween.onComplete(fin);
            this.tween.onStop(fin);
            this.tween.start();
            const updateFunc = ()=>{ // Update block's position based on tween
                const t:number = performance.now();
                this.tween.update(t);
                if (!isComplete)
                    requestAnimationFrame(updateFunc);
            };
            requestAnimationFrame(updateFunc);
            if (isInstantDrop) await comp; // Only wait for tween completion when hard dropping
        } else {
            // Instantly update without expending resources to create a tween
            [this._x, this._y] = [this.targetPos.X, this.targetPos.Y];
            this.Draw();
            if (isInstantDrop)
                this.dropping = false;
        }
        return !this.dropping? true : false;
    }
    // Rotate block (cycle through block shapes)
    Rotate(reverse:boolean=false) : boolean {
        const success = ()=>{
            this.Draw();
            SFX.blockrotate.play();
            return true;
        };
        let dir:number = (reverse) ? -1 : 1;
        const newRot:number = Utils.OverflowOperate(this.Rotation,dir,0,3); // Wrap around from 4 -> 0 and -1 -> 3
        // If new position with new shape is invalid, try finding a valid position in all four directions
        if (!this.IsValidPosition(undefined,undefined,this.Shapes[newRot])) {
            for (let i=1; i<=this.Shapes[newRot][0].length; i++) {
                if (this.IsValidPosition((this.targetPos?.X ?? 0)-i,undefined,this.Shapes[newRot])) {
                    this._x = this.targetPos?.X ?? 0;
                    this.Rotation = newRot;
                    this._x = (this.targetPos?.X ?? 0)-i;
                    this.targetPos =  new Point(this._x,this.targetPos?.Y ?? 0);
                    return success();
                }
                if (this.IsValidPosition((this.targetPos?.X ?? 0)+i,undefined,this.Shapes[newRot])) {
                    this._x = this.targetPos?.X ?? 0;
                    this.Rotation = newRot;
                    this._x = (this.targetPos?.X ?? 0)+i;
                    this.targetPos =  new Point(this._x,this.targetPos?.Y ?? 0);
                    return success();
                }
                if (this.IsValidPosition(undefined,(this.targetPos?.Y ?? 0)-i,this.Shapes[newRot])) {
                    this._y = this.targetPos?.Y ?? 0;
                    this.Rotation = newRot;
                    this._y = (this.targetPos?.Y ?? 0)-i;
                    this.targetPos =  new Point(this.targetPos?.X ?? 0,this._y);
                    return success();
                }
                if (this.IsValidPosition(undefined,(this.targetPos?.Y ?? 0)+i,this.Shapes[newRot])) {
                    this._y = this.targetPos?.Y ?? 0;
                    this.Rotation = newRot;
                    this._y = (this.targetPos?.Y ?? 0)+i;
                    this.targetPos =  new Point(this.targetPos?.X ?? 0,this._y);
                    return success();
                }
            }
            SFX.negative.play(); // No attempts were successful; play fail sound and return false
            return false;
        }
        this.Rotation = newRot;
        return success();
    }
    // Allows clones to draw themselves without drawing other things that the current block needs to draw
    static Draw(block:BlockInstance,canvas?:Canvas2D,x?:number,y?:number,drawColor?:boolean,outline?:boolean,width?:number,height?:number) : void {
        block._draw(canvas,x,y,drawColor,outline,width,height);
    }
    // Actually draw pixels to the canvas, translating game logic pixels to real pixels
    private _draw(canvas:Canvas2D=Game.BlockCanvas, x:number=this._x, y:number=this._y,drawColor:boolean=false,outline:boolean=false,width:number=1,height:number=1) : void {
        if (drawColor) canvas.Context.fillStyle = this.Data.Color.RGBA;
        for (const [oY, row] of this.CurrentShape.entries()) {
            for (const [oX, col] of row.entries()) {
                if (col === 0) continue;
                const [pxsz,gWidth,gHeight] = (canvas === Game.HoldCanvas || canvas === Game.NextCanvas)? [Game.BasePixelSize,Game.BaseWidth,Game.BaseHeight] : [Game.PixelSize,Game.Width,Game.Height];
                // Center anchor pixel
                let [_x,_y,_w,_h]:number[] = [Game.CanvasOffset(canvas,gWidth,gHeight,pxsz).X+x*pxsz+oX*pxsz,Game.CanvasOffset(canvas,gWidth,gHeight,pxsz).Y+y*pxsz+oY*pxsz,pxsz*width*Game.BlockScale,pxsz*height*Game.BlockScale]; // Convert game logic pixels to real pixels, filling 1 game pixel per width/height
                _x-=(_w-_w/Game.BlockScale)/2; _y-=(_h-_h/Game.BlockScale)/2;
                if (!outline)
                    canvas.Context.fillRect(_x,_y,_w,_h);
                else
                    canvas.Context.strokeRect(_x,_y,_w,_h);
            }
        }
    }
    // Draw block, ghost block, and AccuBlock
    Draw(canvas:Canvas2D=Game.BlockCanvas) : void {
        if (!this.IsValidPosition() || this.isFake) return;
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
    // Write block to game state
    async Stamp() : Promise<void> {
        if (this.dropping || this.stamping) return;
        this.stamping = true;
        [this._x, this._y] = [this.targetPos?.X ?? 0, this.targetPos?.Y ?? 0];
        this.Draw(Game.StaleCanvas);
        Game.WriteShape(this, this._x, this._y, this.CurrentShape);
        await Game.BlockStamped(this);
        this.stamping = false;
    }
    // Hard drop (move to lowest valid position)
    async InstantDrop() : Promise<void> {
        Game.LockMovement = true;
        const y:number = this.LowestValidY-(this.targetPos?.Y ?? 0);
        await this.Move(0,y,true);
        SFX.harddrop.play();
        await this.Stamp();
        Game.addScore(y*Enum.BaseScores.Hard);
    }
    private get LowestValidY() : number {
        let y:number = this.targetPos?.Y ?? 0;
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
        let highestPoint:Point = new Point(0,0);
        for (const [oY, row] of this.CurrentShape.entries()) {
            for (const [oX, col] of row.entries()) {
                if (col === 0) continue;
                return new Point(oX,oY);
            }
        }
        return highestPoint;
    }
    get LowestPoint() : Point {
        let lowestPoint:Point = new Point(0,0);
        for (const [oY, row] of this.CurrentShape.entries()) {
            if (oY < lowestPoint.Y) break;
            for (const [oX, col] of row.entries()) {
                if (col === 0) continue;
                lowestPoint = new Point(oX,oY);
            }
        }
        return lowestPoint;
    }
    // Convert from `BlockInstance` to `Block`
    toBlock() : Block {
        return new Block(this.Shapes,this.Data,this.Symbol);
    }
}

// Define blocks by constructing a Block with all block rotations, and its color
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

// Get a slider input's step (how much it changes/what intervals it snaps to) based on modifier keys
function getRangeStep(range:HTMLInputElement) : number {
    const int:boolean = range.classList.contains("int");
    let step:number = ((int? parseInt : parseFloat)(range.step)) || 1;
    if (heldKeys.Shift && (heldKeys.Control || heldKeys.Meta))
        step=Math.abs(parseFloat(range.max))+Math.abs(parseFloat(range.min));
    else if (heldKeys.Shift)
        step = parseFloat(range.dataset.shiftStep ?? "") || (step*5);
    else if (heldKeys.Control || heldKeys.Meta)
        step = (Math.abs(parseFloat(range.max))+Math.abs(parseFloat(range.min)))/2;
    return (int? Math.round : Utils.dummy)(step);
}
// Manually step slider left or right (dir=-1|1)
function stepRange(range:HTMLInputElement,dir:number=1) : number {
    const int:boolean = range.classList.contains("int");
    return Utils.clamp((int? parseInt : parseFloat)(range.value)+(getRangeStep(range)*dir),(int? parseInt : parseFloat)(range.min),(int? parseInt : parseFloat)(range.max));
}

const heldKeys:Record<string,boolean> = {}; // Currently pressed keys
const keyThreads:Record<string,number|undefined> = {}; // Key delay setTimeout ids

// Pause game when tab/wimdow focus lost
var pausedFromFocusLoss:boolean;
window.addEventListener("focus",()=>{
    if (pausedFromFocusLoss && Game.Paused && Game.AutoPause) Game.TogglePause(false); // Only pause if setting enabled and if the last pause was automatic
    pausedFromFocusLoss = false;
});
window.addEventListener("blur",()=>{
    for (const k of Object.keys(heldKeys))
        heldKeys[k] = false;
    if (!Game.Paused && Game.AutoPause) {
        Game.TogglePause(true);
        pausedFromFocusLoss = true;
    }
});

async function handleKeypress(event:KeyboardEvent) : Promise<void> {
    if (clickWar) return event.preventDefault(); // Don't register presses if the click warning is still on-screen
    let eventKey:string = event.key;
    if (eventKey === "Tab" && heldKeys.Shift) // Circumvent intentional switch statement limitations
        eventKey = "ShiftTab";
    if (event.defaultPrevented || !SFX) return;
    if (!Game.Running || Game.Paused) {
        if (document.activeElement?.classList.contains("keybind") && document.activeElement.textContent === "...") // Don't hinder keybind button functionality
            return event.preventDefault();
        switch(eventKey) {
            case "ArrowLeft": // Don't interfere with settings input controls (or add further functionality to them)
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
                focusButton();
                return event.preventDefault();
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
                focusButton();
                return event.preventDefault();
            case "z":
            case "c":
            case " ":
            case "Enter": // Click selected element
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
    if ((Game.Paused && event.key !== "Escape" ) || Game.LockMovement) return; // Don't try to move if in menus or not able to move block
    switch (event.key) {
        case Game.KeyBinds.Left:
            Game.CurrentBlock?.Move(-1, 0);
            break;
        case Game.KeyBinds.Right:
            Game.CurrentBlock?.Move(1, 0);
            break;
        case Game.KeyBinds.Soft:
            Game.CurrentBlock?.Move(0, 1).then(success=>{
                if (success) Game.addScore(Enum.BaseScores.Soft);
            });
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
        default: return;
    }
    event.preventDefault();
}

// Update held keys
window.addEventListener("keyup",event=>{
    heldKeys[event.key] = false;
    if (keyThreads[event.key]) {
        clearTimeout(keyThreads[event.key]);
        keyThreads[event.key] = undefined;
    }
});
window.addEventListener("keydown", async event=>{
    const paused:boolean = Game.Paused;
    if (!paused && heldKeys[event.key]) return;
    heldKeys[event.key] = true;
    handleKeypress(event);
    const isMoveKey:boolean = event.key === Game.KeyBinds.Left || event.key === Game.KeyBinds.Right || event.key === Game.KeyBinds.Soft; // Whether to use move key delay/repeat interval settings
    if (!paused) {
        keyThreads[event.key] = setTimeout(()=>{
            if (!heldKeys[event.key]) return;
            var id:number;
            id = setInterval(()=>{
                if (!heldKeys[event.key]) return clearInterval(id);
                handleKeypress(new KeyboardEvent("keydown",{key:event.key}));
            },isMoveKey? Game.MoveKeyRepeatInterval : Game.KeyRepeatInterval);
        },isMoveKey? Game.MoveKeyRepeatDelay : Game.KeyRepeatDelay);
    }
}, true);

// Resume/start game when button clicked
document.getElementById("pause-resume")?.addEventListener("click",()=>{
    if (!Game.Running) {
        Game.StartGame();
        return;
    }
    Game.TogglePause(false);
});

// Restart game when button clicked
document.getElementById("pause-restart")?.addEventListener("click",()=>{
    Game.Reset();
    Game.StartGame();
});

// Show/hide help page
document.getElementById("pause-help")?.addEventListener("click",()=>{
    if (document.querySelector(".modal.active")) return;
    document.getElementById("help")?.classList.add("active");
    updateSelectionButtons();
});
document.getElementById("help-back")?.addEventListener("click",()=>{
    document.getElementById("help")?.classList.remove("active");
    updateSelectionButtons();
});

// Show/hide about page
document.getElementById("pause-about")?.addEventListener("click",()=>{
    if (document.querySelector(".modal.active")) return;
    document.getElementById("about")?.classList.add("active");
    updateSelectionButtons();
});
document.getElementById("about-back")?.addEventListener("click",()=>{
    document.getElementById("about")?.classList.remove("active");
    updateSelectionButtons();
});

// Show/hide settings page
document.getElementById("pause-settings")?.addEventListener("click",()=>{
    if (document.querySelector(".modal.active")) return;
    SettingsBuffer.clear();
    document.getElementById("settings")?.classList.add("active");
    updateSelectionButtons();
});
// Save settings
document.getElementById("settings-back")?.addEventListener("click",()=>{
    document.getElementById("settings")?.classList.remove("active");
    updateSelectionButtons();
    WriteSettingsBuffer();
});
// Discard settings
document.getElementById("settings-quit")?.addEventListener("click",()=>{
    document.getElementById("settings")?.classList.remove("active");
    updateSelectionButtons();
    RejectSettingsBuffer.Fire();
});

// Hook into collapsable menus to smoothly animate expanding/collapsing
const detailsArr:HTMLStyleElement[] = [];
document.querySelectorAll("details").forEach(el=>{
    const style:HTMLStyleElement = document.createElement("style");
    const ind:number = detailsArr.length;
    detailsArr.push(style);
    document.head.appendChild(style);
    el.classList.add(`details-${ind}`);
    const summary:HTMLElement|null = el.querySelector("summary");
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

const isMac:boolean = navigator.platform === "MacIntel"; // Whether user is on mac
// Define map between text representations of keys and the custom Kenney Input Keyboard Icons font's icon characters
const keyTranslationMap:Record<string,string> = {
    "0": "",
    "1": "",
    "2": "",
    "3": "",
    "4": "",
    "5": "",
    "6": "",
    "7": "",
    "8": "",
    "9": "",
    a: "",
    b: "",
    c: "",
    d: "",
    e: "",
    f: "",
    g: "",
    h: "",
    i: "",
    j: "",
    k: "",
    l: "",
    m: "",
    n: "",
    o: "",
    p: "",
    q: "",
    r: "",
    s: "",
    t: "",
    u: "",
    v: "",
    w: "",
    x: "",
    y: "",
    z: "",
    Alt: "",
    "'": "",
    ArrowDown: "",
    ArrowLeft: "",
    ArrowRight: "",
    ArrowUp: "",
    "*": "",
    Backspace: "",
    "[": "",
    "]": "",
    "<": "",
    ">": "",
    CapsLock: "",
    "**": "",
    ":": "",
    ",": "",
    Control: "",
    Delete: "",
    End: "",
    Enter: "",
    "=": "",
    Escape: "",
    "!": "",
    F1: "",
    F2: "",
    F3: "",
    F4: "",
    F5: "",
    F6: "",
    F7: "",
    F8: "",
    F9: "",
    F10: "",
    F11: "",
    F12: "",
    Home: "",
    Insert: "",
    "-": "",
    PageDown: "",
    PageUp: "",
    ".": "",
    "+": "",
    PrintScreen: "",
    "?": "",
    "\"": "",
    ";": "",
    Shift: "",
    "\\": "",
    "/": "",
    " ": "",
    Tab: "",
    "~": "",
    Meta: "",
    mac_Command: "",
    mac_Option: ""
}
for (const [key,symbol] of Object.entries(keyTranslationMap)) {
    // Add uppercase letters (shift+letter)
    if (key.length === 1 && key.toUpperCase() !== key) {
        keyTranslationMap[key.toUpperCase()] = `${keyTranslationMap.Shift}﹢${symbol}`
        continue;
    }
    // Replace generic keys with mac keys if on mac
    if (isMac && (key === "Meta" || key === "Alt")) {
        if (key === "Meta")
            keyTranslationMap[key] = keyTranslationMap.mac_Command;
        if (key === "Alt")
            keyTranslationMap[key] = keyTranslationMap.mac_Option;
        continue;
    }
}
// Translate key text via keyTranslationMap
function translateKey(k:string) : string {
    if (keyTranslationMap[k]) return keyTranslationMap[k];
    return k;
}
// Keybind button expands when showing an icon; this function resets it when it only has normal text
function resetKeybindStyle(el:HTMLButtonElement) : void {
    if (Object.values(keyTranslationMap).indexOf(el.textContent) !== -1)
        el.classList.remove("active");
}
// Hook into all keybind buttons to detect keys and update keybinds when set
(document.querySelectorAll("button.keybind") as NodeListOf<HTMLButtonElement>).forEach(el=>{
    Game.KeyBinds[el.dataset.bind ?? ""] = el.dataset.key ?? "";
    let ignoreInput:boolean = false;
    function click(event:KeyboardEvent) : void {
        if (ignoreInput) {
            ignoreInput = false;
            return;
        }
        if (event.key === "Escape") {
            el.textContent = translateKey(el.dataset.key ?? "");
            resetKeybindStyle(el);
            return;
        }
        el.dataset.key = event.key;
        event.preventDefault();
        document.removeEventListener("keyup",click);
        el.textContent = translateKey(event.key);
        Game.KeyBinds[el.dataset.bind ?? ""] = el.dataset.key ?? "";
        resetKeybindStyle(el);
    }
    el.textContent = translateKey(el.dataset.key ?? "");
    resetKeybindStyle(el);
    el.addEventListener("click",event=>{
        el.classList.add("active");
        el.textContent = "..."
        ignoreInput = !event.isTrusted;
        document.addEventListener("keyup",click);
    });
});

// Prevent default key events from running under certain conditions (avoid interferences with keybind buttons, inputs, etc.)
function preventKeyEvents(el:HTMLInputElement|HTMLElement) : void {
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
    // Highlight content of <input>s when focused in order to make quickly editing values easier
    if (el instanceof HTMLInputElement) {
        el.addEventListener("focus",()=>{
            el.select();
        });
    }
}

(document.querySelectorAll(".keyboard-selectable") as NodeListOf<HTMLElement>).forEach(el=>{
    preventKeyEvents(el);
});

// Make all links open in a new tab
document.addEventListener("click",event=>{
    const trg:HTMLLinkElement = event.target as HTMLLinkElement;
    if (trg.tagName === "A") {
        event.preventDefault();
        open(trg.href);
    }
});

LoadSettings();
Game.DrawGrid();
Game.Reset();

// Generate markdown HTML from markdown file
async function genReadme(id:string,path:string) : Promise<void> {
    let readme:Response|string = await fetch(path);
    readme = await readme.text();
    readme = await marked.parse(readme);
    const rmt:HTMLElement|null = document.getElementById(`${id}-readme`);
    if (rmt) rmt.innerHTML = readme;
    (rmt?.querySelectorAll("a,h1,h2,h3,tr,.keyboard-selectable") as NodeListOf<HTMLElement>).forEach(el=>{
        el.classList.add("keyboard-selectable");
        if (el.tabIndex === -1) el.tabIndex = 0;
    })
}

const readmePages:Record<string,string> = { about:"./README.md", help:"./HELP.md" };
for (const [id,path] of Object.entries(readmePages)) {
    genReadme(id,path);
}

(document.getElementById("pause-text") as HTMLElement).innerHTML = "<b>Bogetris</b>"; // Set title text