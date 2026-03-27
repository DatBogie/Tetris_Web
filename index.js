import { sfxr } from "./Modules/jsfxr.js";
import click from "./Sounds/click.json" with { type: 'json' };
import { Tween, Easing } from "@tweenjs/tween.js";
const clickWar = document.getElementById("click-req");
clickWar?.addEventListener("click", () => {
    updateSelectionButtons();
    clickWar.style.pointerEvents = "none !important";
    clickWar.style.opacity = "0";
    setTimeout(() => {
        clickWar?.remove();
    }, 600);
});
var clickSound;
var PauseMenuSel = 0;
var PauseBtns = Array.from(document.querySelectorAll("#pause-btns > .keyboard-selectable"));
var __sfx_loaded = false;
function loadSFX() {
    __sfx_loaded = true;
    clickSound = sfxr.toAudio(click);
    window.removeEventListener("click", loadSFX);
}
function playSound(sound) {
    if (!__sfx_loaded)
        return false;
    sound.play();
    return true;
}
function updateSelectionButtons(detailsSel) {
    const modal = document.querySelector(".modal.active");
    const btns = Array.from(modal ? modal.querySelectorAll(".modal-content .keyboard-selectable") : document.querySelectorAll("#pause-btns > .keyboard-selectable"));
    const tBtns = [];
    for (const btn of btns.values()) {
        const details = btn.parentElement?.parentElement?.parentElement?.parentElement;
        if (!btn.classList.contains("hidden") && (!details || !(details instanceof HTMLDetailsElement) || details.open)) {
            tBtns.push(btn);
        }
    }
    PauseMenuSel = !detailsSel ? 0 : tBtns.indexOf(detailsSel.querySelector("summary") ?? detailsSel) ?? 0;
    PauseBtns = tBtns;
    focusButton();
}
function isChildOverflown(el, parent = el.parentElement) {
    if (!parent)
        return true;
    const cRect = el.getBoundingClientRect();
    const pRect = parent.getBoundingClientRect();
    return (cRect.top >= pRect.bottom ||
        cRect.right <= pRect.left ||
        cRect.bottom <= pRect.top ||
        cRect.left >= pRect.right);
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
            _s = Color.parseCSSNumber(data[0], true);
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
class Game {
    static AnimTime = 20;
    static Anims = true;
    static Physics = false;
    static KeyBinds = {};
    static BlockThemes = {
        "Default": new BlockTheme(undefined, {
            [Enum.BlockShape.I]: Color.fromHex("#91d7e3"),
            [Enum.BlockShape.J]: Color.fromHex("#eed49f"),
            [Enum.BlockShape.L]: Color.fromHex("#c6a0f6"),
            [Enum.BlockShape.O]: Color.fromHex("#a6da95"),
            [Enum.BlockShape.S]: Color.fromHex("#ed8796"),
            [Enum.BlockShape.T]: Color.fromHex("#b7bdf8"),
            [Enum.BlockShape.Z]: Color.fromHex("#f5a97f")
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
    static Paused = true;
    static CurrentBlock;
    static BgCanvas = new Canvas2D(document.getElementById("bg"));
    static GameCanvas = new Canvas2D(document.getElementById("game"));
    static BlockCanvas = new Canvas2D(document.getElementById("block"));
    static StaleCanvas = new Canvas2D(document.getElementById("stale"));
    static Level;
    static get Running() {
        return Game._running;
    }
    static _running;
    static _data;
    static _time;
    static _thread_id;
    static GridDrawn = false;
    static get CenterPoint() {
        return new Point(Game.GameCanvas.Canvas.width / 2, Game.GameCanvas.Canvas.height / 2);
    }
    static get GameOffset() {
        return new Point(Game.CenterPoint.X - (Game.Width * Game.PixelSize) / 2, Game.CenterPoint.Y - (Game.Height * Game.PixelSize) / 2);
    }
    static get Speed() {
        return Game.BaseSpeedMs / Game.Level.Speed / Game.SpeedMul;
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
        Game.Level = Enum.Levels[0];
        if (!Game.GridDrawn)
            Game.DrawGrid();
        Game.BlockCanvas.ClearCanvas();
        Game.StaleCanvas.ClearCanvas();
        Game._data = [];
        for (let y = 0; y < Game.Height; y++) {
            Game._data[y] = [];
            for (let x = 0; x < Game.Width; x++)
                Game._data[y][x] = 0;
        }
    }
    static NewGame() {
        Game.Reset();
    }
    static async GameTick() {
        if (Game.Paused)
            return;
        const moveRes = await Game.CurrentBlock.Move(0, 1);
        if (Game.CurrentBlock && moveRes === false) {
            console.log(moveRes);
            await Game.CurrentBlock.Stamp();
        }
    }
    static StartGame() {
        if (Game._running)
            return;
        Game._running = true;
        Game.TogglePause(false);
        Game.CurrentBlock = Game.RandomBlock();
        Game.CurrentBlock.Draw();
        if (Game._thread_id !== null)
            clearInterval(Game._thread_id);
        Game._thread_id = setInterval(Game.GameTick, Game.Speed);
    }
    static RandomBlock() {
        return new BlockInstance(Utils.PickRandomFromDict(Blocks));
    }
    static DrawGrid() {
        Game.GridDrawn = true;
        Game.GameCanvas.ClearCanvas();
        Game.BgCanvas.ClearCanvas();
        Game.BgCanvas.Context.fillStyle = "#1e2030";
        Game.BgCanvas.Context.fillRect(Game.GameOffset.X, Game.GameOffset.Y, Game.Width * Game.PixelSize, Game.Height * Game.PixelSize);
        Game.GameCanvas.Context.strokeStyle = "#18192680";
        Game.GameCanvas.Context.lineWidth = 1;
        for (let x = 0; x <= Game.Width; x++) {
            Game.GameCanvas.Context.beginPath();
            Game.GameCanvas.Context.moveTo(Game.GameOffset.X + x * Game.PixelSize, Game.GameOffset.Y);
            Game.GameCanvas.Context.lineTo(Game.GameOffset.X + x * Game.PixelSize, Game.GameOffset.Y + Game.Height * Game.PixelSize);
            Game.GameCanvas.Context.stroke();
        }
        for (let y = 0; y <= Game.Height; y++) {
            Game.GameCanvas.Context.beginPath();
            Game.GameCanvas.Context.moveTo(Game.GameOffset.X, Game.GameOffset.Y + y * Game.PixelSize);
            Game.GameCanvas.Context.lineTo(Game.GameOffset.X + Game.Width * Game.PixelSize, Game.GameOffset.Y + y * Game.PixelSize);
            Game.GameCanvas.Context.stroke();
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
                await sleep(Game.AnimTime);
                Game.RedrawCanvas();
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
                Game.StaleCanvas.Context.fillRect(Game.GameOffset.X + x * Game.PixelSize, Game.GameOffset.Y + y * Game.PixelSize, Game.PixelSize, Game.PixelSize);
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
                await sleep(Game.AnimTime);
            }
        }
    }
    static async handleClears() {
        var cFlag = false;
        Game.BlockCanvas.ClearCanvas();
        for (let y = 0; y < Game.Height; y++) {
            if (Game._data[y].every(col => col !== 0)) {
                await Game.EraseLine(Game, y);
                for (let oY = y - 1; oY >= 0; oY--) {
                    for (let x = 0; x < Game.Width; x++) {
                        Game._data[oY + 1][x] = Game._data[oY][x];
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
        return cFlag;
    }
    static async BlockStamped(self) {
        if (self !== Game.CurrentBlock)
            return;
        if (await Game.handleClears())
            await Game.handleClears();
        Game.RedrawCanvas();
        Game.CurrentBlock = Game.RandomBlock();
        if (!Game.CurrentBlock.IsValidPosition()) {
            Game.Reset();
        }
        Game.CurrentBlock.Draw();
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
        document.querySelectorAll(".game-canvas").forEach(canvas => {
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
    SpeedMul: settingsWin?.querySelector("#settings-game-speed-mul"),
    Anims: settingsWin?.querySelector("#settings-anims"),
    AnimTime: settingsWin?.querySelector("#settings-anim-time"),
    GhostBlockOpacity: settingsWin?.querySelector("#settings-ghost-opacity"),
    Width: settingsWin?.querySelector("#settings-game-width"),
    Height: settingsWin?.querySelector("#settings-game-height"),
    Physics: settingsWin?.querySelector("#settings-physics")
};
const SettingsBuffer = new Map();
const settingsTitle = document.getElementById("settings-title");
function UpdateSettingsBuffer(k, data) {
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
        if (el instanceof HTMLInputElement) {
            switch (el.type) {
                case "number":
                    const min = parseFloat(el.dataset.min ?? "0");
                    const max = parseFloat(el.dataset.max ?? "100");
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
                        // setAttr(Game,k,el.classList.contains("percent")? val/max : val);
                        UpdateSettingsBuffer(k, { value: (el.classList.contains("percent") ? val / max : val), funcs: funcs, el: el });
                        el.valueAsNumber = val;
                    });
                    RejectSettingsBuffer.Connect(() => {
                        el.valueAsNumber = (getAttr(Game, k) ?? defaultVal) * (el.classList.contains("percent") ? max : 1);
                    });
                    break;
                case "checkbox":
                    el.checked = getAttr(Game, k);
                    const _defaultVal = el.checked;
                    el.addEventListener("change", () => {
                        // setAttr(Game,k,el.checked);
                        UpdateSettingsBuffer(k, { value: el.checked, el: el });
                    });
                    RejectSettingsBuffer.Connect(() => {
                        el.checked = getAttr(Game, k) ?? _defaultVal;
                    });
                    break;
                default:
                    el.value = getAttr(Game, k);
                    const __defaultVal = el.value;
                    el.addEventListener("change", () => {
                        // setAttr(Game,k,el.value);
                        UpdateSettingsBuffer(k, { value: el.value, el: el });
                    });
                    RejectSettingsBuffer.Connect(() => {
                        el.value = getAttr(Game, k) ?? __defaultVal;
                    });
                    break;
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
        this._x = Math.floor(Game.Width / 2 - this.CurrentShape[0].length / 2);
    }
    _x = 0;
    _y = 0;
    get X() {
        return this._x;
    }
    get Y() {
        return this._y;
    }
    get CurrentShape() {
        return this.Shapes[this.Rotation];
    }
    Rotation = 0;
    IsValidPosition(x = this._x, y = this._y, shape = this.CurrentShape) {
        for (const [oY, row] of shape.entries()) {
            for (const [oX, col] of row.entries()) {
                if (col === 0)
                    continue;
                if (Game.Data[Utils.BiasedRound(y) + oY] === undefined || Game.Data[0][Utils.BiasedRound(x) + oX] === undefined)
                    return false;
                if (Game.Data[Utils.BiasedRound(y) + oY][Utils.BiasedRound(x) + oX] !== 0)
                    return false;
            }
        }
        return true;
    }
    get tween() {
        return this.tweens[this.tweens.length - 1];
    }
    get prevTween() {
        if (this.tweens.length <= 1)
            return undefined;
        return this.tweens[this.tweens.length - 2];
    }
    tweens = [];
    targetPos;
    dropping = false;
    get IsDropping() {
        return this.dropping;
    }
    async Move(x = 0, y = 0, isInstantDrop = false) {
        if (this.dropping)
            return undefined;
        const [orX, orY] = [x, y];
        x += this.targetPos?.x ?? Utils.BiasedRound(this._x);
        y += this.targetPos?.y ?? Utils.BiasedRound(this._y);
        if (!this.IsValidPosition(x, y))
            return !this.dropping ? false : undefined;
        if (isInstantDrop)
            this.dropping = true;
        this.targetPos = { x: x, y: y };
        const tData = { s: { x: Utils.BiasedRound(this._x, orX), y: Utils.BiasedRound(this._y, orY) }, e: { x: Utils.BiasedRound(x, orX), y: Utils.BiasedRound(y, orY) } };
        const { promise: comp, resolve } = Promise.withResolvers();
        // if (this.tween && this.tween.isPlaying()) {
        //     this.tween.stop();
        //     this._x = Utils.BiasedRound(x,orX);
        //     this._y = Utils.BiasedRound(y,orY);
        //     this.Draw();
        //     return true;
        // }
        const noTweens = this.tweens.length === 0;
        if (this.tween && this.tween.isPlaying()) {
            this.tween.stop();
        }
        this.tweens.push(new Tween(tData.s));
        this.tween
            .to(tData.e, Game.AnimTime)
            .easing(Easing.Linear.InOut)
            .dynamic(true)
            .onUpdate(data => {
            this._x = data.x;
            this._y = data.y;
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
        // if (!this.prevTween)
        //     this.tween.start();
        // else if (this.prevTween.isPlaying()) {
        //     this.prevTween.stop();
        //     this.prevTween.chain(this.tween).start();
        // } else
        //     this.tween.start();
        const updateFunc = () => {
            const t = performance.now();
            this.tween.update(t);
            if (!isComplete)
                requestAnimationFrame(updateFunc);
        };
        requestAnimationFrame(updateFunc);
        await comp;
        await sleep(2);
        // this._x=Utils.BiasedRound(x);
        // this._y=Utils.BiasedRound(y);
        // this.Draw();
        return !this.dropping ? true : false;
    }
    Rotate(reverse = false) {
        let dir = (reverse) ? -1 : 1;
        const oldRot = this.Rotation;
        this.Rotation = Utils.OverflowOperate(this.Rotation, dir, 0, 3);
        if (!this.IsValidPosition()) {
            this.Rotation = oldRot;
            return false;
        }
        this.Draw();
        return true;
    }
    _draw(canvas = Game.BlockCanvas, x = this._x, y = this._y) {
        for (const [oY, row] of this.CurrentShape.entries()) {
            for (const [oX, col] of row.entries()) {
                if (col === 0)
                    continue;
                canvas.Context.fillRect(Game.GameOffset.X + x * Game.PixelSize + oX * Game.PixelSize, Game.GameOffset.Y + y * Game.PixelSize + oY * Game.PixelSize, Game.PixelSize, Game.PixelSize);
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
        if (canvas === Game.BlockCanvas && this.LowestValidY > this._y) {
            canvas.Context.fillStyle = this.Data.Color.WithOpacity(Game.GhostBlockOpacity);
            this._draw(canvas, Utils.BiasedRound(this._x), Utils.BiasedRound(this.LowestValidY));
        }
    }
    async Stamp() {
        if (this.dropping)
            return;
        this._x = Utils.BiasedRound(this._x);
        this._y = Utils.BiasedRound(this._y);
        this.Draw(Game.StaleCanvas);
        Game.WriteShape(this, this._x, this._y, this.CurrentShape);
        await Game.BlockStamped(this);
    }
    async InstantDrop() {
        if (!Game.Anims)
            this.Move(0, this.LowestValidY - this._y, true);
        else {
            await this.Move(0, this.LowestValidY - this._y, true);
            // for (let i=this._y; i<this.LowestValidY; i++) {
            //     this.Move(0,1);
            //     if (i % 2 === 0)
            //         await sleep(0);
            // }
        }
        await this.Stamp();
    }
    get LowestValidY() {
        let y = this._y;
        while (true) {
            y++;
            if (!this.IsValidPosition(undefined, y)) {
                y--;
                break;
            }
        }
        return y;
    }
    get LowestPoint() {
        let lowestPoint = { x: 0, y: 0 };
        for (const [oY, row] of this.CurrentShape.entries()) {
            if (oY < lowestPoint.y)
                continue;
            for (const [oX, col] of row.entries()) {
                if (col === 0)
                    continue;
                lowestPoint = { x: oX, y: oY };
            }
        }
        return lowestPoint;
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
    ], new BlockData("#91d7e3")),
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
    ], new BlockData("#eed49f")),
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
    ], new BlockData("#c6a0f6")),
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
    ], new BlockData("#a6da95")),
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
    ], new BlockData("#ed8796")),
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
    ], new BlockData("#b7bdf8")),
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
    ], new BlockData("#f5a97f"))
};
class ModEngine {
    static ModList = {};
    static LoadMod(mod) {
        if (this.ModList[mod.Namespace] !== undefined)
            return false;
        this.ModList[mod.Namespace] = mod;
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
    Namespace;
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
const resizeObserver = new ResizeObserver(onResize);
resizeObserver.observe(document.body);
window.addEventListener("resize", onResize);
window.addEventListener("click", loadSFX);
window.addEventListener("keydown", event => {
    if (event.defaultPrevented || !__sfx_loaded)
        return;
    if (!Game.Running || Game.Paused) {
        switch (event.key) {
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
        switch (event.key) {
            case "ArrowLeft":
                if (PauseBtns[PauseMenuSel] instanceof HTMLInputElement)
                    break;
            case "ArrowUp":
                PauseMenuSel = Utils.OverflowOperate(PauseMenuSel, -1, 0, PauseBtns.length - 1);
                return focusButton();
            case "ArrowRight":
                if (PauseBtns[PauseMenuSel] instanceof HTMLInputElement)
                    break;
            case "ArrowDown":
                PauseMenuSel = Utils.OverflowOperate(PauseMenuSel, 1, 0, PauseBtns.length - 1);
                return focusButton();
            case "z":
            case "c":
            case "Enter":
                document.activeElement?.click();
                return;
            case " ":
            case "Escape":
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
    summary.addEventListener("click", () => {
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
    " ": "Space",
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
        if (event.defaultPrevented || event.key === "Escape") {
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
        el.textContent = "…";
        document.addEventListener("keydown", click);
    });
});
document.querySelectorAll("input.keyboard-selectable").forEach(el => {
    el.addEventListener("keydown", event => {
        switch (event.key) {
            case "Enter":
            case "ArrowUp":
            case "ArrowDown":
                return event.preventDefault();
            default:
                return;
        }
    });
    el.addEventListener("focus", () => {
        el.select();
    });
});
// export default { Enum, Game, Color, BlockData, Block, BlockInstance }
