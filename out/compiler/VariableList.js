"use strict";
//============================== Class VariableList ==============================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariableList = void 0;
//--------------------------------------------------------------------------------//
class VariableList {
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    constructor() {
        //------------------------------- Class Variables --------------------------------//
        this.dictionary = {};
    }
    //--------------------------------------------------------------------------------//
    //----------------------------------- Methods ------------------------------------//
    get(id) {
        return this.dictionary[id];
    }
    add(variable) {
        this.dictionary[variable.methodName + "." + variable.name] = variable;
    }
    removeVariables(methodName) {
        for (var key in this.dictionary) {
            if (this.dictionary[key].methodName == methodName) {
                delete this.dictionary[key];
            }
        }
    }
    display() {
        console.log(this.dictionary);
    }
}
exports.VariableList = VariableList;
//================================================================================//
//# sourceMappingURL=VariableList.js.map