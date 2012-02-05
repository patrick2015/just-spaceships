/**
 * Server-side game class
 */
Game.Server = OZ.Class().extend(Game);
Game.Server.prototype.path = "/space";
Game.Server.prototype.init = function(ws) {
	Game.prototype.init.call(this);
	
	this._ws = ws;
	this._ts = 0; /* last idle notification */
	this._clients = [];
	this._clientShips = [];
	
	this._ws.addApplication(this);
	
	/* testing ship */
	var ship = this._addShip(Ship);
	ship.getControl().engine = 1;
}

Game.Server.prototype.start = function() {
	Game.prototype.start.call(this);
	this._ts = Date.now();
	this._ws.run();
}

Game.Server.prototype.onconnect = function(client, headers) {
	this._clients.push(client);
	var state = this._getState();
	var data = {
		type: Game.MSG_CREATE,
		data: state
	}
	data = JSON.stringify(data);
	this._ws.send(client, data);
}

Game.Server.prototype.ondisconnect = function(client, code, message) {
	var index = this._clients.indexOf(client);
	if (index != -1) { this._clients.splice(index, 1); }
}

Game.Server.prototype.onmessage = function(client, data) {
	var parsed = JSON.parse(data);
	switch (parsed.type) {
		case Game.MSG_CREATE:
			for (var id in parsed.data) {
				if (id in this._ships) { /* FIXME */ continue; }
				this._addShip({id:id});
				var shipData = parsed.data[id];
				this._merge(id, shipData);
				/* FIXME zapamatovat ke klientovi */
			}
		break;
		
		case Game.MSG_CHANGE:
			for (var id in parsed.data) {
				if (!(id in this._ships)) { /* FIXME */ continue; }
				var shipData = parsed.data[id];
				this._merge(id, shipData);
			}
		break;

		default:
			alert("Unknown message type " + data.type);
		break;
	}
	
	for (var i=0;i<this._clients.length;i++) {
		var id = this._clients[i];
		this._ws.send(id, data);
	}
}

Game.Server.prototype.onidle = function() {
	this._engine.tick();
	var ts = Date.now();
	
	if (ts - this._ts > 500) { /* FIXME constant */
		this._ts = ts;
		var state = this._getState();
		var data = {
			type: Game.MSG_SYNC,
			data: state
		}
		data = JSON.stringify(data);
		for (var i=0;i<this._clients.length;i++) {
			this._ws.send(this._clients[i], data);
		}
	}
	
}

Game.Server.prototype._getState = function() {
	var obj = {};
	for (var id in this._ships) {
		var ship = this._ships[id];
		obj[id] = {
			phys: ship.getPhys(),
			control: ship.getControl(),
		}
	}
	return obj;
}

/**
 * Merge ship data with existing ship
 */
Game.Server.prototype._merge = function(id, data) {
	var ship = this._ships[id];
	if (data.control) {
		var control = ship.getControl();
		for (var p in data.control) { control[p] = data.control[p]; }
	}
	if (data.phys) {
		var phys = ship.getPhys();
		for (var p in data.phys) { phys[p] = data.phys[p]; }
	}
}