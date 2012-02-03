Pilot.UI = OZ.Class().extend(Pilot);

Pilot.UI.prototype.init = function(game, ship, name) {
	Pilot.prototype.init.call(this, game, ship, name);
	OZ.Event.add(window, "keydown", this._keydown.bind(this));
	OZ.Event.add(window, "keyup", this._keyup.bind(this));
}

Pilot.UI.prototype._keydown = function(e) {
	switch (e.keyCode) {
		case 17:
			this._control.fire = true;
		break;
		case 37:
			this._control.torque.mode = 2;
			this._control.torque.target = -Infinity;
		break;
		case 39:
			this._control.torque.mode = 2;
			this._control.torque.target = +Infinity;
		break;
		
		case 38:
			this._control.engine = 1;
		break;
		case 40:
			this._control.engine = -1;
		break;
		
	}
}

Pilot.UI.prototype._keyup = function(e) {
	switch (e.keyCode) {
		case 17:
			this._control.fire = false;
		break;
		
		case 37:
		case 39:
			this._control.torque.mode = 0;
		break;
		
		case 38:
		case 40:
			this._control.engine = 0;
		break;
		
	}
}
