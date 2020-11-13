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
    constructor(name, methodName, type, isParameter, addPile, parameterIndex) {
        this.parameterIndex = -1;
        this.name = name;
        this.type = type;
        this.methodName = methodName;
        if (!(parameterIndex === undefined)) {
            this.parameterIndex = parameterIndex;
        }
        this.addPile = addPile;
        // if (!(scope === undefined)) { this.scope = scope; }
        this.isParameter = isParameter;
        if (isParameter) { }
    }
}
exports.Variable = Variable;
//================================================================================//
//# sourceMappingURL=Variable.js.map