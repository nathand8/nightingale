(function() {

    var pages = [];
    for (var i = 1; i < 92; i++) {
        pages.push({url: "images/" + i + ".png", height: 3880, width: 2550});
    }

    var imgSrc = "images/1.png";

    var staticCanvas = new fabric.StaticCanvas(null, {enableRetinaScaling: false});

    $(function() {
        $("#rotate").click(rotate);
    })

    function updateCounter() {
    }

    function rotate() {

        var pgsCount = parseInt($("#pgsCount").val());
        var delay = parseInt($("#delay").val());

        _.each(pages, function(page, i) {
            if (i < pgsCount) {
                setTimeout(function() {
                    rotatePage(page);
                }, delay * i)
            }
            
        })

    }

    function rotatePage(page) {

        var canvas = new fabric.Canvas();
        canvas.setHeight(page.height);
        canvas.setWidth(page.width);

        return createCanvasItems(canvas, page);
    }

    function createCanvasItems(canvas, page) {

        createMainGroupFromImage(page, function(newGroup) {
            canvas.add(newGroup).renderAll();
            newGroup.setAngle((newGroup.angle + 180) % 360);
            newGroup.setTop((newGroup.top * -1));
            newGroup.setLeft((newGroup.left * -1));
            canvas.renderAll();
            jQuery('body').append('<img style="height: 100px; display:block; float: left;" src="' + canvas.toDataURL() + '" />');
            var counter = $("#count")[0];
            counter.innerHTML = parseInt(counter.innerHTML) + 1;
        });
    }

    function createMainGroupFromImage(page, callback) {

        fabric.Image.fromURL(page.url, function(oImg) {

            oImg.set({
                left: (page.width / 2) * -1,
                top: (page.height / 2) * -1,
                originX: 'center',
                originY: 'center',
                width: page.width,
                height: page.height,
                selectable: false
            });


            var group = new fabric.Group([oImg], {
                left: 0,
                top: 0,
                originX: 'left',
                originY: 'top',
                width: page.width,
                height: page.height,
                selectable: false
            });

            callback(group);
        });
    }

})();
