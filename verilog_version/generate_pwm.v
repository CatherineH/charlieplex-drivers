module generate_pwm (
	input aclr,
	input clock,
	output [143:0] led_state);

// the featherlite charlieplexed led matrix is split into two matrices of 9 pins. 
// this code strobes over the 9 rows of each matrix, checking for the output when each row is set high.
reg [10:0] counter;
reg [7:0] compare_counter;
reg [7:0] pixel;
reg [7:0] led_state_index;
reg [3:0] pixel_index;
reg compare_trigger;
reg [1152:0] hex_image;
reg [143:0] led_state_internal;
assign led_state = led_state_internal;
always @(posedge compare_trigger)
    begin
        compare_counter = counter[10:3];
        if(pixel >= compare_counter) led_state_internal[led_state_index] = 1;
        else led_state_internal[led_state_index] = 0;
        led_state_index = led_state_index + 1;
    end


always @(posedge clock)
    if(pixel_index<8)
        // while the pixel index is under 7, copy the correct address in the hex image
        // into the temporary register for that pixel
        begin
            hex_image =
            1152'hfff6fffffdfefffffffefffffcfff6fffffffffffbfffffffdfffe000400010500000200106a1e0108060a020020ffc7a6ababaa57030863fff6cef5e9ea39000ebfbb04acaa672c0102c2c100aeac0300021dccc300accc1900006bff78037af56f01022e5b0d001b5b2e00000402030000020000fffafbfffffdfffffffafffcfffdfffbfafffefffbfffffaffffff;

            compare_trigger = 0;
            pixel_index = pixel_index + 1;
            pixel[pixel_index] = hex_image[led_state_index*8+pixel_index];
        end
    else
        begin
            // increase the time counter, which is used to determine the width (in
            // time) of the signal at position led_state_index
            counter = counter + 1;
            // trigger the comparison and copying to led_state_internal
            compare_trigger = 1;
            pixel_index = 0;
        end

endmodule
