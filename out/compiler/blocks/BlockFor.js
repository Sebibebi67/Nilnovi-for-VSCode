"use strict";
//================================ Class BlockFor ================================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockFor = void 0;
const BlockWhile_1 = require("./BlockWhile");
//--------------------------------------------------------------------------------//
class BlockFor extends BlockWhile_1.BlockWhile {
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    constructor(variable) {
        super();
        this.variable = variable;
    }
}
exports.BlockFor = BlockFor;
//================================================================================//
//# sourceMappingURL=BlockFor.js.map