/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('room.infrastructure');
 * mod.thing == 'a thing'; // true
 */

const roads = require('room.infrastructure.roads')
const utilsPos = require('utils.pos')

const codeStructures = {
    "$": STRUCTURE_SPAWN,
    "E": STRUCTURE_EXTENSION,
    "R": STRUCTURE_ROAD,
    "W": STRUCTURE_WALL,
    "D": STRUCTURE_RAMPART,
    "l": STRUCTURE_KEEPER_LAIR,
    "P": STRUCTURE_PORTAL,
    "@": STRUCTURE_CONTROLLER,
    "I": STRUCTURE_LINK,
    "S": STRUCTURE_STORAGE,
    "T": STRUCTURE_TOWER,
    "O": STRUCTURE_OBSERVER,
    "B": STRUCTURE_POWER_BANK,
    "*": STRUCTURE_POWER_SPAWN,
    "X": STRUCTURE_EXTRACTOR,
    "L": STRUCTURE_LAB,
    "T": STRUCTURE_TERMINAL,
    "C": STRUCTURE_CONTAINER,
    "N": STRUCTURE_NUKER,
    "F": STRUCTURE_FACTORY,
    "i": STRUCTURE_INVADER_CORE,
}

const structureCodes = {}

for (let k in codeStructures) {
    structureCodes[codeStructures[k]] = k
}

const structureToPackedPos = function (structure) {
    return utilsPos.packXY(structure.pos).concat(structureCodes[structure.structureType])
}

const placeStructure = function (x, y, type, room) {
    // console.log("Try to place structure", x, y, type, room.name)
    if (room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y).length != 0) {
        return true
    }

    if (room.lookForAt(LOOK_STRUCTURES, x, y).filter(function (s) { return s.structureType == type }).length != 0) {
        return false
    }

    let csr = room.createConstructionSite(x, y, type)
    if (csr != OK) {
        console.log("Result of placing structure:", csr, x, y, type, room.name)
    }
    return true
}

const completeInfrastructure = function (infrastructureLayer, room) {
    return !infrastructureLayer.map(function (item) {
        let pos = utilsPos.unpackXY(item)
        let structureType = codeStructures[item[2]]
        return placeStructure(pos.x, pos.y, structureType, room)
    }).reduce(function (a, b) { return a || b }, false)
}

const maintainedNeutralStructureTypes = new Set([STRUCTURE_ROAD, STRUCTURE_WALL])

const maintainedStructureFilter = function (structure) {
    return structure.my || maintainedNeutralStructureTypes.has(structure.structureType)
}

const createSnapshot = function (room) {
    let findAndPack = function (find) {
        return room.find(find, { filter: maintainedStructureFilter }).map(structureToPackedPos)
    }
    let packedStructures = findAndPack(FIND_STRUCTURES).concat(findAndPack(FIND_CONSTRUCTION_SITES))
    return packedStructures
}

module.exports = {
    structureCodes: structureCodes,

    codeStructures: codeStructures,

    init: function (room, force) {
        if (force || !room.memory['infrastructure']) {
            room.memory['infrastructure'] = []
        }
    },

    doSnapshot: function (level, room) {
        this.init(room)
        let infrastructure = room.memory.infrastructure
        infrastructure[level] = createSnapshot(room)
        this.cleanup(room)
    },

    buildRoad: function (nodesArray, level, room) {
        this.init(room)
        const infrastructure = room.memory.infrastructure
        const roadCode = structureCodes[STRUCTURE_ROAD]
        let roadCommands = roads.compileRoad(nodesArray, room).map(function (pos) { return utilsPos.packXY(pos).concat(roadCode) })
        if (infrastructure[level]) {
            infrastructure[level] = infrastructure[level].concat(roadCommands)
        } else {
            infrastructure[level] = roadCommands
        }
        this.cleanup(room)
    },

    cleanup: function (room) {
        let infrastructure = room.memory.infrastructure
        if (!infrastructure) {
            return
        }

        for (let i = 0; i < infrastructure.length; i++) {
            if (!infrastructure[i]) {
                infrastructure[i] = []
            }
            let commands = new Set(infrastructure[i])
            let distinctedLayer = []
            infrastructure[i].forEach(function (item) {
                if (commands.has(item)) {
                    distinctedLayer.push(item)
                }
                commands.delete(item)
            })
            infrastructure[i] = distinctedLayer
        }

        for (let i = 0; i < infrastructure.length - 1; i++) {
            let commands = new Set(infrastructure[i])
            for (let j = i + 1; j < infrastructure.length; j++) {
                infrastructure[j] = infrastructure[j].filter(function (item) {
                    return !commands.has(item)
                })
            }
        }
    },

    maintainedStructureFilter: maintainedStructureFilter,

    buildInfrastructure: function (room) {
        let infrastructure = room.memory.infrastructure
        if (!infrastructure) {
            return
        }

        for (let i in infrastructure) {
            if (!completeInfrastructure(infrastructure[i], room)) {
                break
            }
        }
    }
};