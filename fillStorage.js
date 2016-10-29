module.exports = function (config) {
    if (config.engine) {
		let C = config.engine.driver.constants;
		let old = config.engine.onProcessObject;
        config.engine.onProcessObject = function(object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk) {
            if (object.type !== 'storage') {
				if (old) {
					return old.call(this, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk);
				}
				return true;
			}
			
			let baseQuantity = 5000;
			let tier1Quantity = 5000;
			let tier2Quantity = 10000;
			let tier3Quantity = 20000;
			let miscQuantity = 20000;
			
			let resources = {
				'energy': 300000,
				'power': 10000,
				
				'U': baseQuantity,
				'L': baseQuantity,
				'Z': baseQuantity,
				'K': baseQuantity,
				'X': baseQuantity,
				'G': baseQuantity,
				
				'ZK': miscQuantity,
				'UL': miscQuantity,
				'OH': miscQuantity,
				
				'UO': tier1Quantity,
				'LO': tier1Quantity,
				'ZO': tier1Quantity,
				'KO': tier1Quantity,
				'GO': tier1Quantity,
				
				'UH': tier1Quantity,
				'LH': tier1Quantity,
				'ZH': tier1Quantity,
				'KH': tier1Quantity,
				'GH': tier1Quantity,
				
				'UHO2': tier2Quantity,
				'LHO2': tier2Quantity,
				'ZHO2': tier2Quantity,
				'KHO2': tier2Quantity,
				'GHO2': tier2Quantity,
				
				'UH2O': tier2Quantity,
				'LH2O': tier2Quantity,
				'ZH2O': tier2Quantity,
				'KH2O': tier2Quantity,
				'GH2O': tier2Quantity,
				
				'XUHO2': tier3Quantity,
				'XLHO2': tier3Quantity,
				'XZHO2': tier3Quantity,
				'XKHO2': tier3Quantity,
				'XGHO2': tier3Quantity,
				
				'XUH2O': tier3Quantity,
				'XLH2O': tier3Quantity,
				'XZH2O': tier3Quantity,
				'XKH2O': tier3Quantity,
				'XGH2O': tier3Quantity,
			};
			for (let resource in resources) {
				object[resource] = resources[resource];
			}
			
			bulk.update(object, resources);
			
			if (old) {
				return old.call(this, object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, userBulk);
			}
			return true;
        }
    }
};