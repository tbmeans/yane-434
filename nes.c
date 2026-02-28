/* nes.c */
#include <stdio.h>
#include <stdint.h>
#include <stddef.h>
#include <stdlib.h>

#define BYTE1 0x100
#define BYTE2 0x10000
#define BYTE3 0x1000000
#define BYTE4 0x100000000
#define BYTE5 0x10000000000
#define MASK1 0xfffffffffffffeff


/* 6502 CPU registers */
/*                  pc s y x p a */
uint64_t regs = 0xfffc0000000000;

/* pointer into ricoh 2a03 system memory */
uint8_t *mem;

/* 2A03 buses */
uint16_t addr_bus = 0;
uint8_t ctrl_bus = 0;
uint8_t data_bus = 0;

/* cpu registers' getters and some setters */
uint8_t get_a(void);
uint8_t get_p(void);
uint8_t get_carry(void);
void set_carry(int set_or_reset);
uint8_t get_x(void);
uint8_t get_y(void);
uint8_t get_s(void);
uint16_t get_pc(void);

/* MMC function */

/* allocate space for instruction address storage */

/* 6502 CPU instructions */
void adc_imm(uint8_t memval);
void adc_abs(uint16_t memval);
void adc_xab(uint16_t memval);
void adc_yab(uint16_t memval);
void adc_zpg(uint8_t memval);
void adc_xzp(uint8_t memval);
void adc_xzi(uint8_t memval);
void adc_ziy(uint8_t memval);


int main() {

	mem = malloc(0x10000);
	if (mem == NULL) {
		puts("Unable to allocate RAM for this application.");
		return 1;
	}

	/* now do ninty shit */

	free(mem);
	return 0;
}


uint8_t get_a(void) {
	return (uint8_t) (regs % BYTE1);
}

uint8_t get_p(void) {
	return (uint8_t) (regs / BYTE1 % BYTE1);
}

uint8_t get_carry(void) {
	return (uint8_t) (get_p() % 2);
}

void set_carry(int set_or_reset) {
	regs = set_or_reset ? (regs | BYTE1) : (regs & MASK1);
}