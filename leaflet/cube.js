	function _cube(init){
		this._container = document.createElement('DIV');
		this._container.classList.add('cube-holder');

		this._container.perspective = document.createElement('DIV');
		this._container.perspective.classList.add('perspective');
		this._container.appendChild(this._container.perspective);

		this._container.cube = document.createElement('DIV');
		this._container.cube.classList.add('cube');
		this._container.perspective.appendChild(this._container.cube);

		/* Right side */
		this._container.cube_right = document.createElement('DIV');
		this._container.cube_right.classList.add('cube-right');
		this._container.cube.appendChild(this._container.cube_right);

		/* Left side */
		this._container.cube_left = document.createElement('DIV');
		this._container.cube_left.classList.add('cube-left');
		this._container.cube.appendChild(this._container.cube_left);


		/* Controls */
		this._container.cube_control_height = document.createElement('DIV');
		this._container.cube_control_height.classList.add('cube-control');
		this._container.cube_control_height.classList.add('cube-control-height');
		this._container.appendChild(this._container.cube_control_height);

		this._container.cube_control_angle = document.createElement('DIV');
		this._container.cube_control_angle.classList.add('cube-control');
		this._container.cube_control_angle.classList.add('cube-control-angle');
		this._container.appendChild(this._container.cube_control_angle);

		this._container.cube_control_left = document.createElement('DIV');
		this._container.cube_control_left.classList.add('cube-control');
		this._container.cube_control_left.classList.add('cube-control-left');
		this._container.appendChild(this._container.cube_control_left);

		this._container.cube_control_right = document.createElement('DIV');
		this._container.cube_control_right.classList.add('cube-control');
		this._container.cube_control_right.classList.add('cube-control-right');
		this._container.appendChild(this._container.cube_control_right);


		var ths = this;
		this._container.cube_control_height.addEventListener('mousedown',function(e){ths.height_mousedown(e);});
		this._container.cube_control_left.addEventListener('mousedown',function(e){ths.left_mousedown(e);});
		this._container.cube_control_right.addEventListener('mousedown',function(e){ths.right_mousedown(e);});
		this._container.cube_control_angle.addEventListener('mousedown',function(e){ths.angle_mousedown(e);});

		if( init && init._container ){
			if( init._container.startIndexA ){this.angle(init._container.startIndexA);}
			if( init._container.startIndexY ){this.height(init._container.startIndexY);}
			if( init._container.startIndexL ){this.left(init._container.startIndexL);}
			if( init._container.startIndexR ){this.right(init._container.startIndexR);}
		}
	};
	_cube.prototype.angle = function(angle){
		this._container.perspective.style.transform = 'rotateX(25deg) rotateZ(' + angle + 'deg)';
		/* Save last position to allow resume */
		this._container.startIndexA = angle;
	};
	_cube.prototype.height = function(height){
		this._container.cube.style.transform   = 'translateZ(' + height + 'px)';
		this._container.cube_right.style.width = height + 'px';
		this._container.cube_left.style.height = height + 'px';
		/* Save last position to allow resume */
		this._container.startIndexY = height;
	};
	_cube.prototype.left = function(left){
		this._container.perspective.style.height        = left + 'px';
		this._container.cube.style.height               = left + 'px';
		this._container.cube_left.style.transformOrigin = '0 ' + left + 'px';
		this._container.cube_left.style.transform       = 'rotateX(-90deg) translateY(' + left + 'px)';
		this._container.cube_right.style.height         = left + 'px';
		/* Save last position to allow resume */
		this._container.startIndexL = left;
	};
	_cube.prototype.right = function(right){
		this._container.perspective.style.width          = right + 'px';
		this._container.cube.style.width                 = right + 'px';
		this._container.cube_right.style.transformOrigin = right + 'px 0';
		this._container.cube_right.style.transform       = 'rotateY(90deg) translateX(' + right + 'px)';
		this._container.cube_left.style.width            = right + 'px';
		/* Save last position to allow resume */
		this._container.startIndexR = right;
	};
	_cube.prototype.scale = function(ratio){
		this._container.style.transform = 'scale(' + ratio + ') translateX(-20px) translateY(-20px)';
	};
	_cube.prototype.controlsToggle = function(ratio){
		this._container.classList.toggle('active');
	};
	_cube.prototype.appendTo = function(holder){
		holder.appendChild(this._container);
	};

	/* INI-Height */
	_cube.prototype.height_mousedown = function(e){
		if ( e.button === 1 ) {return false;}

		e.preventDefault();
		e.stopPropagation();
		var ths = this;
		this._container.startX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
		this._container.startY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
		if( !this._container.startIndexY ){
			//FIXME: hardcoded
			this._container.startIndexY = 40;
		}

		if( !('handlerHeightMouseMove' in this._container) ){
			this._container.handlerHeightMouseMove = function(e){ths.height_mousemove(e);}
			this._container.handlerHeightMouseUp   = function(e){ths.height_mouseup(e);}
		}

		addEventListener('mousemove',this._container.handlerHeightMouseMove,false);
		addEventListener('mouseup',  this._container.handlerHeightMouseUp,false);
		//addEventListener('touchmove',this.panel.handlerHeightMouseMove,false);
		//addEventListener('touchend', this.panel.handlerHeightMouseUp,false);
		//addEventListener('touchstop',this.panel.handlerHeightMouseUp,false);
	};
	_cube.prototype.height_mousemove = function(e){
		e.stopPropagation();

		this._container.x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
		this._container.y = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
		this._container.diffY = this._container.startY - this._container.y;
		this._container.tmp = (this._container.startIndexY + this._container.diffY);
		//FIXME: hardcoded
		if( this._container.tmp < 40 ){this._container.tmp = 40;}

		this._container.cube.style.transform   = 'translateZ(' + this._container.tmp + 'px)';
		this._container.cube_right.style.width = this._container.tmp + 'px';
		this._container.cube_left.style.height = this._container.tmp + 'px';
	};
	_cube.prototype.height_mouseup = function(e){
		e.preventDefault();
		e.stopPropagation();

		/* Save last position to allow resume */
		this._container.startIndexY = this._container.tmp;

		removeEventListener('mousemove',this._container.handlerHeightMouseMove,false);
		removeEventListener('mouseup',  this._container.handlerHeightMouseUp,false);
	};
	/* END-Height */
	/* INI-Left side */
	_cube.prototype.right_mousedown = function(e){
		if ( e.button === 1 ) {return false;}

		e.preventDefault();
		e.stopPropagation();
		var ths = this;
		this._container.startX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
		this._container.startY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
		if( !this._container.startIndexR ){
			//FIXME: hardcoded
			this._container.startIndexR = 40;
		}

		if( !('handlerRightMouseMove' in this._container) ){
			this._container.handlerRightMouseMove = function(e){ths.right_mousemove(e);}
			this._container.handlerRightMouseUp   = function(e){ths.right_mouseup(e);}
		}

		addEventListener('mousemove',this._container.handlerRightMouseMove,false);
		addEventListener('mouseup',  this._container.handlerRightMouseUp,false);
		//addEventListener('touchmove',this.panel.handlerHeightMouseMove,false);
		//addEventListener('touchend', this.panel.handlerHeightMouseUp,false);
		//addEventListener('touchstop',this.panel.handlerHeightMouseUp,false);
	};
	_cube.prototype.right_mousemove = function(e){
		e.stopPropagation();

		this._container.x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
		this._container.y = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
		this._container.diffX = this._container.x - this._container.startX;
		this._container.tmp = (this._container.startIndexR + this._container.diffX);
		//FIXME: hardcoded
		if( this._container.tmp < 10 ){this._container.tmp = 10;}

		this._container.perspective.style.width = this._container.tmp + 'px';
		this._container.cube.style.width = this._container.tmp + 'px';
		this._container.cube_right.style.transformOrigin = this._container.tmp + 'px 0';
		this._container.cube_right.style.transform       = 'rotateY(90deg) translateX(' + this._container.tmp + 'px)';
		this._container.cube_left.style.width            = this._container.tmp + 'px';
	};
	_cube.prototype.right_mouseup = function(e){
		e.preventDefault();
		e.stopPropagation();

		/* Save last position to allow resume */
		this._container.startIndexR = this._container.tmp;

		removeEventListener('mousemove',this._container.handlerRightMouseMove,false);
		removeEventListener('mouseup',  this._container.handlerRightMouseUp,false);
	};
	/* END-Left side */
	/* INI-Right side */
	_cube.prototype.left_mousedown = function(e){
		if ( e.button === 1 ) {return false;}

		e.preventDefault();
		e.stopPropagation();
		var ths = this;
		this._container.startX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
		this._container.startY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
		if( !this._container.startIndexL ){
			//FIXME: hardcoded
			this._container.startIndexL = 40;
		}

		if( !('handlerLeftMouseMove' in this._container) ){
			this._container.handlerLeftMouseMove = function(e){ths.left_mousemove(e);}
			this._container.handlerLeftMouseUp   = function(e){ths.left_mouseup(e);}
		}

		addEventListener('mousemove',this._container.handlerLeftMouseMove,false);
		addEventListener('mouseup',  this._container.handlerLeftMouseUp,false);
		//addEventListener('touchmove',this.panel.handlerHeightMouseMove,false);
		//addEventListener('touchend', this.panel.handlerHeightMouseUp,false);
		//addEventListener('touchstop',this.panel.handlerHeightMouseUp,false);
	};
	_cube.prototype.left_mousemove = function(e){
		e.stopPropagation();

		this._container.x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
		this._container.y = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
		this._container.diffX = this._container.startX - this._container.x;
		this._container.tmp = (this._container.startIndexL + this._container.diffX);
		//FIXME: hardcoded
		if( this._container.tmp < 10 ){this._container.tmp = 10;}

		this._container.perspective.style.height = this._container.tmp + 'px';
		this._container.cube.style.height = this._container.tmp + 'px';
		this._container.cube_left.style.transformOrigin = '0 ' + this._container.tmp + 'px';
		this._container.cube_left.style.transform       = 'rotateX(-90deg) translateY(' + this._container.tmp + 'px)';
		this._container.cube_right.style.height         = this._container.tmp + 'px';
	};
	_cube.prototype.left_mouseup = function(e){
		e.preventDefault();
		e.stopPropagation();

		/* Save last position to allow resume */
		this._container.startIndexL = this._container.tmp;

		removeEventListener('mousemove',this._container.handlerLeftMouseMove,false);
		removeEventListener('mouseup',  this._container.handlerLeftMouseUp,false);
	};
	/* END-Right side */



	_cube.prototype.angle_mousedown = function(e){
		if ( e.button === 1 ) {return false;}

		e.preventDefault();
		e.stopPropagation();
		var ths = this;
		this._container.startX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
		this._container.startY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
		if( !this._container.startIndexA ){
			//FIXME: hardcoded
			this._container.startIndexA = 45;
		}

		if( !('handlerAngleMouseMove' in this._container) ){
			this._container.handlerAngleMouseMove = function(e){ths.angle_mousemove(e);}
			this._container.handlerAngleMouseUp   = function(e){ths.angle_mouseup(e);}
		}

		addEventListener('mousemove',this._container.handlerAngleMouseMove,false);
		addEventListener('mouseup',  this._container.handlerAngleMouseUp,false);
		//addEventListener('touchmove',this.panel.handlerMouseMove,false);
		//addEventListener('touchend', this.panel.handlerMouseUp,false);
		//addEventListener('touchstop',this.panel.handlerMouseUp,false);
	};
	_cube.prototype.angle_mousemove = function(e){
		e.stopPropagation();

		this._container.x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
		this._container.y = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
		this._container.diffX = this._container.startX - this._container.x;
		this._container.tmp = (this._container.startIndexA + this._container.diffX);
		if( this._container.tmp < 0 ){this._container.tmp = 0;}
		if( this._container.tmp > 90 ){this._container.tmp = 90;}

		this._container.perspective.style.transform = 'rotateX(25deg) rotateZ(' + this._container.tmp + 'deg)';
	};
	_cube.prototype.angle_mouseup = function(e){
		e.preventDefault();
		e.stopPropagation();

		/* Save last position to allow resume */
		this._container.startIndexA = this._container.tmp;

		removeEventListener('mousemove',this._container.handlerAngleMouseMove,false);
		removeEventListener('mouseup',  this._container.handlerAngleMouseUp,false);
	};
