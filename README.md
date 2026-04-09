# Yet Another Nes Emulator

## Journal of concepts and architectural try-outs

### 20250816
[Christening the overarching project as] "nIDEran the SNES GB studio"

### 20260223
Bookmarks saved for reference:
* [6502 - Ultimate Commodore 64 Reference](
      https://www.pagetable.com/c64ref/6502/)
* [Top (GNU C Language Manual)](
    https://www.gnu.org/software/c-intro-and-ref/manual/html_node/index.html)
* [Top (The C Preprocessor)](https://gcc.gnu.org/onlinedocs/cpp/index.html)
* [Gregoire Pro C++](https://read.amazon.com/?asin=B08XM881GZ)
* [Blazing Trails- Building the World's Fastest GameBoy Emulator in Modern
    C++- Tom Tesch CppCon 2024 - YouTube](
        https://www.youtube.com/watch?v=4lliFwe5_yg&t=2142s)
* [The Ultimate Game Boy Talk (33c3) - YouTube](
    https://www.youtube.com/watch?v=HyzD8pNlpwI)
* [Simple DirectMedia Layer - Homepage](https://www.libsdl.org/)
* [WebAssembly - MDN](https://developer.mozilla.org/en-US/docs/WebAssembly)
* [I want to… - WebAssembly](
    https://webassembly.org/getting-started/developers-guide/)
* [Executing JavaScript and WebAssembly - Web Apps - Android Developers](
    https://developer.android.com/develop/ui/views/layout/webapps/jsengine)
* is it possible to share data between 2 android phones over usb c to micro
    usb - Google Search
* is it possible to write an android app to transfer data from one android
    phone to another over usb - Google Search
* [USB accessory overview - Connectivity - Android Developers](
    https://developer.android.com/develop/connectivity/usb/accessory)




### 20260228 `NES.c`
* Refresher on C lib stdint.h 
  * Discovered IBM i docs on [stdint.h](https://www.ibm.com/docs/en/i/7.6.0?topic=files-stdinth).
* Representing all CPU regs w/in one variable, `uint64_t regs`.
  * Specif., `regs` is a degree 8 polynomial base 256 w/ CPU registers as coefficients.
    * degree * base = 8 bytes = 64 bit int since max value of a byte is 256 - 1.
  * The coeffient of 256<sup>7</sup> is always 0--there's only 7 registers to cover.
  * Coefficient 256<sup>6</sup> is PCH,
  * coeff of 256<sup>5</sup> is PCL,
  * coeff of 256<sup>4</sup> is S,
  * coeff of 256<sup>3</sup> is Y, 
  * coeff of 256<sup>2</sup> is X, 
  * coeff of 256 is P,
  * and the polynomial constant (coeff of 256<sup>0</sup> = 1) is A.
  * Only easy value to extract is A, the lowest byte, by `regs % 256`.
* Declared `uint8_t *mem` to point into system work RAM
* Declared single variables to hold the values that can be received or sent on the system bus, based on [Diskin's](https://www.nesdev.org/NESDoc.pdf) definitions of bus.
  * `uint16_t addr_bus`
  * `uint8_t ctrl_bus`
  * `uint8_t data_bus`
* Declared a `void`-returning function for each addressing mode of `ADC`.
  * Void because each function was intended to modify either `regs` or  `mem` via pointers.
    * However either forgot or didn't make time to list the pointer params necessary for such functions to modify `regs` or `mem`.
     * Only param defined was either a `uint16_t` or `uint8_t` per addressing mode operand size.
  * NEVER got around to defining ANY of these operation functions.
* Declared getters for A, P, Carry of P, X, Y, S, and PC.
* Only setter declared was for Carry of P.
* Defined an `int main()`
  * Main allocated 65536 bytes for entire address space,
  * and next statements immediately freed allocation and returned 0.
  * Of course I was not ready to immediately write all the emulation-running statements.
* Only getters got around to defining were for A, P, and Carry.
* Did attempt to define the Carry setter but the formula is incorrect.
* The all-cpu-regs-in-poly implementation makes for unnec. complicated math to access P, X, Y, S, and PC.
  * Def'd series of 5 constants, `BYTE1` through `BYTE5`, equal to powers 256 through 256<sup>5</sup>, resp., to get and set P, X, Y, S, PC, resp.
  * Only got as far as writing `uint8_t`-returning functions to get A by `regs % 256` and get P by `regs / BYTE1 % BYTE1`.
  * Other getters would have required `regs / BYTE<#> % BYTE<#>`.
  * Only got as far as defining one 64-bit AND mask, \
    `#define MASK1 = 0xfffffffffffffeff`, which is only good for reset of Carry bit of P.
    * Many more masks were needed of course.
  * Attempted to write a setter of Carry bit of P which decides by ternary on regular int 1-or-0 param to set or reset Carry bit.
    * For setting the Carry, the formula was `regs | BYTE1`.
    * For resetting the Carry `regs & MASK1`
    * As for the setters I didn't get around to;
      * for the other P bits, would have been `regs | (BYTE1 * value)`, and
      * for setting X, Y, S, and PC, would have been `regs | (BYTE<#> * value)`.
    * ALL THESE OR FORMULA SETTERS would have mistakenly SUMMED existing register value and desired register value up to the max 1-byte value of 255.
  * So this is all UNNECESSARILY COMPLICATED when you could just have individual `uint8_t` values for each registers and just use `return` to get them and assignment to set them.
* Distracted away from C attempt by curiosity of how much I could do the JavaScript equivalent.

### 20260228 `NES.js`
* Bus values same as `NES.c` but also wrapped in obj lit
* Memory is 65536-byte ArrayBuffer
* Started out w/ polynomial-encoded register values in a `bigint` but changed mind.
* Each CPU register is an individual JS regular `number` wrapped in object literal `regs`
  * Bitwise `|` with a power of 2 in this case properly sets single bits.
  * Defined 2 of the simplest instructions, `SEI` and `CLI`
* Like `NES.c` it's going to be 1:1 opcodes:functions
  * Every addressing mode of an instruction gets its own function
  * This time defining instruction of a given addressing mode in order of increasing opcode
    * So wrote out do-nothing arrow functions as placeholders for `BRK`, `ORA (zp,X)`,
    * but then skipped ahead and wrote another placeholder for `ORA abs`,
    * and skipped again to fully define `SEI`, `CLI` and `ADC #` which directly modify members of `regs` by assignment of expression result.
* `SEI` was implemented as `regs.p = regs.p | 0b00000100`.
* `CLI` was implemented as `regs.p = regs.p & 0b11111011`. 
    * The constant ANDed is just 255 - 4, where 4 is the constant OR'd for SEI.
* Function for `ADC` got the addition done in the first statement `sum = regs.p + param + regs.p % 2` with the last term being the extraction of carry from P.
  * First after doing the actual sum, we test for sum > 255 and if true we set carry with `regs.p | 1` else `regs.p & 0xfe` where 0xfe is just 255 - 1.
  * Next the V flag is set with `regs.p | 0x40` if accumulator and sum are not the same sign, bit 7, as tested by `& 0x80`, else reset by AND with `0xbf = 255 - 64`.
  * Third, set accumulator to `sum % 0x100` in case the sum is over 255.
  * Fourth, test accumulator sign with AND 0x80 and if that bit 7 is on also turn it on in P with OR 0x80 else P AND 0b01111111 which is 0x7f=127
  * Finally we take care of the Z flag. To see if result was zero I used `sum % 0x100 == 0` even though I could have just used `regs.a == 0`.
    * I guess just being ocd that the accumulator wasn't clobbered b/c there's nothing should have clobbered it?
    * To change zero flag part of P, OR 2 to set it and AND 0b11111101 to reset.
* There's no returns in any of these instruction functions because all that's needed is assignment to a member of `regs` object.
* Last progress for this attempt was to start an array `ops` holding references to `BRK` and `ORA (zp,X)` functions, in that order as 1st 2 elements, for proper opcode order.
  * For now first `BRK` then `ORA (zp,X)` and then a couple placeholder nulls in `ops`.
  * The idea is that we can go straight from opcode byte value to instruction execution via `ops[opcode(memvalue)]`.

### 20260409 `NES.js`
* Completely shift gears to try to model RP2A03 bus action instead of mere assignment of register and memory vars
* I've been looking at W65C02S data sheet and trying to model the bus connections
* Noble OOP effort but not well-designed
  * Address bus object has a value property 'v' and an "a0a15" property for holding pinout values from CPU
    * Drive method sets "a0a15" pinout prop to the "v" value property
    * Methods to represent address bus ability to drive PCL, PCH, and ALU (inaccurate emulation?)
      * but the objects for those components aren't set with address bus's value property but whatever param is passed to method
    * Getters for each address bus CPU pinout bit, using bitwise-ANDing "a0a15" with power of 2 as ternary to pick 1 or 0
    * No pinout setters
  * ALU obj lit has a value property but its methods set value props of addressbus, databus, and accumulator to whatever param is passed to the setter not the ALU.v value prop
    * This ALU obj does not set the a0a15 pinout rather directly sets addressbus value prop
      * So ALU a0a15 pinout holder is defined but never used
  * Data bus object has a value prop 'v'
    * Its setters take the param and assign it to the value property of 
      * all CPU registers objects plus objects representing
        * the ALU, 
        * input data latch, and 
        * data bus buf
  * Accumulator object has 'v' value propery and ability to drive ALU and data bus with its value
  * Program Counter has hi and lo byte value properties
    * Its getter linear combos hi and lo into 16-bit value
    * It can set the address and data bus with any param passed to the setter
  * I created a generic register object with a value property named 'v' and a method to set each the address and data bus with whatever param is passed
    * The X, Y, S, and input data latch objects are all instantiated by Object.create on this generic register
  * Data bus buffer object has value property named 'v', also a property to represent what's on the D0-D7 pins
    * Its "drive" method puts the 'v' value into 'd0d7' pin prop
    * a method to set data bus with whatever param is passed
    * a getter for each D0-D7 pin using AND power of 2 ternary to 1:0
  * The Processor status object starts off with a value prop 'v'
    * Has a getter for each flag, AND power of 2 ternary to 1,0
      * except Bit 5 always returns 1
    * I wanted setters just like all the rest that take in a param and there's one for all except of course Bit 5
      * the param intended to be either 0 or 1 decides a ternary between ORing or AND*NOTing P's 'v' with a power of 2 then set that result to P's 'v'
        * The AND * NOT power of 2 formula is something I googled and AI Overview suggested it as a way to zero only a single bit because merely AND power of 2 would clobber all other bits and only reset the desired bit if it was already reset. 
  * Stopped the just-getting-started emulation attempt by defining a bunch of empty objects each to represent a component I'm mostly just getting introduced to on [NESDev](https://nesdev.org) or in the WDC data sheet
    * phi2ClockInput
    * controllerPort
      * from which controller1 and controller2 are made by Object.create
    * rwbSignal
    * nmiInput
    * irqInput
    * resInput
    * rdyM2Input (thinking Ricoh's M2 and WDC's RDY are equivalent)
    * audioOutPin
      * from which audio1pulse and audio2trinz are made by Object.create