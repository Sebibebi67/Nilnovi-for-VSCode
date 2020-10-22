"use strict";
//================================ Class blockFor ================================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockFor = void 0;
const blockWhile_1 = require("./blockWhile");
//--------------------------------------------------------------------------------//
class blockFor extends blockWhile_1.blockWhile {
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    constructor(variable) {
        super();
        this.variable = variable;
    }
}
exports.blockFor = blockFor;
//================================================================================//
//# sourceMappingURL=blockFor.js.map