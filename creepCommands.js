var _ = require('lodash');

function processRepairCommand(config, message, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk) {
	//We need to implement this command:
	//						0123456789
	//Repair				rxxyy NNNN	Repairs all structures at the given co-ord by NNNN.
	
	if (!message.startsWith('r') || message.length <= 6) {
		return;
	}
	let xStr = message.substr(1, 2);
	let yStr = message.substr(3, 2);
	let x = parseInt(xStr), y = parseInt(yStr);
	if (!x || !y || x >= 50 || y >= 50 || x < 0 || y < 0) {
		return;
	}
	
	if (message[5] !== ' ') {
		return;
	}
	
	let numberStr = message.substr(6);
	let repairAmount = parseNumber(numberStr);
	if (isNaN(repairAmount)) {
		return;
	}
	
	console.log('Command accepted: repair @ ' + roomInfo._id + ' ' + x + ',' + y + ' for ' + repairAmount + ' hits');
	
	//Ok, let's do this.
	let C = config.engine.driver.constants;
    let targets = _.filter(roomObjects, obj => obj.x === x && obj.y === y );
	for (let i = 0; i < targets.length; i++) {
		let target = targets[i];
		if (!C.CONSTRUCTION_COST[target.type]) {
			continue;
		}
		
		let newHits = Math.min(target.hitsMax, target.hits + repairAmount);
		if (newHits !== target.hits) {
			target.hits = newHits;
			bulk.update(target, { hits: newHits });
		}
	}
	return true;
}

function processWallCommand(config, message, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk) {
	//We need to implement this command:
	//						0123456789
	//Build walls			wall NNNN	Sets all walls in the current room to NNNN health
	//Build walls			wall+NNNN	Adds NNNN health to all walls in the current room
	
	if (!message.startsWith('wall') || message.length <= 5) {
		return;
	}
	
	if (message[4] !== ' ' && message[4] !== '+') {
		return;
	}
	
	let add = message[4] === '+';
	let numberStr = message.substr(5);
	let repairAmount = parseNumber(numberStr);
	if (isNaN(repairAmount)) {
		return;
	}
	
	console.log('Command accepted: ' + (add ? 'add ' + repairAmount + ' hits to walls' : 'set walls to' + repairAmount + ' hits') + ' in ' + roomInfo._id);
	
	//Ok, let's do this.
	let C = config.engine.driver.constants;
    let targets = _.filter(roomObjects, obj => obj.type === 'constructedWall' || obj.type === 'rampart');
	for (let i = 0; i < targets.length; i++) {
		let target = targets[i];
		let newHits = Math.min(target.hitsMax, add ? target.hits + repairAmount : repairAmount);
		if (newHits !== target.hits) {
			target.hits = newHits;
			bulk.update(target, { hits: newHits });
		}
	}
	return true;
}

function processUpgradeCommand(config, message, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk) {
	//Upgrade Controller	upgrade L	Upgrades (or downgrades) the controll to the given level.			
	if (!message.startsWith('upgrade ')) {
		return;
	}
	
	let rest = message.substr('upgrade ');
	let level = parseInt(rest);
	if (isNaN(level)) {
		return;
	}
	
	console.log('Command accepted: change controller @ ' + roomInfo._id + ' to level ' + level);
	_.filter(roomObjects, obj => obj.type === 'controller').forEach(controller => {
		if (controller.level) {
			//We need to claim the controller too.
			
		}
		
		bulk.update({
			level: controller.level = level
		});
	});
}

var invaderCount = 0;
function spawnCreep(body, x, y, room, owner) {

    var body = [], energyCapacity = 0;

    intent.body.forEach((i) => {
        if(_.contains(C.BODYPARTS_ALL, i)) {
            body.push({
                type: i,
                hits: 100
            });
        }

        if(i == C.CARRY)
            energyCapacity += C.CARRY_CAPACITY;
    });

    var creep = {
        name: 'invader_' + (invaderCount++),
        x: x,
        y: y,
        body,
        energy: 0,
        energyCapacity,
        type: 'creep',
        room: room,
        user: user,
        hits: body.length * 100,
        hitsMax: body.length * 100,
        spawning: false,
        fatigue: 0,
        notifyWhenAttacked: true
    };

    bulk.insert(creep);
}

function spawnInvaders() {
}

function parseInvaderList(list) {
	
}

function processInvaderCommand(config, message, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk) {
	
}

