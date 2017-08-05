
	class _cartoon_layer{
		constructor(ilayer,config){
			this.config = {};
			this.config.dispatchEvents = true;

			if( ilayer.id ){
				this.id  = ilayer.id;
				this._id = ilayer.id;
			}

			this._cartoon_display = 'block';
		}
		addTo(map){
			if( !this._layer ){
				/* If there is no instanced layer yet you cant append nothing */
				return false;
			}
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
		}
		remove(){
			/* Remove this layer from the parent map, its basically
			 * an alias to the underlying layer */
			if( this._map
			 && this._layer
			 && ('remove' in this._layer) ){
				this._layer.remove();
				return true;
			}
			return false;
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
		isVisible(){
			return (this._cartoon_display == 'block');
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
			/* Empty the current layer first */
			this._layer.eachLayer(function(lyr){
				lyr.remove();
			});

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

			if( this._map && this.config.dispatchEvents ){
				/* This will take a while, so notify event */
				var event = new CustomEvent('cartoon-layer-loading-start',{'detail':{'map':this._map,'layer':this},'bubbles':true,'cancelable':true});
				this._map._container.dispatchEvent(event);
			}

			this._query(api_url + '/api/v2/sql?q=' + sql,false,{
				'onEnd': function(data){
					if( this._map && this.config.dispatchEvents ){
						/* Finally we got the response, notify */
						var event = new CustomEvent('cartoon-layer-loading-end',{'detail':{'map':this._map,'layer':this},'bubbles':true,'cancelable':true});
						this._map._container.dispatchEvent(event);
					}


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

							var geoj = L.geoJson(geojson);
							geoj._type = 'geojson';
							geoj._sql  = sql;
							geoj._row  = row;

							if( ths._cartoon_cartocss_apply ){
								ths._cartoon_cartocss.layer(geoj);
							}

							ths.add(geoj);
						}
					});
				}.bind(this)
			});
		}
		cartocss(theme){
			this._cartoon_cartocss.parse(theme);

			this._layer.eachLayer(function(lyr){
				this._cartoon_cartocss.layer(lyr);
			}.bind(this));
		}
	}
	class _cartoon_layer_cubes extends _cartoon_layer{
		constructor(ilayer,config){
			super(ilayer,config);
			this._ilayer = ilayer;
			this._type = 'cubes';
			this._layer = L.layerGroup();

			/* Voxel party! Render the list of cubes */
			if( ilayer.options.cubes ){
				ilayer.options.cubes.forEach(function(c,ck){
					//FIXME: solo si no viene id

//FIXME: necesito un helper para cubes
					var id     = this._guid();
					var cube   = new _cube();
					var icon   = L.divIcon({html:cube._container,'iconSize':[0,0]});
					var marker = L.marker(c.center,{'icon':icon,draggable:'true'});
					marker._cube = cube;
					marker._type = 'cube';

					//if( o != 1 ){cube.scale(o);}
					if( c.angle ){cube.angle(c.angle);}
					if( c.height ){cube.height(c.height);}
					this.add(marker);
				}.bind(this));
			}
		}
		addTo(map){
			/* If we change the map, remove all old event listeners */
			if( this._map && this._on_zoomend ){
				this._map.off('zoomend',this._on_zoomend);
			}


			this._map = map;
			this._update();

			/* We Need a listener for resizing */
			this._on_zoomend = function(){this._update();}.bind(this);
			this._map.on('zoomend',this._on_zoomend);

			return super.addTo(map);
		}
		add(obj){
			if( obj._type !== 'cube' ){return false;}
			if( this.config.dispatchEvents ){
				obj.on('click',function(e){
					var event = new CustomEvent('cartoon-marker-click',{'detail':{'map':this._map,'marker':obj,'layer':this},'bubbles':true,'cancelable':true});
					this._map._container.dispatchEvent(event);
				}.bind(this));
				obj.on('dragstart',function(e){
					var event = new CustomEvent('cartoon-marker-dragstart',{'detail':{'map':this._map,'marker':obj,'layer':this},'bubbles':true,'cancelable':true});
					this._map._container.dispatchEvent(event);
				}.bind(this));
				obj.on('dragend',function(e){
					//console.log(this.getLatLng());
				}.bind(this));

			}

			var o = this._scale();
			obj._cube.scale(o);
			return super.add(obj);
		}
		_update(){
			var o = this._scale();
			this._layer.eachLayer(function(lyr){
				lyr._cube.scale(o);
			});
		}
		_scale(){
			if( !this._map ){return 1;}
			var metersPerPixel = 40075017 * Math.abs(Math.cos(this._map.getCenter().lat * 180/Math.PI)) / Math.pow(2, 18 + 8);
			var zoom = this._map.getZoom();
			var o = 1;
			if( zoom != 18 ){
				var mpp  = 40075017 * Math.abs(Math.cos(this._map.getCenter().lat * 180/Math.PI)) / Math.pow(2, this._map.getZoom() + 8);
				o = metersPerPixel/mpp;
			}
			return o;
		}
	}



	function _cartoon_layers(config){
		this.layers = {};
		this.config = config || {'dispatchEvents':true};
		this._map = false;
	};
	_cartoon_layers.prototype.setMap = function(map){
		//FIXME: check map
		this._map = map;
	};
	_cartoon_layers.prototype.register = function(layer){
		if( $is.string(layer) ){
			/* Validate string layers */
			try {
				layer = JSON.parse(layer);
			} catch (e) {
				console.log('Invalid layer');
				return false;
			}
		}

		var ths = this;
		if( !layer.id ){layer.id = this._guid();}
		if( !layer.type ){
			console.log('Invalid layer');
			return false;
		}
		layer.type = layer.type.toLowerCase();

		if( this._map ){
			/* If the map exists, we apply the layers */
			if( layer.type == 'tiled' ){
				_cartoon_layer = new _cartoon_layer_tiled(layer);
				_cartoon_layer.addTo(this._map);
			}
			if( layer.type == 'cartodb' ){
				_cartoon_layer = new _cartoon_layer_cartodb(layer);
				_cartoon_layer.addTo(this._map);
			}
			if( layer.type == 'cubes' ){
				_cartoon_layer = new _cartoon_layer_cubes(layer);
				_cartoon_layer.addTo(this._map);
			}

			layer._cartoon_layer = _cartoon_layer;
		}

		if( this._map && this.config.dispatchEvents ){
			/* Notify the layer registering */
			var event = new CustomEvent('cartoon-layer-register',{'detail':{'map':this._map,'layer':_cartoon_layer},'bubbles':true,'cancelable':true});
			this._map._container.dispatchEvent(event);
		}

		return this.layers[layer.id] = layer;
	};
	_cartoon_layers.prototype.remove = function(layer){
		if( !this.layers[layer.id] ){
			console.log('Layer not found');
			return false;
		}

		if( this.layers[layer.id]._cartoon_layer
		 && this.layers[layer.id]._cartoon_layer
		 && ('remove' in this.layers[layer.id]._cartoon_layer ) ){
			this.layers[layer.id]._cartoon_layer.remove();
		}

		if( this._map && this.config.dispatchEvents ){
			/* Notify the layer unregistering */
			var event = new CustomEvent('cartoon-layer-remove',{'detail':{'map':this._map,'layer':this.layers[layer.id]._cartoon_layer},'bubbles':true,'cancelable':true});
			this._map._container.dispatchEvent(event);
		}

		delete this.layers[layer.id];
	};
	_cartoon_layers.prototype.forEach = function(callback){
		this.tmp = false;
		for( this.tmp in this.layers ){
			callback(this.layers[this.tmp],this.tmp);
		}
	};
	_cartoon_layers.prototype.empty = function(){
		this.forEach(function(lyr){
			this.remove(lyr);
		}.bind(this));
	};
	_cartoon_layers.prototype.get = function(id){
		if( !this.layers[id] ){return false;}
		return this.layers[id];
	};
	_cartoon_layers.prototype.toTiled = function(layer){
		if( layer._type != 'cartodb' ){
			console.log('Cant render this type yet');
			return false;
		}
		//FIXME: TODO
	};
	_cartoon_layers.prototype.visibleToTiled = function(id){
		/* This will convert visible layers to tiled ones using cartodb
		 * Note: Only compatible with cartodb layers */
		var config = {'layers':[]};
		var copy = false;
		this.forEach(function(lyr){
			if( lyr.type !== 'cartodb'
			 || !lyr._cartoon_layer
			 || !lyr._cartoon_layer._ilayer ){return false;}
			if( !lyr._cartoon_layer.isVisible() ){return false;}

			copy = Object.assign({},lyr._cartoon_layer._ilayer);
			copy.type = 'mapnik'; /* Need to re-type */
			delete copy._cartoon_layer;
			config.layers.push(copy);
		}.bind(this));

		if( !config.layers.length ){
			/* NO layers to render */
			return false;
		}

		//FIXME: hardcoded user
		this._query('http://documentation.cartodb.com/api/v1/map',JSON.stringify(config),{
			'onEnd': function(res){
				try {
					res = JSON.parse(res);
				} catch (e) {
					console.log('Unknown response');
					return false;
				}

				/* Calculate urlTemplate */
				res.metadata.layers.forEach(function(lyr,i){
					//FIXME: hardcoded user
					var urlTemplate = 'http://ashbu.cartocdn.com/documentation/api/v1/map/' + res.layergroupid + '/' + i + '/{z}/{x}/{y}.png';
					this.register({
						"id":lyr.id,
						"type":"tiled",
						"options":{
							"urlTemplate":urlTemplate,
							"minZoom":"0",
							"maxZoom":"18",
							"attribution":"&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
						}
					});
					console.log(urlTemplate);
				}.bind(this));
			}.bind(this)
		});
	};
	_cartoon_layers.prototype._query = function(url,params,callbacks){
		return _cartoon_helper_query(url,params,callbacks);
	};
	_cartoon_layers.prototype._guid = function(){
		function s4(){
			return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
		};
		return s4() + s4() + '-' + s4();
	};

