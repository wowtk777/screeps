/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('room.utils');
 * mod.thing == 'a thing'; // true
 */

const buildCreepsByRole = function (room) {
    let creepsByRole = {
        HARVESTER: [],
        UPGRADER: [],
        BUILDER: []
    }

    room.find(FIND_MY_CREEPS).forEach(function (creep) {
        const role = creep.memory.role
        if (creepsByRole[role] == undefined) {
            creepsByRole[role] = [creep]
        } else {
            creepsByRole[role].push(creep)
        }
    })
    return creepsByRole
}

const fetchControllerLevel = function (room) {
    if (room.controller) {
        return room.controller.level
    }
}

const buildSources = function (room) {
    return room.find(FIND_SOURCES_ACTIVE).map(function (src) {
        const countOfEntrances = room.lookAtArea(src.pos.y - 1, src.pos.x - 1, src.pos.y + 1, src.pos.x + 1, true)
            .filter(function (area) { return area.type == 'terrain' && area.terrain != 'wall' }).length
        return { id: src.id, countOfEntrances: countOfEntrances }
    }).reduce(function (acc, src) {
        acc[src.id] = src
        return acc
    }, {})
}

module.exports = {
    buildRoomDescription: function (room) {
        return {
            creepsByRole: buildCreepsByRole(room),
            controllerLevel: fetchControllerLevel(room),
            sources: buildSources(room),
        }
    },

    findFreeSpawner: function (room) {
        var spawners = room.find(FIND_MY_SPAWNS, { filter: function (spawner) { return !spawner.spawning } })
        if (spawners.length > 0) {
            return spawners[0]
        }
        return null
    },
};