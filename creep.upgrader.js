/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('creep.upgrader');
 * mod.thing == 'a thing'; // true
 */

var creepBehaviour = require('creep.behaviour')

module.exports = {
    doStep: function (creep, roomDescription) {
        var sources = creep.room.find(FIND_SOURCES_ACTIVE)
        var source = sources[0]
        switch (creep.memory.state) {
            case 'HARVEST':
                creepBehaviour.harvest(creep, function (creep) {
                    creep.memory.state = 'UPGRADE'
                    creep.say('🧬upgrade')
                }, roomDescription)
                break
            case 'UPGRADE':
                creepBehaviour.upgrade(creep, function (creep) {
                    creep.memory.state = 'HARVEST'
                    creep.say('⛏ harvest')
                }, roomDescription)
                break
            default:
                creep.memory['state'] = 'HARVEST'
                break;
        }
    },

};