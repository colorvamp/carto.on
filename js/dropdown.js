
	function widgets_dropdown_init(e){
		/* INI-dropdown */
		if( !window.VAR ){window.VAR = {};}
		window.VAR.dropdown = false;
		var dropdownToggles = document.querySelectorAll('.dropdown-toggle');
		Array.prototype.slice.call(dropdownToggles).forEach(function(v){
			var d = new dropdown(v);
		});

		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
		if( MutationObserver ){
			// define a new observer
			var obs = new MutationObserver(function(mutations, observer){
				if( mutations[0].addedNodes.length/* || mutations[0].removedNodes.length*/ ){
					var nodeList = Array.prototype.slice.call(document.querySelectorAll('.dropdown-toggle:not([data-dropdown])'));
					if( nodeList.length ){
						nodeList.forEach(function(v,k){new dropdown(v);});
					}
				}
			});
			// have the observer observe foo for changes in children
			obs.observe( document.body, { childList:true, subtree:true });
		}

		var body = document.body;
		body.addEventListener('click',function(event){
			if( window.VAR.dropdown ){
				var event = new CustomEvent('close',{'detail':{},'bubbles':true,'cancelable':true});
				window.VAR.dropdown.dispatchEvent(event);
			}
		});
		/* END-dropdown */
	};
	
	addEventListener('DOMContentLoaded',widgets_dropdown_init);
	if (document.readyState === 'complete' || document.readyState === 'loaded' || document.readyState === 'interactive') {
		widgets_dropdown_init();
	}

	function dropdown(elem){
		this.elem = elem;
		/* Evitamos que un mismo elemento se pueda instanciar 2 veces como dropdown */
		if( elem.getAttribute('data-dropdown') ){return false;}
		elem.setAttribute('data-dropdown',true);

		var ths = this;
		this.elem.addEventListener('click',function(e){ths.onClick.call(ths,e);});
		this.elem.addEventListener('state',function(e){ths.onState.call(ths,e);});
		this.elem.addEventListener('touchstart',function(e){ths.onClick.call(ths,e);});
		this.elem.addEventListener('close',function(e){ths.close.call(ths,e);});

		/* Evitamos que se cierre al hacer click en el contenido */
		this.ddm = elem.querySelector('.dropdown-menu');
		if( this.ddm ){
			this.ddm.addEventListener('click',function(e){e.stopPropagation();});
			this.ddm.addEventListener('touchstart',function(e){e.stopPropagation();});
		}

		/* INI-botones de cerrar que incorpore el dropdown */
		var buttons = this.elem.querySelectorAll('.btn.close,.btn.btn-close');
		if( buttons.length ){Array.prototype.slice.call(buttons).forEach(function(btn){
			btn.addEventListener('click',function(e){e.stopPropagation();ths.close.call(ths,e);});
			btn.addEventListener('touchstart',function(e){e.stopPropagation();ths.close.call(ths,e);});
		});}
		/* END-botones de cerrar que incorpore el dropdown */
		var buttons = this.elem.querySelectorAll('*[class*=\'btn-state-\']');
		if( buttons.length ){Array.prototype.slice.call(buttons).forEach(function(btn){
			btn.addEventListener('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				var state = (/btn\-state\-([^ ]+)/g).exec(this.className);
				state = state[1];
				var event = new CustomEvent('state', {'detail':{'state':state}, 'bubbles': true, 'cancelable': true});
				this.dispatchEvent(event);
			});
			btn.addEventListener('touchstart',function(e){
				e.preventDefault();
				e.stopPropagation();
				var state = (/btn\-state\-([^ ]+)/g).exec(this.className);
				state = state[1];
				var event = new CustomEvent('state', {'detail':{'state':state}, 'bubbles': true, 'cancelable': true});
				this.dispatchEvent(event);
			});
		});}
	}
	dropdown.prototype.isDisabled  = function(){return this.elem.classList.contains('disabled');};
	dropdown.prototype.isOpen      = function(){return this.elem.classList.contains('active');};
	dropdown.prototype.isSelectBox = function(){return this.elem.classList.contains('select');};
	dropdown.prototype.isAjax      = function(){return this.elem.classList.contains('ajax');};
	dropdown.prototype.isRemoveBox = function(){return this.elem.classList.contains('remove');};
	dropdown.prototype.mustSubmit  = function(){return this.elem.classList.contains('autosubmit');};
	dropdown.prototype.setValue    = function(dataToSet,initial){
		var parent = this.elem.getElementsByClassName('dropdown-menu');
		if(!parent.length){return;}parent = parent[0];
		Array.prototype.slice.call(parent.childNodes).forEach(function(it){
			if(!$E.class.exists(it,'item')){return;}
			var data = it.getAttribute('data-value');
			if(data != dataToSet){/* Buscamos el element coincidente, saltamos si este no fuera */return;}
			var ddw = $E.parent.find(it,{'className':'dropdown-toggle'});if(!ddw){return false;}
			var ipt = ddw.getElementsByClassName('input');if(ipt){
				Array.prototype.slice.call(ipt).forEach(function(y){y.value = data;});
			}
			var val = ddw.getElementsByClassName('value');if(val){
				Array.prototype.slice.call(val).forEach(function(y){y.innerHTML = it.innerHTML;});
			}
		});

		if(!initial && this.mustSubmit()){
			/* Widget calendar tiene su propio handler */
			if($E.class.exists(this.elem,'widget-calendar')){return false;}
			var form = $E.parent.find(this.elem,{'tagName':'form'});
			return form.submit();
		}
	};
	dropdown.prototype.onState = function(e){
		if( !e.detail.state ){return false;}
		var state = this.elem.getAttribute('data-state');
		if( !state ){state = 'main';}
		var current = false;
		var next    = false;

		if( !(current = this.ddm.querySelector('.dropdown-menu-state-'+state)) ){return false;}
		if( !(next    = this.ddm.querySelector('.dropdown-menu-state-'+e.detail.state)) ){return false;}
		next.style.transition    = 'opacity 0.4s ease-in-out';
		current.style.transition = 'opacity 0.4s ease-in-out';
		var ths = this;

		var position = 'right';
		var cursor = current;
		while( cursor.previousElementSibling ){
			if( cursor.previousElementSibling == next ){position = 'left';break;}
			cursor = cursor.previousElementSibling;
		}

		var width  = this.ddm.offsetWidth;
		var height = this.ddm.offsetHeight;
		this.ddm.style.width    = width+'px';
		//this.ddm.style.height   = height+'px';
		this.ddm.style.overflow = 'hidden';

		var width  = current.offsetWidth;
		var height = current.offsetHeight;

		var parent = current.parentNode;
		//parent.style.transition = 'none';
		parent.style.width  = (width*2)+'px';
		parent.style.height = height+'px';
		if( position == 'left' ){
			parent.style.transform = 'translateX( -'+width+'px )';
console.log('asd'+width);
		}else{
			parent.style.transform = 'translateX( 0px )';
console.log('asd0');
		}

		current.style.display = 'inline-block';
		current.style.width   = width+'px';
		current.style.height  = height+'px';

		next.style.display = 'inline-block';
		next.style.width   = width+'px';

		var diff = (next.offsetHeight-current.offsetHeight);
		parent.style.transition = 'transform 0.4s ease-in-out,height 0.4s ease-in-out';
		next.style.opacity    = 1;
		current.style.opacity = 0;

		setTimeout(function(){
			var move = position == 'right' ? '-'+width : 0;
			parent.style.transform  = 'translateX( '+move+'px )';
			parent.style.height = next.offsetHeight+'px';
			current.style.height = 'auto';

			setTimeout(function(){
				current.style.display = 'none';
				current.style.opacity = 0;

				next.style.display = 'block';
				next.style.opacity = 1;

				parent.style.transition = 'none';
				parent.style.height     = 'auto';

				parent.style.transform = 'translateX( 0px )';
				parent.style.width  = width+'px';
				ths.ddm.style.overflow = 'auto';
			},501);
		},30);

		this.elem.setAttribute('data-state',e.detail.state);
	};
	dropdown.prototype.onClick = function(e){
		var item = false;
		if(this.isDisabled()){return false;}
		e.preventDefault();
		e.stopPropagation();
		if(this.isOpen()){
			//VAR_dropdownToggled = false;
			if(this.isSelectBox() &&  (item = $E.parent.find(e.target,{'className':'item'})) ){
				var dataToSet = item.getAttribute('data-value');
				this.setValue(dataToSet);
			}
			return this.close();
		}
		return this.open();
	}
	dropdown.prototype.ajax = function(e){
		var ths = this;
		var form = $E.parent.find(e.target,{'tagName':'form'});if(!form){return false;}
		var ddm = this.elem.querySelector('.dropdown-menu');if(!ddm){return false;}

		$transition.toState(ddm,'working',function(q){});

		var params = $toUrl($parseForm(form));
		ajaxPetition(window.location.href,params,function(ajax){
			var r = jsonDecode(ajax.responseText);if(parseInt(r.errorCode)>0){alert(print_r(r));return;}
			if('html' in r){$transition.setHTMLByState(ddm,'info',r.html);}

			$execWhenTrue(function(){return ddm.getAttribute('data-ready') == 'true';},function(){
				$transition.toState(ddm,'info',function(q){});
				if(ths.isRemoveBox()){do{
					/* Si este cuadro de información es para eliminar elementos, lo eliminamos automáticamente */
					var node = $E.parent.find(ddm,{'className':'node'});if(!node){break;}
					$fx.leaveVertical(node,{'callback':function(n){n.parentNode.removeChild(n);}});
				}while(false);}

				var buttons = ddm.querySelectorAll('.btn.close,.btn.btn-close');
				if(buttons.length){Array.prototype.slice.call(buttons).forEach(function(btn){
					btn.addEventListener('click',function(e){e.stopPropagation();ths.close.call(ths,e);});
				});}
			});
		});

		return false;
	};
	dropdown.prototype.open = function(){
		//FIXME: evento before open
		if( window.VAR.dropdown && !$E.parent.inside(this.elem,window.VAR.dropdown) ){
			/* Si hay un dropdown anterior lo cerramos */
			var event = new CustomEvent('close',{'detail':{},'bubbles':true,'cancelable':true});
			window.VAR.dropdown.dispatchEvent(event);
		}

		var btn = $E.parent.find(this.elem,{'className':'dropdown-toggle'});
		/* INI-Soporte para recaptcha */
		if( window.grecaptcha && (elems = this.elem.querySelectorAll('.g-recaptcha')) ){
			var key  = false;
			var elem = false;
			Array.prototype.slice.call(elems).forEach(function(elem){
				if( elem.firstChild ){return;}
				key = elem.getAttribute('data-sitekey');
				if(key){grecaptcha.render(elem,{'sitekey':key,'theme':'light'});}
			});
		}
		/* END-Soporte para recaptcha */
		btn.classList.toggle('active');

		if( !window.VAR ){window.VAR = {};}
		window.VAR.dropdown = this.elem;
		var bodyWidth = (document.body.offsetWidth);
		var ddm  = btn.querySelector('.dropdown-menu');
		var pos  = ddm.getBoundingClientRect();
		if( pos.width > (bodyWidth-20) ){
			ddm.style.width = (bodyWidth-20)+'px';
			ddm.style.minWidth = (bodyWidth-20)+'px';
			pos  = ddm.getBoundingClientRect();
		}
		var rpos = bodyWidth-(pos.left+pos.width);
		/* If the infoBox is out the page, fix it to the right border */
		if( rpos < 10 ){ddm.style.left = ddm.offsetLeft+rpos-10+'px';}
		ddm.style.width = pos.width+'px';


		ddm.classList.remove('state-end');
		//FIXME: evento open
	}
	dropdown.prototype.close = function(){
		var btn = $E.parent.find(this.elem,{'className':'dropdown-toggle'});
		if(btn){btn.classList.remove('active');}
	};
	/* END-dropdown */

	if( typeof $E == 'undefined' ){
		/* extended $E-lements functions - to avoid too much selector overload */
		var $E = {
			classHas: function(elem,className){var p = new RegExp('(^| )'+className+'( |$)');return (elem.className && elem.className.match(p));},
			classAdd: function(elem,className){if($E.classHas(elem,className)){return true;}elem.className += ' '+className;},
			classRemove: function(elem,className){var c = elem.className;var p = new RegExp('(^| )'+className+'( |$)');c = c.replace(p,' ').replace(/  /g,' ');elem.className = c;},
			classParentHas: function(elem,className,limit){
				limit = typeof limit !== 'undefined' ? limit : 1;
				if($E.classHas(elem,className)){return elem;}
				if(!elem.parentNode){return false;}
				do{if($E.classHas(elem.parentNode,className)){return elem.parentNode;}elem = elem.parentNode;}while(elem.parentNode && limit--);return false;
			},
			class: {
				exists: function(elem,className){var p = new RegExp('(^| )'+className+'( |$)');return (elem.className && elem.className.match(p));},
				add: function(elem,className){if($E.classHas(elem,className)){return true;}elem.className += ' '+className;},
				remove: function(elem,className){var c = elem.className;var p = new RegExp('(^| )'+className+'( |$)');c = c.replace(p,' ').replace(/  /g,' ');elem.className = c;}
			},
			parent: {
				find: function(elem,p){/* p = {tagName:false,className:false} */if(p.tagName){p.tagName = p.tagName.toUpperCase();}if(p.className){p.className = new RegExp('( |^)'+p.className+'( |$)');}while(elem.parentNode && ((p.tagName && elem.tagName!=p.tagName) || (p.className && !elem.className.match(p.className)))){elem = elem.parentNode;}if(!elem.parentNode){return false;}return elem;},
				inside: function(elem,parent){
					while( elem.parentNode && elem.parentNode !== parent ){elem = elem.parentNode;}
					return ( elem.parentNode === parent ) ? true : false;
				},
				match: function(elem,m){
					while( elem.parentNode && (!elem.matches || !elem.matches(m)) ){elem = elem.parentNode;}
					return ( elem.parentNode ) ? elem : false;
				}
			},
			style: {
				apply: function(elem,style){
					for( var o in style ){
						if( o.indexOf('.') == 0 ){elem.style[o.replace(/^./,'')] = style[o];continue;}
						elem[o] = style[o];
					}
					return elem;
				}
			}
		}
	}
