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
    this.s = Snap("#svg");
};


SVG_drawing.prototype.onSVGLoaded = function(data){
    this.s.append(data);
};

SVG_drawing.prototype.drawSVG = function(data){


    //, image_width+right_margin,
    //image_height+bottom_margin);
    var LED_dimensions = [106.0, 71.0];
    var LED_points = [[35, 68], [35, 31], [66, 50]];
    var LED_entries = [[4, 50], [103, 50]];
    var aspect_ratio = LED_dimensions[1]/LED_dimensions[0];
    var new_width = this.image_width/this.num_across;
    var new_height = this.new_width*aspect_ratio;
    var LED_scale = 0.75;
    var LED_offsets = [this.new_width*LED_scale/2, this.new_height*LED_scale];
    var junction_radius = 0.8;
    var bloop1 = Snap.load("resources/Symbol_LED.svg", this.onSVGLoaded );
    for(i = 0; i < num_across; i++)
    {
        var diode = this.s.svg(100, 150, 10);
        diode.transform("t10 "+i*10);
        /*
         {
        loadedFragment.selectAll("*").attr({stroke: "#bada55", fill: "#bada55",
        width:image_width, height:image_height});}
        bloop = bloop1.select("g");
        bloop.transform("t10 "+i*10);
        diode.append(bloop);
    //diode.transform("t-10 0 s0 32 32");*/
    }
};

var drawing = new SVG_drawing();

window.onload = drawing.drawSVG();