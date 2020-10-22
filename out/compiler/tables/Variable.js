"use strict";
//================================ Class Variable=== =============================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.Variable = void 0;
//--------------------------------- Description ----------------------------------//
//
// This is a structures which describes the fields of a variable
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
class Variable {
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    constructor(name, type, isParameter, addPile, scope) {
        this.addPile = -1;
        this.scope = -1;
        this.name = name;
        this.type = type;
        if (!(addPile === undefined)) {
            this.addPile = addPile;
        }
        if (!(scope === undefined)) {
            this.scope = scope;
        }
        this.isParameter = isParameter;
    }
}
exports.Variable = Variable;
//================================================================================//
//# sourceMappingURL=Variable.js.map