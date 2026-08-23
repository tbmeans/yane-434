# Yet Another Nes Emulator

## Journal of architectural try-outs

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
* Last progress for this attempt was to start an array `ops` holding references to `BRK` and `ORA (zp,X)` functions, in that order as 1st 2 elements, for proper opcode order.
  * For now first `BRK` then `ORA (zp,X)` and then a couple placeholder nulls in `ops`.
  * The idea is that we can go straight from opcode byte value to instruction execution via `ops[opcode(memvalue)]`.

