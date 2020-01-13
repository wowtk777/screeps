/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('creep.builder');
 * mod.thing == 'a thing'; // true
 */

var creepBehaviour = require('creep.behaviour')

module.exports = {
    doStep: function (creep, roomDescription) {
        switch (creep.memory.state) {
            case 'HARVEST':
                creepBehaviour.harvest(creep, function (creep) {
                    creep.memory.state = 'BUILD'
                    creep.say('🏗 build')
                }, roomDescription)
                break
            case 'BUILD':
                if (creep.store.getUsedCapacity() <= 0) {
                    creep.memory.state = 'HARVEST'
                    creep.say('⛏ harvest')
                    break
                }

                if (creep.memory.target) {
                    delete creep.memory.target
                }

                var sites = creep.room.find(FIND_STRUCTURES, {
                    filter: function (s) {
                        if (!s.my && s.structureType != STRUCTURE_ROAD && s.structureType != STRUCTURE_WALL) {
                            return false
                        }

                        if (!s.hitsMax || s.hits > 15000) {
                            return false
                        }

                        return (s.hitsMax > s.hits)
                    }
                })
                if (sites.length > 0) {
                    var site = sites[0]
                    if (creep.repair(site) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(site, { visualizePathStyle: { stroke: '#08f' } });
                    }
                } else {
                    sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES)
                    if (sites.length > 0) {
                        var site = sites[0]
                        if (creep.build(site) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(site, { visualizePathStyle: { stroke: '#08f' } });
                        }
                    }
                }
                break
            default:
                creep.memory['state'] = 'HARVEST'
                break;
        }
    },

};