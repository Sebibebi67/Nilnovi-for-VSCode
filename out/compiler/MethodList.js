"use strict";
//=============================== Class MethodList ===============================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.MethodList = void 0;
//--------------------------------------------------------------------------------//
class MethodList {
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    //
    constructor() {
        //------------------------------- Class Variables --------------------------------//
        this.dictionary = {};
    }
    //--------------------------------------------------------------------------------//
    //----------------------------------- Methods ------------------------------------//
    get(id) {
        return this.dictionary[id];
    }
    add(method) {
        this.dictionary[method.name] = method;
    }
    display() {
        console.log(this.dictionary);
    }
}
exports.MethodList = MethodList;
//================================================================================//
//# sourceMappingURL=MethodList.js.map