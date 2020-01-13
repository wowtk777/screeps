var worldStrategy = require('world.strategy');
var roomUtils = require('room.utils');
var harvester = require('creep.harvester');
var upgrader = require('creep.upgrader');
var builder = require('creep.builder');

const creepRoles = {
    'HARVESTER': harvester,
    'UPGRADER': upgrader,
    'BUILDER': builder,
}

const cleenupMemory = function () {
    for (let creepName in Memory.creeps) {
        if (!(creepName in Game.creeps)) {
            delete Memory.creeps[creepName]
        }
    }

    for (let roomName in Memory.rooms) {
        if (roomName in Game.rooms) {
            if ('preferences' in Memory.rooms[roomName]) {
                delete Memory.rooms[roomName]['preferences']
            }
        } else {
            delete Memory.rooms[roomName]
        }
    }

}

module.exports.loop = function () {
    cleenupMemory()
    const roomDescriptions = {}
    for (let name in Game.rooms) {
        const roomDescription = roomUtils.buildRoomDescription(Game.rooms[name])
        roomDescriptions[name] = roomDescription
        worldStrategy.strategyCommon(Game.rooms[name], roomDescription)
    }

    for (let creepKey in Game.creeps) {
        const creep = Game.creeps[creepKey]
        creepRoles[creep.memory.role].doStep(creep, roomDescriptions[creep.room.name])
    }
}