module game_of_life(
	input aclr,
	input clock,
	output [143:0] state
);

reg [143:0] ws; //working state
reg [143:0] os; //output state
reg [7:0] counter;
reg [2:0] alive_neighbors;

assign state = os;

always @(posedge clock)
	if (aclr)
		begin
			counter = 0;
			// start a glider at the top left corner
			ws = (143'b1) + 143'b1 << 18 + 143'b1 << 19 + 143'b1 << 32 + 143'b1 << 33; 
		end
	else
		begin
			alive_neighbors = 0;
			if(counter == 143)
				counter = 0;
			alive_neighbors =   (143'b1 << 8 + counter) & ws + (143'b1 << 9 + counter) & ws + (143'b1 << 10 + counter) & ws
									+ (143'b1 << 1 + counter) & ws                                + (143'b1 >> 1  + counter) & ws
									+ (143'b1 >> 8 + counter) & ws + (143'b1 >> 9 + counter) & ws + (143'b1 >> 10 + counter) & ws;
			if(alive_neighbors < 2 || alive_neighbors > 3)
				os[counter] = 0;
			else
				os[counter] = 1;
			counter = counter + 1;
			
		end

endmodule