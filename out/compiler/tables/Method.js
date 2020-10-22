"use strict";
//================================= Class Method =================================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.Method = void 0;
//--------------------------------------------------------------------------------//
class Method {
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    constructor(name, scope, type, refLine, params) {
        this.name = name;
        this.scope = scope;
        this.type = type;
        this.refLine = refLine;
        this.params = params;
    }
    //--------------------------------------------------------------------------------//
    //----------------------------------- Methods ------------------------------------//
    isEqual(name) {
        return (this.name == name);
    }
}
exports.Method = Method;
//================================================================================//
//# sourceMappingURL=Method.js.map