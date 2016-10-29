var _ = require('lodash');
var createdStructureCounter = 0;

function checkTerrain(terrain, x, y, mask) {
    var code = terrain instanceof Uint8Array ? terrain[y*50+x] : Number(terrain.charAt(y*50 + x));
    return (code & mask) > 0;
}

module.exports = function (config) {
    if (config.engine) {
		let C = config.engine.driver.constants;
		let old = config.engine.onProcessObject;
        config.engine.onProcessObject = function(object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk) {
            if (object.type !== 'constructionSite') {
				if (old) {
					return old.call(this, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk);
				}
				return true;
			}
			console.log('Constructing ' + object._id + '(' + object.structureType + ')');
			bulk.remove(object._id);
			
			var newObject = {
				type: object.structureType,
				x: object.x,
				y: object.y,
				room: object.room,
				notifyWhenAttacked: true
			};

			if (object.structureType == 'spawn') {
				_.extend(newObject, {
					name: object.name,
					user: object.user,
					energy: 0,
					energyCapacity: C.SPAWN_ENERGY_CAPACITY,
					hits: C.SPAWN_HITS,
					hitsMax: C.SPAWN_HITS
				});
			}

			if (object.structureType == 'extension') {
				let controller = _.filter(roomObjects, obj => obj.type === 'controller')[0];
				let energyCapacity;
				if (controller) {
					energyCapacity = C.EXTENSION_ENERGY_CAPACITY[controller.level] || 0;
				} else {
					energyCapacity = 0;
				}
				
				_.extend(newObject, {
					user: object.user,
					energy: energyCapacity,
					energyCapacity: energyCapacity,
					hits: C.EXTENSION_HITS,
					hitsMax: C.EXTENSION_HITS
				});
			}

			if (object.structureType == 'link') {
				_.extend(newObject, {
					user: object.user,
					energy: 0,
					energyCapacity: C.LINK_CAPACITY,
					cooldown: 0,
					hits: C.LINK_HITS,
					hitsMax: C.LINK_HITS_MAX
				});
			}

			if (object.structureType == 'storage') {
				_.extend(newObject, {
					user: object.user,
					energy: 0,
					energyCapacity: C.STORAGE_CAPACITY,
					hits: C.STORAGE_HITS,
					hitsMax: C.STORAGE_HITS
				});
			}

			if (object.structureType == 'rampart') {
				_.extend(newObject, {
					user: object.user,
					hits: C.RAMPART_HITS,
					hitsMax: C.RAMPART_HITS,
					nextDecayTime: gameTime + C.RAMPART_DECAY_TIME
				});
			}

			if (object.structureType == 'road') {
				var hits = C.ROAD_HITS;

				if(_.any(roomObjects, {x: object.x, y: object.y, type: 'swamp'}) ||
					checkTerrain(roomTerrain, object.x, object.y, C.TERRAIN_MASK_SWAMP)) {
					hits *= C.CONSTRUCTION_COST_ROAD_SWAMP_RATIO;
				}
				_.extend(newObject, {
					hits,
					hitsMax: hits
				});
			}

			if (object.structureType == 'constructedWall') {
				_.extend(newObject, {
					hits: C.WALL_HITS,
					hitsMax: C.WALL_HITS_MAX
				});
			}

			if (object.structureType == 'tower') {
				_.extend(newObject, {
					user: object.user,
					energy: 0,
					energyCapacity: C.TOWER_CAPACITY,
					hits: C.TOWER_HITS,
					hitsMax: C.TOWER_HITS
				});
			}

			if (object.structureType == 'observer') {
				_.extend(newObject, {
					user: object.user,
					hits: C.OBSERVER_HITS,
					hitsMax: C.OBSERVER_HITS
				});
			}

			if (object.structureType == 'extractor') {
				_.extend(newObject, {
					user: object.user,
					hits: C.EXTRACTOR_HITS,
					hitsMax: C.EXTRACTOR_HITS
				});
			}

			if (object.structureType == 'lab') {
				_.extend(newObject, {
					user: object.user,
					hits: C.LAB_HITS,
					hitsMax: C.LAB_HITS,
					mineralAmount: 0,
					cooldown: 0,
					mineralType: null,
					mineralCapacity: C.LAB_MINERAL_CAPACITY,
					energy: 0,
					energyCapacity: C.LAB_ENERGY_CAPACITY
				});
			}

			if (object.structureType == 'powerSpawn') {
				_.extend(newObject, {
					user: object.user,
					power: 0,
					powerCapacity: C.POWER_SPAWN_POWER_CAPACITY,
					energy: 0,
					energyCapacity: C.POWER_SPAWN_ENERGY_CAPACITY,
					hits: C.POWER_SPAWN_HITS,
					hitsMax: C.POWER_SPAWN_HITS
				});
			}

			if (object.structureType == 'terminal') {
				_.extend(newObject, {
					user: object.user,
					energy: 0,
					energyCapacity: C.TERMINAL_CAPACITY,
					hits: C.TERMINAL_HITS,
					hitsMax: C.TERMINAL_HITS
				});
			}

			if (object.structureType == 'container') {
				_.extend(newObject, {
					energy: 0,
					energyCapacity: C.CONTAINER_CAPACITY,
					hits: C.CONTAINER_HITS,
					hitsMax: C.CONTAINER_HITS,
					nextDecayTime: gameTime + C.CONTAINER_DECAY_TIME
				});
			}

			if (object.structureType == 'nuker') {
				_.extend(newObject, {
					user: object.user,
					energy: 0,
					energyCapacity: config.ptr ? 1 : C.NUKER_ENERGY_CAPACITY,
					G: 0,
					GCapacity: config.ptr ? 1 : C.NUKER_GHODIUM_CAPACITY,
					hits: C.NUKER_HITS,
					hitsMax: C.NUKER_HITS,
					cooldownTime: gameTime + (config.ptr ? 100 : C.NUKER_COOLDOWN)
				});
			}

			bulk.insert(newObject);
			if (old) {
				return old.call(this, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk);
			}
			return true;
        }
    }
};