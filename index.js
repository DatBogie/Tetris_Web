import { sfxr } from "jsfxr";
import click from "./Sounds/click.json" with { type: 'json' };
import { Tween, Easing } from "@tweenjs/tween.js";
import { marked } from "marked";
const clickWar = document.getElementById("click-req");
clickWar?.addEventListener("click", () => {
    updateSelectionButtons();
    clickWar.style.pointerEvents = "none !important";
    clickWar.style.opacity = "0";
    setTimeout(() => {
        clickWar?.remove();
    }, 600);
});
class Sound {
    constructor(json) {
        this.sound = sfxr.toAudio(json);
        this.json = json;
        this.vol = 1;
        this.gain = json.sound_vol;
    }
    sound;
    json;
    vol;
    gain;
    play() {
        this.sound.play();
    }
    get volume() {
        return this.vol;
    }
    set volume(vol) {
        this.vol = vol;
        this.json.sound_vol = this.gain * vol;
        this.sound = sfxr.toAudio(this.json);
    }
}
var clickSound;
var PauseMenuSel = 0;
var PauseBtns = Array.from(document.querySelectorAll("#pause-btns > .keyboard-selectable"));
var __sfx_loaded = false;
function loadSFX() {
    __sfx_loaded = true;
    clickSound = new Sound(click);
    window.removeEventListener("click", loadSFX);
}
function playSound(sound) {
    if (!__sfx_loaded)
        return false;
    sound.volume = Game.AudioVol / 100;
    sound.play();
    return true;
}
function updateSelectionButtons(detailsSel) {
    const modal = document.querySelector(".modal.active");
    const btns = Array.from(modal ? modal.querySelectorAll(".modal-content .keyboard-selectable") : document.querySelectorAll("#pause-btns > .keyboard-selectable"));
    const tBtns = [];
    for (const btn of btns.values()) {
        let details = btn.parentElement?.parentElement?.parentElement?.parentElement;
        if (!details || !(details instanceof HTMLDetailsElement))
            details = btn.parentElement?.parentElement?.parentElement?.parentElement?.parentElement;
        if (!btn.classList.contains("hidden") && (!details || !(details instanceof HTMLDetailsElement) || details.open)) {
            tBtns.push(btn);
        }
    }
    PauseMenuSel = !detailsSel ? 0 : tBtns.indexOf(detailsSel.querySelector("summary") ?? detailsSel) ?? 0;
    PauseBtns = tBtns;
    focusButton();
}
function focusButton() {
    setTimeout(() => {
        PauseBtns[PauseMenuSel]?.focus();
        if (__sfx_loaded)
            playSound(clickSound);
    }, 1);
}
function getAttr(instance, attr) {
    return instance[attr];
}
function setAttr(instance, attr, value) {
    instance[attr] = value;
}
class ArrayWrapper {
    constructor(data) {
        this.data = Array.from(data);
    }
    data;
    get length() {
        return this.data.length;
    }
    push(...items) {
        this.data.push(items);
    }
    pop() {
        return this.data.pop();
    }
    get(index) {
        return this.data[index];
    }
    set(index, value) {
        this.data[index] = value;
    }
    indexOf(searchElement, fromIndex) {
        return this.data.indexOf(searchElement, fromIndex);
    }
    toString() {
        return this.data.toString();
    }
}
class InfiniteArray extends ArrayWrapper {
    get(index) {
        if (new NumberRange(0, this.length - 1).inRange(index))
            return this.data[index];
        return this.data[this.length - 1];
    }
    toString() {
        return this.data.toString();
    }
}
var Enum;
(function (Enum) {
    class BaseScores {
        static Soft = 1;
        static Hard = 2;
        static Clears = new InfiniteArray([
            100,
            300,
            500,
            800
        ]);
    }
    Enum.BaseScores = BaseScores;
    class ModeOperation {
        static Set = (x, y) => y;
        static Add = (x, y) => x + y;
        static Multiply = (x, y) => x * y;
    }
    Enum.ModeOperation = ModeOperation;
    let GridMode;
    (function (GridMode) {
        GridMode[GridMode["BG"] = 0] = "BG";
        GridMode[GridMode["Grid"] = 1] = "Grid";
        GridMode[GridMode["Both"] = 2] = "Both";
    })(GridMode = Enum.GridMode || (Enum.GridMode = {}));
    class CustomBlockShape {
        static get length() {
            let i = 0;
            for (const _ of Object.keys(Blocks))
                i++;
            return i;
        }
        constructor(symbol, block) {
            this.Symbol = symbol;
            this.Block = block;
            this.index = CustomBlockShape.length;
            Blocks[this.index] = block;
        }
        Symbol;
        Block;
        index;
    }
    Enum.CustomBlockShape = CustomBlockShape;
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
    let ThemeStyle;
    (function (ThemeStyle) {
        ThemeStyle[ThemeStyle["Dark"] = 0] = "Dark";
        ThemeStyle[ThemeStyle["Light"] = 1] = "Light";
    })(ThemeStyle = Enum.ThemeStyle || (Enum.ThemeStyle = {}));
    let UIThemeKey;
    (function (UIThemeKey) {
        UIThemeKey[UIThemeKey["olc"] = 0] = "olc";
        UIThemeKey[UIThemeKey["rosewater"] = 1] = "rosewater";
        UIThemeKey[UIThemeKey["flamingo"] = 2] = "flamingo";
        UIThemeKey[UIThemeKey["pink"] = 3] = "pink";
        UIThemeKey[UIThemeKey["mauve"] = 4] = "mauve";
        UIThemeKey[UIThemeKey["red"] = 5] = "red";
        UIThemeKey[UIThemeKey["maroon"] = 6] = "maroon";
        UIThemeKey[UIThemeKey["peach"] = 7] = "peach";
        UIThemeKey[UIThemeKey["yellow"] = 8] = "yellow";
        UIThemeKey[UIThemeKey["green"] = 9] = "green";
        UIThemeKey[UIThemeKey["teal"] = 10] = "teal";
        UIThemeKey[UIThemeKey["sky"] = 11] = "sky";
        UIThemeKey[UIThemeKey["sapphire"] = 12] = "sapphire";
        UIThemeKey[UIThemeKey["blue"] = 13] = "blue";
        UIThemeKey[UIThemeKey["lavender"] = 14] = "lavender";
        UIThemeKey[UIThemeKey["text"] = 15] = "text";
        UIThemeKey[UIThemeKey["subtext1"] = 16] = "subtext1";
        UIThemeKey[UIThemeKey["subtext0"] = 17] = "subtext0";
        UIThemeKey[UIThemeKey["overlay2"] = 18] = "overlay2";
        UIThemeKey[UIThemeKey["overlay1"] = 19] = "overlay1";
        UIThemeKey[UIThemeKey["overlay0"] = 20] = "overlay0";
        UIThemeKey[UIThemeKey["surface2"] = 21] = "surface2";
        UIThemeKey[UIThemeKey["surface1"] = 22] = "surface1";
        UIThemeKey[UIThemeKey["surface0"] = 23] = "surface0";
        UIThemeKey[UIThemeKey["base"] = 24] = "base";
        UIThemeKey[UIThemeKey["mantle"] = 25] = "mantle";
        UIThemeKey[UIThemeKey["crust"] = 26] = "crust";
        UIThemeKey[UIThemeKey["accent"] = 27] = "accent";
    })(UIThemeKey = Enum.UIThemeKey || (Enum.UIThemeKey = {}));
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
        return Math.floor(Math.random() * (max + 1) - min) + min;
    }
    static PickRandomFromArray(arr) {
        return arr[this.RandomRange(0, arr.length - 1)];
    }
    static PickRandomFromDict(dict) {
        return dict[this.PickRandomFromArray(Object.keys(dict))];
    }
    static MergeDicts(x, d) {
        for (const [k, v] of Object.entries(d)) {
            x[k] ??= v;
        }
        return x;
    }
    static BiasedRound(x, dir = 0) {
        if (x > Math.floor(x) && dir > 0)
            return Math.floor(x) + 1;
        return Math.floor(x);
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
class Point {
    constructor(x, y) {
        this.X = x;
        this.Y = y;
    }
    X;
    Y;
}
class ColorPalette {
    constructor(name, blocktheme, uitheme, style = Enum.ThemeStyle.Dark) {
        this.Name = name;
        this.BlockTheme = blocktheme;
        this.Style = style;
        if (uitheme?.Name === undefined || uitheme?.Style === undefined)
            uitheme?.setPropertiesFromPalette(this);
        this.UITheme = uitheme;
    }
    Name;
    BlockTheme;
    UITheme;
    Style;
    enabled = false;
    get Enabled() {
        return this.enabled;
    }
    set Enabled(enabled) {
        if (enabled === this.enabled)
            return;
        this.enabled = enabled === undefined ? !this.enabled : enabled;
        Game.ApplyColorPalettes();
    }
}
class BlockTheme {
    constructor(name, data) {
        this.name = name;
        this.Data = data;
    }
    name;
    get Name() {
        return this.Name;
    }
    Data;
    enabled = false;
    get Enabled() {
        return this.enabled;
    }
    set Enabled(enabled) {
        if (enabled === this.enabled)
            return;
        this.enabled = enabled === undefined ? !this.enabled : enabled;
        Game.ApplyBlockThemes();
    }
}
class UITheme {
    constructor(name, data, style, css) {
        this.name = name;
        this.Data = data;
        this.style = style;
        this.CSS = css;
    }
    name;
    get Name() {
        return this.name;
    }
    Data;
    CSS;
    style;
    get Style() {
        return this.style;
    }
    setPropertiesFromPalette(palette) {
        this.name ??= palette.Name;
        this.style ??= palette.Style;
    }
    enabled = false;
    get Enabled() {
        return this.enabled;
    }
    set Enabled(enabled) {
        if (enabled === this.enabled)
            return;
        this.enabled = enabled === undefined ? !this.enabled : enabled;
        Game.ApplyUIThemes();
    }
}
class Color {
    constructor(r, g, b, opacity = 1.0) {
        this._rgb = `rgba(${r},${g},${b}`;
        this.Opacity = opacity;
    }
    static fromHex(hex) {
        hex = hex.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        let o = 255;
        if (hex.length > 6)
            o = parseInt(hex.substring(6, 8), 16);
        return new Color(r, g, b, o / 255);
    }
    static parseCSSNumber(n, retInt = false) {
        if (n.endsWith("deg")) {
            return (!retInt ? parseFloat : parseInt)(n) / 360;
        }
        if (n.endsWith("turn")) {
            return (!retInt ? parseFloat : parseInt)(n) * 180;
        }
        if (n.endsWith("%")) {
            return (!retInt ? parseFloat : parseInt)(n) / 100;
        }
        return (!retInt ? parseFloat : parseInt)(n);
    }
    /*
     * Adapted version of https://gist.github.com/mjackson/5311256 > hslToRgb()
     */
    static fromHSLA(h, s, l, a) {
        s /= 100;
        l /= 100;
        if (s === 0) {
            l *= 255;
            return new Color(l, l, l, a);
        }
        else {
            function hue2rgb(p, q, t) {
                if (t < 0)
                    t += 1;
                if (t > 1)
                    t -= 1;
                if (t < 1 / 6)
                    return p + (q - p) * 6 * t;
                if (t < 1 / 2)
                    return q;
                if (t < 2 / 3)
                    return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            return new Color(hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3), a);
        }
    }
    static fromCSS(s) {
        if (s.startsWith("rgb")) {
            let r, g, b, a;
            let data;
            if (s.startsWith("rgba"))
                data = s.substring(5, s.length - 1).split(",", 4);
            else
                data = s.substring(4, s.length - 1).split(",", 3);
            r = parseInt(data[0]);
            g = parseInt(data[1]);
            b = parseInt(data[2]);
            if (data.length > 3)
                a = parseFloat(data[3]);
            return new Color(r, g, b, a);
        }
        if (s.startsWith("#")) {
            return Color.fromHex(s);
        }
        if (s.startsWith("hsl")) {
            let h, _s, l, a;
            let data;
            if (s.startsWith("hsla"))
                data = s.substring(5, s.length - 1).split(",", 4);
            else
                data = s.substring(4, s.length - 1).split(",", 3);
            h = Color.parseCSSNumber(data[0], true);
            _s = Color.parseCSSNumber(data[1], true);
            l = Color.parseCSSNumber(data[2], true);
            return Color.fromHSLA(h, _s, l, a);
        }
    }
    _rgb;
    Opacity;
    get RGBA() {
        return `${this._rgb},${this.Opacity})`;
    }
    WithOpacity(opacity) {
        let o = this.Opacity;
        this.Opacity = opacity;
        const s = this.RGBA;
        this.Opacity = o;
        return s;
    }
    toString() {
        return this.RGBA;
    }
}
// Source - https://stackoverflow.com/a/39914235
// Posted by Dan Dascalescu, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-18, License - CC BY-SA 4.0
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
class FeedtapeArray {
    constructor(length) {
        this.data = new Array(length);
        this.data.fill(undefined);
        Object.seal(this.data);
    }
    data;
    get length() {
        return this.data.length;
    }
    feed() {
        for (let i = 0; i < this.length - 1; i++)
            this.data[i] = this.data[i + 1];
    }
    push(value) {
        this.feed();
        this.data[this.length - 1] = value;
    }
    get(index) {
        return this.data[index];
    }
    set(index, value) {
        this.data[index] = value;
    }
    fill(value, startIndex = 0, endIndex = this.length) {
        for (let i = startIndex; i < endIndex; i++)
            this.data[i] = typeof value === "function" ? value() : value;
    }
    toString() {
        let s = "";
        for (const [i, val] of this.data.entries())
            if (i !== 0)
                s += `, ${val}`;
            else
                s += `${val}`;
        return s;
    }
}
const levelText = document.getElementById("level");
const scoreText = document.getElementById("score");
const scoreGateText = document.getElementById("score-gate");
const scoreGateRelText = document.getElementById("score-gate-rel");
const scoreGatePercentText = document.getElementById("score-gate-percent");
class Game {
    static MaxSpeed = 4.0;
    static BlockScale = 1.0;
    static LockDelay = 500;
    static score = 0;
    static set Score(score) {
        Game.score = Math.round(score * Game.Level.ScoreMultiplier());
        if (Game.score >= Game.ScoreGate) {
            Game.score -= Game.ScoreGate;
            Game.Level = Game.LevelIndex + 1;
        }
        scoreText.textContent = Game.Score.toString();
        scoreGateRelText.textContent = (Game.ScoreGate - Game.score).toString();
        scoreGatePercentText.textContent = Math.trunc((Game.score / Game.ScoreGate) * 100).toString();
    }
    static get Score() {
        return Game.score;
    }
    static ScoreGate;
    static KeyRepeatInterval = 150;
    static KeyRepeatDelay = 250;
    static MoveKeyRepeatInterval = 75;
    static MoveKeyRepeatDelay = 125;
    static AudioVol = 100;
    static DisableGrid = false;
    static AnimMoveTime = 60;
    static AnimDropTime = Game.AnimMoveTime * 2;
    static AnimClearTime = Math.trunc((Game.AnimMoveTime / 2) * 10);
    static FixedAnimClearTime = true;
    static MoveEaseStyle = "Linear";
    static MoveEaseDirection = "InOut";
    static DropEaseStyle = "Circular";
    static DropEaseDirection = "In";
    static get MoveEase() {
        return Easing[Game.MoveEaseStyle][Game.MoveEaseDirection];
    }
    static get DropEase() {
        return Easing[Game.DropEaseStyle][Game.DropEaseDirection];
    }
    static Anims = true;
    static Physics = false;
    static KeyBinds = {};
    static BlockThemes = {
        "Default": new BlockTheme(undefined, {
            "I": Color.fromHex("#91d7e3"),
            "J": Color.fromHex("#eed49f"),
            "L": Color.fromHex("#c6a0f6"),
            "O": Color.fromHex("#a6da95"),
            "S": Color.fromHex("#ed8796"),
            "T": Color.fromHex("#b7bdf8"),
            "Z": Color.fromHex("#f5a97f")
        })
    };
    static UIThemes = {
        "Default": new UITheme(undefined, {
            [Enum.UIThemeKey.olc]: Color.fromHSLA(0, 0, 100, .25),
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
    static ColorPalettes = {
        "Default": new ColorPalette("Catppuccin Macchiato", Game.BlockThemes.Default, Game.UIThemes.Default, Enum.ThemeStyle.Dark)
    };
    static filterActive(dict, callback, invert = false) {
        const ret = {};
        for (const [k, theme] of Object.entries(dict))
            if ((theme.Enabled && !invert) || (!theme.Enabled && invert)) {
                ret[k] = theme;
                if (callback)
                    callback(k, theme);
            }
        return ret;
    }
    static get ActiveUIThemes() {
        return Game.filterActive(Game.UIThemes);
    }
    static get ActiveBlockThemes() {
        return Game.filterActive(Game.BlockThemes);
    }
    static get ActiveColorPalettes() {
        return Game.filterActive(Game.ColorPalettes);
    }
    static ApplyUIThemes() {
    }
    static ApplyBlockThemes() {
    }
    static ApplyColorPalettes() {
        Game.filterActive(Game.ColorPalettes, (k, theme) => {
            if (theme.BlockTheme)
                theme.BlockTheme.Enabled = true;
            if (theme.UITheme)
                theme.UITheme.Enabled = true;
        });
    }
    static get PixelSize() {
        return Math.min(Game.GameCanvas.Canvas.width / Game.Width, Game.GameCanvas.Canvas.height / Game.Height);
    }
    static Width = 10;
    static Height = 20;
    static SpeedMul = 1.0;
    static BaseSpeedMs = 1000.0;
    static GhostBlockOpacity = 0.25;
    static AnimGhostBlock = true;
    static RawBlockOpacity = 0.0;
    static Paused = true;
    static CurrentBlock;
    static BgCanvas = new Canvas2D(document.getElementById("bg"));
    static GameCanvas = new Canvas2D(document.getElementById("game"));
    static BlockCanvas = new Canvas2D(document.getElementById("block"));
    static StaleCanvas = new Canvas2D(document.getElementById("stale"));
    static HoldCanvas = new Canvas2D(document.getElementById("hold"));
    static NextCanvas = new Canvas2D(document.getElementById("next"));
    static LevelIndex;
    static get LevelNumber() {
        return Game.LevelIndex + 1;
    }
    static get Level() {
        return Levels.get(this.LevelIndex);
    }
    static get NextLevel() {
        return Levels.get(this.LevelIndex + 1);
    }
    static set Level(level) {
        this.LevelIndex = level;
        this.LevelSpeed = this.Level.Speed;
        this.ScoreGate = this.NextLevel.ScoreGate;
        levelText.textContent = (this.LevelIndex + 1).toString();
        scoreGateText.textContent = this.ScoreGate.toString();
        scoreGateRelText.textContent = (this.ScoreGate - this.score).toString();
        scoreGatePercentText.textContent = Math.trunc((this.score / this.ScoreGate) * 100).toString();
    }
    static get Running() {
        return Game._running;
    }
    static _running;
    static _data;
    static _time;
    static _thread_id;
    static _lock_thread_id;
    static GridDrawn = false;
    static _centerPoint(canvas) {
        return new Point(canvas.Canvas.width / 2, canvas.Canvas.height / 2);
    }
    static get CenterPoint() {
        return Game._centerPoint(Game.GameCanvas);
    }
    static CanvasOffset(canvas) {
        return new Point(Game._centerPoint(canvas).X - (Game.Width * Game.PixelSize) / 2, Game._centerPoint(canvas).Y - (Game.Height * Game.PixelSize) / 2);
    }
    static get GameOffset() {
        return Game.CanvasOffset(Game.GameCanvas);
    }
    static LevelSpeed = 1.0;
    static get Speed() {
        return Game.BaseSpeedMs / Game.LevelSpeed / Game.SpeedMul;
    }
    static get Data() {
        return Game._data;
    }
    static get Time() {
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
        for (let y = 0; y < Game.Height; y++) {
            Game._data[y] = [];
            for (let x = 0; x < Game.Width; x++)
                Game._data[y][x] = 0;
        }
    }
    static NewGame() {
        Game.Reset();
    }
    static rgt() {
        Game._thread_id = setTimeout(Game.GameTick, Game.Speed);
    }
    static async GameTick() {
        if (Game.Paused)
            return Game.rgt();
        const moveRes = await Game.CurrentBlock?.Move(0, 1, undefined, true);
        if (Game.CurrentBlock && moveRes === false) {
            const curBlock = Game.CurrentBlock;
            if (Game._lock_thread_id)
                clearTimeout(Game._lock_thread_id);
            Game._lock_thread_id = setTimeout(async () => {
                if (curBlock !== Game.CurrentBlock || Game.CurrentBlock?.IsValidPosition(undefined, (Game.CurrentBlock?.TargetPos?.Y ?? 0) + 1))
                    return;
                await Game.CurrentBlock?.Stamp();
            }, Game.LockDelay);
        }
        else if (Game._lock_thread_id)
            clearInterval(Game._lock_thread_id);
        return Game.rgt();
    }
    static StartGame() {
        if (Game._running)
            return;
        Game._running = true;
        Game.TogglePause(false);
        Game.blockFeed = new FeedtapeArray(4);
        Game.blockFeed.fill(Game.randBlock, 1);
        Game.CurrentBlock = Game.RandomBlock();
        Game.CurrentBlock?.Draw();
        if (Game._thread_id !== null)
            clearTimeout(Game._thread_id);
        Game.rgt();
    }
    static blockFeed;
    static randBlock() {
        return Utils.PickRandomFromDict(Blocks);
    }
    static heldBlock;
    static holdCooldown = false;
    static HoldBlock() {
        if (Game.holdCooldown)
            return;
        Game.holdCooldown = true;
        if (!Game.heldBlock) {
            Game.heldBlock = Game.CurrentBlock?.toBlock();
            Game.CurrentBlock = Game.RandomBlock();
        }
        else {
            const buffer = Game.heldBlock;
            Game.heldBlock = Game.CurrentBlock?.toBlock();
            Game.CurrentBlock = new BlockInstance(buffer);
        }
        Game.CurrentBlock?.Draw();
        Game.RedrawHeldBlock();
        if (!Game.heldBlock)
            return;
        Game.HoldCanvas.Canvas.animate([{ scale: .9 }, { scale: 1 }], { easing: "ease", duration: 100 });
    }
    static RandomBlock() {
        Game.blockFeed.push(Game.randBlock());
        const newBlock = Game.blockFeed.get(0) ? new BlockInstance(Game.blockFeed.get(0)) : undefined;
        Game.RedrawNextBlocks();
        Game.NextCanvas.Canvas.animate([{ scale: .9 }, { scale: 1 }], { easing: "ease", duration: 100 });
        return newBlock;
    }
    static get NextBlock() {
        return Game.blockFeed.get(Game.blockFeed.length - 1);
    }
    static DrawGrid(canvas, mode = Enum.GridMode.Both, width, height, sX = 0, sY = 0) {
        const gameCanvas = canvas ?? Game.GameCanvas;
        const bgCanvas = canvas ?? Game.BgCanvas;
        if (!canvas) {
            Game.GridDrawn = true;
            gameCanvas.ClearCanvas();
            bgCanvas.ClearCanvas();
        }
        if (mode === Enum.GridMode.BG || mode === Enum.GridMode.Both) {
            bgCanvas.Context.fillStyle = "#1e2030";
            bgCanvas.Context.fillRect(Game.GameOffset.X, Game.GameOffset.Y, Game.Width * Game.PixelSize, Game.Height * Game.PixelSize);
        }
        if ((!canvas && Game.DisableGrid) || (mode === Enum.GridMode.BG))
            return;
        gameCanvas.Context.strokeStyle = "#18192680";
        gameCanvas.Context.lineWidth = 1;
        for (let x = sX; x <= (width ? sX + width : Game.Width); x++) {
            gameCanvas.Context.beginPath();
            gameCanvas.Context.moveTo(Game.GameOffset.X + x * Game.PixelSize, Game.GameOffset.Y + sY);
            gameCanvas.Context.lineTo(Game.GameOffset.X + x * Game.PixelSize, Game.GameOffset.Y + sY + (height ?? Game.Height) * Game.PixelSize);
            gameCanvas.Context.stroke();
        }
        for (let y = sY; y <= (height ? sY + height : Game.Height); y++) {
            gameCanvas.Context.beginPath();
            gameCanvas.Context.moveTo(Game.GameOffset.X + sX, Game.GameOffset.Y + y * Game.PixelSize);
            gameCanvas.Context.lineTo(Game.GameOffset.X + sX + (width ?? Game.Width) * Game.PixelSize, Game.GameOffset.Y + y * Game.PixelSize);
            gameCanvas.Context.stroke();
        }
    }
    static EraseShape(self, x, y, shape) {
        if (Game !== self && self !== Game.CurrentBlock)
            return;
        if (self instanceof BlockInstance) {
            x ??= self.X;
            y ??= self.Y;
            shape ??= self.CurrentShape;
        }
        else {
            x ??= 0;
            y ??= 0;
            shape ??= [];
        }
        for (const [oY, row] of shape.entries()) {
            for (const [oX, col] of row.entries()) {
                if (col === 0)
                    continue;
                Game._data[y + oY][x + oX] = 0;
            }
        }
    }
    static WriteShape(self, x, y, shape) {
        if (Game !== self && self !== Game.CurrentBlock)
            return;
        let data;
        if (self instanceof BlockInstance) {
            x ??= self.X;
            y ??= self.Y;
            shape ??= self.CurrentShape;
            data = self.Data;
        }
        else {
            x ??= 0;
            y ??= 0;
            shape ??= [];
            data = new BlockData("white");
        }
        for (const [oY, row] of shape.entries()) {
            for (const [oX, col] of row.entries()) {
                if (col === 0)
                    continue;
                Game._data[y + oY][x + oX] = data;
            }
        }
    }
    static async EraseLine(self, y) {
        if (this !== self && self !== Game.CurrentBlock)
            return;
        if (self instanceof BlockInstance)
            y ??= self.Y;
        else
            y ??= 0;
        for (let x = 0; x < Game.Width; x++) {
            Game._data[y][x] = 0;
            if (Game.Anims) {
                await sleep(Game.FixedAnimClearTime ? Game.AnimClearTime / Game.Width : Game.AnimClearTime);
                Game.RedrawCanvas();
            }
        }
    }
    static RedrawHeldBlock() {
        Game.HoldCanvas.ClearCanvas();
        if (!Game.heldBlock)
            return;
        const block = new BlockInstance(Game.heldBlock).Clone();
        let [lY, hY] = [block.LowestPoint.Y, block.HighestPoint.Y];
        if (lY === hY)
            hY = 0;
        BlockInstance.Draw(block, Game.HoldCanvas, Game.Width / 2 - block.CurrentShape[0].length / 2, (Game.Height / 2) - (lY - hY), true); // Draw hold block
        if (!Game.DisableGrid) {
            Game.HoldCanvas.Context.strokeStyle = "#18192680";
            BlockInstance.Draw(block, Game.HoldCanvas, Game.Width / 2 - block.CurrentShape[0].length / 2, (Game.Height / 2) - (lY - hY), true, true);
        }
    }
    static RedrawNextBlocks() {
        Game.NextCanvas.ClearCanvas();
        if (!Game.blockFeed)
            return;
        const positions = [];
        for (let i = 1; i < Game.blockFeed.length; i++) {
            const blockShape = Game.blockFeed.get(i);
            if (!blockShape)
                continue;
            const block = new BlockInstance(blockShape).Clone();
            let [lY, hY] = [block.LowestPoint.Y, block.HighestPoint.Y];
            const prevBlock = Game.blockFeed.get(i - 1) && positions[i - 1] ? new BlockInstance(Game.blockFeed.get(i - 1)) : undefined;
            const [pX, pY] = [Game.Width / 2 - block.CurrentShape[0].length / 2, (positions[i - 1]?.Y ?? 5) + (prevBlock?.LowestPoint.Y ?? -1) + 1 - hY + 1];
            positions[i] = new Point(pX, pY);
            BlockInstance.Draw(block, Game.NextCanvas, pX, pY, true); // Draw next block
            if (!Game.DisableGrid) {
                Game.NextCanvas.Context.strokeStyle = "#18192680";
                BlockInstance.Draw(block, Game.NextCanvas, pX, pY, true, true);
            }
        }
    }
    static RedrawCanvas() {
        Game.StaleCanvas.ClearCanvas();
        for (let y = 0; y < Game.Height; y++) {
            for (let x = 0; x < Game.Width; x++) {
                const col = Game._data[y][x];
                if (col === 0)
                    continue;
                Game.StaleCanvas.Context.fillStyle = (col instanceof BlockData) ? col.Color.RGBA : "white";
                let [_x, _y, _w, _h] = [Game.GameOffset.X + x * Game.PixelSize, Game.GameOffset.Y + y * Game.PixelSize, Game.PixelSize * Game.BlockScale, Game.PixelSize * Game.BlockScale];
                _x -= (_w - _w / Game.BlockScale) / 2;
                _y -= (_h - _h / Game.BlockScale) / 2;
                Game.StaleCanvas.Context.fillRect(_x, _y, _w, _h);
            }
        }
    }
    static async InstantDrop(px, py) {
        if (py >= Game.Height - 1 || Game._data[py][px] === undefined)
            return;
        for (let y = py + 1; y < Game.Height; y++) {
            if (Game._data[y][px] !== 0)
                return;
            Game._data[y][px] = Game._data[py][px];
            Game._data[py][px] = 0;
            py++;
            if (Game.Anims) {
                Game.RedrawCanvas();
                await sleep(Game.FixedAnimClearTime ? Game.AnimClearTime / Game.Width : Game.AnimClearTime);
            }
        }
    }
    static async handleClears() {
        var cFlag = false;
        let lineCount = 0;
        Game.BlockCanvas.ClearCanvas();
        for (let y = 0; y < Game.Height; y++) {
            if (Game._data[y].every(col => col !== 0)) {
                await Game.EraseLine(Game, y);
                lineCount++;
                for (let oY = y - 1; oY >= 0; oY--) {
                    for (let x = 0; x < Game.Width; x++) {
                        Game._data[oY + 1][x] = Game._data[oY][x];
                        if (!cFlag)
                            cFlag = true;
                    }
                }
            }
        }
        if (Game.Physics) {
            for (let y = Game.Height - 1; y > 0; y--) {
                for (let x = 0; x < Game.Width; x++) {
                    Game.InstantDrop(x, y);
                    cFlag = true;
                }
            }
        }
        if (lineCount > 0)
            Game.Score += Enum.BaseScores.Clears.get(lineCount - 1);
        return cFlag;
    }
    static async BlockStamped(self) {
        Game.holdCooldown = false;
        if (self !== Game.CurrentBlock)
            return;
        await Game.handleClears();
        Game.RedrawCanvas();
        Game.CurrentBlock = Game.RandomBlock();
        if (!Game.CurrentBlock?.IsValidPosition()) {
            Game.Reset();
        }
        Game.CurrentBlock?.Draw();
    }
    static TogglePause(paused) {
        document.querySelectorAll(".modal.active").forEach(el => {
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
        document.querySelectorAll(".game-canvas, .right-stack, .left-stack").forEach(canvas => {
            if (Game.Paused)
                canvas.classList.add("paused");
            else
                canvas.classList.remove("paused");
        });
        if (!Game._running) {
            document.getElementById("pause-text").innerText = "Game Over!";
            document.getElementById("pause-resume").classList.add("hidden");
            document.getElementById("pause-restart").innerText = "Start";
        }
        else {
            document.getElementById("pause-text").innerText = "Paused...";
            document.getElementById("pause-resume").classList.remove("hidden");
            document.getElementById("pause-restart").innerText = "Restart";
        }
        if (Game.Paused) {
            PauseMenuSel = 0;
            updateSelectionButtons();
        }
    }
}
function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
}
function dummy(x) {
    return x;
}
class Signal {
    subs = [];
    Connect(func) {
        return this.subs.push(func);
    }
    Disconnect(id) {
        this.subs[id] = undefined;
    }
    Fire() {
        for (const f of this.subs.values()) {
            if (f === undefined)
                continue;
            f();
        }
    }
}
const settingsWin = document.getElementById("settings");
const Settings = {
    MaxSpeed: settingsWin?.querySelector("#settings-game-max-speed"),
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
};
const SettingsBuffer = new Map();
const settingsTitle = document.getElementById("settings-title");
function UpdateSettingsBuffer(k, data) {
    const label = document.getElementById(data.el.id + "-label");
    if (label)
        label.textContent = data.value;
    if (getAttr(Game, k) === data.value) {
        SettingsBuffer.delete(k);
        if (SettingsBuffer.size === 0)
            settingsTitle.textContent = "Settings";
        return;
    }
    SettingsBuffer.set(k, data);
    settingsTitle.textContent = "Settings*";
}
function WriteSettingsBuffer() {
    for (const [k, v] of SettingsBuffer.entries()) {
        setAttr(Game, k, v.value);
        if (v.funcs && v.funcs.length !== 0) {
            for (const f of v.funcs) {
                let x = getAttr(Game, f);
                if (x === undefined)
                    continue;
                x();
            }
        }
    }
    SettingsBuffer.clear();
    settingsTitle.textContent = "Settings";
}
const RejectSettingsBuffer = new Signal();
RejectSettingsBuffer.Connect(() => {
    settingsTitle.textContent = "Settings";
});
function handleSettings() {
    for (const [k, el] of Object.entries(Settings)) {
        const li = el.parentElement;
        li.title = `${li.title !== "" ? `${li.title}\n` : ""}Default: ${getAttr(Game, k)}`;
        const label = document.getElementById(el.id + "-label");
        if (label)
            label.textContent = getAttr(Game, k);
        if (el instanceof HTMLInputElement) {
            if (el.type === "number" || el.type === "range") {
                const min = parseFloat(el.min ?? "0");
                const max = parseFloat(el.max ?? "100");
                const defaultVal = getAttr(Game, k);
                if (el.classList.contains("percent"))
                    el.valueAsNumber = getAttr(Game, k) * max;
                else
                    el.valueAsNumber = getAttr(Game, k);
                const funcs = (el.dataset.funcs ?? "").split(",");
                el.addEventListener("change", () => {
                    if (isNaN(el.valueAsNumber)) {
                        el.valueAsNumber = SettingsBuffer.get(k)?.value ?? (getAttr(Game, k) ?? defaultVal) * (el.classList.contains("percent") ? max : 1);
                        return;
                    }
                    const val = (el.classList.contains("int") ? Math.trunc : dummy)(clamp(el.valueAsNumber, min, max));
                    UpdateSettingsBuffer(k, { value: (el.classList.contains("percent") ? val / max : val), funcs: funcs, el: el });
                    el.valueAsNumber = val;
                });
                RejectSettingsBuffer.Connect(() => {
                    el.valueAsNumber = (getAttr(Game, k) ?? defaultVal) * (el.classList.contains("percent") ? max : 1);
                });
            }
            else if (el.type === "checkbox") {
                el.checked = getAttr(Game, k);
                const defaultVal = el.checked;
                const funcs = (el.dataset.funcs ?? "").split(",");
                el.addEventListener("change", () => {
                    UpdateSettingsBuffer(k, { value: el.checked, el: el, funcs: funcs });
                });
                RejectSettingsBuffer.Connect(() => {
                    el.checked = getAttr(Game, k) ?? defaultVal;
                });
            }
            else {
                el.value = getAttr(Game, k);
                const defaultVal = el.value;
                const funcs = (el.dataset.funcs ?? "").split(",");
                el.addEventListener("change", () => {
                    UpdateSettingsBuffer(k, { value: el.value, el: el, funcs: funcs });
                });
                RejectSettingsBuffer.Connect(() => {
                    el.value = getAttr(Game, k) ?? defaultVal;
                });
            }
        }
        else if (el instanceof HTMLSelectElement) {
            if (el.classList.contains("ease")) {
                el.value = getAttr(Game, k);
                const defaultVal = el.value;
                const funcs = (el.dataset.funcs ?? "").split(",");
                el.addEventListener("change", () => {
                    UpdateSettingsBuffer(k, { value: el.value, el: el, funcs: funcs });
                });
                RejectSettingsBuffer.Connect(() => {
                    el.value = getAttr(Game, k) ?? defaultVal;
                });
            }
        }
    }
}
handleSettings();
class BlockData {
    constructor(color = Color.fromHex("#FFFFFFFF")) {
        if (typeof color === "string")
            color = Color.fromHex(color + "FF");
        this.Color = color;
    }
    Color;
}
class NumberRange {
    constructor(min, max) {
        this.Min = Math.min(min, max);
        this.Max = Math.max(min, max);
    }
    inRange(x) {
        return (x >= this.Min) && (x <= this.Max);
    }
    Min;
    Max;
    static infinite = new NumberRange(-Infinity, Infinity);
}
class Level {
    constructor(name, speed, scoreGate, speedMode = Enum.ModeOperation.Multiply, scoreGateMode = Enum.ModeOperation.Multiply, speedRange = NumberRange.infinite, scoreGateRange = NumberRange.infinite, scoreMultiplier) {
        this.Name = name;
        this.speed = speed;
        this.scoreGate = scoreGate;
        this.SpeedMode = speedMode;
        this.ScoreGateMode = scoreGateMode;
        this.SpeedRange = speedRange;
        this.ScoreGateRange = scoreGateRange;
        if (scoreMultiplier)
            this.scoreMultiplier = scoreMultiplier;
    }
    Name;
    speed;
    scoreGate;
    scoreMultiplier = function (index) {
        return 1 + (index / 25);
    };
    ScoreMultiplier() {
        return this.scoreMultiplier(Levels.indexOf(this));
    }
    SpeedMode;
    ScoreGateMode;
    SpeedRange;
    ScoreGateRange;
    get Speed() {
        return clamp(this.SpeedMode(Game.LevelSpeed, this.speed), this.SpeedRange.Min, this.SpeedRange.Max);
    }
    get ScoreGate() {
        return Math.round(clamp(this.ScoreGateMode(Game.ScoreGate, this.scoreGate), this.ScoreGateRange.Min, this.ScoreGateRange.Max));
    }
}
class Block {
    constructor(blockShapes, blockData, symbol) {
        if (blockShapes.length < 4)
            for (let i = blockShapes.length; i < 4; i++)
                blockShapes[i] = blockShapes[i - 1];
        this.Shapes = blockShapes;
        this.Data = blockData;
        this.Symbol = symbol;
    }
    Shapes;
    Data;
    Symbol;
    toString() {
        return this.Symbol;
    }
}
class BlockInstance extends Block {
    constructor(block) {
        super(block.Shapes, block.Data, block.Symbol);
        this._x = Math.floor(Game.Width / 2 - this.CurrentShape[0].length / 2);
        // this._y = 0-this.HighestPoint.Y;
        this.targetPos = new Point(this._x, this._y);
    }
    _x = 0;
    _y = 0;
    get X() {
        return this._x;
    }
    get Y() {
        return this._y;
    }
    get Width() {
        return this.CurrentShape[0].length;
    }
    get Height() {
        return this.CurrentShape.length;
    }
    get VisualHeight() {
        return (this.LowestPoint.Y - this.HighestPoint.Y) + 1;
    }
    get CurrentShape() {
        return this.Shapes[this.Rotation];
    }
    Rotation = 0;
    IsValidPosition(x = this.targetPos?.X ?? 0, y = this.targetPos?.Y ?? 0, shape = this.CurrentShape) {
        for (const [oY, row] of shape.entries()) {
            for (const [oX, col] of row.entries()) {
                if (col === 0)
                    continue;
                if (Game.Data[y + oY] === undefined || Game.Data[0][x + oX] === undefined)
                    return false;
                if (Game.Data[y + oY][x + oX] !== 0)
                    return false;
            }
        }
        return true;
    }
    tween = new Tween([]);
    targetPos;
    get TargetPos() {
        return this.targetPos;
    }
    dropping = false;
    isFake = false;
    Clone() {
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
    get IsDropping() {
        return this.dropping;
    }
    async Move(x = 0, y = 0, isInstantDrop = false, isTickedDrop = false) {
        if (this.dropping)
            return undefined;
        x += this.targetPos?.X ?? 0;
        y += this.targetPos?.Y ?? 0;
        if (!this.IsValidPosition(x, y))
            return !this.dropping ? false : undefined;
        if (isInstantDrop)
            this.dropping = true;
        this.targetPos = new Point(x, y);
        if (Game.Anims) {
            const tData = { s: new Point(this._x, this._y), e: this.targetPos };
            const { promise: comp, resolve } = Promise.withResolvers();
            if (this.tween && this.tween.isPlaying())
                this.tween.stop();
            this.tween = new Tween(tData.s)
                .to(tData.e, !isInstantDrop ? Game.AnimMoveTime : Game.AnimDropTime)
                .easing(!isInstantDrop ? Game.MoveEase : Game.DropEase)
                .dynamic(true)
                .onUpdate(data => {
                this._x = data.X;
                this._y = data.Y;
                this.Draw();
            });
            var isComplete = false;
            const fin = () => {
                if (isInstantDrop)
                    this.dropping = false;
                isComplete = true;
                resolve(undefined);
            };
            this.tween.onComplete(fin);
            this.tween.onStop(fin);
            this.tween.start();
            const updateFunc = () => {
                const t = performance.now();
                this.tween.update(t);
                if (!isComplete)
                    requestAnimationFrame(updateFunc);
            };
            requestAnimationFrame(updateFunc);
            await comp;
            await sleep(2);
        }
        else {
            [this._x, this._y] = [this.targetPos.X, this.targetPos.Y];
            this.Draw();
            if (isInstantDrop)
                this.dropping = false;
        }
        return !this.dropping ? true : false;
    }
    Rotate(reverse = false) {
        let dir = (reverse) ? -1 : 1;
        const newRot = Utils.OverflowOperate(this.Rotation, dir, 0, 3);
        if (!this.IsValidPosition(undefined, undefined, this.Shapes[newRot])) {
            for (let i = 1; i <= this.Shapes[newRot][0].length; i++) {
                if (this.IsValidPosition((this.targetPos?.X ?? 0) - i, undefined, this.Shapes[newRot])) {
                    this.tween.stop();
                    this.Rotation = newRot;
                    this._x = (this.targetPos?.X ?? 0) - i;
                    this.targetPos = new Point(this._x, this.targetPos?.Y ?? 0);
                    this.Draw();
                    return true;
                }
                if (this.IsValidPosition((this.targetPos?.X ?? 0) + i, undefined, this.Shapes[newRot])) {
                    this.tween.stop();
                    this.Rotation = newRot;
                    this._x = (this.targetPos?.X ?? 0) + i;
                    this.targetPos = new Point(this._x, this.targetPos?.Y ?? 0);
                    this.Draw();
                    return true;
                }
            }
            return false;
        }
        this.Rotation = newRot;
        this.Draw();
        return true;
    }
    static Draw(block, canvas, x, y, drawColor, outline, width, height) {
        if (!block.isFake)
            return;
        block._draw(canvas, x, y, drawColor, outline, width, height);
    }
    _draw(canvas = Game.BlockCanvas, x = this._x, y = this._y, drawColor = false, outline = false, width = 1, height = 1) {
        if (drawColor)
            canvas.Context.fillStyle = this.Data.Color.RGBA;
        for (const [oY, row] of this.CurrentShape.entries()) {
            for (const [oX, col] of row.entries()) {
                if (col === 0)
                    continue;
                let [_x, _y, _w, _h] = [Game.CanvasOffset(canvas).X + x * Game.PixelSize + oX * Game.PixelSize, Game.CanvasOffset(canvas).Y + y * Game.PixelSize + oY * Game.PixelSize, Game.PixelSize * width * Game.BlockScale, Game.PixelSize * height * Game.BlockScale];
                _x -= (_w - _w / Game.BlockScale) / 2;
                _y -= (_h - _h / Game.BlockScale) / 2;
                if (!outline)
                    canvas.Context.fillRect(_x, _y, _w, _h);
                else
                    canvas.Context.strokeRect(_x, _y, _w, _h);
            }
        }
    }
    Draw(canvas = Game.BlockCanvas) {
        if (!this.IsValidPosition())
            return;
        if (canvas === Game.BlockCanvas)
            canvas.ClearCanvas();
        canvas.Context.fillStyle = this.Data.Color.RGBA;
        this._draw(canvas);
        // Draw ghost block
        if (Game.GhostBlockOpacity > 0 && canvas === Game.BlockCanvas && this.LowestValidY > this._y) {
            canvas.Context.fillStyle = this.Data.Color.WithOpacity(Game.GhostBlockOpacity);
            this._draw(canvas, !Game.AnimGhostBlock ? this.targetPos?.X : this._x, this.LowestValidY);
        }
        // Draw accublock
        if (Game.RawBlockOpacity > 0 && canvas === Game.BlockCanvas) {
            canvas.Context.fillStyle = this.Data.Color.WithOpacity(Game.RawBlockOpacity);
            this._draw(canvas, this.targetPos?.X, this.targetPos?.Y);
        }
    }
    stamping = false;
    async Stamp() {
        if (this.dropping || this.stamping)
            return;
        this.stamping = true;
        [this._x, this._y] = [this.targetPos?.X ?? 0, this.targetPos?.Y ?? 0];
        this.Draw(Game.StaleCanvas);
        Game.WriteShape(this, this._x, this._y, this.CurrentShape);
        await Game.BlockStamped(this);
        this.stamping = false;
    }
    async InstantDrop() {
        const y = this.LowestValidY - (this.targetPos?.Y ?? 0);
        Game.Score += y * Enum.BaseScores.Hard;
        await this.Move(0, y, true);
        await this.Stamp();
    }
    get LowestValidY() {
        let y = this.targetPos?.Y ?? 0;
        while (true) {
            y++;
            if (!this.IsValidPosition(undefined, y)) {
                y--;
                break;
            }
        }
        return y;
    }
    get HighestPoint() {
        let highestPoint = new Point(0, 0);
        for (const [oY, row] of this.CurrentShape.entries()) {
            for (const [oX, col] of row.entries()) {
                if (col === 0)
                    continue;
                return new Point(oX, oY);
            }
        }
        return highestPoint;
    }
    get LowestPoint() {
        let lowestPoint = new Point(0, 0);
        for (const [oY, row] of this.CurrentShape.entries()) {
            if (oY < lowestPoint.Y)
                break;
            for (const [oX, col] of row.entries()) {
                if (col === 0)
                    continue;
                lowestPoint = new Point(oX, oY);
            }
        }
        return lowestPoint;
    }
    toBlock() {
        return new Block(this.Shapes, this.Data, this.Symbol);
    }
}
const Levels = new InfiniteArray([
    new Level("1", 1.0, 0, Enum.ModeOperation.Set, Enum.ModeOperation.Set),
    new Level("2..", 1.05, 1000, (x, y) => Math.max(1.064 ^ Game.LevelNumber, Game.MaxSpeed), Enum.ModeOperation.Set)
]);
const Blocks = {
    "I": new Block([
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
    ], new BlockData("#91d7e3"), "I"),
    "O": new Block([
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
    ], new BlockData("#eed49f"), "O"),
    "T": new Block([
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
    ], new BlockData("#c6a0f6"), "T"),
    "S": new Block([
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
    ], new BlockData("#a6da95"), "S"),
    "Z": new Block([
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
    ], new BlockData("#ed8796"), "Z"),
    "J": new Block([
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
    ], new BlockData("#b7bdf8"), "J"),
    "L": new Block([
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
    ], new BlockData("#f5a97f"), "L")
};
class ModEngine {
    static ModList = {};
    static LoadMod(mod) {
        if (this.ModList[mod.Name] !== undefined)
            return false;
        this.ModList[mod.Name] = mod;
        return true;
    }
}
class Mod {
    constructor(modData) {
        this.Name = modData.Name;
        this.Description = modData.Description ?? "";
        this.Blocks = modData["Custom Blocks"];
    }
    ;
    Name;
    Description;
    Blocks;
}
function onResize() {
    const cond = document.documentElement.scrollWidth <= window.innerWidth || document.documentElement.scrollHeight <= window.innerHeight;
    document.querySelectorAll(".game-canvas, .modal").forEach(canvas => {
        if (cond) {
            canvas.style.height = "100%";
            canvas.style.width = "auto";
        }
        else {
            canvas.style.height = "auto";
            canvas.style.width = "100%";
        }
    });
}
// const resizeObserver = new ResizeObserver(onResize);
// resizeObserver.observe(document.body);
// window.addEventListener("resize",onResize);
window.addEventListener("click", loadSFX);
function getRangeStep(range) {
    const int = range.classList.contains("int");
    let step = ((int ? parseInt : parseFloat)(range.step)) || 1;
    if (heldKeys.Shift && (heldKeys.Control || heldKeys.Meta))
        step = Math.abs(parseFloat(range.max)) + Math.abs(parseFloat(range.min));
    else if (heldKeys.Shift)
        step = parseFloat(range.dataset.shiftStep ?? "") || (step * 5);
    else if (heldKeys.Control || heldKeys.Meta)
        step = (Math.abs(parseFloat(range.max)) + Math.abs(parseFloat(range.min))) / 2;
    return (int ? Math.round : dummy)(step);
}
function stepRange(range, dir = 1) {
    const int = range.classList.contains("int");
    return clamp((int ? parseInt : parseFloat)(range.value) + (getRangeStep(range) * dir), (int ? parseInt : parseFloat)(range.min), (int ? parseInt : parseFloat)(range.max));
}
const heldKeys = { "Shift": false, "Control": false, "Meta": false };
const keyThreads = {};
async function handleKeypress(event) {
    let eventKey = event.key;
    if (eventKey === "Tab" && heldKeys.Shift)
        eventKey = "ShiftTab";
    if (event.defaultPrevented || !__sfx_loaded)
        return;
    if (!Game.Running || Game.Paused) {
        if (document.activeElement?.classList.contains("keybind") && document.activeElement.textContent === "...")
            return event.preventDefault();
        switch (eventKey) {
            case "ArrowLeft":
                if (PauseBtns[PauseMenuSel] instanceof HTMLInputElement) {
                    if (PauseBtns[PauseMenuSel].type !== "range") {
                        return;
                    }
                    else {
                        const val = PauseBtns[PauseMenuSel];
                        val.valueAsNumber = stepRange(val, -1);
                        val.dispatchEvent(new Event("change"));
                        return event.preventDefault();
                    }
                }
            case "ShiftTab":
            case "ArrowUp":
                PauseMenuSel = Utils.OverflowOperate(PauseMenuSel, -1, 0, PauseBtns.length - 1);
                return focusButton();
            case "ArrowRight":
                if (PauseBtns[PauseMenuSel] instanceof HTMLInputElement) {
                    if (PauseBtns[PauseMenuSel].type !== "range") {
                        return;
                    }
                    else {
                        const val = PauseBtns[PauseMenuSel];
                        val.valueAsNumber = stepRange(val);
                        val.dispatchEvent(new Event("change"));
                        return event.preventDefault();
                    }
                }
            case "Tab":
            case "ArrowDown":
                PauseMenuSel = Utils.OverflowOperate(PauseMenuSel, 1, 0, PauseBtns.length - 1);
                return focusButton();
            case "z":
            case "c":
            case " ":
            case "Enter":
                if (!(document.activeElement instanceof HTMLSelectElement)) {
                    if (document.activeElement?.classList.contains("keybind"))
                        await sleep(2);
                    document.activeElement?.click();
                }
                else
                    document.activeElement?.showPicker();
                return;
            case "Backspace":
                if (PauseBtns[PauseMenuSel] instanceof HTMLInputElement)
                    if (PauseBtns[PauseMenuSel].type !== "range")
                        return;
            case "Escape":
                for (const el of PauseBtns.values()) {
                    if (el?.classList?.contains("modal-back"))
                        return el?.click();
                }
                if (!Game.Running)
                    return;
                break;
            default: return;
        }
    }
    if (Game.Paused && event.key !== "Escape")
        return;
    switch (event.key) {
        case Game.KeyBinds.Left:
            Game.CurrentBlock?.Move(-1, 0);
            break;
        case Game.KeyBinds.Right:
            Game.CurrentBlock?.Move(1, 0);
            break;
        case Game.KeyBinds.Soft:
            Game.CurrentBlock?.Move(0, 1).then(success => {
                if (success)
                    Game.Score += Enum.BaseScores.Soft;
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
        default: return console.log(event.key);
    }
    event.preventDefault();
}
window.addEventListener("keyup", event => {
    heldKeys[event.key] = false;
    if (keyThreads[event.key]) {
        clearTimeout(keyThreads[event.key]);
        keyThreads[event.key] = undefined;
    }
});
window.addEventListener("keydown", async (event) => {
    const paused = Game.Paused;
    if (!paused && heldKeys[event.key])
        return;
    heldKeys[event.key] = true;
    handleKeypress(event);
    const isMoveKey = event.key === Game.KeyBinds.Left || event.key === Game.KeyBinds.Right || event.key === Game.KeyBinds.Soft;
    if (!paused) {
        keyThreads[event.key] = setTimeout(() => {
            if (!heldKeys[event.key])
                return;
            var id;
            id = setInterval(() => {
                if (!heldKeys[event.key])
                    return clearInterval(id);
                handleKeypress(new KeyboardEvent("keydown", { key: event.key }));
            }, isMoveKey ? Game.MoveKeyRepeatInterval : Game.KeyRepeatInterval);
        }, isMoveKey ? Game.MoveKeyRepeatDelay : Game.KeyRepeatDelay);
    }
}, true);
Game.DrawGrid();
Game.NewGame();
document.getElementById("pause-resume")?.addEventListener("click", () => {
    if (!Game.Running) {
        Game.StartGame();
        return;
    }
    Game.TogglePause(false);
});
document.getElementById("pause-restart")?.addEventListener("click", () => {
    Game.Reset();
    Game.StartGame();
});
document.getElementById("pause-mods")?.addEventListener("click", () => {
    if (document.querySelector(".modal.active"))
        return;
    document.getElementById("mods")?.classList.add("active");
    updateSelectionButtons();
});
document.getElementById("mods-back")?.addEventListener("click", () => {
    document.getElementById("mods")?.classList.remove("active");
    updateSelectionButtons();
});
document.getElementById("pause-about")?.addEventListener("click", () => {
    if (document.querySelector(".modal.active"))
        return;
    document.getElementById("about")?.classList.add("active");
    updateSelectionButtons();
});
document.getElementById("about-back")?.addEventListener("click", () => {
    document.getElementById("about")?.classList.remove("active");
    updateSelectionButtons();
});
document.getElementById("pause-settings")?.addEventListener("click", () => {
    if (document.querySelector(".modal.active"))
        return;
    SettingsBuffer.clear();
    document.getElementById("settings")?.classList.add("active");
    updateSelectionButtons();
});
document.getElementById("settings-back")?.addEventListener("click", () => {
    document.getElementById("settings")?.classList.remove("active");
    updateSelectionButtons();
    WriteSettingsBuffer();
});
document.getElementById("settings-quit")?.addEventListener("click", () => {
    document.getElementById("settings")?.classList.remove("active");
    updateSelectionButtons();
    RejectSettingsBuffer.Fire();
});
const detailsArr = [];
document.querySelectorAll("details").forEach(el => {
    const style = document.createElement("style");
    const ind = detailsArr.length;
    detailsArr.push(style);
    document.head.appendChild(style);
    el.classList.add(`details-${ind}`);
    const summary = el.querySelector("summary");
    summary?.addEventListener("click", () => {
        setTimeout(() => {
            updateSelectionButtons(el);
        }, 1);
        var height = (el.children.item(1)?.children.item(0)?.clientHeight ?? 0) * (el.children.item(1)?.children.length ?? 1);
        style.textContent = `
        details[open].details-${ind}::details-content {
            height: ${height}px;
        }
        `;
    });
});
const keyTranslationMap = {
    " ": "Space"
};
function translateKey(k, reverse = false) {
    if (keyTranslationMap[k])
        return keyTranslationMap[k];
    if (!reverse) {
        if (k.length === 1)
            return k.toUpperCase();
        if (k.startsWith("Arrow"))
            return `${k.substring(5)} Arrow`;
    }
    else {
        if (k.length === 1)
            return k.toLowerCase();
        if (k.endsWith(" Arrow"))
            return `Arrow${k.substring(0, k.lastIndexOf(" Arrow"))}`;
    }
    return k;
}
document.querySelectorAll("button.keybind").forEach(el => {
    Game.KeyBinds[el.dataset.bind ?? ""] = el.dataset.key ?? "";
    function click(event) {
        if (event.key === "Escape") {
            el.textContent = translateKey(el.dataset.key ?? "");
            return;
        }
        el.dataset.key = event.key;
        event.preventDefault();
        document.removeEventListener("keydown", click);
        el.textContent = translateKey(event.key);
        Game.KeyBinds[el.dataset.bind ?? ""] = el.dataset.key ?? "";
    }
    el.textContent = translateKey(el.dataset.key ?? "");
    el.addEventListener("click", () => {
        el.textContent = "...";
        document.addEventListener("keydown", click);
    });
});
function preventKeyEvents(el) {
    el.addEventListener("keydown", event => {
        if (!el.classList.contains("keybind") || el.textContent !== "...") {
            switch (event.key) {
                case "Enter":
                case " ":
                case "ArrowUp":
                case "ArrowDown":
                    return event.preventDefault();
                case "Tab":
                case "ArrowLeft":
                case "ArrowRight":
                    return !(el instanceof HTMLInputElement) ? event.preventDefault() : undefined;
                default:
                    return;
            }
        }
    });
    if (el instanceof HTMLInputElement) {
        el.addEventListener("focus", () => {
            el.select();
        });
    }
}
document.querySelectorAll(".keyboard-selectable").forEach(el => {
    preventKeyEvents(el);
});
document.addEventListener("click", event => {
    const trg = event.target;
    if (trg.tagName === "A") {
        event.preventDefault();
        open(trg.href);
    }
});
let readme = await fetch("./README.md");
readme = await readme.text();
readme = await marked.parse(readme);
const rmt = document.getElementById("about-readme");
if (rmt)
    rmt.innerHTML = readme;
