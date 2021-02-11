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
    /**
     * @description gets the chosen variable
     * @param string id of the chosen variable
     * @author Sébastien HERT
     */
    get(id) {
        return this.dictionary[id];
    }
    /**
     * @description adds a new variable to the dictionary
     * @param Variable variable to add
     * @author Sébastien HERT
     */
    add(variable) {
        this.dictionary[variable.methodName + "." + variable.name] = variable;
    }
    /**
     * @description removes variables from the dictionary
     * @param string method from which variables has to be removed
     * @author Sébastien HERT
     */
    removeVariables(methodName) {
        for (var key in this.dictionary) {
            if (this.dictionary[key].methodName == methodName) {
                delete this.dictionary[key];
            }
        }
    }
}
exports.VariableList = VariableList;
//================================================================================//
//# sourceMappingURL=VariableList.js.map