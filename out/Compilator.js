"use strict";
//=============================== Class Compilator ===============================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compilator = void 0;
//--------------------------------- Description ----------------------------------//
//
// 
//
//--------------------------------------------------------------------------------//
//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
//
//--------------------------------------------------------------------------------//
//----------------------------------- Imports ------------------------------------//
//
//--------------------------------------------------------------------------------//
class Compilator {
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    //
    constructor(file) {
        //------------------------------- Class Variables --------------------------------//
        this.DictLines = {};
        var lines = file.split(/\r?\n/);
        console.log(lines);
        // console.log("constructor")
    }
}
exports.Compilator = Compilator;
//================================================================================//
//# sourceMappingURL=Compilator.js.map