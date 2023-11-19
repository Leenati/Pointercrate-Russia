const { trophy } = require('../resource.json');

module.exports = { 
	getTrophy(type, position) {
		if (!trophy.hasOwnProperty(type))
			return null;
	
		for (let i = 0; i < trophy[type].tops.length; i++)
			if (position <= trophy[type].tops[i])
				return trophy[type].trophys[i];
		return trophy[type].default;
	} 
};