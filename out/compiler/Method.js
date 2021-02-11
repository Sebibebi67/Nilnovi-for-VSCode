"use strict";
//================================= Class Method =================================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.Method = void 0;
//--------------------------------- Description ----------------------------------//
//
// This is a structure which describes the fields of a function or a procedure 
//
//--------------------------------------------------------------------------------//
//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
// Adam RIVIÈRE
//
//--------------------------------------------------------------------------------//
class Method {
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    constructor(name, type, refLine, params) {
        this.fakePileLength = 0;
        this.name = name;
        this.type = type;
        this.refLine = refLine;
        this.params = params;
    }
}
exports.Method = Method;
//================================================================================//
//# sourceMappingURL=Method.js.map