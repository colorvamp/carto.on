
	/* This is not a function because only one instance of this can run at a time */
	var _cartoshop = {
		'vars': {
			 'holder': false
			,'elements': {}
			,'map': false
			,'config': {}
			,'selected': false
			,'keys': {
				 'pressed': {}
				,'map': {'KEY_SHIFT': 16,'KEY_CONTROL': 17,'KEY_ALT': 18,'KEY_WND': 91}
			}
			,'menu': {
				 'layer': {'list':false}
			}
		},
		'init': function(){
			var tmp = null;
			if( !(tmp = document.querySelector('body.cartoshop')) ){return false;}
			_cartoshop.vars.holder = tmp;

			/* We ensure only one init */
			if( _cartoshop.vars.holder.getAttribute('data-cartoshop') ){return false;}
			_cartoshop.vars.holder.setAttribute('data-cartoshop',true);

			if( !(tmp = document.querySelector('body .cartoshop-map')) ){return false;}
			if( (tmp = document.querySelector('.cartoshop-footer-keys')) ){
				/* Holder for pressed keys visual map */
				_cartoshop.vars.elements.cartoshop_footer_keys = tmp;
			}

			/* Load configuration if any */
			_cartoshop.load();

			/* INI-Initialize menus */
			_cartoshop.menu.layer.init();
			/* END-Initialize menus */

			_cartoshop.vars.map = new _cartoon('body .cartoshop-map');

			/* INI-Listeners */
			document.body.addEventListener('cartoon-layer-register',function(e){
				//console.log(e.detail);
				e.stopPropagation();
				_cartoshop.menu.layer.append(e.detail.layer);

if( e.detail.layer._type == 'cartodb' ){
_cartoshop.sidebar.layer.cartodb(e.detail.layer);
}
			});
			document.body.addEventListener('cartoon-geojson-click',function(e){
				e.stopPropagation();
				if( _cartoshop.vars.selected && _cartoshop.vars.selected.controlsHide ){
					_cartoshop.vars.selected.controlsHide();
				}
				e.detail.geojson.controlsShow();
				_cartoshop.vars.selected = e.detail.geojson;
			});
			document.body.addEventListener('cartoon-marker-click',function(e){
				if( e.detail.marker._type == 'cube' ){
					//FIXME: no es la mejor forma de hacerlo
					if( _cartoshop.vars.selected ){
						_cartoshop.vars.selected._cube.controlsToggle();
					}

					e.detail.marker._cube.controlsToggle();
					_cartoshop.vars.selected = e.detail.marker;
				}
				//console.log(e.detail);
				//e.stopPropagation();
				//_cartoshop.menu.layer.append(e.detail.layer);
			});
			document.body.addEventListener('cartoon-center-change',function(e){
				e.stopPropagation();
				_cartoshop.vars.config.center = e.detail.center;
				_cartoshop.save();
			});
			document.body.addEventListener('cartoon-zoom-change',function(e){
				e.stopPropagation();
				_cartoshop.vars.config.zoom = e.detail.zoom;
				_cartoshop.save();
			});
			document.body.addEventListener('cartoon-marker-dragstart',function(e){
				if( _cartoshop.$is.keypresed('KEY_CONTROL') ){
					if( e.detail.marker._type && e.detail.marker._type == 'cube' ){
						/* Cube duplication code */
						var newid     = _cartoshop.vars.map.layers._guid();
						var newcube   = new _cube(e.detail.marker._cube);
						var newicon   = L.divIcon({html:newcube._container,'iconSize':[0,0]});
						var newmarker = L.marker(e.detail.marker.getLatLng(),{'icon':newicon,draggable:'true'});
						newmarker._cube = newcube;
						newmarker._type = 'cube';

						e.detail.layer.add(newmarker);
					}
				}
			});
			document.body.addEventListener('keydown',_cartoshop.keydown);
			document.body.addEventListener('keyup',_cartoshop.keyup);
			window.addEventListener('blur',_cartoshop.blur);
			/* END-Listeners */

			/* Render de map */
			_cartoshop.vars.map.config(_cartoshop.vars.config);
			_cartoshop.vars.map.render();

if( 1 ){
_cartoshop.vars.map.layers.register({
	"type":"CartoDB",
	"options":{
		"user_name": "documentation",
		"maps_api_template": "http://{user}.carto.com:80",
		"sql":"select * from european_countries_e",
		"cartocss":"/** choropleth visualization */\n\n#european_countries_e{\n  polygon-fill: #FFFFB2;\n  polygon-opacity: 0.8;\n  line-color: #FFF;\n  line-width: 1;\n  line-opacity: 0.5;\n}\n#european_countries_e [ area <= 1638094] {\n   polygon-fill: #B10026;\n}\n#european_countries_e [ area <= 55010] {\n   polygon-fill: #E31A1C;\n}\n#european_countries_e [ area <= 34895] {\n   polygon-fill: #FC4E2A;\n}\n#european_countries_e [ area <= 12890] {\n   polygon-fill: #FD8D3C;\n}\n#european_countries_e [ area <= 10025] {\n   polygon-fill: #FEB24C;\n}\n#european_countries_e [ area <= 9150] {\n   polygon-fill: #FED976;\n}\n#european_countries_e [ area <= 5592] {\n   polygon-fill: #FFFFB2;\n}",
		"cartocss_version":"2.1.1"
	}
});
}
if( 0 ){
_cartoshop.vars.map.layers.register({
	 "type":"cubes"
	,"cubes":[
		 {"center":[40.40927061480857,-3.7368214130401616],'angle':66}
		//,{"center":[42.465797321492,-2.452000379562378],'angle':70,'height':108}
	]
});
}
		},
		'$is': {
			'keypresed': function(key){
				if( $is.string(key) && _cartoshop.vars.keys.map[key] ){
					key = _cartoshop.vars.keys.map[key];
				}
				return _cartoshop.vars.keys.pressed[key] || false;
			}
		},
		'keydown': function(e){
			//e.stopPropagation();
			//e.preventDefault();
			if( _cartoshop.$is.keypresed(e.which) ){return false;}
			_cartoshop.vars.keys.pressed[e.which] = true;

			//console.log(e.which);
			var keyname = e.which;
			switch( e.which ){
				case 16:
					keyname = 'Shift';
					break;
				case 17:
					keyname = 'Ctrl';
					break;
				case 18:
					keyname = 'Alt';
					break;
				case 91:
					keyname = 'Wnd';
					break;

			}
			if( _cartoshop.vars.elements.cartoshop_footer_keys ){
				var kbd = document.createElement('KBD');
				kbd.classList.add('cartoshop-pressed-key-' + e.which);
				kbd.innerHTML = keyname;
				_cartoshop.vars.elements.cartoshop_footer_keys.appendChild(kbd);
			}
		},
		'keyup': function(e){
			delete _cartoshop.vars.keys.pressed[e.which];
			if( _cartoshop.vars.elements.cartoshop_footer_keys
			 && (tmp = _cartoshop.vars.elements.cartoshop_footer_keys.querySelector('.cartoshop-pressed-key-' + e.which)) ){
				_cartoshop.vars.elements.cartoshop_footer_keys.removeChild(tmp);
			}
		},
		'blur': function(e){
			/* Window lose focus */

			/* Reset preset keys for coherence */
			_cartoshop.vars.keys.pressed = {};
			if( _cartoshop.vars.elements.cartoshop_footer_keys ){
				_cartoshop.vars.elements.cartoshop_footer_keys.innerHTML = '';
			}
		},
		'save': function(){
			delete _cartoshop.vars.config.layers;
			localStorage.setItem('cartoshop',JSON.stringify(_cartoshop.vars.config));
		},
		'load': function(){
			_cartoshop.vars.config = localStorage.getItem('cartoshop');
			if( !_cartoshop.vars.config ){
				_cartoshop.vars.config = {};
				return true;
			}
			_cartoshop.vars.config = JSON.parse(_cartoshop.vars.config);
		}
	};

	_cartoshop.menu = {};
	_cartoshop.menu.layer = {
		'init': function(){
			_cartoshop.vars.menu.layer.list = document.querySelector('.cartoshop-layer-list');
		},
		'append': function(layer){
			var li = document.createElement('LI');

			var div_display = document.createElement('DIV');
			div_display.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';

			var div_type = document.createElement('DIV');
			div_type.innerHTML = layer._type;

			var div_name = document.createElement('DIV');
			div_name.innerHTML = layer._id;

			li.appendChild(div_display);
			li.appendChild(div_type);
			li.appendChild(div_name);

			div_display.addEventListener('click',function(){
				layer.toggle();
			});

			_cartoshop.vars.menu.layer.list.appendChild(li);
		}
	};

	_cartoshop.sidebar = {};
	_cartoshop.sidebar.layer = {
		'cartodb': function(layer){
			var view = {'layer':layer._ilayer};
			_cartoshop.utils.template('cartoshop-sidebar-layer-cartodb',view);
		}
	};

	_cartoshop.utils = {
		'template': function(name,view){
			var tpl = document.querySelector('.cartoshop-templates .' + name);
			if( !tpl ){return false;}
			tpl = tpl.innerHTML;

			var out = Mustache.render(tpl,view);
			document.querySelector('.cartoshop-sidebar').innerHTML = out;
		}
	};

	addEventListener('DOMContentLoaded',function(e){_cartoshop.init();});
	if (document.readyState === 'complete' || document.readyState === 'loaded' || document.readyState === 'interactive') {
		_cartoshop.init();
	}
