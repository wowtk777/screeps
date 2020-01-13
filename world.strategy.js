/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('world.strategy');
 * mod.thing == 'a thing'; // true
 */

var creepModel = require('creep.model');
var roomUtils = require('room.utils');
var roomInfrastructure = require('room.infrastructure');

var calculateRequiredUpgraders = function (controllerLevel) {
    switch (controllerLevel) {
        case 0:
        case 1:
        case 8:
            return 1
        default:
            return 2
    }
}

var calculateRequiredBuilders = function (room) {
    var count = room.find(FIND_MY_CONSTRUCTION_SITES).length + room.find(FIND_STRUCTURES, { filter: roomInfrastructure.maintainedStructureFilter }).length
    if (count > 1) {
        return Math.max(2, count / 20) + 0.5
    }
    return 0
}

module.exports = {
    strategyCommon: function (room, roomDescription) {
        roomInfrastructure.buildInfrastructure(room)
        const strategies = [this.strategy01, this.strategy02, this.strategy03, this.strategy04, this.strategy05, this.strategyLast]
        for (var i in strategies) {
            if (strategies[i](room, roomDescription)) {
                break
            }
        }
    },
    strategy01: function (room, roomDescription) {
        if (roomDescription.controllerLevel > 1) {
            return false
        }
        room.memory.strategy = { code: "01" }

        if (roomDescription.creepsByRole.UPGRADER.length == 0) {
            creepModel.spawnBySpawner('HW01', 'UPGRADER', roomUtils.findFreeSpawner(room))
            return true
        }

        if (roomDescription.creepsByRole.HARVESTER.length == 0) {
            creepModel.spawnBySpawner('HW01', 'HARVESTER', roomUtils.findFreeSpawner(room))
            return true
        }

        return true
    },
    strategy02: function (room, roomDescription) {
        // TODO Убрать
        if (roomDescription.controllerLevel > 8) {
            return false
        }

        var harvesterCondition = roomDescription.creepsByRole.HARVESTER.length < 2
        var upgraderCondition = roomDescription.creepsByRole.UPGRADER.length < calculateRequiredUpgraders(roomDescription.controllerLevel)
        var builderCondition = roomDescription.creepsByRole.BUILDER.length < calculateRequiredBuilders(room)

        if (!harvesterCondition && !upgraderCondition && !builderCondition) {
            return false
        }

        room.memory.strategy = { code: "02" }

        if (upgraderCondition || harvesterCondition) {
            creepModel.spawnBySpawner(creepModel.selectMostPowerfulModel(room.energyAvailable, 'HW'), upgraderCondition ? 'UPGRADER' : 'HARVESTER', roomUtils.findFreeSpawner(room))
            return true
        }

        if (builderCondition) {
            creepModel.spawnBySpawner(creepModel.selectMostPowerfulModel(room.energyAvailable, 'BD'), 'BUILDER', roomUtils.findFreeSpawner(room))
            return true
        }

        return true
    },
    strategy03: function (room, roomDescription) {
        return false
    },
    strategy04: function (room, roomDescription) {
        return false
    },
    strategy05: function (room, roomDescription) {
        return false
    },
    strategyLast: function (room, roomDescription) {
        room.memory.strategy = { code: "last" }
        return true
    }
};