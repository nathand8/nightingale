var pages = [];
var availablePgsCount = 91;
for (var i = 1; i <= availablePgsCount; i++) {
    pages.push({url: "images/" + i + ".png", height: 3880, width: 2550});
}

$(function() {
    $("#rotate").click(rotate);
})

function appendImage(imgData) {
    jQuery('body').append('<img style="height: 100px; display:block; float: left;" src="' + imgData + '" />');
}

function updateCounter() {
    var counter = $("#count")[0];
    counter.innerHTML = parseInt(counter.innerHTML) + 1;
}

function rotate() {

    var pgsCount = parseInt($("#pgsCount").val());
    var delay = parseInt($("#delay").val());
    var useStaticCanvas = $("#useStaticCanvas")[0].checked;

    for (var i = 0; i < pgsCount; i++) {
        var page = pages[i % availablePgsCount];
        setTimeout(function(p) {
            return function() {
                console.log(p.url);
                rotatePage(p, useStaticCanvas);
            }
        }(page), delay * i)
    }

}

var staticCanvas = new fabric.StaticCanvas(null, {enableRetinaScaling: false});

function rotatePage(page, useStaticCanvas) {

    var canvas = undefined;
    if (useStaticCanvas) {
        canvas = staticCanvas;
        canvas.dispose();
    } else {
        canvas = new fabric.Canvas();
    }

    canvas.setHeight(page.height);
    canvas.setWidth(page.width);

    return createCanvasImage(canvas, page);
}

function createCanvasImage(canvas, page) {

    fabric.Image.fromURL(page.url, function(oImg) {
        canvas.add(oImg).renderAll();
        oImg.setAngle(oImg.angle + 180);
        canvas.renderAll();

        appendImage(canvas.toDataURL());
        updateCounter();
    });

}
