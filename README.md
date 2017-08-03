
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

Carto.on events
--------

#### cartoon-layer-register
Fired when a new layer is registered into the map config

#### cartoon-layer-remove
Fired when a layer is removed from the map config, the map will be updated

#### cartoon-layer-visibility-change
Fired when a layer changes its visibility status

WIP


TO-DO
-----

Features I would like to add.

- [ ] Render Cartodb templates (mapnick)
- [ ] Archive -> Export map
- [ ] Archive -> Import config
- [x] Layer -> Add layer
- [ ] View -> Option for zooming
- [x] Delete Objects on supr keypress
- [x] Layer config options in layer list
- [x] Layer remove option in layer list
- [ ] Layer panTo option in layer list
- [ ] Loading info when ajax layers are transferring
- [ ] Cube z-index control algorithm
- [ ] Integrate CodeMirror (for editing cartocss)
- [ ] Custom layer for mapping roads
- [ ] Complete cartocss parser to handle #Polygon etc
- [ ] Undo stack
- [ ] Projecting svg closed paths in y axis
- [ ] Bug when angle is 0 on cubes
- [ ] Bookmark positions to fast-travel
- [ ] quadtree algorightm to optimize layer/cubes drawing
