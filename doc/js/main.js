var SVG_drawing = function (num_across, num_down, image_height, image_width,
                            right_margin, bottom_margin) {
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
        bottom_margin = 30;
    }
    this.bottom_margin = bottom_margin;
    this.led_loaded = false;
    this.svg_init = false;
    // create a map of the nodes
    this.nodes = [];
    this.new_width = this.image_width/this.num_across;
    for(i=0; i<this.num_across;i++)
    {
        for(j=0; j<this.num_down;j++)
        {
            // add the entry node
            var x_pos = LED_scale*(this.new_width*(this.num_across-i-1)/LED_scale+this.right_margin);
            var y_pos = LED_scale*((this.image_height/this.num_down)*j/LED_scale+this.bottom_margin);
            if(j==0)
            {
                var next = i+1;
                var node = {x_pos:x_pos, y_pos:y_pos, size:junction_radius,
                            name: "pin_"+j,
                            neighbors: ["entry_"+next+"_"+0, "exit_"+i+"_"+1]};
                this.nodes.push(node);

            }
            var node = {x_pos:x_pos + LED_entries[0][0]*LED_scale,
                        y_pos:y_pos + LED_entries[0][1]*LED_scale,
                        size:junction_radius, name:"entry_"+i+"_"+j};
            this.nodes.push(node);
            var node = {x_pos:x_pos + LED_entries[1][0]*LED_scale,
                        y_pos:y_pos + LED_entries[1][1]*LED_scale,
                        size:junction_radius, name:"exit_"+i+"_"+j};
            this.nodes.push(node);
        }
    }

};
var LED_entries = [[4, 50], [103, 50]];
var LED_dimensions = [106.0, 71.0];
var LED_scale = .5;
var junction_radius = 1.0;


SVG_drawing.prototype.drawSVG = function(){
    function connect_points(i, j)
    {
        console.log(drawing.nodes[i].name, drawing.nodes[j].name)
        drawing.s.line(drawing.nodes[i].x_pos, drawing.nodes[i].y_pos,
                    drawing.nodes[j].x_pos, drawing.nodes[j].y_pos).attr({ stroke: 'black', 'strokeWidth': 2});
    }
    function find_index(name)
    {
        for(i=0; i<drawing.nodes.length; i++)
        {
            if(drawing.nodes[i].name == name)
            {
                return i;
            }
        }
    }
    var LED_points = [[35, 68], [35, 31], [66, 50]];

    var aspect_ratio = LED_dimensions[1]/LED_dimensions[0];
    var new_height = this.new_width*aspect_ratio;
    var LED_offsets = [this.new_width*LED_scale/2, new_height*LED_scale];
    var current_led = [2, 1];

    for(i = 0; i < this.num_across; i++)
    {
        var x_pos = this.right_margin+this.new_width*(this.num_across-i-1)/LED_scale;

        for(j = 0; j< this.num_down;j++)
        {
            var y_pos = this.bottom_margin+(this.image_height/this.num_down)*j/LED_scale;

            var position = [x_pos+LED_offsets[0], y_pos+LED_offsets[1]];
            var led_clone = this.led_data.clone();
            var myMatrix = new Snap.Matrix();
            myMatrix.scale(LED_scale);
            myMatrix.translate(x_pos, y_pos);
            led_clone.transform(myMatrix);
            if(j==0)
            {
                text = this.s.text(0, 0, i+1);
                text.transform(myMatrix);

            }

            if(i==current_led[0] && j==current_led[1])
            {
                led_clone.select("path[stroke='#000']").attr({fill: "#ffff00"});
            }
            this.s.append(led_clone);
        }
    }
    var pin_0_index = find_index('pin_0');
    for(i = 0; i < this.nodes.length; i++)
    {
        this.s.circle(this.nodes[i].x_pos, this.nodes[i].y_pos,
                      this.nodes[i].size).attr({ stroke: 'None', 'strokeWidth': 0, fill: 'black' });
    }
    // walk through the node tree
    for(neighbor_index=0; neighbor_index < this.nodes[pin_0_index].neighbors.length; neighbor_index++)
    {
        console.log(neighbor_index, this.nodes[pin_0_index].neighbors[neighbor_index]);
        var neighbor_index = find_index(this.nodes[pin_0_index].neighbors[neighbor_index]);
        //connect_points(pin_0_index, neighbor_index);
    }

};


SVG_drawing.prototype.onSVGLoaded = function(data){
    drawing.led_data = data.select("g");
    drawing.led_loaded = true;
    if(drawing.svg_init && drawing.led_loaded)
    {
        drawing.drawSVG();
    }
};

SVG_drawing.prototype.initializeSVG = function(data){
    drawing.s = Snap("#svg");
    drawing.svg_init = true;
    if(drawing.svg_init && drawing.led_loaded)
    {
        drawing.drawSVG();
    }

};

var drawing = new SVG_drawing();
var loaded_led_svg = Snap.load("resources/Symbol_LED.svg", drawing.onSVGLoaded);
window.onload = drawing.initializeSVG;
