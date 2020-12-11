"use strict";
//================================ Class Executor ================================//
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
//--------------------------------- Description ----------------------------------//
//
// This class describes how the nilnovi executor should work
//
//--------------------------------------------------------------------------------//
//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
// Simon JOURDAN
// Adam RIVIERE
//
//--------------------------------------------------------------------------------//
//----------------------------------- Imports ------------------------------------//
const vscode = require("vscode");
//--------------------------------------------------------------------------------//
class Executor {
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    constructor(instructions, output, panel) {
        //------------------------------- Class Variables --------------------------------//
        this.currentLineCpt = 0;
        this.cptPile = 0;
        // public pile: [number, string][] = [];
        this.pile = [];
        this.base = -1;
        this.lines = [];
        this.end = false;
        this.output = output;
        this.instructions = instructions;
        this.panel = panel;
        this.run(1000);
    }
    //--------------------------------------------------------------------------------//
    //-------------------------------- Public Methods --------------------------------//
    /**
       * @description Runs the file previously loaded
       * @param number (Optional) The delay
       * @author Sébastien HERT
       */
    run(delay) {
        return __awaiter(this, void 0, void 0, function* () {
            // resets the global values
            this.reset();
            // while not "FinProg" or error
            while (!this.end) {
                // Evaluating current line
                let returnValue = yield this.eval(this.instructions[this.currentLineCpt]);
                // An error occurs
                if (delay !== undefined) {
                    yield this.delay(delay);
                }
                if (returnValue != 0) {
                    // console.log(this.pile);
                    this.stop();
                }
                this.updateWebView();
                // await this.delay(delay);
            }
        });
    }
    //--------------------------------------------------------------------------------//
    //-------------------------------- Private Methods -------------------------------//
    eval(instruction) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log(instruction)
            let type = instruction.type;
            let method = "";
            // console.log(type);
            if (type !== undefined) {
                method = instruction.machineCode.replace(");", ",\"" + type + "\")");
            }
            else {
                method = instruction.machineCode.replace(");", ")");
            }
            // console.log(method);
            console.log(method);
            const returnValue = yield eval("this.evaluable_" + method);
            if (returnValue != 0) {
                return 1;
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
        // this.commentedState = this.commentedStates.NOT_COMMENTED;
    }
    pileError(str) {
        const currentLine = this.currentLineCpt + 1;
        this.output.appendLine("ERROR at line " + currentLine + " : " + str);
    }
    zeroDivisionError() {
        const currentLine = this.currentLineCpt + 1;
        this.output.appendLine("ERROR at line " + currentLine + " : division by zero.");
    }
    addToPile(value, type) {
        this.pile.push({ value: value, type: type });
    }
    updateWebView() {
        this.panel.webview.postMessage({ command: "showPile", pile: this.pile, pointer: this.cptPile, instructionLine: this.currentLineCpt + 1, instruction: this.instructions[this.currentLineCpt].machineCode });
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    //--------------------------------------------------------------------------------//
    //-------------------------------- Nilnovi Methods -------------------------------//
    /**
    * @description Enables the beginning of the program
    * @return output status
    * @author Sébastien HERT
    */
    evaluable_debutProg() {
        this.output.appendLine("Début de Programme");
        this.currentLineCpt++;
        return 0;
    }
    /**
    * @description Enables the end of the program
    * @return output status
    * @author Sébastien HERT
    */
    evaluable_finProg() {
        this.output.appendLine("Fin de Programme");
        this.stop();
        return 0;
    }
    /**
    * @description Reserves n slots in the pile
    * @param number the number of slots to reserve
    * @return output status
    * @author Sébastien HERT
    */
    evaluable_reserver(n, type) {
        for (let i = 0; i < n; i++) {
            this.addToPile(0, type);
        }
        this.cptPile += n;
        this.currentLineCpt++;
        return 0;
    }
    /**
    * @description stacks the value n at the top of the pile
    * @param number the number to stack
    * @param type the type of the number to stack
    * @return output status
    * @author Sébastien HERT
    */
    evaluable_empiler(n, type) {
        // let type = this.instructions[this.currentLineCpt].type;addToPile(
        this.addToPile(n, type);
        this.cptPile++;
        this.currentLineCpt++;
        return 0;
    }
    evaluable_affectation() {
        const value = this.pile.pop();
        const address = this.pile.pop();
        // if (value === undefined || address === undefined) {
        // 	console.error("affectation problem");
        // 	return 1;
        // }
        if (address === undefined ||
            address.value < 0 ||
            address.value > this.pile.length ||
            value === undefined) {
            this.pileError("Address isn't is the pile");
            return 1;
        }
        try {
            this.pile[address.value].value = value.value;
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
    evaluable_valeurPile() {
        const address = this.pile.pop();
        this.cptPile--;
        if (address === undefined || address.value < 0 || address.value > this.pile.length) {
            this.pileError("Address isn't is the pile");
            return 1;
        }
        // if (address === undefined) {
        // 	console.error("valeurPile problem");
        // 	return 1;
        // }
        const value = this.pile[address.value].value;
        const type = this.pile[address.value].type;
        return this.evaluable_empiler(value, type);
    }
    evaluable_get() {
        return __awaiter(this, void 0, void 0, function* () {
            // if (this.pile.length < 1) {
            // 	this.pileError("Pile doesn't have enough elements.");
            // 	return 1;
            // }
            function getInputValue() {
                return __awaiter(this, void 0, void 0, function* () {
                    let res = yield vscode.window.showInputBox({
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
            let inputString = yield getInputValue();
            if (inputString === undefined) {
                console.log("inputBox is undefined");
                this.currentLineCpt++;
                return 0;
            }
            let inputNumber = parseInt(inputString);
            // if (isNaN(inputNumber)) {
            // 	this.notNumberError(inputString);
            // 	return 1;
            // }
            const address = this.pile.pop();
            this.cptPile--;
            if (address === undefined || address.value < 0 || address.value > this.pile.length) {
                this.pileError("Address isn't is the pile");
                return 1;
            }
            // if (address === undefined){return 1}
            this.pile[address.value].value = inputNumber;
            this.currentLineCpt++;
            return 0;
        });
    }
    evaluable_put() {
        const value = this.pile.pop();
        if (value === undefined) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        this.cptPile--;
        this.currentLineCpt++;
        if (value.type == "boolean") {
            if (value.value == 0) {
                this.output.appendLine("false");
            }
            else {
                this.output.appendLine("true");
            }
        }
        else {
            this.output.appendLine(value.value.toString());
        }
        return 0;
    }
    evaluable_moins() {
        if (this.pile.length < 1) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        let value = this.pile.pop();
        this.cptPile--;
        if (value === undefined) {
            return 1;
        }
        return this.evaluable_empiler(-value, "integer");
    }
    evaluable_sous() {
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        let b = this.pile.pop();
        let a = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        return this.evaluable_empiler(b.value - a.value, "integer");
    }
    evaluable_add() {
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        let b = this.pile.pop();
        let a = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        return this.evaluable_empiler(b.value + a.value, "integer");
    }
    evaluable_mult() {
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        let b = this.pile.pop();
        let a = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        return this.evaluable_empiler(b.value * a.value, "integer");
    }
    evaluable_div() {
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        let b = this.pile.pop();
        let a = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        if (a.value == 0) {
            this.zeroDivisionError();
            return 1;
        }
        return this.evaluable_empiler(Math.floor(b.value / a.value), "integer");
    }
    evaluable_egal() {
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        let b = this.pile.pop();
        let a = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        return this.evaluable_empiler(Number(a.value == b.value), "boolean");
    }
    evaluable_diff() {
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        let b = this.pile.pop();
        let a = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        return this.evaluable_empiler(Number(!(a.value == b.value)), "boolean");
    }
    evaluable_inf() {
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        let b = this.pile.pop();
        let a = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        // console.log(a.value < b.value);
        // console.log(Number(a.value < b.value));
        return this.evaluable_empiler(Number(a.value < b.value), "boolean");
    }
    evaluable_infeg() {
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        let b = this.pile.pop();
        let a = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        return this.evaluable_empiler(Number(a.value <= b.value), "boolean");
    }
    evaluable_sup() {
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        let b = this.pile.pop();
        let a = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        return this.evaluable_empiler(Number(a.value > b.value), "boolean");
    }
    evaluable_supeg() {
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        let b = this.pile.pop();
        let a = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        return this.evaluable_empiler(Number(a.value >= b.value), "boolean");
    }
    evaluable_et() {
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        let b = this.pile.pop();
        let a = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        //   if (a[0] != 0 && a[0] != 1) {
        // 	this.notBooleanError(a);
        // 	return 1;
        //   }
        //   if (b[0] != 0 && b[0] != 1) {
        // 	this.notBooleanError(b);
        // 	return 1;
        //   }
        return this.evaluable_empiler(Number(b.value && a.value), "boolean");
    }
    evaluable_ou() {
        if (this.pile.length < 2) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        let b = this.pile.pop();
        let a = this.pile.pop();
        this.cptPile -= 2;
        if (a === undefined || b === undefined) {
            return 1;
        }
        //   if (a[0] != 0 && a[0] != 1) {
        // 	this.notBooleanError(a);
        // 	return 1;
        //   }
        //   if (b[0] != 0 && b[0] != 1) {
        // 	this.notBooleanError(b);
        // 	return 1;
        //   }
        return this.evaluable_empiler(Number(b.value || a.value), "boolean");
    }
    //Simon à partir d'ici
    evaluable_non() {
        if (this.pile.length < 1) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        let a = this.pile.pop();
        this.cptPile -= 1;
        if (a === undefined) {
            return 1;
        }
        //   if (a[0] != 0 && a[0] != 1) {
        // 	this.notBooleanError(a);
        // 	return 1;
        //   }
        return this.evaluable_empiler(Number(!a.value), "boolean");
    }
    evaluable_tra(n) {
        this.currentLineCpt = n - 1;
        return 0;
    }
    evaluable_tze(n) {
        let a = this.pile.pop();
        this.cptPile -= 1;
        if (a === undefined) {
            return 1;
        }
        if (a.value == 0) {
            return this.evaluable_tra(n);
        }
        else {
            this.currentLineCpt++;
            return 0;
        }
    }
    // private evaluable_erreur(exp: string) {
    // 	this.output.appendLine("TODO");
    // 	this.currentLineCpt++;
    // 	return 0;
    // }
    evaluable_empilerAd(n) {
        // this.currentLineCpt++;
        return this.evaluable_empiler(this.base + 2 + n, "address");
    }
    evaluable_empilerParam(n) {
        let v = this.pile[this.base + 2 + n]; //On lit le couple situé à l'adresse n au dessus du bloc courant
        // this.currentLineCpt++;
        return this.evaluable_empiler(v.value, v.type);
    }
    evaluable_retourProc() {
        while (this.pile[this.cptPile - 1].type != "topBlock") { //Efface les valeurs au dessus du bloc de liaison
            this.pile.pop();
            this.cptPile -= 1;
        }
        let t = this.pile.pop(); //Traitement du topBlock
        this.cptPile -= 1;
        if (t === undefined) {
            return 1;
        }
        let returnValue = this.evaluable_tra(t.value);
        if (returnValue != 0) {
            return 1;
        }
        let b = this.pile.pop(); //Traitement du bottomBlock
        this.cptPile -= 1;
        if (b === undefined) {
            return 1;
        }
        this.base = b.value;
        return 0;
    }
    evaluable_retourFonct() {
        let a = this.pile.pop();
        this.cptPile--;
        let returnValue = this.evaluable_retourProc();
        if (returnValue != 0 || a === undefined) {
            return 1;
        }
        this.currentLineCpt--;
        return this.evaluable_empiler(a.value, a.type);
    }
    evaluable_reserverBloc() {
        let returnValue = this.evaluable_empiler(this.base, "bottomBlock");
        if (returnValue != 0) {
            return 1;
        }
        returnValue = this.evaluable_empiler(0, "topBlock");
        if (returnValue != 0) {
            return 1;
        }
        this.currentLineCpt--;
        return 0;
    }
    evaluable_traStat(n, t) {
        this.pile[this.cptPile - t - 1].value = this.currentLineCpt + 2; //affectation topBlock
        this.base = (this.cptPile - t) - 2;
        return this.evaluable_tra(n);
    }
}
exports.Executor = Executor;
//================================================================================//
//# sourceMappingURL=Executor.js.map