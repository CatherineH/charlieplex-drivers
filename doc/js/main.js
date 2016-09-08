function position(_drawing, i, j)
{
    if(i>=0)
    {
        var _x_pos = LED_scale*(_drawing.new_width*(_drawing.num_across-i-1)/LED_scale+_drawing.right_margin);
    }
    else{
        var _x_pos = _drawing.image_width;
    }
    if(j>=0)
    {
        var _y_pos = LED_scale*((_drawing.image_height/_drawing.num_down)*j/LED_scale+_drawing.top_margin);
    }
    else{
        var _y_pos = _drawing.top_margin*LED_scale-LED_entries[1][1]*LED_scale-LED_dimensions[1]*LED_scale/2.0;
    }
    return [_x_pos, _y_pos];
}

function generate_diode_pins(_drawing, i, j, a_offset, b_offset)
{
    var pos = position(_drawing, i, j);
    var y_pos_a = pos[1] + a_offset;
    var y_pos_b = pos[1] + b_offset;
    var x_pos_entry = pos[0] + LED_entries[0][0]*LED_scale;
    var x_pos_exit = pos[0] + LED_entries[1][0]*LED_scale;
    // "above" pin, the buffer into the diode
    var node = {x_pos:x_pos_entry, y_pos:y_pos_a, size:junction_radius,
                name:"0entrya_"+i+"_"+j, neighbors: []};
    _drawing.nodes.push(node);
    // "below" pin, directly into the diode
    var node = {x_pos:x_pos_entry, y_pos:y_pos_b, size:junction_radius,
                name:"1entryb_"+i+"_"+j, neighbors: []};
    _drawing.nodes.push(node);
    // exit pin
    var node = {x_pos: x_pos_exit, y_pos:y_pos_b, size:junction_radius,
                name:"2exit_"+i+"_"+j, neighbors: []};
    _drawing.nodes.push(node);
}

