module charlieplex (
	input aclr,
	input clock,
	inout [8:0] brow,
	inout [8:0] trow,
	output [7:0] sample_row,
	input [143:0] led_state);

// the featherlite charlieplexed led matrix is split into two matrices of 9 pins. 
// this code strobes over the 9 rows of each matrix, checking for the output when each row is set high.
reg [30:0] counter;
// brow = bottom row, trow = top row.
reg [8:0] brow_internal;
// the intermediate arrays are needed to store the floating states.
// if intermediate_1 != intermediate_2, then the bit is floating
reg [8:0] brow_intermediate_1;
reg [8:0] brow_intermediate_2;
reg [8:0] trow_internal;
reg [8:0] trow_intermediate_1;
reg [8:0] trow_intermediate_2;

// the row
reg [3:0] j;
// the column
reg [3:0] i;
// the position in trow or brow
reg [3:0] k;
// the flags are the values read from the led_state at location i, j for the top and
// bottom matrices
reg flag1;
reg flag2;

// the led state index
reg [7:0] led_state_index;
reg [3:0] compare_row;
reg flush;

assign sample_row = led_state[7:0];
assign brow = brow_internal;
assign trow = trow_internal;

always @(posedge flush)
    // upon copying the values to the temporary registers, handle moving on to the
    // next matrix location
    begin
        i = i + 1;
        if(i == 8) j = j + 1;
        if(i == 8) i = 0;
        if(j == 9) j = 0;
        if (i <j)
            compare_row = i;
        else
            compare_row = i + 1;
    end


always @(posedge counter[0])
    if(k < 9)
        begin
            flush = 0;
            led_state_index = i*9 + j;
            flag1 = led_state[led_state_index];
            flag2 = led_state[led_state_index + 72];
            // since begin/end statements cannot be nested, a conditional
            // statement is required for both trow_intermediates
            if(k==j)
                trow_intermediate_1[k] = 1'b0;
            else if((k == compare_row && flag1) ||
            (trow_intermediate_1[k] && trow_intermediate_2[k]))
                trow_intermediate_1[k] = 1'b1;
            else
                trow_intermediate_1[k] = 1'b0;

            if(k==j)
                trow_intermediate_2[k] = 1'b0;
            else if((k == compare_row && flag1) ||
            (trow_intermediate_1[k] && trow_intermediate_2[k]))
                trow_intermediate_2[k] = 1'b1;
            else
                trow_intermediate_2[k] = 1'b1;

            if(k==j)
                brow_intermediate_1[k] = 1'b0;
            else if((k == compare_row && flag2) ||
            (brow_intermediate_1[k] && brow_intermediate_2[k]))
                brow_intermediate_1[k] = 1'b1;
            else
                brow_intermediate_1[k] = 1'b0;

            if(k==j)
                brow_intermediate_2[k] = 1'b0;
            else if((k == compare_row && flag2) ||
            (brow_intermediate_1[k] && brow_intermediate_2[k]))
                brow_intermediate_2[k] = 1'b1;
            else
                brow_intermediate_2[k] = 1'b1;

            k = k+1;

        end
    else if (k == 9 && i==7)
        begin
            // z values can't be copied, hence this mess
            if(trow_intermediate_1[0] == trow_intermediate_2[0])
                trow_internal[0] = trow_intermediate_1[0];
            else
                trow_internal[0] = 1'bz;

            if(trow_intermediate_1[1] == trow_intermediate_2[1])
                trow_internal[1] = trow_intermediate_1[1];
            else
                trow_internal[1] = 1'bz;

            if(trow_intermediate_1[2] == trow_intermediate_2[2])
                trow_internal[2] = trow_intermediate_1[2];
            else
                trow_internal[2] = 1'bz;

            if(trow_intermediate_1[3] == trow_intermediate_2[3])
                trow_internal[3] = trow_intermediate_1[3];
            else
                trow_internal[3] = 1'bz;

            if(trow_intermediate_1[4] == trow_intermediate_2[4])
                trow_internal[4] = trow_intermediate_1[4];
            else
                trow_internal[4] = 1'bz;

            if(trow_intermediate_1[5] == trow_intermediate_2[5])
                trow_internal[5] = trow_intermediate_1[5];
            else
                trow_internal[5] = 1'bz;

            if(trow_intermediate_1[6] == trow_intermediate_2[6])
                trow_internal[6] = trow_intermediate_1[6];
            else
                trow_internal[6] = 1'bz;

            if(trow_intermediate_1[7] == trow_intermediate_2[7])
                trow_internal[7] = trow_intermediate_1[7];
            else
                trow_internal[7] = 1'bz;

            if(trow_intermediate_1[8] == trow_intermediate_2[8])
                trow_internal[8] = trow_intermediate_1[8];
            else
                trow_internal[8] = 1'bz;

            if(brow_intermediate_1[0] == brow_intermediate_2[0])
                brow_internal[0] = brow_intermediate_1[0];
            else
                brow_internal[0] = 1'bz;

            if(brow_intermediate_1[1] == brow_intermediate_2[1])
                brow_internal[1] = brow_intermediate_1[1];
            else
                brow_internal[1] = 1'bz;

            if(brow_intermediate_1[2] == brow_intermediate_2[2])
                brow_internal[2] = brow_intermediate_1[2];
            else
                brow_internal[2] = 1'bz;

            if(brow_intermediate_1[3] == brow_intermediate_2[3])
                brow_internal[3] = brow_intermediate_1[3];
            else
                brow_internal[3] = 1'bz;

            if(brow_intermediate_1[4] == brow_intermediate_2[4])
                brow_internal[4] = brow_intermediate_1[4];
            else
                brow_internal[4] = 1'bz;

            if(brow_intermediate_1[5] == brow_intermediate_2[5])
                brow_internal[5] = brow_intermediate_1[5];
            else
                brow_internal[5] = 1'bz;

            if(brow_intermediate_1[6] == brow_intermediate_2[6])
                brow_internal[6] = brow_intermediate_1[6];
            else
                brow_internal[6] = 1'bz;

            if(brow_intermediate_1[7] == brow_intermediate_2[7])
                brow_internal[7] = brow_intermediate_1[7];
            else
                brow_internal[7] = 1'bz;

            if(brow_intermediate_1[8] == brow_intermediate_2[8])
                brow_internal[8] = brow_intermediate_1[8];
            else
                brow_internal[8] = 1'bz;
            // the default state is all z, then 1 states get added
            brow_intermediate_1 = 9'b111111111;
            brow_intermediate_2 = 9'b000000000;
            trow_intermediate_1 = 9'b111111111;
            trow_intermediate_2 = 9'b000000000;

            k = k + 1;
        end
    else if(k ==9 && i!=7)
        begin
            k = k + 1;
        end
    else if(k == 10)
        begin
            flush = 1;
            k = 0;
        end


always @(posedge clock)
    if(aclr)
        begin
            counter = 0;
        end
    else
        begin
            counter = counter + 1;
        end
	
	
endmodule
