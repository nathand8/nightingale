(function() {

var pages = [];
for (var i = 1; i < 92; i++) {
    pages.push({url: "images/" + i + ".png", height: 3880, width: 2550});
}

var imgSrc = "images/1.png";

var staticCanvas = new fabric.StaticCanvas(null, {enableRetinaScaling: false});

$(function() {
    initiateRotate();
})

function initializeCanvas(page) {

    var canvas = new fabric.Canvas();
    canvas.setHeight(page.height);
    canvas.setWidth(page.width);

    return createCanvasItems(canvas, page, true);
}


function initiateRotate() {
    $("#rotate").click(rotate);
}

function rotate() {

    _.each(pages, function(page, i) {
        setTimeout(function() {
            initializeCanvas(page);
        }, 1 * i)
        
    })

    // function objectRotateClock(clone) {
    //     console.log('started page');
    //     clone.setAngle((clone.angle + 180) % 360);
    //     clone.setTop((clone.top * -1));
    //     clone.setLeft((clone.left * -1));
    //     return clone;
    // }

    // applyFilterToEveryPage({
    //     singleObjectCb: objectRotateClock
    // });

}







function createCanvasItems(canvas, page) {

    createMainGroupFromImage(page, function(newGroup) {
        canvas.add(newGroup).renderAll();
        newGroup.setAngle((newGroup.angle + 180) % 360);
        newGroup.setTop((newGroup.top * -1));
        newGroup.setLeft((newGroup.left * -1));
        canvas.renderAll();
        setTimeout(function() {
            jQuery('body').append('<img style="height: 100px; display:block; float: left;" src="' + canvas.toDataURL() + '" />')
        }, 3000)
        

    });
}

function createMainGroupFromImage(page, callback) {
    var ratio = 1;
    page.filteredUrl = page.url;
    page.origUrl = page.url;
    fabric.Image.fromURL(page.url, function(oImg) {
        oImg.set({
            left: (page.width / 2) * ratio * -1,
            top: (page.height / 2) * ratio * -1,
            originX: 'center',
            originY: 'center',
            width: page.width * ratio,
            height: page.height * ratio,
            selectable: false
        });


        var group = new fabric.Group([oImg], {
            left: 0,
            top: 0,
            originX: 'left',
            originY: 'top',
            width: page.width * ratio,
            height: page.height * ratio,
            selectable:false
        });

        callback(group);
    });
}

function mergeCanvasToImage(canvasObject,args) {
    if(args.cloneObjects === false) {
        saveCanvasInfo(canvasObject.canvas, canvasObject.page);

        return saveCanvasToImage(canvasObject);
    }

    //return cloneThenSaveCanvas(canvasObject, args.singleObjectCb, args.allObjectsCb).then(function() {}, function() {console.log('fail 4');});
    return cloneThenSaveCanvas(canvasObject, args.singleObjectCb, args.allObjectsCb);
}

function cloneThenSaveCanvas(canvasObject,singleObjectCb,allObjectsCb) {
    if(typeof singleObjectCb === 'undefined') {
        singleObjectCb = function(clone) {
            return clone;
        };
    }

    return cloneGroupObjects(canvasObject.group,singleObjectCb).then(allObjectsCb, function() {console.log('fail 3');}).then(function(clones) {
        clones = _.pull(clones,undefined);

        var newGroup = new fabric.Group(clones,{
            left: 0,
            top: 0,
            originX: 'left',
            originY: 'top',
            width: canvasObject.page.width,
            height: canvasObject.page.height
        },true);

        canvasObject.canvas.clear().renderAll();
        canvasObject.canvas.add(newGroup);

        // Save canvas JSON information etc so we can revive it later
        saveCanvasInfo(canvasObject.canvas, canvasObject.page);

        return saveCanvasToImage(canvasObject);
    }, function() {
        console.log('fail 2');
    });
}

function saveCanvasInfo(canvas,page) {
    page.canvasInfo = {
        ratio: 1,
        width: angular.copy(canvas.getWidth()),
        json: canvas.toJSON()
    };
}

function saveCanvasToImage(canvasObject) {
    // var filter = new fabric.Image.filters.ConvertTransparentToWhite();
    canvasObject.page.url = canvasObject.canvas.toDataURL();
    canvasObject.page.modified = true;

    jQuery('body').append('<img style="height: 100px; display:block; float: left;" src="' + canvasObject.page.url + '" />')

    return $q.when(canvasObject);
}

/**
 * Clones the group
 *
 * @param group
 * @param singleObjectCb
 * @returns {{promises: Array, items: Array}}
 */
function cloneGroupObjects(group,singleObjectCb) {
    return Promise.map(group.getObjects(), function(object) {
        if(fabric.util.getKlass(object.type).async) {
            var deferred = $q.defer();
            object.clone(function(clone) {
                deferred.resolve(singleObjectCb(clone));
            });
            return deferred.promise;
        }

        return $q.when(object.clone());
    });
}

function setDefaultsForApplyChanges(args) {
    var defaults = {
        applyChangesCb: function(canvasObject) {
            return $q.when(canvasObject);
        },
        singleObjectCb: function(clone) {
            return clone;
        },
        allObjectsCb: function(objects) {
            console.log('all objects');
            return objects
        },
        cloneObjects: true,
        concurrency: 3,
        applyTo: 'current'
    };

    return _.merge(defaults, args);
}

function applyFilterToEveryPage(args) {

    args = setDefaultsForApplyChanges(args);

    Promise.map(pages, function(page) {
        return initializeCanvas(page)
                .then(args.applyChangesCb)
                .then(function(newCanvasObject) {
                    console.log('canvas applied')
                    return mergeCanvasToImage(newCanvasObject,args);
                }).then(function() {
                    console.log('hey tbhere');
                }, function(error) {
                    console.log(error);
                });

    }, {concurrency: 1})

    // _.each(pages, function(page, i) {

            

            
    // });

};



})();
