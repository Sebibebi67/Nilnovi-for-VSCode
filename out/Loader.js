"use strict";
//================================= Class Loader =================================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loader = void 0;
//--------------------------------- Description ----------------------------------//
//
// This class allows us to save the status of the pile after each instructions,
// which is very useful for the next and the previous step.
//
//--------------------------------------------------------------------------------//
//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
//
//--------------------------------------------------------------------------------//
class Loader {
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
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