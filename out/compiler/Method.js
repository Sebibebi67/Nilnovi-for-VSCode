"use strict";
//================================= Class Method =================================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.Method = void 0;
//--------------------------------------------------------------------------------//
class Method {
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    constructor(name, type, refLine, params) {
        this.fakePileLength = 0;
        this.name = name;
        // this.scope = scope;
        this.type = type;
        this.refLine = refLine;
        this.params = params;
    }
}
exports.Method = Method;
//================================================================================//
//# sourceMappingURL=Method.js.map