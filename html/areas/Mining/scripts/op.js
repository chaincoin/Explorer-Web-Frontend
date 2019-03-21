'use strict';
//the right shift is important, it has to do with 32 bit operations in javascript, it will make things faster


var op = {};


function u64(h, l) {
    this.hi = h >>> 0;
    this.lo = l >>> 0;
}

u64.prototype.set = function(oWord) {
    this.lo = oWord.lo;
    this.hi = oWord.hi;
};

u64.prototype.add = function(oWord) {
    var lowest, lowMid, highMid, highest; //four parts of the whole 64 bit number..

    //need to add the respective parts from each number and the carry if on is present..
    lowest = (this.lo & 0XFFFF) + (oWord.lo & 0XFFFF);
    lowMid = (this.lo >>> 16) + (oWord.lo >>> 16) + (lowest >>> 16);
    highMid = (this.hi & 0XFFFF) + (oWord.hi & 0XFFFF) + (lowMid >>> 16);
    highest = (this.hi >>> 16) + (oWord.hi >>> 16) + (highMid >>> 16);

    //now set the hgih and the low accordingly..
    this.lo = (lowMid << 16) | (lowest & 0XFFFF);
    this.hi = (highest << 16) | (highMid & 0XFFFF);

    return this; //for chaining..
};

u64.prototype.addOne = function() {
    if (this.lo === -1 || this.lo === 0xFFFFFFFF) {
        this.lo = 0;
        this.hi++;
    }
    else {
        this.lo++;
    }
};

u64.prototype.plus = function(oWord) {
    var c = new u64(0, 0);
    var lowest, lowMid, highMid, highest; //four parts of the whole 64 bit number..

    //need to add the respective parts from each number and the carry if on is present..
    lowest = (this.lo & 0XFFFF) + (oWord.lo & 0XFFFF);
    lowMid = (this.lo >>> 16) + (oWord.lo >>> 16) + (lowest >>> 16);
    highMid = (this.hi & 0XFFFF) + (oWord.hi & 0XFFFF) + (lowMid >>> 16);
    highest = (this.hi >>> 16) + (oWord.hi >>> 16) + (highMid >>> 16);

    //now set the hgih and the low accordingly..
    c.lo = (lowMid << 16) | (lowest & 0XFFFF);
    c.hi = (highest << 16) | (highMid & 0XFFFF);

    return c; //for chaining..
};

u64.prototype.not = function() {
    return new u64(~this.hi, ~this.lo);
};

u64.prototype.one = function() {
    return new u64(0x0, 0x1);
};

u64.prototype.zero = function() {
    return new u64(0x0, 0x0);
};

u64.prototype.neg = function() {
    return this.not().plus(this.one());
};

u64.prototype.minus = function(oWord) {
    return this.plus(oWord.neg());
};

u64.prototype.isZero = function() {
    return (this.lo === 0) && (this.hi === 0);
};

function isLong(obj) {
    return (obj && obj.__isLong__) === true;
}

function fromNumber(value) {
    if (isNaN(value) || !isFinite(value)) return this.zero();
    var pow32 = (1 << 32);
    return new u64((value % pow32) | 0, (value / pow32) | 0);
}

u64.prototype.multiply = function(multiplier) {
    if (this.isZero()) return this.zero();
    if (!isLong(multiplier)) multiplier = fromNumber(multiplier);
    if (multiplier.isZero()) return this.zero();

    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.

    var a48 = this.hi >>> 16;
    var a32 = this.hi & 0xFFFF;
    var a16 = this.lo >>> 16;
    var a00 = this.lo & 0xFFFF;

    var b48 = multiplier.hi >>> 16;
    var b32 = multiplier.hi & 0xFFFF;
    var b16 = multiplier.lo >>> 16;
    var b00 = multiplier.lo & 0xFFFF;

    var c48 = 0,
        c32 = 0,
        c16 = 0,
        c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return new u64((c48 << 16) | c32, (c16 << 16) | c00);
};

u64.prototype.shiftLeft = function(bits) {
    bits = bits % 64;
    var c = new u64(0, 0);
    if (bits === 0) {
        return this.clone();
    }
    else if (bits > 31) {
        c.lo = 0;
        c.hi = this.lo << (bits - 32);
    }
    else {
        var toMoveUp = this.lo >>> 32 - bits;
        c.lo = this.lo << bits;
        c.hi = (this.hi << bits) | toMoveUp;
    }
    return c; //for chaining..
};

