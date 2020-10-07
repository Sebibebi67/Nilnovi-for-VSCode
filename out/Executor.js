"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Executor = void 0;
//================================ Class Executor ================================//
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
    // public inputString : String = "";
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    constructor() {
        //------------------------------- Class Variables --------------------------------//
        this.currentLineCpt = 0;
        this.pile = [];
        this.base = -1;
        this.cptPile = -1;
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
        return __awaiter(this, void 0, void 0, function* () {
            // resets the global values
            this.reset();
            // while not "FinProg" or error
            while (!this.end) {
                // Evaluating current line
                const returnValue = yield this.eval(this.lines[this.currentLineCpt]);
                // An error occurs
                if (returnValue != 0) {
                    this.stop();
                }
            }
        });
    }
    //--------------------------------------------------------------------------------//
    //-------------------------------- Private Methods -------------------------------//
    eval(line) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    const returnValue = yield eval("this.evaluable_" + method);
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
                    if (error.name == "ReferenceError") {
                        this.referenceError(error.message);
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
        });
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
    referenceError(message) {
        const currentLine = this.currentLineCpt + 1;
        this.output.appendLine("ERROR at line " + currentLine + " : " + message);
    }
    notValidNumberError(n) {
        const currentLine = this.currentLineCpt + 1;
        this.output.appendLine("ERROR at line " + currentLine + " : " + n + " is not a valid number.");
    }
    pileError(str) {
        const currentLine = this.currentLineCpt + 1;
        this.output.appendLine("ERROR at line " + currentLine + " : " + str);
    }
    notNumberError(str) {
        const currentLine = this.currentLineCpt + 1;
        this.output.appendLine("ERROR at line " + currentLine + " : '" + str + "' is not a number.");
    }
    zeroDivisionError() {
        const currentLine = this.currentLineCpt + 1;
        this.output.appendLine("ERROR at line " + currentLine + " : division by zero.");
    }
    notBooleanError(n) {
        const currentLine = this.currentLineCpt + 1;
        this.output.appendLine("ERROR at line " +
            currentLine +
            " : " + n + " is not a valid value of Boolean.\nPlease use 0 or 1.");
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
        // this.output.show();
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
     * * (The parameter error checks if only one argument has been given)
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
            this.notValidNumberError(n);
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
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        const value = this.pile.pop();
        const address = this.pile.pop();
        if (address === undefined ||
            address < 0 ||
            address > this.pile.length ||
            this.pile.length ||
            value === undefined) {
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
    evaluable_valeurPile(error = undefined) {
        if (!(error === undefined)) {
            this.paramsError(this.evaluable_valeurPile.name, 0);
            return 1;
        }
        const address = this.pile.pop();
        this.cptPile--;
        if (address === undefined || address < 0 || address > this.pile.length) {
            this.pileError("Address isn't is the pile");
            return 1;
        }
        const value = this.pile[address];
        return this.evaluable_empiler(value);
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
    evaluable_get(error = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(error === undefined)) {
                this.paramsError(this.evaluable_get.name, 0);
                return 1;
            }
            if (this.pile.length < 1) {
                this.pileError("Pile doesn't have enough elements.");
                return 1;
            }
            function getInputValue() {
                return __awaiter(this, void 0, void 0, function* () {
                    var res = yield vscode.window.showInputBox({
                        placeHolder: "",
                        prompt: "Please enter an integer.",
                    });
                    if (res === undefined) {
                        return "";
                    }
                    else {
                        return res;
                    }
                });
            }
            var inputString = yield getInputValue();
            if (inputString === undefined) {
                console.log("inputBox is undefined");
                this.currentLineCpt++;
                return 0;
            }
            var inputNumber = parseInt(inputString);
            if (isNaN(inputNumber)) {
                this.notNumberError(inputString);
                return 1;
            }
            const address = this.pile.pop();
            this.cptPile--;
            if (address === undefined || address < 0 || address > this.pile.length) {
                this.pileError("Address isn't is the pile");
                return 1;
            }
            this.pile[address] = inputNumber;
            this.currentLineCpt++;
            return 0;
        });
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
    evaluable_put(error = undefined) {
        if (!(error === undefined)) {
            this.paramsError(this.evaluable_put.name, 0);
            return 1;
        }
        const value = this.pile.pop();
        if (value === undefined) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        this.cptPile--;
        this.currentLineCpt++;
        this.output.appendLine(value.toString());
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
     * * adam
     */
    evaluable_moins(error = undefined) {
        if (!(error === undefined)) {
            this.paramsError(this.evaluable_moins.name, 0);
            return 1;
        }
        if (this.pile.length < 1) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        var value = this.pile.pop();
        this.cptPile--;
        if (value === undefined) {
            return 1;
        }
        return this.evaluable_empiler(-value);
    }
    evaluable_sous(error = undefined) {
        if (!(error === undefined)) {
            this.paramsError(this.evaluable_sous.name, 0);
            return 1;
        }
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        var a = this.pile.pop();
        var b = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        return this.evaluable_empiler(b - a);
    }
    evaluable_add(error = undefined) {
        if (!(error === undefined)) {
            this.paramsError(this.evaluable_add.name, 0);
            return 1;
        }
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        var a = this.pile.pop();
        var b = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        return this.evaluable_empiler(b + a);
    }
    evaluable_mult(error = undefined) {
        if (!(error === undefined)) {
            this.paramsError(this.evaluable_mult.name, 0);
            return 1;
        }
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        var a = this.pile.pop();
        var b = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        return this.evaluable_empiler(b * a);
    }
    evaluable_div(error = undefined) {
        if (!(error === undefined)) {
            this.paramsError(this.evaluable_div.name, 0);
            return 1;
        }
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        var a = this.pile.pop();
        var b = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        if (a == 0) {
            this.zeroDivisionError();
            return 1;
        }
        return this.evaluable_empiler(Math.floor(b / a));
    }
    evaluable_egal(error = undefined) {
        if (!(error === undefined)) {
            this.paramsError(this.evaluable_egal.name, 0);
            return 1;
        }
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        var a = this.pile.pop();
        var b = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        // if (a==b){
        //   return this.evaluable_empiler(1);
        // }else{
        //   return this.evaluable_empiler(0);
        // }
        return this.evaluable_empiler(Number(a == b));
    }
    evaluable_diff(error = undefined) {
        if (!(error === undefined)) {
            this.paramsError(this.evaluable_diff.name, 0);
            return 1;
        }
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        var a = this.pile.pop();
        var b = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        return this.evaluable_empiler(Number(!(a == b)));
    }
    evaluable_inf(error = undefined) {
        if (!(error === undefined)) {
            this.paramsError(this.evaluable_inf.name, 0);
            return 1;
        }
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        var a = this.pile.pop();
        var b = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        return this.evaluable_empiler(Number(b > a));
    }
    evaluable_infeg(error = undefined) {
        if (!(error === undefined)) {
            this.paramsError(this.evaluable_infeg.name, 0);
            return 1;
        }
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        var a = this.pile.pop();
        var b = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        return this.evaluable_empiler(Number(b >= a));
    }
    evaluable_sup(error = undefined) {
        if (!(error === undefined)) {
            this.paramsError(this.evaluable_sup.name, 0);
            return 1;
        }
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        var a = this.pile.pop();
        var b = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        return this.evaluable_empiler(Number(b > a));
    }
    evaluable_supeg(error = undefined) {
        if (!(error === undefined)) {
            this.paramsError(this.evaluable_supeg.name, 0);
            return 1;
        }
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        var a = this.pile.pop();
        var b = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        return this.evaluable_empiler(Number(b >= a));
    }
    evaluable_et(error = undefined) {
        if (!(error === undefined)) {
            this.paramsError(this.evaluable_et.name, 0);
            return 1;
        }
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        var a = this.pile.pop();
        var b = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        if (a != 0 && a != 1) {
            this.notBooleanError(a);
            return 1;
        }
        if (b != 0 && b != 1) {
            this.notBooleanError(b);
            return 1;
        }
        return this.evaluable_empiler(Number(b && a));
    }
    evaluable_ou(error = undefined) {
        if (!(error === undefined)) {
            this.paramsError(this.evaluable_ou.name, 0);
            return 1;
        }
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        var a = this.pile.pop();
        var b = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        if (a != 0 && a != 1) {
            this.notBooleanError(a);
            return 1;
        }
        if (b != 0 && b != 1) {
            this.notBooleanError(b);
            return 1;
        }
        return this.evaluable_empiler(Number(b || a));
    }
    evaluable_non(error = undefined) {
        if (!(error === undefined)) {
            this.paramsError(this.evaluable_ou.name, 0);
            return 1;
        }
        if (this.pile.length < 1) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        var a = this.pile.pop();
        this.cptPile--;
        if (a === undefined) {
            return 1;
        }
        if (a != 0 && a != 1) {
            this.notBooleanError(a);
            return 1;
        }
        return this.evaluable_empiler(Number(!a));
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