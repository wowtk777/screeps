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

                let structures = creep.room.find(FIND_MY_STRUCTURES)
                let structureFound = false
                for (var structureIndex in structures) {
                    let structure = structures[structureIndex]
                    if (structure.store != undefined && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                        if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(structure, { visualizePathStyle: { stroke: '#fff' } });
                        }
                        structureFound = true
                        break
                    }
                }

                if (!structureFound) {
                    creepBehaviour.upgrade(creep, doHarvest, roomDescription)
                }
                break
            default:
                creep.memory['state'] = 'HARVEST'
                break;
        }
    }
};