u64.prototype.setShiftLeft = function(bits) {
    if (bits === 0) {
        return this;
    }
    if (bits > 63) {
        bits = bits % 64;
    }

    if (bits > 31) {
        this.hi = this.lo << (bits - 32);
        this.lo = 0;
    }
    else {
        var toMoveUp = this.lo >>> 32 - bits;
        this.lo <<= bits;
        this.hi = (this.hi << bits) | toMoveUp;
    }
    return this; //for chaining..
};
//Shifts this word by the given number of bits to the right (max 32)..
u64.prototype.shiftRight = function(bits) {
    bits = bits % 64;
    var c = new u64(0, 0);
    if (bits === 0) {
        return this.clone();
    }
    else if (bits >= 32) {
        c.hi = 0;
        c.lo = this.hi >>> (bits - 32);
    }
    else {
        var bitsOff32 = 32 - bits,
            toMoveDown = this.hi << bitsOff32 >>> bitsOff32;
        c.hi = this.hi >>> bits;
        c.lo = this.lo >>> bits | (toMoveDown << bitsOff32);
    }
    return c; //for chaining..
};
//Rotates the bits of this word round to the left (max 32)..
u64.prototype.rotateLeft = function(bits) {
    if (bits > 32) {
        return this.rotateRight(64 - bits);
    }
    var c = new u64(0, 0);
    if (bits === 0) {
        c.lo = this.lo >>> 0;
        c.hi = this.hi >>> 0;
    }
    else if (bits === 32) { //just switch high and low over in this case..
        c.lo = this.hi;
        c.hi = this.lo;
    }
    else {
        c.lo = (this.lo << bits) | (this.hi >>> (32 - bits));
        c.hi = (this.hi << bits) | (this.lo >>> (32 - bits));
    }
    return c; //for chaining..
};

u64.prototype.setRotateLeft = function(bits) {
    if (bits > 32) {
        return this.setRotateRight(64 - bits);
    }
    var newHigh;
    if (bits === 0) {
        return this;
    }
    else if (bits === 32) { //just switch high and low over in this case..
        newHigh = this.lo;
        this.lo = this.hi;
        this.hi = newHigh;
    }
    else {
        newHigh = (this.hi << bits) | (this.lo >>> (32 - bits));
        this.lo = (this.lo << bits) | (this.hi >>> (32 - bits));
        this.hi = newHigh;
    }
    return this; //for chaining..
};
//Rotates the bits of this word round to the right (max 32)..
u64.prototype.rotateRight = function(bits) {
    if (bits > 32) {
        return this.rotateLeft(64 - bits);
    }
    var c = new u64(0, 0);
    if (bits === 0) {
        c.lo = this.lo >>> 0;
        c.hi = this.hi >>> 0;
    }
    else if (bits === 32) { //just switch high and low over in this case..
        c.lo = this.hi;
        c.hi = this.lo;
    }
    else {
        c.lo = (this.hi << (32 - bits)) | (this.lo >>> bits);
        c.hi = (this.lo << (32 - bits)) | (this.hi >>> bits);
    }
    return c; //for chaining..
};
u64.prototype.setFlip = function() {
    var newHigh;
    newHigh = this.lo;
    this.lo = this.hi;
    this.hi = newHigh;
    return this;
};
//Rotates the bits of this word round to the right (max 32)..
u64.prototype.setRotateRight = function(bits) {
    if (bits > 32) {
        return this.setRotateLeft(64 - bits);
    }

    if (bits === 0) {
        return this;
    }
    else if (bits === 32) { //just switch high and low over in this case..
        var newHigh;
        newHigh = this.lo;
        this.lo = this.hi;
        this.hi = newHigh;
    }
    else {
        newHigh = (this.lo << (32 - bits)) | (this.hi >>> bits);
        this.lo = (this.hi << (32 - bits)) | (this.lo >>> bits);
        this.hi = newHigh;
    }
    return this; //for chaining..
};
//Xors this word with the given other..
u64.prototype.xor = function(oWord) {
    var c = new u64(0, 0);
    c.hi = this.hi ^ oWord.hi;
    c.lo = this.lo ^ oWord.lo;
    return c; //for chaining..
};
//Xors this word with the given other..
u64.prototype.setxorOne = function(oWord) {
    this.hi ^= oWord.hi;
    this.lo ^= oWord.lo;
    return this; //for chaining..
};
//Ands this word with the given other..
u64.prototype.and = function(oWord) {
    var c = new u64(0, 0);
    c.hi = this.hi & oWord.hi;
    c.lo = this.lo & oWord.lo;
    return c; //for chaining..
};