var SVG_drawing = function (num_across, num_down, image_height, image_width,
                            right_margin, bottom_margin, top_margin) {
    { // initializing defaults
        if (num_across === undefined) {
            num_across = 9;
        }
        this.num_across = num_across;

        if (num_down === undefined) {
            num_down = 8;
        }
        this.num_down = num_down;

        if (image_height === undefined) {
            image_height = 400;
        }
        this.image_height = image_height;

        if (image_width === undefined) {
            image_width = 600;
        }
        this.image_width = image_width;

        if (right_margin === undefined) {
            right_margin = 30;
        }
        this.right_margin = right_margin;

        if (bottom_margin === undefined) {
            bottom_margin = 50;
        }
        this.bottom_margin = bottom_margin;

        if (top_margin === undefined) {
            top_margin = 30;
        }
        this.top_margin = top_margin;

    }
    this.led_loaded = false;
    this.svg_init = false;

    // create a map of the nodes
    this.nodes = [];
    // node types;
    // 0 - not a diode (i.e., diag, terminals, entrya)
    // 1 - diode entry (i.e., entryb)
    // 2 - diode exit (i.e., exit)
    // connections going 2 to 1 are not allowed. Since entries have buffers,
    // only certain exits to uncorrelated entries aren't a problem.

    this.new_width = this.image_width/this.num_across;
    // generate the nodes, type by type.
    // first, entry pins
    for(var i=0; i<this.num_across; i++)
    {
        var pos = position(this, i, 0);
        var node = {x_pos:pos[0] + LED_entries[1][0]*LED_scale, y_pos:pos[1],
                    size:junction_radius, name: "0terminal_"+i,
                    neighbors: []};
        this.nodes.push(node);
    }
    // next, the diagonals
    var min_axis = _.min([this.num_across, this.num_down]);
    for(var i=0; i< min_axis; i++)
    {
        var pos = position(this, i, i);
        var y_pos = pos[1] + LED_dimensions[1]*LED_scale/4.0;
        var x_pos = pos[0] + LED_entries[1][0]*LED_scale;

        var node = {x_pos: x_pos, y_pos:y_pos, size:junction_radius,
                    name: "0diag_"+i, neighbors: []};
        this.nodes.push(node);
    }
    // next, the diode pins in the first column
    for(var j=0; j<this.num_across;j++)
    {
        var a_offset = -LED_dimensions[1]*LED_scale/4.0 + this.image_height/this.num_down;

        generate_diode_pins(this, 0, j, a_offset, a_offset);

    }
    // all other diode pins
    for(var i=1; i<this.num_across; i++)
    {
        for(var j=0; j<this.num_down; j++)
        {
            if(i>j)
            {
                var a_offset = LED_dimensions[1]*LED_scale/4.0;
            }
            else
            {
                var a_offset = -LED_dimensions[1]*LED_scale/4.0 + this.image_height/this.num_down;
            }
            var b_offset = LED_entries[1][1]*LED_scale;
            generate_diode_pins(this, i, j, a_offset, b_offset);
        }
    }
    // now, enumerate all rules
    for(var i=0;i<this.nodes.length; i++)
    {
        var _name = this.nodes[i].name;
        var column = parseInt(_name.split("_")[1]);
        var prev_column = column-1;
        var next_column = column+1;

        if(_name.split("_").length==3)
        {
            var row = parseInt(_name.split("_")[2]);
        }
        else{
            var row = -1;
        }
        
        // rule 1 - diode entry pins go to their corresponding exit pins
        if(_name.search('1entryb')>=0)
        {
            this.nodes[i].neighbors.push(_name.replace('1entryb', '2exit'));
        }
        // rule 2 - diode buffer pins to to the diode entries
        if(_name.search('0entrya')>=0)
        {
            this.nodes[i].neighbors.push(_name.replace('0entrya', '1entryb'));
        }
        // rule 3 - terminal pins > 0 go to the exit of the diode right under them
        if(_name.search("0terminal")>=0 &&  column > 0)
        {
            this.nodes[i].neighbors.push(_name.replace("0terminal", "2exit")+"_0");
        }
        // rule 4 - first terminal pin goes directly to the first diagonal pin
        if(_name.search("0terminal_0")>=0)
        {
            this.nodes[i].neighbors.push("0diag_0");
        }
        // rule 5 - diagonal pins are connected to the exit of the diode
        // directly above them and to the one directly to the left of them,
        // and to the entry of the pin directly to the right
        if(_name.search("0diag_")>=0 && column > 0)
        {
            var next_next_column = next_column+1;
            this.nodes[i].neighbors.push("2exit_"+column+"_"+prev_column);
            if(next_column<this.num_across)
            {
                this.nodes[i].neighbors.push("0entrya_"+next_column+"_"+column);
            }
            this.nodes[i].neighbors.push("0entrya_"+prev_column+"_"+prev_column);
        }
        // rule 6 - top diagonal pin is connected to the entry of the pin to the left of it
        if(_name.search("0diag_0")>=0)
        {
            this.nodes[i].neighbors.push("0entrya_1_0");
        }
        // rule 7 - diagonal pins are always connected to the exit of the diode they share a column with
        if(_name.search("0diag")>=0)
        {
            this.nodes[i].neighbors.push("2exit_"+column+"_"+column);
        }
        // rule 8 - except for the diodes right above the diagonal and on the
        // bottom row, diodes exits are alway connected to the diode below
        if(_name.search("2exit")>=0 && row < this.num_down-1 && row != column-1)
        {
            var next_row = row + 1;
            this.nodes[i].neighbors.push("2exit_"+column+"_"+next_row);
        }
        // rule 9 - except for the diodes right above the diagonal and on the
        // bottom row, diodes entries are alway connected to the diode to the right
        if(_name.search("0entrya")>=0 && column > 0  && row != column-1)
        {
            var next_row = row + 1;
            this.nodes[i].neighbors.push("0entrya_"+prev_column+"_"+row);
        }
        // rule 10 - complete the cycle - the bottom left corner diode's exit
        // is connected to the entry of the diode to the right of it
        if(_name.search("2exit_8_7")>=0)
        {
            this.nodes[i].neighbors.push("0entrya_7_7");
        }
    }

    // mirror the connections
    for(var i = 0; i<this.nodes.length; i++)
    {
        for(var j = 0; j<this.nodes.length; j++)
        {
            var ni = _.indexOf(this.nodes[j].neighbors, this.nodes[i].name);
            if(ni != -1 && !(this.nodes[i].name[0] == '2' && this.nodes[j].name[0]=='1'))
            {
                if(!_.contains(this.nodes[i].neighbors, this.nodes[j].neighbors[ni]))
                {
                    this.nodes[i].neighbors.push(this.nodes[j].name);
                }
            }
        }
    }

};
var LED_entries = [[4, 50], [103, 50]];
var LED_dimensions = [106.0, 71.0];
var LED_scale = .5;
var junction_radius = 1.5;
var depth = 0;


