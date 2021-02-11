"use strict";
//=============================== Class MethodList ===============================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.MethodList = void 0;
//--------------------------------------------------------------------------------//
class MethodList {
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    constructor() {
        //------------------------------- Class Variables --------------------------------//
        this.dictionary = {};
    }
    //--------------------------------------------------------------------------------//
    //----------------------------------- Methods ------------------------------------//
    /**
     * @description gets the chosen method
     * @param string id of the chosen method
     * @author Sébastien HERT
     */
    get(id) {
        return this.dictionary[id];
    }
    /**
     * @description adds a new method to the dictionary
     * @param Method method to add
     * @author Sébastien HERT
     */
    add(method) {
        this.dictionary[method.name] = method;
    }
}
exports.MethodList = MethodList;
//================================================================================//
//# sourceMappingURL=MethodList.js.map