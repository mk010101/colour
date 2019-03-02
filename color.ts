/**
 * Created by MK010101 on 17/03/2017
 */


const Color = {


    toRgb(...args): number[] {
        if (args.length === 1) {
            if (args[0].constructor === Array) {
                return this._toArray(args[0]);
            } else if (this._isHex(args[0])) {
                return this.hexToRgb(args[0]);
            } else {
                return this._toArray(args[0]);
            }
        }
        return args.map(parseFloat);
    },

    toRgbString(...args): string {
        if (args.length === 1) {
            if (args[0].constructor === Array) {
                return this._toRgbStr(args[0]);
            } else {
                let rgb = this.toRgb(args[0]);
                if (rgb) return this._toRgbStr(rgb);
            }
        }
        return this._toRgbStr(args);
    },


    toHex(...args): string {

        if (args.length === 1) {
            let res = args[0];
            if (res.constructor === Array) {
                let arr = this._toArray(res);
                return this.rgbToHex(arr[0], arr[1], arr[2]);
            } else if (this._isHex(res)) {
                if (res.match(/^#/g)) return res;
                return "#" + res;
            } else {
                let arr = this._toArray(res);
                if (!arr) return null;
                return this.rgbToHex(arr[0], arr[1], arr[2]);
            }
        }
        return this.rgbToHex(args[0], args[1], args[2]);

    },


    toHsl(...args): number[] {
        let arr;
        if (args.length === 1) {
            arr = this.toRgb(args[0])
        } else {
            arr = args;
        }
        return this.rgbToHsl(arr[0], arr[1], arr[2])
    },



    /* =====================================================================================================================
     HEX - RGB
     ==================================================================================================================== */

    hexToRgb(hex: string): number[] {

        let m = hex.match(/[0-9A-Fa-f]{6}/g);
        if (!m) return null;

        hex = m[0];

        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }

        let num = parseInt(hex, 16);

        return [num >> 16, num >> 8 & 255, num & 255];
    },


    rgbToHex(r, g, b): string {
        return "#" + this._componentToHex(r) + this._componentToHex(g) + this._componentToHex(b);
    },


    /* =====================================================================================================================
     HEX - HSL
     ==================================================================================================================== */

    hexToHsl(hex: string) {
        let rgb = this.hexToRgb(hex);
        return this.rgbToHsl(rgb[0], rgb[1], rgb[2]);
    },

    hslToHex(h, s, l) {
        let rgb = this.hslToRgb(h, s, l);
        return this.rgbToHex(rgb[0], rgb[1], rgb[2]);
    },


    /* =====================================================================================================================
     HSL - RGB (HSL ranges 0-1)
     ==================================================================================================================== */

    rgbToHsl(r, g, b): number[] {

        let min, max, i, l, s, maxcolor, h, rgb = [];
        rgb[0] = r / 255;
        rgb[1] = g / 255;
        rgb[2] = b / 255;
        min = rgb[0];
        max = rgb[0];
        maxcolor = 0;
        for (i = 0; i < rgb.length - 1; i++) {
            if (rgb[i + 1] <= min) {
                min = rgb[i + 1];
            }
            if (rgb[i + 1] >= max) {
                max = rgb[i + 1];
                maxcolor = i + 1;
            }
        }
        if (maxcolor == 0) {
            h = (rgb[1] - rgb[2]) / (max - min);
        }
        if (maxcolor == 1) {
            h = 2 + (rgb[2] - rgb[0]) / (max - min);
        }
        if (maxcolor == 2) {
            h = 4 + (rgb[0] - rgb[1]) / (max - min);
        }
        if (isNaN(h)) {
            h = 0;
        }
        h = h * 60;
        if (h < 0) {
            h = h + 360;
        }
        l = (min + max) / 2;
        if (min == max) {
            s = 0;
        } else {
            if (l < 0.5) {
                s = (max - min) / (max + min);
            } else {
                s = (max - min) / (2 - max - min);
            }
        }
        return [h, s, l]

    },


    hslToRgb(h, s, l) {
        let t1, t2, r, g, b;
        h = h / 60;
        if (l <= 0.5) {
            t2 = l * (s + 1);
        } else {
            t2 = l + s - (l * s);
        }
        t1 = l * 2 - t2;
        r = Math.round(this._hueToRgb(t1, t2, h + 2) * 255);
        g = Math.round(this._hueToRgb(t1, t2, h) * 255);
        b = Math.round(this._hueToRgb(t1, t2, h - 2) * 255);
        return [r, g, b];

    },


    /* =====================================================================================================================
     OPERATIONS
     ==================================================================================================================== */

    hue(hex: string, rotation: number): string {

        let [r, g, b] = this.hexToRgb(hex);
        let [h, s, l] = this.rgbToHsl(r, g, b);
        h = (h + rotation) % 360;

        [r, g, b] = this.hslToRgb(h, s, l);
        return this.rgbToHex(r, g, b);
    },


    saturation(hex: string, value: number) {
        if (value >= 100) return hex;
        value /= 100;
        let [h, s, l] = this.hexToHsl(hex);
        s = value;
        return (this.hslToHex(h, s, l));
    },

    lightness(hex: string, value: number): string {
        if (value >= 100) return hex;
        value /= 100;
        let [h, s, l] = this.hexToHsl(hex);
        l = value;
        return (this.hslToHex(h, s, l));
    },

    complementary(hex: string): string {
        return this.hue(hex, 180);
    },


    mix(hexBase: string, hexColor: string, amount: number = 50) {

        amount = amount || 50;

        let [r, g, b] = this.hexToRgb(hexBase);
        let [r1, g1, b1] = this.hexToRgb(hexColor);

        let p = amount / 100;

        let mr = Math.round((r1 - r) * p + r);
        let mg = Math.round((g1 - g) * p + g);
        let mb = Math.round((b1 - b) * p + b);

        return this.rgbToHex(mr, mg, mb);
    },

    /**
     * Adds white to the base colour and returns hex string
     * @param hex
     * @param amount
     * @returns {string}
     */
        tint(hex: string, amount: number = 10) {
        amount = amount || 1;
        return this.mix(hex, "ffffff", amount);
    },

    /**
     * Adds black to the base colour and returns hex string
     * @param hex
     * @param amount
     * @returns {string}
     */
        shade(hex: string, amount = 10) {
        amount = amount || 1;
        return this.mix(hex, "000000", amount);
    },

    /**
     * Adds grey to the base colour and returns hex string
     * @param hex
     * @param amount
     * @returns {string}
     */
        tone(hex: string, amount = 10) {
        amount = amount || 1;
        return this.mix(hex, "808080", amount);
    },

    toGrey(hex: string): string {
        let [r, g, b] = this.toRgb(hex);
        let v = Math.round((r + g + b) / 3);
        return this.rgbToHex(v, v, v);
    },

    /* =====================================================================================================================
     ANALYSIS
     ==================================================================================================================== */

    isDark(hex: string): boolean {
        return this.getLuma(hex) < 128;
    },

    isWarm(input: string): boolean {
        let hsl = this.toHsl(input);
        let h = hsl[0];
        return h <= 120 || h >= 300;
    },


    getValue(hex: string): number {
        let [r, g, b] = this.toRgb(hex);
        return Math.max(r, g, b); // if range 0-1 is needed, divide by 255.
    },

    getHue(hex: string): number {
        return this.toHsl(hex)[0];
    },

    getSaturation(hex: string): number {
        let hsl = this.toHsl(hex);
        return Math.round(hsl[1] * 100);
    },

    getLightness(hex: string): number {
        let hsl = this.toHsl(hex);
        return Math.round(hsl[2] * 100);
    },

    getLuma(hex: string): number {
        let [r,g, b] = this.toRgb(hex);
        return Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
    },

    getLuma2(hex: string): number {
        let [r,g, b] = this.toRgb(hex);
        return Math.round(((r * 299 + g * 587 + b * 114) / 1000));
    },

    getGreyValue(hex: string): number {
        let [r,g, b] = this.toRgb(hex);
        return Math.round((r + g + b) / 3);
    },

    getContrast(a: string, b:string): number {
        let l1 = this.getLuma(a) / 255;
        let l2 = this.getLuma(b) / 255;
        if (l2 > l1) [l1, l2] = [l2, l1];
        return (l1 + 0.05) / (l2 + 0.05);
    },



    /* =====================================================================================================================
     PRIVATE
     ==================================================================================================================== */

    _toArray(inp): number[] {
        if (inp.constructor === Array) return inp.map(parseFloat);
        let arr = inp.match(/\d+\.\d+|\d+\s*/g);
        if (!arr || arr.length < 3 || arr.length > 4) return null;
        return arr.map(parseFloat);
    },

    _isHex(str): boolean {
        return str.match(/[0-9A-Fa-f]{6}/g);
    },

    _hueToRgb(t1, t2, hue) {
        if (hue < 0) hue += 6;
        if (hue >= 6) hue -= 6;
        if (hue < 1) return (t2 - t1) * hue + t1;
        else if (hue < 3) return t2;
        else if (hue < 4) return (t2 - t1) * (4 - hue) + t1;
        else return t1;
    },

    _toRgbStr(rgb: number[]): string {
        if (rgb.length < 3 || rgb.length > 4) return null;
        if (rgb.length === 3) return "rgb(" + rgb.join(", ") + ")";
        return "rgba(" + rgb.join(", ") + ")";
    },

    _componentToHex(c) {
        let hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    },


};


export {Color};



















