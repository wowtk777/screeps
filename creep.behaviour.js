/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('creep.behaviour');
 * mod.thing == 'a thing'; // true
 */

const utilsPos = require('utils.pos')

const serializeTarget = function (target, ttl) {
    if (target && target.id) {
        return { id: target.id, pos: utilsPos.packRoomPosition(target.pos), ttl: (ttl === undefined ? null : ttl) }
    }
    return null
}

const deserializeTarget = function (target) {
    if (target && target.id) {
        return Game.getObjectById(target.id)
    }

    return null
}

const deserializeTargetRoomPosition = function (target) {
    if (target && target.pos) {
        return utilsPos.unpackRoomPosition(target.pos)
    }

    return null
}

const selectSource = function (creep, roomDescription) {
    // console.log('roomDescription', JSON.stringify(roomDescription))
    if (creep.memory.target && creep.memory.target.id && (creep.memory.target.id in roomDescription.sources)) {
        let target = creep.memory.target
        return Game.getObjectById(target.id)
    }

    const wrongStructureIds = new Set()

    while (true) {
        const nearestSource = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE, {
            filter: function (structure) {
                return !wrongStructureIds.has(structure.id)
            }
        })

        if (!nearestSource) {
            console.log("No source for creep", creep.name)
            return null
        }

        let pretendentsCount = 0
        for (let creepName in Game.creeps) {
            const creepMemory = Game.creeps[creepName].memory
            if (creepMemory.target && creepMemory.target.id == nearestSource.id) {
                pretendentsCount++
            }
        }

        if (pretendentsCount >= roomDescription.sources[nearestSource.id].countOfEntrances) {
            wrongStructureIds.add(nearestSource.id)
        } else {
            return nearestSource
        }
    }
}

module.exports = {
    harvest: function (creep, callback, roomDescription) {
        var source = selectSource(creep, roomDescription)

        const target = creep.memory['target']
        if (target && target.id == source.id && target.ttl) {
            target.ttl--
        } else {
            creep.memory['target'] = serializeTarget(source, 5)
        }


        if (creep.store.getFreeCapacity() <= 0) {
            callback(creep)
            return
        }
        if (source) {
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                if (ERR_NO_PATH == creep.moveTo(source, { visualizePathStyle: { stroke: '#f80' } })) {
                    delete creep.memory['target']
                    creep.say("No path")
                }
            }
        } else {
            creep.say("Awaiting source")
        }
    },
    upgrade: function (creep, callback, roomDescription) {
        if (creep.store.getUsedCapacity() <= 0) {
            callback(creep)
            return
        }

        if (creep.memory.target) {
            delete creep.memory.target
        }

        var structure = creep.room.controller
        if (creep.upgradeController(structure) == ERR_NOT_IN_RANGE) {
            creep.moveTo(structure, { visualizePathStyle: { stroke: '#0ff' } });
        }
    },

};