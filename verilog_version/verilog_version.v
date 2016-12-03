module verilog_version
(
// {ALTERA_ARGS_BEGIN} DO NOT REMOVE THIS LINE!
	input CLK_50,
	output [7:0]LED,
	// buttons
	input RESET_BUTTON,
	input TOGGLE_BUTTON,
	// charlieplex pins
	inout [8:0] TROW,
	inout [8:0] BROW
// {ALTERA_ARGS_END} DO NOT REMOVE THIS LINE!

);

// {ALTERA_IO_BEGIN} DO NOT REMOVE THIS LINE!

// {ALTERA_IO_END} DO NOT REMOVE THIS LINE!
// the system clock
wire sys_clock;
wire [7:0] sample_row;
wire reset;
wire [143:0] led_state;
assign LED = sample_row;
assign reset = ~RESET_BUTTON;
// {ALTERA_MODULE_BEGIN} DO NOT REMOVE THIS LINE!
charlieplex_driver_altpll pll(.areset(reset),	.inclk0(CLK_50), .c0(sys_clock),
	.locked());
	
charlieplex cp(.aclr(reset), .clock(sys_clock), .brow(BROW), .trow(TROW), .sample_row
(sample_row), .led_state(led_state));
//game_of_life gol(.aclr(reset), .clock(sys_clock), .state(led_state));
generate_pwm gp(.aclr(reset), .clock(sys_clock), .led_state(led_state));

// {ALTERA_MODULE_END} DO NOT REMOVE THIS LINE!
endmodule
