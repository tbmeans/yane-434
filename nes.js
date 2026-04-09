// nes.js

'use strict';


/* MODELING THE RICOH 2A03 VARIANT OF THE WDC 6502 */

const div = (dividend, divisor) => (dividend - dividend % divisor) / divisor;

const addressBus = {
    v: 0,
    a0a15: 0,
    drive() {
        this.a0a15 = this.v;
    },
    setALU(v) {
        alu.v = v;
    },
    setPCL(lo) {
        pc.lo = lo;
    },
    setPCH(hi) {
        pc.hi = hi;
    },
    getA0() {
        return this.a0a15 & 1;
    },
    getA1() {
        return this.a0a15 & 2 ? 1 : 0;
    },
    getA2() {
        return this.a0a15 & 4 ? 1 : 0;
    },
    getA3() {
        return this.a0a15 & 8 ? 1 : 0;
    },
    getA4() {
        return this.a0a15 & 16 ? 1 : 0;
    },
    getA5() {
        return this.a0a15 & 32 ? 1 : 0;
    },
    getA6() {
        return this.a0a15 & 64 ? 1 : 0;
    },
    getA7() {
        return this.a0a15 & 128 ? 1 : 0;
    },
    getA8() {
        return this.a0a15 & 256 ? 1 : 0;
    },
    getA9() {
        return this.a0a15 & 512 ? 1 : 0;
    },
    getA10() {
        return this.a0a15 & 1024 ? 1 : 0;
    },
    getA11() {
        return this.a0a15 & 2048 ? 1 : 0;
    },
    getA12() {
        return this.a0a15 & 4096 ? 1 : 0;
    },
    getA13() {
        return this.a0a15 & 8192 ? 1 : 0;
    },
    getA14() {
        return this.a0a15 & 16384 ? 1 : 0;
    },
    getA15() {
        return this.a0a15 & 32768 ? 1 : 0;
    },
};

const alu = {
    v: 0,
    setAddr(v) {
        addressBus.v = v;
    },
    setData(v) {
        dataBus.v = v;
    },
    setA(v) {
        a.v = v;
    },
};

const dataBus = {
    v: 0,
    setALU(v) {
        alu.v = v;
    },
    setX(v) {
        x.v = v;
    },
    setY(v) {
        y.v = v;
    },
    setS(v) {
        s.v = v;
    },
    setA(v) {
        a.v = v;
    },
    setPCL(lo) {
        pc.lo = lo;
    },
    setPCH(hi) {
        pc.hi = hi;
    },
    setDL(v) {
        inputDataLatch.v = v;
    },
    setDataBusBuff(v) {
        dataBusBuffer.v = v;
    },
};

const a = {
    v: 0,
    setALU(v) {
        alu.v = v;
    },
    setData(v) {
        dataBus.v = v;
    },
};

const pc = {
    lo: 0,
    hi: 0,
    getValue() {
        return this.hi * 0x100 + this.lo;
    },
    setAddr(v) {
        addressBus.v = v;
    },
    setData(v) {
        dataBus.v = v;
    },
};

const register = {
    v: 0,
    setAddr(v) {
        addressBus.v = v;
    },
    setData(v) {
        dataBus.v = v;
    },
};

const x = Object.create(register);

const y = Object.create(register);

const s = Object.create(register);

const inputDataLatch = Object.create(register);

const dataBusBuffer = {
    v: 0,
    d0d7: 0,
    drive() {
        this.d0d7 = this.v;
    },
    setData(v) {
        dataBus.v = v;
    },
    getD0() {
        return this.d0d7 & 1;
    },
    getD1() {
        return this.d0d7 & 2 ? 1 : 0;
    },
    getD2() {
        return this.d0d7 & 4 ? 1 : 0;
    },
    getD3() {
        return this.d0d7 & 8 ? 1 : 0;
    },
    getD4() {
        return this.d0d7 & 16 ? 1 : 0;
    },
    getD5() {
        return this.d0d7 & 32 ? 1 : 0;
    },
    getD6() {
        return this.d0d7 & 64 ? 1 : 0;
    },
    getD7() {
        return this.d0d7 & 128 ? 1 : 0;
    },
};

const p = {
    v: 0,
    getC() {
        return this.v & 1;
    },
    getZ() {
        return this.v & 2 ? 1 : 0;
    },
    getI() {
        return this.v & 4 ? 1 : 0;
    },
    getD() {
        return this.v & 8 ? 1 : 0;
    },
    getB() {
        return this.v & 16 ? 1 : 0;
    },
    getBit5() {
        return 1;
    },
    getV() {
        return this.v & 64 ? 1 : 0;
    },
    getN() {
        return this.v & 128 ? 1 : 0;
    },
    setC(b) {
        this.v = b ? (this.v | 1) : (this.v & ~ 1);
    },
    setZ(b) {
        this.v = b ? (this.v | 2) : (this.v & ~ 2);
    },
    setI(b) {
        this.v = b ? (this.v | 4) : (this.v & ~ 4);
    },
    setD(b) {
        this.v = b ? (this.v | 8) : (this.v & ~ 8);
    },
    setB(b) {
        this.v = b ? (this.v | 16) : (this.v & ~ 16);
    },
    setV(b) {
        this.v = b ? (this.v | 64) : (this.v & ~ 64);
    },
    setN(b) {
        this.v = b ? (this.v | 128) : (this.v & ~ 128);
    },
};

// begin 8-bit control bus pins

const phi2ClockInput = {};

const controllerPort = {};

const controller1 = Object.create(controllerPort);

const controller2 = Object.create(controllerPort);

const rwbSignal = {};

const nmiInput = {};

const irqInput = {};

const resInput = {};

const rdyM2Input = {};

// end 8-bit control bus pins

const audioOutPin = {};

const audio1pulse = Object.create(audioOutPin);

const audio2trinz = Object.create(audioOutPin);