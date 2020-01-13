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
                    delete creep.memory.buildTarget
                    creep.memory.state = 'HARVEST'
                    creep.say('⛏ harvest')
                    break
                }

                let buildTarget = creep.memory.buildTarget
                var site = null
                if (buildTarget && buildTarget.ttl > 0) {
                    buildTarget.ttl--
                    site = Game.getObjectById(buildTarget.id)
                } else {
                    const reservedSitesId = new Set(Object.values(Game.creeps).filter(function (c) {
                        return c!= creep && c.memory.buildTarget && c.memory.buildTarget.id
                    }).map(function (creep) {
                        return creep.memory.buildTarget.id
                    }))
                    let sites = creep.room.find(FIND_STRUCTURES, {
                        filter: function (s) {
                            if (reservedSitesId.has(s.id)) {
                                return false
                            }

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
                        site = sites[0]
                        buildTarget = { id: site.id, type: 'repair', ttl: 5 }
                    } else {
                        sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES)
                        if (sites.length > 0) {
                            site = sites[0]
                            buildTarget = { id: site.id, type: 'build', ttl: 5 }
                        }
                    }
                }

                if (site) {
                    creep.memory.buildTarget = buildTarget
                    switch (buildTarget.type) {
                        case 'repair':
                            if (creep.repair(site) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(site, { visualizePathStyle: { stroke: '#08f' } });
                            }
                            break
                        case 'build':
                            if (creep.build(site) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(site, { visualizePathStyle: { stroke: '#08f' } });
                            }
                            break
                    }
                } else {
                    delete creep.memory.buildTarget
                }
                break
            default:
                creep.memory['state'] = 'HARVEST'
                break;
        }
    },

};