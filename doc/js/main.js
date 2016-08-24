window.onload = function(){

    var num_across=9;
    var num_down=8;
    var image_width = 600;
    var image_height = 400;
    var right_margin = 30;
    var bottom_margin = 30;

    var s = Snap("#svg");
    //, image_width+right_margin,
    //image_height+bottom_margin);
    var LED_dimensions = [106.0, 71.0];
    var LED_points = [[35, 68], [35, 31], [66, 50]];
    var LED_entries = [[4, 50], [103, 50]];
    var aspect_ratio = LED_dimensions[1]/LED_dimensions[0];
    var new_width = image_width/num_across;
    var new_height = new_width*aspect_ratio;
    var LED_scale = 0.75;
    var LED_offsets = [new_width*LED_scale/2, new_height*LED_scale];
    var junction_radius = 0.8;
    for(i = 0; i < num_across; i++)
    {
        var diode = s.svg(100, 150, 10);
        diode.transform("t10 "+i*10);
        /*var bloop1 = Snap.load("resources/Symbol_LED.svg", function
        (loadedFragment ) {
        loadedFragment.selectAll("*").attr({stroke: "#bada55", fill: "#bada55",
        width:image_width, height:image_height});
        bloop = loadedFragment.select("g");
        bloop.transform("t10 "+i*10);
        s.append(loadedFragment);} );*/
    //diode.transform("t-10 0 s0 32 32");
    }
}