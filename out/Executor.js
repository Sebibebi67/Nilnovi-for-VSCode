"use strict";
//================================ Class Executor ================================//
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
        //------------------------------- Class Variables --------------------------------//
        this.currentLineCpt = 0;
        this.pile = [];
        this.base = -1;
        this.cptPile = 0;
        this.lines = [];
        this.end = false;
        this.output = vscode.window.createOutputChannel("Nilnovi Executor Output");
        this.output.show(true);
    }
    //--------------------------------------------------------------------------------//
    //-------------------------------- Public Methods --------------------------------//
    /**
     * Description : Loads and converts the file into an array of strings, one string per line. It also removes the block of comments
     *
     * Input:
     * * The file which should be loaded
     *
     * Output: None
     *
     * Authors:
     * * Sébastien HERT
     */
    loadingFile(file) {
        // First, we will remove all the blocks of comments and replace them by empty lines, then filling our array of lines
        const regex = /\/\*(.|[\r\n])*\*\//;
        this.lines = file.replace(regex, "\r\n").split(/\r?\n/);
    }
    /**
     * Description : Runs the file previously loaded
     *
     * Input:
     * * (Optional) The delay
     *
     * Output: None
     *
     * Authors:
     * * Sébastien HERT
     */
    run(delay) {
        // resets the global values
        this.reset();
        // while not "FinProg" or error
        while (!this.end) {
            // Evaluating current line
            const returnValue = this.eval(this.lines[this.currentLineCpt]);
            // An error occurs
            if (returnValue != 0) {
                this.stop();
            }
        }
    }
    //--------------------------------------------------------------------------------//
    //-------------------------------- Private Methods -------------------------------//
    eval(line) {
        // First, we need to remove the spaces at begin and end of the line
        line = line.trim();
        // if the line is empty or commented
        if (line.length == 0 || line.startsWith("#")) {
            this.currentLineCpt++;
            return 0;
        }
        let method = line.split(";")[0].split("=>")[0];
        // User cannot use word "undefined", except for the "erreur" method
        let arg = line.split("(")[1].split(")")[0];
        if (arg.includes("undefined") && !method.includes("erreur")) {
            this.wordUndefinedUseError();
            return 1;
        }
        // checks if the line is commented or empty
        if (!(line.length == 0) && !line.startsWith("#")) {
            try {
                const returnValue = eval("this.evaluable_" + method);
                if (returnValue != 0) {
                    return 1;
                }
            }
            catch (error) {
                if (error.message.endsWith("is not a function")) {
                    this.functionNotDefinedError(method.split("(")[0]);
                    return 1;
                }
                if (error.name == "SyntaxError") {
                    this.syntaxError();
                    return 1;
                }
                this.unknownError();
                console.log(error);
                return 1;
            }
        }
        else {
            // else, we should increase the currentLineCpt
            this.currentLineCpt++;
        }
        return 0;
    }
    stop() {
        this.end = true;
    }
    reset() {
        this.end = false;
        this.currentLineCpt = 0;
        this.pile = [];
        this.cptPile = 0;
        this.base = -1;
        // this.commentedState = this.commentedStates.NOT_COMMENTED;
    }
    paramsError(name, nbOfParams) {
        const currentLine = this.currentLineCpt + 1;
        const methodName = name.split("_")[1];
        this.output.appendLine("ERROR at line " +
            currentLine +
            " : Method " +
            methodName +
            " requires " +
            nbOfParams +
            " parameter(s).");
        this.stop();
    }
    wordUndefinedUseError() {
        const currentLine = this.currentLineCpt + 1;
        this.output.appendLine("ERROR at line " +
            currentLine +
            ' : Please do not use the word "undefined"');
        this.stop();
    }
    functionNotDefinedError(name) {
        const currentLine = this.currentLineCpt + 1;
        this.output.appendLine("ERROR at line " + currentLine + " : Method " + name + " is not defined.");
    }
    syntaxError() {
        const currentLine = this.currentLineCpt + 1;
        this.output.appendLine("ERROR at line " + currentLine + " : Syntax Error.");
    }
    notValidNumber(n) {
        const currentLine = this.currentLineCpt + 1;
        this.output.appendLine("ERROR at line " + currentLine + " : " + n + " is not a valid number.");
    }
    pileError(str) {
        const currentLine = this.currentLineCpt + 1;
        this.output.appendLine("ERROR at line " + currentLine + " : " + str);
    }
    unknownError() {
        const currentLine = this.currentLineCpt + 1;
        this.output.appendLine("ERROR at line " + currentLine + ".");
    }
    //--------------------------------------------------------------------------------//
    //-------------------------------- Nilnovi Methods -------------------------------//
    /**
     * Description : Enables the beginning of the program
     *
     * Input :
     * * No parameter should be given
     * * (The parameter error checks if no argument has been given)
     *
     * Output:
     * * The return status 1 | 0
     *
     * Authors:
     * * Sébastien HERT
     */
    evaluable_debutProg(error = undefined) {
        if (!(error === undefined)) {
            this.paramsError(this.evaluable_debutProg.name, 0);
            return 1;
        }
        this.output.appendLine("Début de Programme");
        this.currentLineCpt++;
        return 0;
    }
    /**
     * Description : Enables the end of the program
     *
     * Input:
     * * No parameter should be given
     * * (The parameter error checks if no argument has been given)
     *
     * Output:
     * * The return status 1 | 0
     *
     * Authors:
     * * Sébastien HERT
     */
    evaluable_finProg(error = undefined) {
        if (!(error === undefined)) {
            this.paramsError(this.evaluable_finProg.name, 0);
            return 1;
        }
        this.output.appendLine("Fin de Programme");
        this.end = true;
        this.currentLineCpt = 0;
        return 0;
    }
    /**
     * Description : reserves n slots in the pile
     *
     * Input:
     * * n : the number of slots
     * * (The parameter error checks if no argument has been given)
     *
     * Output:
     * * The return status 1 | 0
     *
     * Authors:
     * * Sébastien HERT
     */
    evaluable_reserver(n, error = undefined) {
        if (!(error === undefined) || n === undefined) {
            this.paramsError(this.evaluable_reserver.name, 1);
            return 1;
        }
        for (let i = 0; i < n; i++) {
            this.pile.push(0);
        }
        this.cptPile += n;
        this.currentLineCpt++;
        return 0;
    }
    /**
     * Description : stacks the value n at the top of the pile
     *
     * Input:
     * * n : the value to stack
     * * (The parameter error checks if no argument has been given)
     *
     * Output:
     * * The return status 1 | 0
     *
     * Authors:
     * * Sébastien HERT
     */
    evaluable_empiler(n, error = undefined) {
        if (!(error === undefined) || n === undefined) {
            this.paramsError(this.evaluable_empiler.name, 1);
            return 1;
        }
        if (!Number.isInteger(n)) {
            this.notValidNumber(n);
            return 1;
        }
        this.pile.push(n);
        this.cptPile++;
        this.currentLineCpt++;
        return 0;
    }
    /**
    * Description :
    *
    * Input: None
    *
    * Output: None
    *
    * Authors:
    * * Sébastien HERT
    * * Adam RIVIERE
    */
    evaluable_affectation(error = undefined) {
        if (!(error === undefined)) {
            this.paramsError(this.evaluable_affectation.name, 0);
            return 1;
        }
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough arguments.");
            return 1;
        }
        const value = this.pile.pop();
        const address = this.pile.pop();
        if (address === undefined || address < 0 || address > this.pile.length || this.pile.length || value === undefined) {
            this.pileError("Address isn't is the pile");
            return 1;
        }
        try {
            this.pile[address] = value;
        }
        catch (error) {
            console.log(error);
            this.stop();
            return 1;
        }
        this.cptPile -= 2;
        this.currentLineCpt++;
        console.log(this.pile);
        return 0;
    }
    evaluable_valeurPile(error = undefined) {
        if (!(error === undefined)) {
            this.paramsError(this.evaluable_affectation.name, 0);
            return 1;
        }
        const address = this.pile.pop();
        if (address === undefined || address < 0 || address > this.pile.length) {
            this.pileError("Address isn't is the pile");
            return 1;
        }
        const value = this.pile[address];
        this.evaluable_empiler(value);
        return 0;
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
        return 0;
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