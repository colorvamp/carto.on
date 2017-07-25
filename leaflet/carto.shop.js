
	/* This is not a function because only one instance of this can run at a time */
	var _cartoshop = {
		'vars': {
			 'holder': false
			,'menu': {
				 'layer':{'list':false}
			}
		},
		'init': function(){
			var tmp = null;
			if( !(tmp = document.querySelector('body.cartoshop')) ){return false;}
			_cartoshop.vars.holder = tmp;

			_cartoshop.menu.layer.init();


			document.addEventListener('cartoon-layer-register',function(e){
				e.stopPropagation();
				//console.log(e.detail);
				_cartoshop.menu.layer.append(e.detail.layer);
			});
		}
	};

	_cartoshop.menu = {};
	_cartoshop.menu.layer = {
		'init': function(){
			_cartoshop.vars.menu.layer.list = document.querySelector('.cartoshop-layer-list');
		},
		'append': function(layer){
			var li = document.createElement('LI');
			li.innerHTML = layer.id;

			_cartoshop.vars.menu.layer.list.appendChild(li);
		}
	};

	addEventListener('DOMContentLoaded',function(e){_cartoshop.init();});
	if (document.readyState === 'complete' || document.readyState === 'loaded' || document.readyState === 'interactive') {
		_cartoshop.init();
	}
