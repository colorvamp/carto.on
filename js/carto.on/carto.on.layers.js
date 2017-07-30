
	class _cartoon_layer{
		constructor(ilayer,config){
			this.config = {};
			this.config.dispatchEvents = true;

			if( ilayer.id ){this._id = ilayer.id;}
		}
		addTo(map){
			this._map = map;
			this._layer.addTo(map);
			return this;
		}
		add(obj){
			/* Ad element to this layer */
			this._layer.addLayer(obj);

//FIXME: hacer con childs
			if( this.config.dispatchEvents
			 && obj._type && obj._type == 'geojson' ){
				obj.on('click',function(e){
					var event = new CustomEvent('cartoon-geojson-click',{'detail':{'map':this._map,'geojson':obj,'layer':this},'bubbles':true,'cancelable':true});
					this._map._container.dispatchEvent(event);
					//this.controlsShow();
				}.bind(this));
			}

			if( this.config.dispatchEvents
			 && obj._type && obj._type == 'cube' ){
				/* Save new information in layer config */
				//this.cubes.push({'center':,'angle':});
				
				obj.on('click',function(e){
					var event = new CustomEvent('cartoon-marker-click',{'detail':{'map':ths.map,'marker':this,'layer':layer},'bubbles':true,'cancelable':true});
					this._map._container.dispatchEvent(event);
				});
				obj.on('dragstart',function(e){
					var event = new CustomEvent('cartoon-marker-dragstart',{'detail':{'map':ths.map,'marker':this,'layer':layer},'bubbles':true,'cancelable':true});
					this._map._container.dispatchEvent(event);
				});
				obj.on('dragend',function(e){
					//console.log(this.getLatLng());
				});

			}
		}
		hide(){
			var a;
			if( this._layer._container ){
				this._layer._container.style.display = 'none';
			}
			if( this._layer._layers ){
				this._layer.eachLayer(function(l,lk){
					switch( true ){
						case !!(l._icon):
							l._icon.childNodes[0].style.display = 'none';
							return false;
						case !!(l._layers):
							//FIXME: check if there is a hide method for recursive
							for( a in l._layers ){
								if( l._layers[a]._path ){l._layers[a]._path.style.display = 'none';}
							}
							return false;
						default:
					}
				});
			}

			this._cartoon_display = 'none';
			if( this._map && this.config.dispatchEvents ){
				/* Notify the layer visibility change */
				var event = new CustomEvent('cartoon-layer-visibility-change',{'detail':{'map':this._map,'layer':this,'visibility':'hidden'},'bubbles':true,'cancelable':true});
				this._map._container.dispatchEvent(event);
			}
		}
		show(){
			var a;
			if( this._layer._container ){
				this._layer._container.style.display = 'block';
			}
			if( this._layer._layers ){
				this._layer.eachLayer(function(l,lk){
					switch( true ){
						case !!(l._icon):
							l._icon.childNodes[0].style.display = 'block';
							return false;
						case !!(l._layers):
							//FIXME: check if there is a show method for recursive
							for( a in l._layers ){
								if( l._layers[a]._path ){l._layers[a]._path.style.display = 'block';}
							}
							return false;
					}
				});
			}

			this._cartoon_display = 'block';
			if( this._map && this.config.dispatchEvents ){
				/* Notify the layer visibility change */
				var event = new CustomEvent('cartoon-layer-visibility-change',{'detail':{'map':this._map,'layer':this,'visibility':'visible'},'bubbles':true,'cancelable':true});
				this._map._container.dispatchEvent(event);
			}
		}
		toggle(){
			if( !this._cartoon_display || this._cartoon_display == 'block' ){return this.hide();}
			return this.show();
		}
		_guid(){
			function s4(){
				return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
			};
			return s4() + s4() + '-' + s4();
		}
		_query(url,params,callbacks){
			if( !callbacks ){callbacks = {};}
			var method = 'GET';if(params){method = 'POST';}
			var rnd = Math.floor(Math.random()*10000);
			var data = false;
			if( params ){switch( true ){
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
	}
	class _cartoon_layer_tiled extends _cartoon_layer{
		constructor(ilayer,config){
			super(ilayer,config);
			this._ilayer = ilayer;
			this._type = 'tiled';
			this._layer = L.tileLayer(ilayer.options.urlTemplate,{
				maxZoom: ilayer.options.maxZoom || 18,
				minZoom: ilayer.options.minZoom || 0,
				attribution: ilayer.options.attribution,
				id: ilayer.id
			});
		}
	}
	class _cartoon_layer_cartodb extends _cartoon_layer{
		constructor(ilayer,config){
			super(ilayer,config);
			this._ilayer = ilayer;
			this._type = 'cartodb';
			this._layer = L.layerGroup();
			this._cartoon_cartocss = new _cartoon_cartocss();
			this._cartoon_cartocss_apply = false;

			if( ilayer.options.cartocss ){
				this._cartoon_cartocss.parse(ilayer.options.cartocss);
				this._cartoon_cartocss_apply = true;
			}
			if( ilayer.options.sql ){
				this.sql(ilayer.options.sql);
			}
		}
		sql(sql){
			var ths = this;
			var api_url = this._ilayer.options.maps_api_template || false;
			if( !api_url ){
				console.log('api url not found');
				return false;
			}
			if( api_url.indexOf('{user}') > -1 ){
				/* If user is needed we try to find him */
				var api_user = this._ilayer.options.user_name || false;
				if( !api_user ){
					console.log('api user not found');
					return false;
				}
				api_url = api_url.replace('{user}',api_user);
			}

			this._query(api_url + '/api/v2/sql?q=' + sql,false,{
				'onEnd': function(data){
					//FIXME: parsear datos de campos
					data = JSON.parse(data);
					if( !data.rows ){
						console.log('query error');
						console.log(data);
						return false;
					}
					data.rows.forEach(function(row,rowKey){
						if( row.the_geom ){
							//FIXME: cachear en this
							var wkx = require('wkx');
							ths.tmp_arrayBuffer = Uint8Array.from(row.the_geom.match(/.{2}/g),function(byte){
								return parseInt(byte,16);
							});
							ths.tmp_geometry = wkx.Geometry.parse(ths.tmp_arrayBuffer);
							delete ths.tmp_arrayBuffer;
							var geojson = ths.tmp_geometry.toGeoJSON();
							delete ths.tmp_geometry;
							//console.log(geojson);
							var styles = {weight:1};
if( ths._cartoon_cartocss_apply ){
/* Apply styles if available */
styles = ths._cartoon_cartocss.style({'id':'european_countries_e','row':row});
}
							var geoj = L.geoJson(geojson,styles);
							geoj._type = 'geojson';
							geoj._row  = row;
							ths.add(geoj);
						}
					});
				}
			});
		}
	}



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
		if( !layer.type ){return false;}
		layer.type = layer.type.toLowerCase();

		if( this.map ){
			/* If the map exists, we apply the layers */
			if( layer.type == 'tiled' ){
				_cartoon_layer = new _cartoon_layer_tiled(layer);
				_cartoon_layer.addTo(this.map);
			}
			if( layer.type == 'cartodb' ){
				_cartoon_layer = new _cartoon_layer_cartodb(layer);
				_cartoon_layer.addTo(this.map);
			}
			if( layer.type == 'cubes' ){
				var metersPerPixel = 40075017 * Math.abs(Math.cos(this.map.getCenter().lat * 180/Math.PI)) / Math.pow(2, 18 + 8);
				var zoom = ths.map.getZoom();
				var o = 1;
				if( zoom != 18 ){
					var mpp  = 40075017 * Math.abs(Math.cos(this.map.getCenter().lat * 180/Math.PI)) / Math.pow(2, this.map.getZoom() + 8);
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
		}

		if( this.map && this.config.dispatchEvents ){
			/* Notify the layer registering */
			var event = new CustomEvent('cartoon-layer-register',{'detail':{'map':this.map,'layer':_cartoon_layer},'bubbles':true,'cancelable':true});
			this.map._container.dispatchEvent(event);
		}

		/* Callbacks */
		

		return this.layers[layer.id] = layer;
	};
	_cartoon_layers.prototype.empty = function(){
		this.layers = {};
		//FIXME: remove from map
	}
	_cartoon_layers.prototype.get = function(id){
		if( !this.layers[id] ){return false;}
		return this.layers[id];
	};
	_cartoon_layers.prototype._guid = function(){
		function s4(){
			return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
		};
		return s4() + s4() + '-' + s4();
	};

