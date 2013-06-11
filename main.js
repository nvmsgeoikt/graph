//
//  main.js
//
//  A project template for using arbor.js
//

(function($){

  var Renderer = function(canvas){
    var canvas = $(canvas).get(0)
    var ctx = canvas.getContext("2d");
    var particleSystem

    var that = {
      init:function(system){
        //
        // the particle system will call the init function once, right before the
        // first frame is to be drawn. it's a good place to set up the canvas and
        // to pass the canvas size to the particle system
        //
        // save a reference to the particle system for use in the .redraw() loop
        particleSystem = system

        // inform the system of the screen dimensions so it can map coords for us.
        // if the canvas is ever resized, screenSize should be called again with
        // the new dimensions
        particleSystem.screenSize(canvas.width, canvas.height) 
        particleSystem.screenPadding(80) // leave an extra 80px of whitespace per side
        
        // set up some event handlers to allow for node-dragging
        that.initMouseHandling()
      },
      
      redraw:function(){
        // 
        // redraw will be called repeatedly during the run whenever the node positions
        // change. the new positions for the nodes can be accessed by looking at the
        // .p attribute of a given node. however the p.x & p.y values are in the coordinates
        // of the particle system rather than the screen. you can either map them to
        // the screen yourself, or use the convenience iterators .eachNode (and .eachEdge)
        // which allow you to step through the actual node objects but also pass an
        // x,y point in the screen's coordinate system
        //
        ctx.fillStyle = "#f9f9f9"
        ctx.fillRect(0,0, canvas.width, canvas.height)
        
        particleSystem.eachEdge(function(edge, pt1, pt2){
          // edge: {source:Node, target:Node, length:#, data:{}}
          // pt1:  {x:#, y:#}  source position in screen coords
          // pt2:  {x:#, y:#}  target position in screen coords

          // draw a line from pt1 to pt2
          ctx.strokeStyle = "rgba(0,0,0, .333)"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(pt1.x, pt1.y)
          ctx.lineTo(pt2.x, pt2.y)
          ctx.stroke()
          ctx.fillStyle = "#ffa500"
          var dispX = pt2.x-pt1.x
          var dispY = pt2.y-pt1.y
          ctx.restore()
          var A = Math.atan2(dispY, dispX)
          var c = 10
          var b = c * Math.cos(A)
          var a = c * Math.sin(A)          
          var w = 7
          ctx.fillRect(pt2.x-w/2-b, pt2.y-w/2-a, w,w)
          ctx.restore()
        })

        particleSystem.eachNode(function(node, pt){
          // node: {mass:#, p:{x,y}, name:"", data:{}}
          // pt:   {x:#, y:#}  node position in screen coords

          // draw a rectangle centered at pt
          var w = 10
          ctx.fillStyle = (node.data.alone) ? "orange" : "black"
          ctx.fillRect(pt.x-w/2, pt.y-w/2, w,w)
            ctx.font="14px Verdana";
            // Create gradient
            var gradient=ctx.createLinearGradient(pt.x-w,pt.y-w,pt.x+w,pt.y+w);
            gradient.addColorStop("0","magenta");
            gradient.addColorStop("0.5","blue");
            gradient.addColorStop("1.0","red");
            // Fill with gradient
            var fill = gradient;
            if (node.data.progress == 100) {
                fill = "green";
            }
            ctx.fillStyle=fill;
            ctx.fillText(node.data.title,pt.x+w,pt.y);
        })    			
      },
      
      initMouseHandling:function(){
        // no-nonsense drag and drop (thanks springy.js)
        var dragged = null;

        // set up a handler object that will initially listen for mousedowns then
        // for moves and mouseups while dragging
        var handler = {
          clicked:function(e){
            var pos = $(canvas).offset();
            _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
            dragged = particleSystem.nearest(_mouseP);

            if (dragged && dragged.node !== null){
              // while we're dragging, don't let physics move the node
              dragged.node.fixed = true
            }

            $(canvas).bind('mousemove', handler.dragged)
            $(window).bind('mouseup', handler.dropped)

            return false
          },
          dragged:function(e){
            var pos = $(canvas).offset();
            var s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)

            if (dragged && dragged.node !== null){
              var p = particleSystem.fromScreen(s)
              dragged.node.p = p
            }

            return false
          },

          dropped:function(e){
            if (dragged===null || dragged.node===undefined) return
            if (dragged.node !== null) dragged.node.fixed = false
            dragged.node.tempMass = 1000

            editItem(dragged.node.data.id)

            dragged = null
            $(canvas).unbind('mousemove', handler.dragged)
            $(window).unbind('mouseup', handler.dropped)
            _mouseP = null
            return false
          }
        }
        
        // start listening
        $(canvas).mousedown(handler.clicked);

      }
    }
    return that
  }
  $(document).ready(function(){
    sys = arbor.ParticleSystem(1000, 600, 0.5) // create the system with sensible repulsion/stiffness/friction
    sys.parameters({gravity:true}) // use center-gravity to make the graph settle nicely (ymmv)
    sys.renderer = Renderer("#viewport") // our newly created renderer will have its .init() method called shortly by sys...

    // add some nodes to the graph and watch it go...
    /*sys.addEdge('a','b')
    sys.addEdge('a','c')
    sys.addEdge('a','d')
    sys.addEdge('a','e')
    sys.addNode('f', {alone:true, mass:.25})*/
    updateGraph()
  })

})(this.jQuery);

var sys;

function updateGraph() {
    $.ajax({
        url: 'http://localhost:5000/read',
        type: 'GET',
        dataType: 'json',
        data: '',
        success: function (json_items) {
            for (var i=0; i<json_items.length; i++) {
                item = json_items[i]
                sys.addNode(item.id, item)
                deps = item.deps.split(',')
                for (var j=0; j<deps.length; j++) {
                    dep = deps[j];
                    if (dep.length > 0) {
                        console.log(item.id + ' -> ' + dep)
                        sys.addEdge(item.id, dep)
                    }
                }
            }
            sys.renderer.redraw()
        }
    })
}
setInterval(updateGraph, 1000)

function editItem(id) {
    $.ajax({
        url: 'http://localhost:5000/read/' + id,
        type: 'GET',
        dataType: 'json',
        data: '',
        success: function (json_item) {
            $("#node_id").text(json_item.id);
            $("#title").val(json_item.title);
            $("#dependencies").val(json_item.deps);
            $("#progress").val(json_item.progress);
            $("#text").val(json_item.text);
        }
    })

}

function updateClick(){
    var node_id = $("#node_id").text();
    var title = $("#title").val();
    var dependencies = $("#dependencies").val();
    var progress = $("#progress").val();
    var text = $("#text").val();

    var new_item = new Object();
    new_item.id = node_id;
    new_item.title = title;
    new_item.deps = dependencies;
    new_item.progress = progress;
    new_item.text = text;
    var new_json_item = JSON.stringify(new_item);
    $.ajax({
        url: 'http://localhost:5000/write/' + new_json_item,
        type: 'GET',
        dataType: 'json',
        data: '',
        success: function (json_item) {
        }
    });
    updateGraph()

}