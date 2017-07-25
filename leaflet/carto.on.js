	function _cartoon(m){
		if( $is.string(m) ){
			m = document.querySelector(m);
		}
		this.holder = m;
		this.layers = new _cartoon_layers();
	};
	_cartoon.prototype.config = function(config){
		this.config = config;
		var tmp = null;

		if( !this.config.center ){this.config.center = [42.465852227987,-2.451798543334];}
		if( !this.config.zoom ){this.config.zoom = 12;}
		if( !this.config.layers ){this.config.layers = [];}
		if( this.config.center ){
			if( $is.string(this.config.center) ){
				if( this.config.center.match(/^\[[ ]*[\-0-9\.]+[ ]*,[ ]*[\-0-9\.]+[ ]*\]$/)
				 && ( tmp = JSON.parse(this.config.center) ) ){
					this.config.center = tmp;
				}
			}
		}
	};
	_cartoon.prototype.render = function(){
		var ths = this;
		var map = L.map(this.holder,{zoomControl:false}).setView(this.config.center,this.config.zoom);

		this.config.layers.forEach(function(layer,layerKey){
			if( !layer.type ){return false;}
			if( !layer.options ){layer.options = {};}
			var l = ths.layers.register(layer);
			if( layer.type == 'tiled' ){
				L.tileLayer(l.options.urlTemplate,{
					maxZoom: 18,
					attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
						'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ',
					id: l.id
				}).addTo(map);
			}
			if( layer.type == 'CartoDB' ){
				ths._query('https://sombra2eternity.carto.com/api/v2/sql?q=select *,ST_AsGeoJSON(the_geom) as geojson from ne_adm0_europe where cartodb_id = 1',false,{
					'onEnd': function(data){
						data = JSON.parse(data);
						data.rows.forEach(function(row,rowKey){
//console.log(row.geojson);
							L.geoJson(JSON.parse(row.geojson),{weight:1}).addTo(map);
//L.geoJson(JSON.parse(row.the_geom),{weight:1}).addTo(map);
						});
					}
				});
			}
		});

		L.marker([42.465852227987,-2.451798543334]).addTo(map);
		L.marker([42.460346499269,-2.4478838592768]).bindPopup("<h4>Hotel Ciudad de Logroño</h4>").addTo(map);
		L.marker([42.46851785564,-2.4432429671288]).bindPopup("<h4>F&amp;G Logroño</h4>").addTo(map);
		L.marker([42.466157428074,-2.4505305290222]).bindPopup("<h4>Hotel Sercotel Portales</h4>").addTo(map);
		L.marker([42.465294751701,-2.451697960496]).bindPopup("<h4>Hotel Condes de Haro</h4>").addTo(map);
		L.marker([42.458851508936,-2.4652598798275]).bindPopup("<h4>NH Logroño</h4>").addTo(map);
		L.marker([42.465802268025,-2.4457038938999]).bindPopup("<h4>Marqués de Vallejo</h4>").addTo(map);
		L.marker([42.476583791681,-2.3965269327164]).bindPopup("<h4>Catalonia Las Cañas</h4>").addTo(map);
		L.marker([42.472967405372,-2.4168848991394]).bindPopup("<h4>Zenit Logroño</h4>").addTo(map);
		L.marker([42.452638160424,-2.4481675028801]).bindPopup("<h4>Las Gaunas</h4>").addTo(map);
		L.marker([42.462728417071,-2.4458205699921]).bindPopup("<h4>Hotel Carlton Rioja</h4>").addTo(map);
		L.marker([42.464966298397,-2.4545216560364]).bindPopup("<h4>Hotel Gran Via</h4>").addTo(map);
		L.marker([42.465310580732,-2.4496822804213]).bindPopup("<h4>Hotel los Bracos by Silken</h4>").addTo(map);
		L.marker([42.465767147632,-2.4529445171356]).bindPopup("<h4>NH Logroño Herencia Rioja</h4>").addTo(map);
		L.marker([42.469034249134,-2.4324202537537]).bindPopup("<h4>AC Hotel La Rioja, a Marriott Lifestyle Hotel</h4>").addTo(map);
var icon = L.divIcon({ 
  html: "<span style='color:blue;'>textToDisplay</span>"
})
L.marker([42.469034249134,-2.4324202537537],{'icon':icon}).addTo(map);
	};
	_cartoon.prototype._query = function(url,params,callbacks){
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

	function _cartoon_layers(config){
		this.layers = {};
		this.config = {};
//FIXME: hardcoded
		this.config.dispatchEvents = true;
	};
	_cartoon_layers.prototype.register = function(layer){
		if( !layer.id ){layer.id = this._guid();}

		if( this.config.dispatchEvents ){
			var event = new CustomEvent('cartoon-layer-register',{'detail':{'layer':layer},'bubbles':true,'cancelable':true});
			document.dispatchEvent(event);
		}

		return this.layers[layer.id] = layer;
	};
	_cartoon_layers.prototype.empty = function(){
		this.layers = {};
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
