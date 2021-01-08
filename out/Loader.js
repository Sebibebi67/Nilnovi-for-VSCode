"use strict";
//== Class Loader ==//
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loader = void 0;
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
class Loader {
    // {currentLineCpt : number, cptPile : number, pile :{value : number, type : string}[], base : number}
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    //
    constructor(currentLineCpt, cptPile, pile, base) {
        this.currentLineCpt = currentLineCpt;
        this.cptPile = cptPile;
        this.pile = pile;
        this.base = base;
    }
}
exports.Loader = Loader;
//================================================================================//
//# sourceMappingURL=Loader.js.map