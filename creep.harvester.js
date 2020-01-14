/*
 * Module 'creep.harvester'
 */

var creepBehaviour = require('creep.behaviour')

module.exports = {
    doStep: function (creep, roomDescription) {
        let doHarvest = function (creep) {
            creep.memory.state = 'HARVEST'
            creep.say('⛏ harvest')
        }
        switch (creep.memory.state) {
            case 'HARVEST':
                creepBehaviour.harvest(creep, function (creep) {
                    creep.memory.state = 'UNLOAD'
                    creep.say('🚛 unload')
                }, roomDescription)
                break
            case 'UNLOAD':
                if (creep.store.getUsedCapacity() <= 0) {
                    doHarvest(creep)
                    break
                }
                if (creep.memory.target) {
                    delete creep.memory.target
                }

                const structureFilter = function (structure) {
                    return structure.store && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                }
                const structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: structureFilter })

                if (structure) {
                    if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(structure, { visualizePathStyle: { stroke: '#fff' } });
                    }
                } else {
                    creepBehaviour.upgrade(creep, doHarvest, roomDescription)
                }
                break
            default:
                creep.memory['state'] = 'HARVEST'
                break;
        }
    }
};