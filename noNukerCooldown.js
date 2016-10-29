module.exports = function (config) {
    if (config.engine) {
		let C = config.engine.driver.constants;
		let old = config.engine.onProcessObject;
        config.engine.onProcessObject = function(object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk) {
            if (object.type !== 'nuker') {
				if (old) {
					return old.call(this, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk);
				}
				return true;
			}
			
			object.energy = object.energyCapacity;
			object.G = object.GCapacity;
			object.cooldownTime = object.gameTime;
			
			bulk.update(object, {
				energy: object.energyCapacity,
				G: object.GCapacity,
				cooldownTime: gameTime
			});
			
			if (old) {
				return old.call(this, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk);
			}
			return true;
        }
    }
};