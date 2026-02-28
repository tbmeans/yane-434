// nes.js

'use strict';

const regs = {
  p: 0,
  a: 0,
  x: 0,
  y: 0,
  s: 0,
  pc: 0xffff
};

const mem = new DataView( new ArrayBuffer(0x10000) );

const bus = {
  address: 0,
  control: 0,
  data: 0
};

const brk = () => {};

const ora_xzi = () => {};

const ora_abs = () => {};

const sei = () => {
  regs.p = regs.p | 0b00000100;
};

const cli = () => {
  regs.p = regs.p & 0b11111011;
};

const adc_imm = (memval) => {
  const sum = regs.a + memval + regs.p % 2;
  regs.p = sum > 0xff ? (regs.p | 1) : (regs.p & 0xfe);
  regs.p = regs.a & 0x80 != sum & 0x80 ? (regs.p | 0x40) : (regs.p & 0xbf);
  regs.a = sum % 0x100;
  regs.p = regs.a & 0x80 ? (regs.p | 0x80) : (regs.p & 0b01111111);
  regs.p = sum % 0x100 == 0 ? (regs.p | 2) : (regs.p & 0b11111101);
};

const ops = [
  brk, ora_xzi, null, null, null, 
];