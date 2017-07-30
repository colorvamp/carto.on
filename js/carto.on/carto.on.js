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
		this.map = L.map(this.holder,{zoomControl:false}).setView(this._config.center,this._config.zoom);
		this.layers._cartoon = this;
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

	/* Cartoon Cartocss parser
	 * Class for parsing and selecting cartocss styles
	 */
	function _cartoon_cartocss(){
		this.rules = [];
	};
	_cartoon_cartocss.prototype.style = function(props){
		var a,v,k,selector = '',selector_,valid,name;
var styles = {};
		if( props.id ){selector += '#' + props.id;}
console.log(selector);

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
console.log(final_styles);
		return final_styles;
	};
	_cartoon_cartocss.prototype.layer = function(layer){

	};
	_cartoon_cartocss.prototype.parse = function(blob,props){
		/* Remove comments */
		blob = blob.replace(/\/\*.*?\*\//g,'');

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
		}.bind(this));
	}

	L.GeoJSON = L.GeoJSON.extend({
		'onAdd': function (map) {
			var ths = this;
			for (var i in this._layers) {
				map.addLayer(this._layers[i]);
			}

			map.on('zoomend',this.update_.bind(this));
		},
		'onRemove': function (map) {
			for (var i in this._layers) {
				map.removeLayer(this._layers[i]);
			}

			map.off('zoomstart zoomend',this.update_.bind(this));
		},
		'update_': function(e){
			if( e.type == 'zoomend' && this._cartoon_status == 'selected' ){
				//FIXME: no es la mejor manera de recalcular
				this.controlsShow();
			}
		},
		'controlsShow': function(){
			/* Show controls on geojson layers */
			//FIXME: probablemente debería ser en svg?
			if( !this._map ){return false;}
			if( !this._map._panes.controlsPane ){return false;}

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
			element:  function(o){return ('nodeType' in o && o.nodeType === 1 && 'cloneNode' in o);},
			function: function(o){if(!o){return false;}return (o.constructor.toString().indexOf('function Function()') == 0);},
			formData: function(o){return (o.constructor.toString().indexOf('function FormData()') == 0);}
		};
	}
