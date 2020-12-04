"use strict";
//== Class Instruction ==//
Object.defineProperty(exports, "__esModule", { value: true });
exports.Instruction = void 0;
//--------------------------------- Description ----------------------------------//
//
// This object contains both the machine code and the type of the potential value
// on the top of the pile
//
//--------------------------------------------------------------------------------//
//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
// Adam RIVIÈRE
//
//--------------------------------------------------------------------------------//
//----------------------------------- Imports ------------------------------------//
//
//--------------------------------------------------------------------------------//
class Instruction {
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    constructor(machineCode, type) {
        this.type = undefined;
        this.machineCode = machineCode;
        if (type !== undefined) {
            this.type = type;
        }
    }
    //--------------------------------------------------------------------------------//
    //----------------------------------- Methods ------------------------------------//
    toString() {
        if (this.type === undefined) {
            return this.machineCode;
        }
        else {
            return this.machineCode + ' -> ' + this.type;
        }
    }
}
exports.Instruction = Instruction;
//================================================================================//
//# sourceMappingURL=Instruction.js.map