function parseNumber(numberStr) {
	let amount = parseFloat(numberStr);
	if (isNaN(amount)) {
		return NaN;
	}
	
	if (numberStr.toLowerCase().endsWith('k')) {
		amount *= 1000;
	}
	if (numberStr.toLowerCase().endsWith('m')) {
		amount *= 1000000;
	}
	return amount;
}


function processFillCommand(config, message, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk) {
	if (!message.startsWith('fill ')) {
		return;
	}
	
	let rest = message.substr('fill '.length);
	if (rest === 'spawn') {
		console.log('Command accepted: fill spawn @ ' + roomInfo._id);
		_.filter(roomObjects, obj => obj.type === 'spawn' || obj.type === 'extension').forEach(obj => {
			if (obj.energyCapacity && obj.energy !== obj.energyCapacity) {
				bulk.update(obj, {
					energy: obj.energyCapacity
				});
			}
		});
	} else if (rest === 'tower') {
		console.log('Command accepted: fill towers @ ' + roomInfo._id);
		_.filter(roomObjects, obj => obj.type === 'tower').forEach(obj => {
			if (obj.energyCapacity && obj.energy !== obj.energyCapacity) {
				bulk.update(obj, {
					energy: obj.energyCapacity
				});
			}
		});
	} else {
		let xStr = rest.substr(0, 2);
		let yStr = rest.substr(2, 2);
		
		let x = parseInt(xStr), y = parseInt(yStr);
		if (!x || !y || x >= 50 || y >= 50 || x < 0 || y < 0) {
			return;
		}
		console.log('Command accepted: fill objects @ ' + roomInfo._id + ' ' + x + ',' + y);
		
		let C = config.engine.driver.constants;
		_.filter(roomObjects, obj => obj.x === x && obj.y === y).forEach(obj => {
			let carry = _.sum(C.RESOURCES_ALL, i => typeof obj[i] == 'object' ? obj[i].amount : (obj[i] || 0));
			let capacity = obj.energyCapacity;
			obj.energy += (capacity - carry);
			bulk.update(obj, {
				energy: obj.energy
			});
		});
	}
}

function processKillCommand(config, message, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk) {
	if (!message.startsWith('kill ')) {
		return;
	}
	
	let rest = message.substr('kill '.length);
	let xStr = rest.substr(0, 2);
	let yStr = rest.substr(2, 2);
	
	let x = parseInt(xStr), y = parseInt(yStr);
	if (isNaN(x) || isNaN(y) || x >= 50 || y >= 50 || x < 0 || y < 0) {
		return;
	}
	
	console.log('Command accepted: kill objects @ ' + roomInfo._id + ' ' + x + ',' + y);
	_.filter(roomObjects, obj => obj.x === x && obj.y === y).forEach(obj => {
		bulk.remove(obj._id);
		delete roomObjects[obj._id];
	});
}

function processMineralCommand(config, message, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk) {
	//						0123456789
	//Mineral Regen			mnrl regen	Regenerates a mineral to 70k
	//Mineral Regen			mnrl NNNNN	Regenerates a mineral to the given amount
	//Change Mineral		mnrl M		Changes the current room's mineral to M. Can be a tier 3 mineral.
	
	if (!message.startsWith('mnrl ')) {
		return;
	}
	
	let C = config.engine.driver.constants;
	
	let rest = message.substr('mnrl '.length);
	let minerals = _.filter(roomObjects, obj => obj.type === 'mineral');
	if (rest === 'regen') {
		console.log('Command accepted: change mineral amount to 70000 @ ' + roomInfo._id);
		minerals.forEach(m => {
			m.mineralAmount = 70000;
			bulk.update(m, {
				mineralAmount: 70000
			});
		});
	} else if (_.contains(C.RESOURCES_ALL, rest)) {
		console.log('Command accepted: change mineral type to ' + rest + ' @ ' + roomInfo._id);
		minerals.forEach(m => {
			m.mineralType = rest;
			bulk.update(m, {
				mineralType: rest
			});
		});
	} else {
		let numberStr = message.substr(5);
		let amount = parseNumber(numberStr);
		
		console.log('Command accepted: change mineral amount to ' + amount + ' @ ' + roomInfo._id);
		minerals.forEach(m => {
			m.mineralAmount = amount;
			bulk.update(m, {
				mineralAmount: amount
			});
		});
	}	
}