//Creates a deep copy of this Word..
u64.prototype.clone = function() {
    return new u64(this.hi, this.lo);
};

u64.prototype.setxor64 = function() {
    var a = arguments;
    var i = a.length;
    while (i--) {
        this.hi ^= a[i].hi;
        this.lo ^= a[i].lo;
    }
    return this;
};

op.u64 = u64;

op.u = function(h, l) {
    return new u64(h, l);
};
/*
op.add64 = function(a, b) {
  var lowest, lowMid, highMid, highest; //four parts of the whole 64 bit number..

  //need to add the respective parts from each number and the carry if on is present..
  lowest = (a.lo & 0XFFFF) + (b.lo & 0XFFFF);
  lowMid = (a.lo >>> 16) + (b.lo >>> 16) + (lowest >>> 16);
  highMid = (a.hi & 0XFFFF) + (b.hi & 0XFFFF) + (lowMid >>> 16);
  highest = (a.hi >>> 16) + (b.hi >>> 16) + (highMid >>> 16);

  var r = new this.u64((highest << 16) | (highMid & 0XFFFF), (lowMid << 16) | (lowest & 0XFFFF));

  return r;
};
*/



op.xor64 = function() {
    var a = arguments,
        h = a[0].hi,
        l = a[0].lo;
    var i = a.length-1;
    do {
        h ^= a[i].hi;
        l ^= a[i].lo;
        i--;
    } while (i>0);
    return new this.u64(h, l);
};

op.clone64Array = function(array) {
    var i = 0;
    var len = array.length;
    var a = new Array(len);
    while (i<len) {
        a[i] = array[i];
        i++;
    }
    return a;
};

//this shouldn't be a problem, but who knows in the future javascript might support 64bits
op.t32 = function(x) {
    return (x & 0xFFFFFFFF);
};

op.rotl32 = function(x, c) {
    return (((x) << (c)) | ((x) >>> (32 - (c)))) & (0xFFFFFFFF);
};

op.rotr32 = function(x, c) {
    return this.rotl32(x, (32 - (c)));
};

op.swap32 = function(val) {
    return ((val & 0xFF) << 24) |
    ((val & 0xFF00) << 8) |
    ((val >>> 8) & 0xFF00) |
    ((val >>> 24) & 0xFF);
};

op.swap32Array = function(a) {
    //can't do this with map because of support for IE8 (Don't hate me plz).
    var i = 0, len = a.length;
    var r = new Array(i);
    while (i<len) {
        r[i] = (this.swap32(a[i]));
        i++;
    }
    return r;
};

op.xnd64 = function(x, y, z) {
    return new this.u64(x.hi ^ ((~y.hi) & z.hi), x.lo ^ ((~y.lo) & z.lo));
};
/*
op.load64 = function(x, i) {
  var l = x[i] | (x[i + 1] << 8) | (x[i + 2] << 16) | (x[i + 3] << 24);
  var h = x[i + 4] | (x[i + 5] << 8) | (x[i + 6] << 16) | (x[i + 7] << 24);
  return new this.u64(h, l);
}
*/
op.bufferInsert = function(buffer, bufferOffset, data, len, dataOffset) {
    dataOffset = dataOffset | 0;
    var i = 0;
    while (i < len) {
        buffer[i + bufferOffset] = data[i + dataOffset];
        i++;
    }
};

op.bufferInsert64 = function(buffer, bufferOffset, data, len) {
    var i = 0;
    while (i < len) {
        buffer[i + bufferOffset] = data[i].clone();
        i++;
    }
};

op.buffer2Insert = function(buffer, bufferOffset, bufferOffset2, data, len, len2) {
    while (len--) {
        var j = len2;
        while (j--) {
            buffer[len + bufferOffset][j + bufferOffset2] = data[len][j];
        }
    }
};

op.bufferInsertBackwards = function(buffer, bufferOffset, data, len) {
    var i = 0;
    while (i < len) {
        buffer[i + bufferOffset] = data[len - 1 - i];
        i++;
    }
};

op.bufferSet = function(buffer, bufferOffset, value, len) {
    var i = 0;
    while (i < len) {
        buffer[i + bufferOffset] = value;
        i++;
    }
};

op.bufferXORInsert = function(buffer, bufferOffset, data, dataOffset, len) {
    var i = 0;
    while (i < len) {
        buffer[i + bufferOffset] ^= data[i + dataOffset];
        i++;
    }
};

op.xORTable = function(d, s1, s2, len) {
    var i = 0;
    while (i < len) {
        d[i] = s1[i] ^ s2[i];
        i++;
    }
};
