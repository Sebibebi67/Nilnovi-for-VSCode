"use strict";
//== Class Executor ==//
Object.defineProperty(exports, "__esModule", { value: true });
exports.Executor = void 0;
//--------------------------------- Description ----------------------------------//
//
// This class describes how the nilnovi executor should work
//
//--------------------------------------------------------------------------------//
//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
//
//--------------------------------------------------------------------------------//
//----------------------------------- Imports ------------------------------------//
const vscode = require("vscode");
//--------------------------------------------------------------------------------//
class Executor {
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    constructor() {
        this.currentLineCpt = 0;
        this.pile = [];
        this.base = -1;
        this.lines = [];
        this.end = false;
        this.commentedLine = false;
        this.output = vscode.window.createOutputChannel("Nilnovi Executor Output");
        this.output.show(true);
    }
    //--------------------------------------------------------------------------------//
    //-------------------------------- Public Methods --------------------------------//
    loadingFile(file) {
        this.lines = file.split(/\r?\n/);
    }
    run(delay) {
        this.end = false;
        while (!this.end) {
            this.eval(this.lines[this.currentLineCpt]);
        }
    }
    //--------------------------------------------------------------------------------//
    //-------------------------------- Private Methods -------------------------------//
    eval(line) {
        // First, we need to remove the spaces at begin and end of the line
        line = line.trim();
        // checks if the line is commented or empty
        if (!(line.length == 0) && !line.startsWith("#")) {
            if (line.startsWith("/*")) {
                this.commentedLine = true;
            }
            // If it's not
            if (!this.commentedLine) {
                let method = (line.split(";")[0]).split("=>")[0];
                try {
                    eval("this.evaluable_" + method);
                }
                catch (error) {
                    // console.log(error);
                    this.currentLineCpt++;
                    this.end = true;
                    this.output.appendLine("\nERROR at line " + this.currentLineCpt + ".");
                    this.output.appendLine("Please check if it's a correct method");
                    this.currentLineCpt = 0;
                }
                // else, we should increase the currentLineCpt
            }
            else {
                this.currentLineCpt++;
            }
            // checks if it's the end of the comment
            if (line.endsWith("*/")) {
                this.commentedLine = false;
            }
        }
        else {
            // else, we should increase the currentLineCpt
            this.currentLineCpt++;
        }
    }
    //--------------------------------------------------------------------------------//
    //-------------------------------- Nilnovi Methods -------------------------------//
    /**
         * Description : enables the beginning of the program
         *
         * Input : None
         *
         * Output: None
         *
         * Authors:
         * * Sébastien HERT
         */
    evaluable_debutProg() {
        this.output.appendLine("Début de Programme");
        this.currentLineCpt++;
    }
    /**
    * Description : enables the end of the program
    *
    * Input: None
    *
    * Output: None
    *
    * Authors:
    * * Sébastien HERT
    */
    evaluable_finProg() {
        this.output.appendLine("Fin de Programme");
        this.output.appendLine("toto");
        this.end = true;
        this.currentLineCpt = 0;
    }
    evaluable_reserver(n) {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_empiler(n) {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_affectation() {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_valeurPile() {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_get() {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_put() {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_moins() {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_sous() {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_add() {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_mult() {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_div() {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_egal() {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_diff() {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_inf() {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_infeg() {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_sup() {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_supeg() {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_et() {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_ou() {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_non() {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_tra(n) {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_tze(n) {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_erreur(exp) {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_empilerAd(n) {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_empilerParam(n) {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_retourProc() {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_retourFonct() {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_reserverBloc() {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
    evaluable_traStat(n, t) {
        this.output.appendLine("TODO");
        this.currentLineCpt++;
    }
}
exports.Executor = Executor;
//================================================================================//
//# sourceMappingURL=Executor.js.map