SVG_drawing.prototype.drawSVG = function(){
    console.log("drawing to depth: ", depth);
    var drawn_connections = [];
    var current_connections = [];
    var lit = false;
    function connect_points(i, j, current, depth_last)
    {
        console.log(i, j, depth_last);

        if(current==1)
        {
            var connections = current_connections;
            //current_connections.push(i+"_"+j);
        }
        else{
            var connections = drawn_connections;
            drawn_connections.push(i+" "+j);
        }
        //drawn_connections.push(j+"_"+i);
        // make sure the connection is only drawn once
        if(!_.contains(connections, j+"_"+i))
        {
            var x_poss = [drawing.nodes[i].x_pos, drawing.nodes[j].x_pos];
            var y_poss = [drawing.nodes[i].y_pos, drawing.nodes[j].y_pos];
            if(current==1)
            {
                var attrs = { stroke: 'green', strokeWidth: 2*LED_scale};
            }
            else
            {
                var attrs = { stroke: 'black', strokeWidth: 1*LED_scale};
            }
            var column = drawing.nodes[i].name.split("_")[1];
            // add the diode if the connections are going from a 1 to a 2
            if(drawing.nodes[i].name[0] == '1' && drawing.nodes[j].name[0] == '2')
            {
                var led_clone = drawing.led_data.clone();
                var led_translate = new Snap.Matrix();
                led_translate.scale(LED_scale);
                if(lit)
                {
                    led_clone.select("path[stroke='#000']").attr({fill: "#ffff00"});
                }

                led_translate.translate((x_poss[0])/LED_scale-LED_entries[0][0],
                                        (y_poss[0])/LED_scale-LED_entries[0][1]);
                led_clone.transform(led_translate);
                var led_scale_m = new Snap.Matrix();
                led_scale_m.scale(LED_scale);
                //led_clone.transform(led_scale_m);
                drawing.s.append(led_clone);
            }
            // if the points line up to an x/y grid, plot a single line
            if(x_poss[0] == x_poss[1] || y_poss[0] == y_poss[1])
            {
                var diff_x = depth_last*(x_poss[1]-x_poss[0])/10.0 + x_poss[0];
                var diff_y = depth_last*(y_poss[1]-y_poss[0])/10.0 + y_poss[0];
                drawing.s.line(x_poss[0], y_poss[0], diff_x, diff_y).attr(attrs);
            }
            // else, plot an L curve
            else{
                var x_distance = Math.abs(x_poss[0]-x_poss[1]);
                var y_distance = Math.abs(y_poss[0]-y_poss[1]);
                var total_distance = x_distance + y_distance;
                if(depth_last>y_distance/total_distance)
                {
                    // draw it solidly if the depth has been achieved.
                    drawing.s.line(x_poss[0], y_poss[0], x_poss[0], y_poss[1]).attr(attrs);
                }
                else{
                    var fraction = depth_last*total_distance/y_distance;
                    var depth_y_distance = fraction/10.0 + y_poss[0];
                    drawing.s.line(x_poss[0], y_poss[0], x_poss[0], depth_y_distance).attr(attrs);
                }
                if(depth_last>y_distance/total_distance)
                {
                    var fraction = (depth_last/10.0 - y_distance/total_distance)/x_distance;
                    var depth_x_distance = fraction +x_poss[0];
                    drawing.s.line(x_poss[0], y_poss[1], depth_x_distance, y_poss[1]).attr(attrs);
                }
            }
        }
     }
    function find_index(name)
    {
        for(var i=0; i<drawing.nodes.length; i++)
        {
            if(drawing.nodes[i].name == name)
            {
                return i;
            }
        }
        console.log("could not find index of: "+name);
    }
    function walk(walk_index, current, walk_depth)
    {
        if(current == 1)
        {
            var connections = current_connections;
        }
        else{
            var connections = drawn_connections;
        }
        if(walk_depth*10>depth)
        {
            return
        }
        for(var ni=0; ni < drawing.nodes[walk_index].neighbors.length; ni++)
        {
            var neighbor_index = find_index(drawing.nodes[walk_index].neighbors[ni]);
            if(!_.contains(connections, walk_index+"_"+neighbor_index))
            {
                var depth_last = depth - walk_depth*10;
                if(depth_last>10)
                {
                    depth_last = 10;
                }
                connect_points(walk_index, neighbor_index, current, depth_last);
                walk(neighbor_index, current, walk_depth+1);
            }
        }
    }
    var LED_points = [[35, 68], [35, 31], [66, 50]];

    var aspect_ratio = LED_dimensions[1]/LED_dimensions[0];
    var new_height = this.new_width*aspect_ratio+this.bottom_margin;
    var LED_offsets = [this.new_width*LED_scale/2, new_height*LED_scale];
    var current_led = [2, 1];
    for(var i = 0; i < this.nodes.length; i++)
    {
        this.s.circle(this.nodes[i].x_pos, this.nodes[i].y_pos,
                      this.nodes[i].size).attr({ stroke: 'None',
                                                 stroke_width: 0.3,
                                                 fill: 'black' });
    }
    // walk through the node tree
    for(var i=0; i<this.num_across; i++)
    {
        var pin_index = find_index('0terminal_'+i);

        // add the pin name
        var text_transform = new Snap.Matrix();
        //text_transform.scale(LED_scale);
        text_transform.translate(this.nodes[pin_index].x_pos,
                                 this.nodes[pin_index].y_pos);
        text = this.s.text(0, 0, i+1).attr({"font-size": 10});
        text.transform(text_transform);
        walk(pin_index, 0, 100);
        if(i==0)
        {
            walk(pin_index, 1, 0);
        }
    }



};


SVG_drawing.prototype.onSVGLoaded = function(data){
    drawing.led_data = data.select("g");
    var led_transform = new Snap.Matrix();
    led_transform.scale(LED_scale);
    drawing.led_loaded = true;
};

SVG_drawing.prototype.initializeSVG = function(data){
    drawing.s = Snap("#svg");
    drawing.svg_init = true;

};

function redraw(){
    if(drawing.svg_init && drawing.led_loaded)
    {
        drawing.s.clear();
        depth += 1;
        drawing.drawSVG();
    }
}

var drawing = new SVG_drawing();
var myVar = setInterval(redraw, 10);
var loaded_led_svg = Snap.load("resources/Symbol_LED.svg", drawing.onSVGLoaded);
window.onload = drawing.initializeSVG;
