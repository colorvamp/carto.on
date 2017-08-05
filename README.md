
Carto.shop
==========

**Carto.shop** is an ide designed to visualize, generate and modify maps. It was created as a test
case for **Carto.on** leaflet based library.


Carto.on
========

**Carto.on** is the core maps library.

```
/* Initialize cartoon object */
var cartoon = new _cartoon('body .cartoon-holder');
/* Load map config */
cartoon.config({...});
/* Render it to map */
cartoon.render();
```

Carto.on methods
--------

#### cartoon.config(object)
Loads an entire map configuration object for easy of use.

#### cartoon.setCenter(...args)
Helper to re-center map, it accepts a range of args:

- setCenter( (string)"lat,lng" )

WIP

Carto.on Layer methods
--------
Carto.on has a layer storage named "\_cartoon\_layers" that work with "\_cartoon\_layer" objects.

#### cartoon.layers.register(object)
Register a new layer, first param is the layer configuration object.

```
cartoon.layers.register({
	 "type":"cubes"
	,"options":{
		"cubes":[
			 {"center":[40.40927061480857,-3.7368214130401616],'angle':66}
		]
	}
});
cartoon.setCenter('40.40927061480857,-3.7368214130401616');
```

#### cartoon.layers.remove(\_cartoon\_layer|object)
Removes the layer from the map.

#### cartoon.layers.get(string)
Returns a layer based on the id.

#### cartoon.layers.forEach(function)
Iterate over all layers applying the argument callback.

```
cartoon.layers.forEach(function(layer,id){
	console.log(layer);
	console.log(id);
});
```
#### cartoon.layers.visibleToTiled()
Take all visible layers and render it using cartodb api resulting in one or various tiled static layer.

Carto.on events
--------
Carto.on use custom events to notify a variety of changes. This events bubble starting from map holder
so you can catch them through DOM using normal event listeners.

```
/* Example to listen carto.on events */
document.body.addEventListener('cartoon-layer-register',function(e){
	console.log('A new layer has been registered');
	console.log(e.detail);
});
```

#### cartoon-layer-register
Fired when a new layer is registered into the map config.

#### cartoon-layer-remove
Fired when a layer is removed from the map config, the map will be updated.

#### cartoon-layer-visibility-change
Fired when a layer changes its visibility status.

#### cartoon-layer-loading-start
Fired when a layer that depends on transferring data makes the request.

#### cartoon-layer-loading-end
Fired when a layer that depends on transferring receives the request.

WIP

\_cartoon\_layer
-----------
Base class for appendable layers inside Carto.on system

#### \_cartoon\_layer.addTo(map)
Add this layer to a map object.

#### \_cartoon\_layer.add(object)
Add an object to this layer.

#### \_cartoon\_layer.remove()
Remove this layer from the parent map.

#### \_cartoon\_layer.hide()
Hide this layer. This will fire a **cartoon-layer-visibility-change** event.

#### \_cartoon\_layer.show()
Show this layer. This will fire a **cartoon-layer-visibility-change** event.

#### \_cartoon\_layer.toggle()
Toggle visibility on this layer. This will fire a **cartoon-layer-visibility-change** event.

\_cartoon\_layer\_tiled extends \_cartoon\_layer
-----------
Class for tiled layers. All \_cartoon\_layer methods will be inherited.

\_cartoon\_layer\_cartodb extends \_cartoon\_layer
-----------
Class for cartodb layers. All \_cartoon\_layer methods will be inherited.

#### \_cartoon\_layer\_cartodb.sql(string)
Changes the sql of this cartodb layer. This will fire a **cartoon-layer-loading-start** event on start loading
and a **cartoon-layer-loading-end** when the request finish.

#### \_cartoon\_layer\_cartodb.cartocss(string)
Changes the style of this cartodb layer.

\_cartoon\_layer\_cubes extends \_cartoon\_layer
-----------
Class for cube layers.

TO-DO
-----

Features I would like to add.

- [x] Render Cartodb templates (mapnick)
- [ ] toString and toJson methods in cartoon
- [ ] Archive -> Export map
- [ ] Archive -> Import config
- [x] Layer -> Add layer
- [ ] View -> Option for zooming
- [x] Delete Objects on supr keypress
- [x] Layer config options in layer list
- [x] Layer remove option in layer list
- [ ] Layer panTo option in layer list (and fitBounds())
- [x] Loading info when ajax layers are transferring
- [ ] Cube z-index control algorithm
- [ ] Cube configurable max metrics
- [ ] Integrate CodeMirror (for editing cartocss)
- [ ] Custom layer for mapping roads
- [ ] Complete cartocss parser to handle #Polygon etc
- [ ] Undo stack
- [ ] Projecting svg closed paths in y axis
- [ ] Bug when angle is 0 on cubes
- [ ] Bookmark positions to fast-travel
- [ ] quadtree algorightm to optimize layer/cubes drawing
- [ ] When modify sql or cartocss in a cartodb layer update ilayer
- [x] When a layer is set to invisible, update layer list icons
- [ ] Dijkstra + Contraction hierarchies to find best route in roads
