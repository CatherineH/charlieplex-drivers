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
    for(i=0; i<this.num_down;i++)
    {
        var node = {x_pos:50, y_pos:i*50, size:3};
        this.nodes.push(node);
    }
};

SVG_drawing.prototype.drawSVG = function(){
    var LED_dimensions = [106.0, 71.0];
    var LED_points = [[35, 68], [35, 31], [66, 50]];
    var LED_entries = [[4, 50], [103, 50]];
    var aspect_ratio = LED_dimensions[1]/LED_dimensions[0];
    var new_width = this.image_width/this.num_across;
    var new_height = new_width*aspect_ratio;
    var LED_scale = 0.75;
    var LED_offsets = [new_width*LED_scale/2, new_height*LED_scale];
    var junction_radius = 0.8;
    var current_led = [2, 1];

    for(i = 0; i < this.num_across; i++)
    {
        var x_pos = new_width*(this.num_across-i-1)/LED_scale;

        for(j = 0; j< this.num_down;j++)
        {
            var y_pos = (this.image_height/this.num_down)*j/LED_scale;
            var position = [x_pos+LED_offsets[0], y_pos+LED_offsets[1]];
            var led_clone = this.led_data.clone();
            var myMatrix = new Snap.Matrix();
            myMatrix.scale(LED_scale);
            myMatrix.translate(x_pos, y_pos);
            led_clone.transform(myMatrix);
            if(i==current_led[0] && j==current_led[1])
            {
                led_clone.select("path[stroke='#000']").attr({fill: "#ffff00"});
            }
            this.s.append(led_clone);
        }
    }

    for(i = 0; i < this.nodes.length; i++)
    {
        this.s.circle(this.nodes[i].x_pos, this.nodes[i].y_pos,
                      this.nodes[i].size).attr({ stroke: '#123456', 'strokeWidth': 20, fill: 'blue' });
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
