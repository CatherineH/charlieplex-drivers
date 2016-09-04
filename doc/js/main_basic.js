function drawSVG(){
        var s = Snap("#svg");
        //var circle = s.circle(90,120,80);
	Snap.load("resources/Symbol_LED.svg", function (f) {
    g = f.select("g");
    s.append(g);
    g.drag();
});
}

window.onload = drawSVG;

/*
window.onload = function(){
	var s = Snap("#svg");
	var circle = s.circle(90,120,80);

}*/


