	/* Cartoon Core Class
	 * Class for generating maps based in a config object
	 */
	function _cartoon(m){
		if( $is.string(m) ){
			m = document.querySelector(m);
		}
		this.holder = m;
		this.layers = new _cartoon_layers();
		this._map   = false;
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
	_cartoon.prototype.setCenter = function(...args){
		if( !this._map ){return false;}
		if( args.length == 1 ){
			if( $is.string(args[0]) && args[0].indexOf(',') ){
				/* Support for string coords */
				var coords = args[0].split(',');
				return this._map.panTo(new L.LatLng(coords[0],coords[1]));
			}
		}

		console.log('no support yet for this format');
	};
	_cartoon.prototype.getCenter = function(){
		if( !this._map ){return false;}
		return this._map.getCenter();
	}
	_cartoon.prototype.setZoom = function(level){
		if( !this._map ){return false;}
		return this._map.setZoom(level);
	};
	_cartoon.prototype.config = function(config){
		this._config = config;
		if( !this._config ){this._config = {};}
		var tmp = null;

		if( !this._config.center ){this._config.center = [40.40927061480857,-3.7368214130401616];}
		if( !this._config.zoom ){this._config.zoom = 12;}
		if( !this._config.maps_api_config ){this._config.maps_api_config = {};}
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
		//window.L_PREFER_CANVAS = true;
		this._map = L.map(this.holder,{zoomControl:false}).setView(this._config.center,this._config.zoom);
		this.layers.setMap(this._map);
		this.layers._cartoon = this;

		if( this.dispatchEvents ){
			if( !('cartoon_handlerZoomChange' in this._map) ){
				this._map.on('zoomend',function(){
					var zoom  = ths._map.getZoom();
					var event = new CustomEvent('cartoon-zoom-change',{'detail':{'map':ths._map,'zoom':zoom},'bubbles':true,'cancelable':true});
					ths.holder.dispatchEvent(event);
				});
			}
			if( !('cartoon_handlerCenterChange' in this._map) ){
				this._map.on('moveend',function(){
					var center = ths._map.getCenter();
					var event  = new CustomEvent('cartoon-center-change',{'detail':{'map':ths._map,'center':center},'bubbles':true,'cancelable':true});
					ths.holder.dispatchEvent(event);
				});
			}
		}

		this._config.layers.forEach(function(layer,layerKey){
			if( !layer.type ){return false;}
			if( !layer.options ){layer.options = {};}
			var l = ths.layers.register(layer);
		});

		//L.marker([42.465852227987,-2.451798543334]).addTo(this._map);
		//L.marker([42.460346499269,-2.4478838592768]).bindPopup("<h4>Hotel Ciudad de Logroño</h4>").addTo(this._map);
	};

	/* Cartoon Cartocss parser
	 * Class for parsing and selecting cartocss styles
	 */
	function _cartoon_cartocss(){
		this.rules = [];
	};
	_cartoon_cartocss.prototype._styles = {
		 stroke: true
		,color: '#3388ff'
		,weight: 1
		,opacity: 1
		,lineCap: 'round'
		,lineJoin: 'round'
		,dashArray: null
		,dashOffset: null
		,fill: true
		,fillOpacity: 0.2
		,fillRule: 'evenodd'
	};
	_cartoon_cartocss.prototype.style = function(props){
		var a,v,k,selector = '',selector_,valid,name;
		var styles = {};
		if( props.id ){selector += '#' + props.id;}
		//FIXME: faltan las clases y otras cosas
		//console.log(selector);

		this.rules.forEach(function(v,k){
			selector_ = v.selector.base.join(' ');

			if( selector == selector_ ){
				if( !v.selector.cond.length ){
					styles = $extend(styles,v.styles);
					return;
				}
				valid = true;
				v.selector.cond.forEach(function(f,d){
					if( !valid ){/* exit fast */return false;}
					if( !props.row || !props.row[f.field] ){return valid = false;}
					var expr = props.row[f.field] + ( f.expr == '=' ? '==' : f.expr ) + f.value;
					if( !eval(expr) ){return valid = false;}
					/* Rule end successfully! */
				});
				if( valid ){
					styles = $extend(styles,v.styles);
				}
			}
		});

		var final_styles = {};
		for( a in styles ){
			name = a;
			if( a == 'polygon-fill' ){name = 'fillColor';}
			if( a == 'polygon-opacity' ){name = 'fillOpacity';}
			if( a == 'line-color' ){name = 'color';}
			if( a == 'line-width' ){name = 'weight';}
			if( a == 'line-opacity' ){name = 'opacity';}
			final_styles[name] = styles[a];
		}

		return $extend(this._styles,final_styles);
	};
	_cartoon_cartocss.prototype.layer = function(layer){
		if( !('setStyle' in layer) ){
			console.log('invalid layer');
			return false;
		}
		var tablename = '';
		if( layer._sql ){
			this.tmp = (/from ([^ ]+)/ig).exec(layer._sql);
			tablename = this.tmp[1];
		}

		var style = this.style({'id':tablename,'row':layer._row || {}});
		return layer.setStyle(style);
	};
	_cartoon_cartocss.prototype.parse = function(blob,props){
		/* Remove comments */
		blob = blob.replace(/\/\*.*?\*\//g,'');
		blob += '\n';

		blob.replace(/([#\.a-z]{1}[^\{]+)\{([^\}]+)\}\n/g,function(rule,selector,styles){
			selector = selector.replace(/\[([^\]]+)\]/g,function(n){
				/* Remove spaces in attrib selector */
				return n.replace(/[ \n\t]/g,'');
			});
			selector = selector.split(' ');

			var selector_final = {
				 'base':[]
				,'cond':[]
			};
			selector.forEach(function(part,k){
				if( $is.empty(part) ){return;}
				if( part.startsWith('[') ){
					/* Split the conditional parts -> [field<num] */
					part = part.substring(1,part.length - 1);
					part.replace(/^([^<=>]+)([<=>]+)([^ ]+)$/,function(n,field,expr,value){
						part = {'field':field,'expr':expr,'value':value};
					});
					selector_final.cond.push(part);
					return;
				}
				selector_final.base.push(part);
			});

			var styles_final = {};
			styles = styles.replace(/([a-z\-]+)[ ]*:[ ]*([^;]+);/g,function(n,name,value){
				styles_final[name] = value;
			});

			this.rules.push({
				 'selector':selector_final
				,'styles':styles_final
			});
			return '';
		}.bind(this));
	}

	L.GeoJSON = L.GeoJSON.extend({
		'onAdd': function (map) {
			var ths = this;
			for (var i in this._layers) {
				map.addLayer(this._layers[i]);
			}

			this._cartoon_status = 'normal';
			map.on('zoomend',this.update_.bind(this));
		},
		'onRemove': function (map) {
			for (var i in this._layers) {
				map.removeLayer(this._layers[i]);
			}

			map.off('zoomstart zoomend',this.update_.bind(this));
		},
		'onBlur': function(){
			if( this._cartoon_status == 'editing' ){
				this.editEnd();
			}
			if( this._cartoon_status == 'selected' ){
				this.controlsHide();
			}
		},
		'update_': function(e){
			if( e.type == 'zoomend' && this._cartoon_status == 'selected' ){
				//FIXME: no es la mejor manera de recalcular
				this.controlsShow();
			}
		},
		'editStart': function(){
			if( !this._map ){return false;}
			if( this._cartoon_status == 'editing' ){return false;}
			if( !this._layer_edit ){this._layer_edit = L.layerGroup().addTo(this._map);}
			if( this._cartoon_status == 'selected' ){this.controlsHide();}
			this._cartoon_status = 'editing';

			var vertex = L.divIcon({iconSize:[8,8],className:'icon-vertex'});

			this.eachLayer(function(layer){
				if( layer instanceof L.Rectangle ){
					console.log('im an instance of L rectangle');
				}

				if( layer instanceof L.Polyline ){
					console.log('im an instance of L polyline');
					//console.log(layer);
				}

				if( layer instanceof L.Marker ){
					console.log('im an instance of L marker');
				}

				if( layer instanceof L.Polygon ){
					var latlngs = layer.getLatLngs();
					var geojson = layer.toGeoJSON();
					for( var i = 0; i < latlngs.length; i++ ){
						for( var j = 0; j < latlngs[i].length; j++ ){
							for( var k = 0; k < latlngs[i][j].length; k++ ){
								var marker = L.marker([latlngs[i][j][k].lat,latlngs[i][j][k].lng],{icon:vertex,draggable:true}).addTo(this._map);
								marker.on('drag',function(e){
									var marker = e.target;
									var position = marker.getLatLng();

									this.latlngs[this.i][this.j][this.k].lat = position.lat;
									this.latlngs[this.i][this.j][this.k].lng = position.lng;
							
									this.layer.setLatLngs(this.latlngs);
								}.bind({'layer':layer,'latlngs':latlngs,'geojson':geojson,'i':i,'j':j,'k':k}));

								this._layer_edit.addLayer(marker);
							}
						}
					}
				}

				//if( layer.feature.geometry.type != 'MultiPolygon' ){return;}
			}.bind(this));
		},
		'editEnd': function(){
			if( this._cartoon_status != 'editing' ){return false;}
			this._map.removeLayer(this._layer_edit);
			this._layer_edit = false;
			this._cartoon_status = 'normal';
		},
		'controlsShow': function(){
			/* Show controls on geojson layers */
			//FIXME: probablemente debería ser en svg?
			if( !this._map ){return false;}
			if( !this._map._panes.controlsPane ){return false;}
			if( this._cartoon_status == 'editing' ){return false;}
			var bounds = this.getBounds();

			//FIXME: no siempre hay que volver a esconder
			this.controlsHide();
			var ovrly = document.createElement('DIV');
			ovrly.classList.add('leaflet-control-geojson');
			ovrly.style.position = 'absolute';
			this._map._panes.controlsPane.appendChild(ovrly);

			var rect, left = false, top = false, right = false, bottom = false
				,_southWest = this._map.latLngToLayerPoint(bounds._southWest)
				,_northEast = this._map.latLngToLayerPoint(bounds._northEast);
			top    = _northEast.y;
			left   = _southWest.x;
			width  = _northEast.x - left;
			height = _southWest.y - top;

			ovrly.style.left   = left + 'px';
			ovrly.style.top    = top + 'px';
			ovrly.style.width  = width + 'px';
			ovrly.style.height = height + 'px';
			this._cartoon_status = 'selected';
			if( !this._cartoon_controls ){this._cartoon_controls = {};}
			this._cartoon_controls._container = ovrly;
		},
		'controlsHide': function(){
			if( this._cartoon_controls
			 && this._cartoon_controls._container
			 && this._cartoon_controls._container.parentNode ){
				this._cartoon_controls._container.parentNode.removeChild(this._cartoon_controls._container);
			}
			this._cartoon_status = 'normal';
		}
	});

	if( typeof _cartoon_helper_query == 'undefined' ){
		function _cartoon_helper_query(url,params,callbacks){
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
			if( data ){
				//if(!$is.formData(data)){xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');}
				if( $is.string(data) && data.match(/^\{.*?\}$/) ){xhr.setRequestHeader('Content-Type','application/json');}
			}
			xhr.send(data);
		};
	}

	if( typeof $extend == 'undefined' ){
		function $extend(destination,source){for(var property in source){destination[property] = source[property];}return destination;}
	}
	if( typeof $is == 'undefined' ){
		var $is = {
			empty:    function(o){if(!o || ($is.string(o) && o == '') || ($is.array(o) && !o.length)){return true;}return false;},
			array:    function(o){return (Array.isArray(o) || typeof o.length === 'number');},
			string:   function(o){return (typeof o == 'string' || o instanceof String);},
			object:   function(o){return (o.constructor.toString().indexOf('function Object()') == 0);},
			element:  function(o){return (!$is.string(o) && 'nodeType' in o && o.nodeType === 1 && 'cloneNode' in o);},
			function: function(o){if(!o){return false;}return (o.constructor.toString().indexOf('function Function()') == 0);},
			formData: function(o){return (o.constructor.toString().indexOf('function FormData()') == 0);}
		};
	}
