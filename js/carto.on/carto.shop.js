
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
				,'map': {'KEY_SHIFT': 16,'KEY_CONTROL': 17,'KEY_ALT': 18,'KEY_SUPR': 46,'KEY_WND': 91}
			}
			,'menu': {
				 'edit':  {'options':{}}
				,'view':  {'options':{}}
				,'layer': {'options':{},'list':false}
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
			_cartoshop.menu.edit.init();
			_cartoshop.menu.view.init();
			_cartoshop.menu.layer.init();
			/* END-Initialize menus */

			_cartoshop.vars.map = new _cartoon('body .cartoshop-map');

			/* INI-Listeners */
			document.body.addEventListener('cartoon-layer-register',function(e){
				//console.log(e.detail);
				e.stopPropagation();
				_cartoshop.menu.layer.append(e.detail.layer);
			});
			document.body.addEventListener('cartoon-layer-remove',function(e){
				//console.log(e.detail);
				e.stopPropagation();
				_cartoshop.menu.layer.remove(e.detail.layer);
			});
			document.body.addEventListener('cartoon-geojson-click',function(e){
				e.stopPropagation();
				if( _cartoshop.vars.selected ){
					if( ('onBlur' in _cartoshop.vars.selected) ){_cartoshop.vars.selected.onBlur();}
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
			document.body.addEventListener('keydown',_cartoshop.keydown);
			document.body.addEventListener('keyup',_cartoshop.keyup);
			window.addEventListener('blur',_cartoshop.blur);
			/* END-Listeners */

			/* Render de map */
			_cartoshop.vars.map.config(_cartoshop.vars.config);
			_cartoshop.vars.map.render();
if( 0 ){
_cartoshop.vars.map.layers.register({
	"type":"tiled",
	"options":{
		"urlTemplate":"http://ashbu.cartocdn.com/documentation/api/v1/map/f4591e1709797856197314e950fe8489:0/1/{z}/{x}/{y}.png",
		"minZoom":"0",
		"maxZoom":"18",
		"attribution":"&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
	}
});
}
if( 0 ){
_cartoshop.vars.map.layers.register({
	"type":"CartoDB",
	"options":{
		"user_name": "documentation",
		"maps_api_template": "http://{user}.carto.com:80",
		//"sql":"select * from european_countries_e where cartodb_id = 34 OR cartodb_id = 40",
		//"sql":"select * from european_countries_e where cartodb_id = 24",
		"sql":"select * from european_countries_e",
		"cartocss":"/** choropleth visualization */\n\n#european_countries_e{\n  polygon-fill: #FFFFB2;\n  polygon-opacity: 0.8;\n  line-color: #FFF;\n  line-width: 1;\n  line-opacity: 0.5;\n}\n#european_countries_e [ area <= 1638094] {\n   polygon-fill: #B10026;\n}\n#european_countries_e [ area <= 55010] {\n   polygon-fill: #E31A1C;\n}\n#european_countries_e [ area <= 34895] {\n   polygon-fill: #FC4E2A;\n}\n#european_countries_e [ area <= 12890] {\n   polygon-fill: #FD8D3C;\n}\n#european_countries_e [ area <= 10025] {\n   polygon-fill: #FEB24C;\n}\n#european_countries_e [ area <= 9150] {\n   polygon-fill: #FED976;\n}\n#european_countries_e [ area <= 5592] {\n   polygon-fill: #FFFFB2;\n}",
		"cartocss_version":"2.1.1"
	}
});
}
if( 1 ){
_cartoshop.vars.map.layers.register({
	 "type":"cubes"
	,"options":{
		"cubes":[
			 {"center":[40.40927061480857,-3.7368214130401616],'angle':66}
		]
	}
});
}

			/* Remove the splash screen */
			if( (tmp = document.querySelector('.cartoshop-splash')) ){
				setTimeout(function(){
					tmp.style.transition = 'opacity 1s ease-in-out';
					tmp.style.opacity = 0;
					setTimeout(function(){
						tmp.style.display = 'none';
					},1001);
				},1000);
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
				case 46:
					/* Supr pressend, so remove selected element */
					keyname = 'Supr';
					if( _cartoshop.vars.selected
					 && ('remove' in _cartoshop.vars.selected) ){
						_cartoshop.vars.selected.remove();
					}
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
	_cartoshop.menu.edit = {
		'init': function(){
			/* Edit Selected option */
			_cartoshop.menu.edit.option_edit_selected();
		},
		'option_edit_selected': function(){
			_cartoshop.vars.menu.view.options.edit_selected = document.querySelector('.cartoshop-option-edit-selected');

			_cartoshop.vars.menu.view.options.edit_selected.addEventListener('click',function(e){
				if( _cartoshop.vars.selected ){
					if( ('editStart' in _cartoshop.vars.selected) ){_cartoshop.vars.selected.editStart();}
				}
			});
		}
	};
	_cartoshop.menu.view = {
		'init': function(){
			/* Go to option */
			_cartoshop.menu.view.option_go_to();
		},
		'option_go_to': function(){
			_cartoshop.vars.menu.view.options.goTo = document.querySelector('.cartoshop-option-go-to');
			var input = _cartoshop.vars.menu.view.options.goTo.querySelector('input[name="textarea-go-to"]');
			var btn = _cartoshop.vars.menu.view.options.goTo.querySelector('.btn-ok');
			btn.addEventListener('click',function(e){
				_cartoshop.vars.map.setCenter(input.value);
			});
		}
	};
	_cartoshop.menu.layer = {
		'init': function(){
			_cartoshop.vars.menu.layer.list = document.querySelector('.cartoshop-layer-list');
			/* Add layer option */
			_cartoshop.menu.layer.option_add_layer();
		},
		'option_add_layer': function(){
			_cartoshop.vars.menu.layer.options.addLayer = document.querySelector('.cartoshop-option-add-layer');

			var input = _cartoshop.vars.menu.layer.options.addLayer.querySelector('textarea[name="textarea-new-layer"]');
			var btn   = _cartoshop.vars.menu.layer.options.addLayer.querySelector('.btn-ok');
			btn.addEventListener('click',function(e){
				_cartoshop.vars.map.layers.register(input.value);
			});
		},
		'append': function(layer){
			var view = {'layer':layer._ilayer};
			var temp = _cartoshop.utils.template('cartoshop-layer-list-node',view,_cartoshop.vars.menu.layer.list).render(view).appendTo(_cartoshop.vars.menu.layer.list);
			var li   = temp.parent.lastElementChild;

			var div_display = li.children[0];
			div_display.addEventListener('click',function(){
				layer.toggle();
			});

			var div_name = li.children[2];
			var a_name   = div_name.children[0];
			a_name.addEventListener('click',function(e){
				if( !_cartoshop.sidebar.layer[layer._type] ){
					console.log('unable to load this layer type (' + layer._type + '), sorry');
					return false;
				}
				_cartoshop.sidebar.layer[layer._type](layer);
			});

			var opt_duplicate = li.querySelector('.cartoshop-option-layer-duplicate');
			var opt_remove    = li.querySelector('.cartoshop-option-layer-remove');

			/* Duplicate layer option */
			opt_duplicate.addEventListener('click',function(e){
				var copy = Object.assign({},layer._ilayer);
				delete copy.id;
				_cartoshop.vars.map.layers.register(copy);
			});
			/* Remove layer option */
			opt_remove.addEventListener('click',function(e){
				_cartoshop.vars.map.layers.remove(layer);
			});
		},
		'remove': function(layer){
			var node = _cartoshop.vars.menu.layer.list.querySelector('.cartoshop-layer-list-node-' + layer._id);
			if( node ){_cartoshop.vars.menu.layer.list.removeChild(node);}
		}
	};

	_cartoshop.sidebar = {};
	_cartoshop.sidebar.layer = {
		'cartodb': function(layer){
			var view = {'layer':layer._ilayer};
			var temp = _cartoshop.utils.template('cartoshop-sidebar-layer-cartodb').render(view).append('.cartoshop-sidebar');
			var h = temp.parent;

			var sql_query  = h.querySelector('textarea[name="sql"]');
			var btn_sql_update = h.querySelector('.btn-sql-update');
			btn_sql_update.addEventListener('click',function(){
				if( $is.empty(sql_query.value) ){return false;}
				layer.sql(sql_query.value);
			});

			var css_theme  = h.querySelector('textarea[name="cartocss"]');
			var btn_cartocss_update = h.querySelector('.btn-cartocss-update');
			btn_cartocss_update.addEventListener('click',function(){
				if( $is.empty(css_theme.value) ){return false;}
				layer.cartocss(css_theme.value);
			});
		},
		'tiled': function(layer){
			var view = {'layer':layer._ilayer};
			_cartoshop.utils.template('cartoshop-sidebar-layer-tiled').render(view).append('.cartoshop-sidebar');
		},
		'cubes': function(layer){
			var view = {'layer':layer._ilayer};
			_cartoshop.utils.template('cartoshop-sidebar-layer-cubes').render(view).append('.cartoshop-sidebar');
		}
	};

	/* Template class for chaining template methods */
	function _cartoshop_template(name){
		this.tpl = document.querySelector('.cartoshop-templates #template-' + name);
		if( !this.tpl ){return false;}
		this.tpl = this.tpl.innerHTML;
		return this;
	};
	_cartoshop_template.prototype.render = function(view){
		this.out = Mustache.render(this.tpl,view);
		return this;
	};
	_cartoshop_template.prototype.append = function(parent){
		this.parent = false;
		if( parent ){
			if( $is.string(parent) ){
				var p = document.querySelector(parent);
				p.innerHTML = this.out;
				this.parent = p;
				return this;
			}
			if( $is.element(parent) ){
				parent.innerHTML = this.out;
				this.parent = parent;
				return this;
			}
		}
		return this;
	};
	_cartoshop_template.prototype.appendTo = function(parent){
		this.parent = false;
		if( parent ){
			if( $is.string(parent) ){
				var p = document.querySelector(parent);
				p.insertAdjacentHTML('beforeend',this.out);
				this.parent = p;
				return this;
			}
			if( $is.element(parent) ){
				parent.insertAdjacentHTML('beforeend',this.out);
				this.parent = parent;
				return this;
			}
		}
		return this;
	};

	_cartoshop.utils = {
		'template': function(name){
			/* Just a static alias */
			return new _cartoshop_template(name);
		}
	};

	addEventListener('DOMContentLoaded',function(e){_cartoshop.init();});
	if (document.readyState === 'complete' || document.readyState === 'loaded' || document.readyState === 'interactive') {
		_cartoshop.init();
	}
