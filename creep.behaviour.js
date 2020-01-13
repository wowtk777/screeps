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

const selectSource = function (creep, roomDescription, targetExtractor) {
    // console.log('roomDescription', JSON.stringify(roomDescription))
    const creepTarget = targetExtractor(creep)
    if (creepTarget && creepTarget.id && creepTarget.ttl > 0 && (creepTarget.id in roomDescription.sources)) {
        return { source: Game.getObjectById(creepTarget.id), cached: true }
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
            return { source: null }
        }

        const pretendentsCount = Object.values(Game.creeps).filter(function (creep) {
            const creepTarget = targetExtractor(creep)
            return creepTarget && creepTarget.id == nearestSource.id
        }).lenght

        if (pretendentsCount >= roomDescription.sources[nearestSource.id].countOfEntrances) {
            wrongStructureIds.add(nearestSource.id)
        } else {
            return { source: nearestSource, cached: false }
        }
    }
}

module.exports = {
    harvest: function (creep, callback, roomDescription) {
        const targetFileld = 'harvestTarget'
        const targetExtractor = function (creep) {
            return creep.memory[targetFileld]
        }
        const sourceInfo = selectSource(creep, roomDescription, targetExtractor)
        const source = sourceInfo.source

        const target = targetExtractor(creep)
        if (sourceInfo.cached) {
            target.ttl--
        } else {
            creep.memory[targetFileld] = serializeTarget(source, 5)
        }

        if (creep.store.getFreeCapacity() <= 0) {
            delete creep.memory[targetFileld]
            callback(creep)
            return
        }
        if (source) {
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                if (ERR_NO_PATH == creep.moveTo(source, { visualizePathStyle: { stroke: '#f80' } })) {
                    delete creep.memory[targetFileld]
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

        var structure = creep.room.controller
        if (creep.upgradeController(structure) == ERR_NOT_IN_RANGE) {
            creep.moveTo(structure, { visualizePathStyle: { stroke: '#0ff' } });
        }
    },

};