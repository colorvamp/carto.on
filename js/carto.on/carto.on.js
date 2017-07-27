	function _cartoon(m){
		if( $is.string(m) ){
			m = document.querySelector(m);
		}
		this.holder = m;
		this.layers = new _cartoon_layers();
		this.map    = false;
		this.config();
//FIXME: configurable?
this.dispatchEvents = true;
	};
	_cartoon.prototype._require = function(url, callback){
		if( (typeof process !== 'undefined') && (process.release.name === 'node') ){
			//FIXME: use require
		}else{
			var head = document.getElementsByTagName('head')[0];
			var script = document.createElement('script');
			script.setAttribute('type','text/javascript');
			script.setAttribute('src',url);

			//FIXME: addEventListener?
			script.onreadystatechange = callback;
			script.onload = callback;

			head.appendChild(script);
		}
	};
	_cartoon.prototype.config = function(config){
		this._config = config;
		if( !this._config ){this._config = {};}
		var tmp = null;

		if( !this._config.center ){this._config.center = [42.465852227987,-2.451798543334];}
		if( !this._config.zoom ){this._config.zoom = 12;}
		if( !this._config.layers ){
			this._config.layers = [{
				"type":"tiled",
				"options":{
					"urlTemplate":"http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
					"minZoom":"0",
					"maxZoom":"18",
					"attribution":"&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
				}
			}];
		}
		if( this._config.center ){
			if( $is.string(this._config.center) ){
				if( this._config.center.match(/^\[[ ]*[\-0-9\.]+[ ]*,[ ]*[\-0-9\.]+[ ]*\]$/)
				 && ( tmp = JSON.parse(this._config.center) ) ){
					this._config.center = tmp;
				}
			}
		}
	};
	_cartoon.prototype.render = function(){
		var ths = this;
		this.map = L.map(this.holder,{zoomControl:false}).setView(this._config.center,this._config.zoom);
		this.layers.map = this.map;

		if( this.dispatchEvents ){
			if( !('cartoon_handlerZoomChange' in this.map) ){
				this.map.on('zoomend',function(){
					var zoom  = ths.map.getZoom();
					var event = new CustomEvent('cartoon-zoom-change',{'detail':{'map':ths.map,'zoom':zoom},'bubbles':true,'cancelable':true});
					ths.holder.dispatchEvent(event);
				});
			}
			if( !('cartoon_handlerCenterChange' in this.map) ){
				this.map.on('moveend',function(){
					var center = ths.map.getCenter();
					var event  = new CustomEvent('cartoon-center-change',{'detail':{'map':ths.map,'center':center},'bubbles':true,'cancelable':true});
					ths.holder.dispatchEvent(event);
				});
			}
		}

		this._config.layers.forEach(function(layer,layerKey){
			if( !layer.type ){return false;}
			if( !layer.options ){layer.options = {};}
			var l = ths.layers.register(layer);
		});

		//L.marker([42.465852227987,-2.451798543334]).addTo(this.map);
		//L.marker([42.460346499269,-2.4478838592768]).bindPopup("<h4>Hotel Ciudad de Logroño</h4>").addTo(this.map);
	};

	function _cartoon_layers(config){
		this.layers = {};
		this.config = {};
		this.map = false;

//FIXME: hardcoded
		this.config.dispatchEvents = true;
	};
	_cartoon_layers.prototype.register = function(layer){
		var ths = this;
		if( !layer.id ){layer.id = this._guid();}

		/* INI-Layer extended functions */
		layer.add = function(obj){
			this._layer.addLayer(obj);

			//console.log(obj._type);
			if( ths.config.dispatchEvents
			 && obj._type && obj._type == 'cube' ){
				/* Save new information in layer config */
				//this.cubes.push({'center':,'angle':});
				

				obj.on('dragstart',function(e){
					var event = new CustomEvent('cartoon-marker-dragstart',{'detail':{'map':ths.map,'marker':this,'layer':layer},'bubbles':true,'cancelable':true});
					ths.map._container.dispatchEvent(event);
				});
				obj.on('dragend',function(e){
					//console.log(this.getLatLng());
				});

			}
		};
		layer.hide = function(){
			if( this._layer._container ){
				this._layer._container.style.display = 'none';
			}
			if( this._layer._layers ){
				this._layer.eachLayer(function(l,lk){
					l._icon.childNodes[0].style.display = 'none';
				});
			}

			this._cartoon_display = 'none';
			if( this.map && this.config.dispatchEvents ){
				/* Notify the layer visibility change */
				var event = new CustomEvent('cartoon-layer-visibility-change',{'detail':{'map':this.map,'layer':layer,'visibility':'hidden'},'bubbles':true,'cancelable':true});
				this.map._container.dispatchEvent(event);
			}
		};
		layer.show = function(){
			if( this._layer._container ){
				this._layer._container.style.display = 'block';
			}
			if( this._layer._layers ){
				this._layer.eachLayer(function(l,lk){
					l._icon.childNodes[0].style.display = 'block';
				});
			}

			this._cartoon_display = 'block';
			if( this.map && this.config.dispatchEvents ){
				/* Notify the layer visibility change */
				var event = new CustomEvent('cartoon-layer-visibility-change',{'detail':{'map':this.map,'layer':layer,'visibility':'visible'},'bubbles':true,'cancelable':true});
				this.map._container.dispatchEvent(event);
			}
		};
		layer.toggle = function(){
			if( !this._cartoon_display || this._cartoon_display == 'block' ){return this.hide();}
			return this.show();
		};
		/* END-Layer extended functions */

		if( this.map ){
			/* If the map exists, we apply the layers */
			if( layer.type == 'tiled' ){
				layer._layer = L.tileLayer(layer.options.urlTemplate,{
					maxZoom: layer.options.maxZoom || 18,
					minZoom: layer.options.minZoom || 0,
					attribution: layer.options.attribution,
					id: layer.id
				}).addTo(this.map);
			}
			if( layer.type == 'cubes' ){
				var metersPerPixel = 40075016.686 * Math.abs(Math.cos(this.map.getCenter().lat * 180/Math.PI)) / Math.pow(2, 18 + 8);
				var zoom = ths.map.getZoom();
				var o = 1;
				if( zoom != 18 ){
					var mpp  = 40075016.686 * Math.abs(Math.cos(this.map.getCenter().lat * 180/Math.PI)) / Math.pow(2, this.map.getZoom() + 8);
					o = metersPerPixel/mpp;
				}

				layer._layer = L.layerGroup().addTo(this.map);

				/* Voxel party! Render the list of cubes */
				layer.cubes.forEach(function(c,ck){
					//FIXME: solo si no viene id

//FIXME: necesito un helper para cubes
					var id     = ths._guid();
					var cube   = new _cube();
					var icon   = L.divIcon({html:cube._container,'iconSize':[0,0]});
					var marker = L.marker(c.center,{'icon':icon,draggable:'true'});
					marker._cube = cube;
					marker._type = 'cube';

					if( o != 1 ){cube.scale(o);}
					if( c.angle ){cube.angle(c.angle);}
					if( c.height ){cube.height(c.height);}
					layer.add(marker);
				});

				/* We Need a listener for resizing */
				this.map.on('zoomend',function(){
					var metersPerPixel = 40075017 * Math.abs(Math.cos(ths.map.getCenter().lat * 180/Math.PI)) / Math.pow(2, 18 + 8);

					/* zoom 18 == 1:1 */
					var zoom = ths.map.getZoom();
					var o = 1;
					if( zoom != 18 ){
						var mpp  = 40075017 * Math.abs(Math.cos(ths.map.getCenter().lat * 180/Math.PI)) / Math.pow(2, ths.map.getZoom() + 8);
						o = metersPerPixel/mpp;
					}
					layer._layer.eachLayer(function(layr){
						layr._cube.scale(o);
					});
				});
			}
			if( layer.type == 'CartoDB' ){
				layer._layer = L.layerGroup().addTo(this.map);

				//FIXME: pasar ths._query
				ths._query('https://sombra2eternity.carto.com/api/v2/sql?q=select *,ST_AsGeoJSON(the_geom) as geojson from ne_adm0_europe where cartodb_id = 1',false,{
					'onEnd': function(data){
						
//FIXME: parsear datos de campos
						data = JSON.parse(data);
						data.rows.forEach(function(row,rowKey){
							if( row.the_geom ){
								//FIXME: cachear en this
								var wkx = require('wkx');
								var arrayBuffer = Uint8Array.from(row.the_geom.match(/.{2}/g),function(byte){
									return parseInt(byte,16);
								});
								var geometry = wkx.Geometry.parse(arrayBuffer);
								delete arrayBuffer;
								var geojson = geometry.toGeoJSON();
								delete geometry;
								console.log(geojson);
								L.geoJson(geojson,{weight:1}).addTo(layer._layer);
							}




//console.log(row.geojson);
							//L.geoJson(JSON.parse(row.geojson),{weight:1}).addTo(ths.map);
//L.geoJson(_cartoon_wkb_to_geojson(row.the_geom),{weight:1}).addTo(map);
						});
					}
				});
			}
		}

		if( this.map && this.config.dispatchEvents ){
			/* Notify the layer registering */
			var event = new CustomEvent('cartoon-layer-register',{'detail':{'map':this.map,'layer':layer},'bubbles':true,'cancelable':true});
			this.map._container.dispatchEvent(event);
		}

		/* Callbacks */
		

		return this.layers[layer.id] = layer;
	};
	_cartoon_layers.prototype.empty = function(){
		this.layers = {};
	}
	_cartoon_layers.prototype.get = function(id){
		if( !this.layers[id] ){return false;}
		return this.layers[id];
	};
	_cartoon_layers.prototype._query = function(url,params,callbacks){
		if( !callbacks ){callbacks = {};}
		var method = 'GET';if(params){method = 'POST';}
		var rnd = Math.floor(Math.random()*10000);
		var data = false;
		if(params){switch(true){
			case params === {}:break;
			case ($is.object(params)):data = new FormData();for(k in params){data.append(k,params[k]);}break;
			default:data = params;
		}}

		var xhr = new XMLHttpRequest();
		if( url.indexOf('?') > 0 ){}
		xhr.open(method,url + ( url.indexOf('?') > 0 ? '&' : '?' ) + 'rnd=' + rnd,true);
		xhr.onreadystatechange = function(){
			if( callbacks.onEnd && xhr.readyState == XMLHttpRequest.DONE ){
				return callbacks.onEnd(xhr.responseText);
			}
		}
		//if(!$is.formData(data)){xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');}
		xhr.send(data);
	};
	_cartoon_layers.prototype._guid = function(){
		function s4(){
			return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
		};
		return s4() + s4() + '-' + s4();
	};

	if( typeof _cartoon_helper_query == 'undefined' ){
		
	}

	if( typeof $is == 'undefined' ){
		var $is = {
			empty:    function(o){if(!o || ($is.string(o) && o == '') || ($is.array(o) && !o.length)){return true;}return false;},
			array:    function(o){return (Array.isArray(o) || $type(o.length) === 'number');},
			string:   function(o){return (typeof o == 'string' || o instanceof String);},
			object:   function(o){return (o.constructor.toString().indexOf('function Object()') == 0);},
			element:  function(o){return ('nodeType' in o && o.nodeType === 1 && 'cloneNode' in o);},
			function: function(o){if(!o){return false;}return (o.constructor.toString().indexOf('function Function()') == 0);},
			formData: function(o){return (o.constructor.toString().indexOf('function FormData()') == 0);}
		};
	}
