/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('utils.pos');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    packX: function (x) {
        if (x < 10) {
            return String.fromCharCode(x + 48)
        }
        if (x < 36) {
            return String.fromCharCode(x - 10 + 65)
        }
        return String.fromCharCode(x - 36 + 97)
    },

    unpackX: function (p) {
        if (p < 'A') {
            return p.charCodeAt(0) - 48
        }
        if (p < 'a') {
            return p.charCodeAt(0) + 10 - 65
        }
        return p.charCodeAt(0) + 36 - 97
    },

    packXY: function (pos) {
        if (pos) {
            return this.packX(pos.x).concat(this.packX(pos.y))
        }

        return null
    },

    unpackXY: function (p) {
        if (p) {
            return { x: this.unpackX(p[0]), y: this.unpackX(p[1]) }
        }

        return null
    },

    packRoomPosition: function (roomPosition) {
        if (roomPosition) {
            return this.packXY(roomPosition).concat(roomPosition.roomName)
        }

        return null
    },

    unpackRoomPosition: function (p) {
        if (p) {
            const pos = this.unpackXY(p)
            return RoomPosition(pos.x, pos.y, p.substring(2))
        }

        return null
    }
};