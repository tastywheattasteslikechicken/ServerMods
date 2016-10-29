module.exports = function (config) {
    if (config.engine) {
		let C = config.engine.driver.constants;
		let old = config.engine.onProcessObject;
        config.engine.onProcessObject = function(object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk) {
            if (object.type !== 'controller' || !object.user) {
				if (old) {
					return old.call(this, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk);
				}
				return true;
			}
			
			userBulk.update(object.user, {
				gcl:  1172218692 //This is enough for GCL20
			});
			
			if (old) {
				return old.call(this, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk);
			}
			return true;
        }
    }
};