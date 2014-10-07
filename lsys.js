"use strict";

var can; // global canvas
var ctx; // global canvas drawing context

function toRad(t) {
    return (t * 2 * Math.PI / 360);
}


// xform applies the ruleSet transform to the srcStr string once.
// returns transformed string
// ruleIn: the input character array
// ruleOut: array of strings as replacements.
// ruleIn and ruleOut are parallel arrays
// F -> F[+F]
// G -> G+G-G
// is represented as
// ruleIn=['F','G']
// ruleOut=['F[+F]','G+G-G']

function xform(srcStr,ruleIn,ruleOut) {
    var rval = "";
    var i,j;
    var ruleFound = false;
    var c;
    for (i=0; i<srcStr.length; i++) {
	c = srcStr.charAt(i);
	ruleFound = false;
	for (j=0; j<ruleIn.length; j++) {
	    if (c == ruleIn[j].charAt(0)) {
		// rule found, apply rule
		ruleFound = true;
		rval += ruleOut[j];
		break;
	    }
	}
	if (!ruleFound) {
	    rval += c;
	}
    }
    return rval;
}

var penstack = [];
var origin = { x:0, y:0, a:0 };
var pen = { x:0, y:0, angle:0 };
var segLength = 8;
var baseAngle = toRad(22.5);

function rSinTheta(r,t) {
    //    return Math.round(r * Math.sin(t));
    return r * Math.sin(t);
}
function rCosTheta(r,t) {
    //    return Math.round(r * Math.cos(t));
    return r * Math.cos(t);
}

var mainstring = "F";
var segLengthControl;
var angleControl;

function app() {
    can = document.getElementById("gcanvas");
    can.width=400;
    can.height=400;
    ctx = can.getContext("2d");
    
    origin.x = Math.round(can.width / 2);
    origin.y = can.height;
    origin.a = toRad(-90);
	
    pen.x = origin.x;
    pen.y = origin.y;
    pen.angle = origin.a;
    segLength = 8;

    var seed = "F[+F[F]-F[F]][-F[F]+F[[F]]]";
    var rule = "F[-F][++F]F[+F][--F]F";

    var s = seed;
    var iter = 3;
    var i;
    for (i=0; i<iter; i++) {
	s = xform(s,["F"],[rule]);
    }
    
    // prep controls
    segLengthControl = document.getElementById("segLengthControl");
    angleControl = document.getElementById("angleControl");
    
    mainstring = s;
    redraw();

}

function handleSegLengthControlChange() {
    var newlength = segLengthControl.value;
    segLength = parseFloat(newlength) / 10;
    redraw();
}

function handleAngleControlChange() {
    var newangle = angleControl.value;
    baseAngle = parseFloat(newangle) / 1000;
    redraw();
}

// reset canvas and redraw
function redraw() {
    // blank canvas
    /*
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0,0,can.width,can.height);
    */
    ctx.clearRect(0,0,can.width,can.height);
    // reset pen state
    pen.x = origin.x;
    pen.y = origin.y;
    pen.angle = origin.a;
    drawString(mainstring);
}

function drawString(s) {
    var i;
    var c;
    ctx.beginPath();
    ctx.moveTo(pen.x,pen.y);
    for (i=0; i<s.length; i++) {
	c = s.charAt(i);
	switch (c) {
	case 'F':
	    // draw one segment
	    pen.x += rCosTheta(segLength,pen.angle);
	    pen.y += rSinTheta(segLength,pen.angle);
	    ctx.lineTo(pen.x,pen.y);
	    break;
	case '+':
	    // turn right
	    pen.angle += baseAngle;
	    break;
	case '-':
	    // turn left
	    pen.angle -= baseAngle;
	    break;
	case '[':
	    // push pen state (location, heading, stack depth)
	    //	    penstack[penstack.length] = {x:pen.x, y:pen.y, a:pen.angle };
	    penstack[penstack.length] = pen.x;
	    penstack[penstack.length] = pen.y;
	    penstack[penstack.length] = pen.angle;
	    
	    break;
	case ']':
	    // pop pen state
	    ctx.stroke();
/*	    
	    var st = penstack.pop();
	    pen.x = st.x;
	    pen.y = st.y;
	    pen.angle = st.a;
*/
	    pen.angle = penstack.pop();
	    pen.y = penstack.pop();
	    pen.x = penstack.pop();
	    ctx.beginPath();
	    ctx.moveTo(pen.x,pen.y);
	    break;
	default:
	    // unknown command char in string
	}
    }
}
