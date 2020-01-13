/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('creep.model');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    buildParts: {
        "HW01": [WORK, CARRY, MOVE],
        "HW02": [CARRY, MOVE, WORK, CARRY, MOVE],
        "BD01": [CARRY, MOVE, WORK, CARRY, MOVE],
        "BD02": [MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE],
    },

    selectMostPowerfulModel: function (energyAvailable, series) {
        switch (series) {
            case "HW":
                if (energyAvailable >= 450)
                    return "BD02"
                return energyAvailable >= 300 ? 'HW02' : 'HW01'
            case "BD":
                return energyAvailable >= 450 ? 'BD02' : 'BD01'

        }
    },

    spawnBySpawner: function (model, role, spawner) {
        if (!spawner) {
            return ERR_BUSY
        }
        var bodyParts = this.buildParts[model]
        var name = role + '-' + model + '-' + Game.time
        return spawner.spawnCreep(bodyParts, name, { memory: { role: role, model: model } })
    }
};