module.exports = function (config) {
    if (config.engine) {
		let C = config.engine.driver.constants;
		let old = config.engine.onProcessObject;
        config.engine.onProcessObject = function(object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk) {
            if (object.type !== 'controller' || object.level === 0) {
				if (old) {
					return old.call(this, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk);
				}
				return true;
			}
			
			if (object.level !== 8) {
				//Upgrade to level 8
				object.progress = 0;
				object.level = 8;
			
				//Deactivate any active safe-mode.
				object.safeMode = null;
				object.safeModeCooldown = null;
				
				bulk.update(object, {
					level: object.level,
					progress: object.progress,
					safeMode: object.safeMode,
					safeModeCooldown: object.safeModeCooldown
				});
			} else {
				//Downgrade if required
				object.downgradeTime = gameTime + C.CONTROLLER_DOWNGRADE[object.level] + 100;
				bulk.update(object, {
					downgradeTime: object.downgradeTime
				});
			}
			
			
			if (old) {
				return old.call(this, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk);
			}
			return true;
        }
    }
};