function processKillCommand(config, message, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk) {
	if (!message.startsWith('template')) {
		return;
	}
	
	let templateName = message.substr('template '.length);
	//Object is our creep
	
	
	let x = parseInt(xStr), y = parseInt(yStr);
	if (isNaN(x) || isNaN(y) || x >= 50 || y >= 50 || x < 0 || y < 0) {
		return;
	}
	
	console.log('Command accepted: kill objects @ ' + roomInfo._id + ' ' + x + ',' + y);
	_.filter(roomObjects, obj => obj.x === x && obj.y === y).forEach(obj => {
		bulk.remove(obj._id);
		delete roomObjects[obj._id];
	});
}



function processCommand(config, message, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk) {
	//Here are the commands we support:
	//NNNNN:
	//
	//IIIIIIII:	(Caps for boosted, 3 suffix for t3 boosted)
	//	H	Small healer	L	Large healer
	//	R	Small ranged	K	Large ranged
	//	M	Small melee		U	Large melee
	//	S	Source Keeper
	//
	//Resource Table:
	//	When a resource isn't spelled out in full (5 chars), R is the base-26 index of the resource in RESOURCES_ALL
	//	(Base 26 -- 'a' is 0, 'b' is 1, 'c' is 2, etc.
	
	//						0123456789
	//Repair				rxxyy NNNN	Repairs all structures at the given co-ord by NNNN.					Implemented
	//Upgrade Controller	upgrade L	Upgrades (or downgrades) the controll to the given level.			
	//Safemode				safemode +	Activates safemode in the current room (does not use an activation)	
	//Safemode				safemode -	Deactivates safemode in the current room (no cooldown)				
	//Safemode				safemode+N	Adds N additional safemode activations.								
	//Safemode				safemode N	Sets available safemode activations to N.							
	//Safemode				safemode+C	Begins a safemode cooldown in the current room						
	//Safemode				safemode C	Ends a safemode cooldown in the current room						
	//Kill Target			kill XXYY	Destroys the given creep or structure at the given position			Implemented
	//Mineral Regen			mnrl regen	Regenerates a mineral to 70k										Implemented
	//Mineral Regen			mnrl NNNNN	Regenerates a mineral to the given amount							Implemented
	//Change Mineral		mnrl MMMMM	Changes the current room's mineral to M								Implemented
	//Boost creep			bMMMMMXXYY	Boosts the creep at the given location with the given mineral		
	//Spawn Invaders		i IIIIIIII	Spawns invaders in the current room, up to 8.
	//Fill towers/spawns	fill spawn	Fills all spawns & extensions in the room							Implemented
	//Fill towers/spawns	fill tower	Fills all towers in the current room								Implemented
	//Fill objects			fill xxyy	Fills all objects at XX YY with energy								Implemented
	//Add energy to object	fxxyy NNNN	Adds NNNN energy to objects at XX YY								
	//Add res to object		fxxyyRNNNN	Adds NNNN R to objects at XX YY										
	//Build walls			wall NNNNN	Sets all walls in the current room to NNNN health					Implemented
	//Build walls			wall+NNNNN	Adds NNNN health to all walls in the current room					Implemented
	//Attack/Injure			aXXYYNNNNN	Deals NNNN damage to all objects at XXYY							
	//Creep spawning		template T	Saves the current creep as template	T.								
	//Creep spawning		spawnTXXYY	Spawns the given template at the given location.					
	
	processRepairCommand(config, message, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk);
	processUpgradeCommand(config, message, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk);
	processInvaderCommand(config, message, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk);
	processFillCommand(config, message, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk);
	processKillCommand(config, message, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk);
	processWallCommand(config, message, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk);
	processMineralCommand(config, message, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk);
	
}

function getCreepMessage(config, creep) {
	if (!creep || !creep._actionLog || !creep._actionLog.say || !creep._actionLog.say.message) {
		return;
	}
	return creep._actionLog.say.message;
}

module.exports = function (config) {
    if (config.engine) {
		let C = config.engine.driver.constants;
		let old = config.engine.onProcessObject;
        config.engine.onProcessObject = function(object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk) {
			let message;
            if (object.type !== 'creep' || !(message = getCreepMessage(config, object, roomInfo._id))) {
				if (old) {
					return old.call(this, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk);
				}
				return true;
			}
			
			//console.log('Found creep saying ' + message);
			
			processCommand(config, message, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk);
			
			if (old) {
				return old.call(this, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk);
			}
			return true;
        }
    }
};