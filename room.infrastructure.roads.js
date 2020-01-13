/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('room.infrastructure.roads');
 * mod.thing == 'a thing'; // true
 */

var compileRoadLine = function (x0, y0, x1, y1, room) {
    return room.findPath(room.getPositionAt(x0, y0), room.getPositionAt(x1, y1), {
        ignoreCreeps: true,
        swampCost: 2
    })
}

var compileRoad = function (road, room) {
    //console.log("compileRoad =", road)
    var result
    switch (road.length) {
        case 0:
        case 1:
            result = []
            break
        case 2:
        case 3:
            result = [{ x: road[0], y: road[1] }]
            break
        default:
            result = compileRoadLine(road[0], road[1], road[2], road[3], room).concat(compileRoad(road.slice(2), room))
            break
    }
    //console.log("compileRoad <-", result, result.length)
    return result
}

module.exports = {
    compileRoad: compileRoad
};