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
const vscode = require("vscode");
const Loader_1 = require("./Loader");
//--------------------------------------------------------------------------------//
class Executor {
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    constructor(instructions, output, panel, delay = 200, maxRec = 100) {
        //------------------------------- Class Variables --------------------------------//
        // public previousLineCpt
        this.currentLineCpt = 0;
        this.cptPile = 0;
        this.pile = [];
        this.base = -1;
        this.end = false;
        this.maxRec = 100;
        this.traRec = {};
        this.delay = 200;
        this.onPause = false;
        this.loader = [];
        this.output = output;
        this.instructions = instructions;
        this.panel = panel;
        this.delay = delay;
        this.maxRec = maxRec;
    }
    //--------------------------------------------------------------------------------//
    //-------------------------------- Public Methods --------------------------------//
    /**
       * @description Runs all the file line by line
       * @author Sébastien HERT
       */
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            // while not "FinProg" or error
            while (!this.end && !this.onPause) {
                // We need a copy of the pile
                let copyPile = [];
                this.pile.forEach(element => {
                    copyPile.push(element);
                });
                // Storing the values
                this.loader.push(new Loader_1.Loader(this.currentLineCpt, this.cptPile, copyPile, this.base));
                // Evaluating current line
                let returnValue = yield this.eval(this.instructions[this.currentLineCpt]);
                // An error occurs
                if (returnValue != 0) {
                    this.stop();
                }
                //We now need to update the web View
                this.updateWebView();
                // Then wait for the delay which is in ms
                yield this.sleep(this.delay);
            }
        });
    }
    //--------------------------------------------------------------------------------//
    //------------------------------ Processing Methods ------------------------------//
    /**
     * @description evaluates Instruction.
     * @param Instruction the instruction
     * @returns the output status
     * @author Sébastien HERT
     */
    eval(instruction) {
        return __awaiter(this, void 0, void 0, function* () {
            let type = instruction.type;
            let method = "";
            // we need to format properly the method which will be called
            if (type !== undefined) {
                method = instruction.machineCode.replace(");", ",\"" + type + "\")");
            }
            else {
                method = instruction.machineCode.replace(");", ")");
            }
            // And then evaluate it and returning the output status
            const returnValue = yield eval("this.evaluable_" + method);
            return returnValue;
        });
    }
    /**
     * @description stops the process
     * @author Sébastien HERT
     */
    stop() { this.end = true; }
    /**
     * @description resumes the process
     * @author Sébastien HERT
     */
    resume() { this.onPause = false; this.run(); }
    /**
     * @description pauses the process
     * @author Sébastien HERT
     */
    pause() { this.onPause = true; }
    /**
     * @description execute the next line
     * @author Sébastien HERT
     * @author Adam RIVIERE
     */
    next() {
        return __awaiter(this, void 0, void 0, function* () {
            // if the program is paused and not ended
            if (this.onPause && !this.end) {
                // We need a copy of the pile
                let copyPile = [];
                this.pile.forEach(element => {
                    copyPile.push(element);
                });
                this.loader.push(new Loader_1.Loader(this.currentLineCpt, this.cptPile, copyPile, this.base));
                // Evaluating current line
                let returnValue = yield this.eval(this.instructions[this.currentLineCpt]);
                // An error occurs
                if (returnValue != 0) {
                    this.stop();
                }
                //We now need to update the web View
                this.updateWebView();
            }
        });
    }
    previous() {
        let loadingConfig = this.loader.pop();
        if (loadingConfig === undefined) {
            return 0;
        }
        this.currentLineCpt = loadingConfig.currentLineCpt;
        this.cptPile = loadingConfig.cptPile;
        this.base = loadingConfig.base;
        this.pile = loadingConfig.pile;
        //We now need to update the web View
        this.updateWebView();
    }
    /**
     * @description adds a couple in the pile
     * @param number the value to add
     * @param string the type of the value (boolean, integer, address...)
     * @author Sébastien HERT
     */
    addToPile(value, type) { this.pile.push({ value: value, type: type }); }
    /**
     * @description updates the webView
     * @author Sébastien HERT
     * @author Simon JOURDAN
     */
    updateWebView() {
        this.panel.webview.postMessage({
            command: "showPile",
            pile: this.pile,
            pointer: this.cptPile,
            instructionLine: this.loader[this.loader.length - 1].currentLineCpt + 1
        });
    }
    /**
     * @description sleeps for few ms
     * @param number the delay in ms
     * @returns Promise
     * @author Sébastien HERT
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * @description displays a string in the output channel
     * @param string the string to display
     * @author Sébastien HERT
     */
    display(str) {
        this.output.appendLine(str);
        this.output.show(true);
    }
    //--------------------------------------------------------------------------------//
    //-------------------------------- Errors Methods --------------------------------//
    /**
     * @description raises an error with the pile
     * @param string the message to display
     * @author Sébastien HERT
     */
    pileError(str) {
        const currentLine = this.currentLineCpt + 1;
        this.display("ERROR at line " + currentLine + " : " + str);
    }
    /**
     * @description raises an error if user tries to divide by zero
     * @author Sébastien HERT
     */
    zeroDivisionError() {
        const currentLine = this.currentLineCpt + 1;
        this.display("ERROR at line " + currentLine + " : division by zero.");
    }
    /**
     * @description raises an error if the string given is not a number
     * @param string the string which is not a number (can be undefined)
     * @author Sébastien HERT
     */
    notNumberError(str) {
        const currentLine = this.currentLineCpt + 1;
        this.display("ERROR at line " + currentLine + " : '" + str + "' is not a integer.");
    }
    /**
     * @description raises an error if the maximum recursion has been reached
     * @author Sébastien HERT
     */
    maxRecursionError() {
        const currentLine = this.currentLineCpt + 1;
        this.display("ERROR at line " + currentLine + " :  Maximum recursion reached.");
    }
    /**
     * @description raises an unknown error
     * @param string the error
     * @author Sébastien HERT
     */
    unknownError(error) {
        const currentLine = this.currentLineCpt + 1;
        this.display("ERROR at line " + currentLine + ".");
    }
    //--------------------------------------------------------------------------------//
    //-------------------------------- Nilnovi Methods -------------------------------//
    /**
    * @description Enables the beginning of the program
    * @return 0 (output status)
    * @author Sébastien HERT
    * @author Adam RIVIÈRE
    */
    evaluable_debutProg() {
        this.display("Début de Programme");
        this.currentLineCpt++;
        return 0;
    }
    /**
    * @description Enables the end of the program
    * @return 0 (output status)
    * @author Sébastien HERT
    * @author Adam RIVIÈRE
    */
    evaluable_finProg() {
        this.display("Fin de Programme");
        this.stop();
        return 0;
    }
    /**
    * @description Reserves n slots in the pile
    * @param number the number of slots to reserve
    * @param string the type as a string
    * @return 0 (output status)
    * @author Sébastien HERT
    * @author Adam RIVIÈRE
    */
    evaluable_reserver(n, type) {
        // Let's add n "0" in the pile with their corresponding type
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
    * @return 0 (output status)
    * @author Sébastien HERT
    * @author Adam RIVIÈRE
    */
    evaluable_empiler(n, type) {
        this.addToPile(n, type);
        this.cptPile++;
        this.currentLineCpt++;
        return 0;
    }
    /**
     * @description affects the last value in the pile to the penultimate value
     * @returns output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    evaluable_affectation() {
        // Let's imagine we have a := b
        // First we need to get a and b
        const b = this.pile.pop();
        const a = this.pile.pop();
        // Then we check if everything is ok
        if (a === undefined ||
            a.value < 0 ||
            a.value > this.pile.length ||
            b === undefined) {
            this.pileError("Address isn't is the pile");
            return 1;
        }
        // then we change the value of the address of a
        try {
            this.pile[a.value].value = b.value;
        }
        catch (error) {
            this.unknownError(error);
            return 1;
        }
        this.cptPile -= 2;
        this.currentLineCpt++;
        return 0;
    }
    /**
     * @description gets the value of the top of the pile considered as a address
     * @returns output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    evaluable_valeurPile() {
        // the address is a the top of the pile
        const address = this.pile.pop();
        this.cptPile--;
        // We need to check if everything is ok
        if (address === undefined || address.value < 0 || address.value > this.pile.length) {
            this.pileError("Address isn't is the pile");
            return 1;
        }
        // Then it is, we need now to get the value and the pile of the variable which has this address
        const newVariable = this.pile[address.value];
        return this.evaluable_empiler(newVariable.value, newVariable.type);
    }
    /**
     * @description waits for the user input and affects if to the corresponding variable, which has its address on top of the pile
     * @returns output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    evaluable_get() {
        return __awaiter(this, void 0, void 0, function* () {
            // Let's define a function to get the input entered by the user.
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
            // Then let's wait for the input
            let inputString = yield getInputValue();
            // First we need to be sure there is no problem with the input string
            if (inputString === undefined) {
                return 1;
            }
            // We now need to parse our inputString
            let inputNumber = parseInt(inputString);
            let inputFloat = parseFloat(inputString);
            // If it's not a number
            if (isNaN(inputNumber) || inputNumber != inputFloat) {
                this.notNumberError(inputString);
                return 1;
            }
            // It's a number, so let's get the variable address
            const address = this.pile.pop();
            this.cptPile--;
            // Now we want to be sure the address is in the pile
            if (address === undefined || address.value < 0 || address.value > this.pile.length) {
                this.pileError("Address isn't is the pile");
                return 1;
            }
            // Finally, we could change the variable value
            this.pile[address.value].value = inputNumber;
            this.currentLineCpt++;
            return 0;
        });
    }
    /**
     * @description displays a which is the top of the pile
     * @returns output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    evaluable_put() {
        // Get a
        const a = this.pile.pop();
        // Check if a exists (if not, we need to raise an error)
        if (a === undefined) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        this.cptPile--;
        this.currentLineCpt++;
        // if a is boolean, we want to see "true" or "false" and not 1 or 0
        if (a.type == "boolean") {
            if (a.value == 0) {
                this.display("false");
            }
            else {
                this.display("true");
            }
        }
        // else a is integer, we just need to display it
        else {
            this.display(a.value.toString());
        }
        return 0;
    }
    /**
     * @description stacks -a on top of the pile, where a is on top of the pile
     * @returns output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    evaluable_moins() {
        // First, checking the length of the pile
        if (this.pile.length < 1) {
            this.pileError("Pile doesn't have enough elements.");
            return 1;
        }
        // let's get a
        let a = this.pile.pop();
        this.cptPile--;
        if (a === undefined) {
            return 1;
        }
        return this.evaluable_empiler(-a, "integer");
    }
    /**
     * @description stacks a - b on top of the pile, where b is on top of the pile and a just below
     * @returns output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
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
    /**
     * @description stacks a + b on top of the pile, where b is on top of the pile and a just below
     * @returns output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
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
    /**
     * @description stacks a * b on top of the pile, where b is on top of the pile and a just below
     * @returns output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
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
    /**
     * @description stacks a // b on top of the pile, where b is on top of the pile, a just below and // is the euclidean division
     * @returns output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
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
    /**
     * @description stacks a == b on top of the pile, where b is on top of the pile, a just below
     * @returns output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
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
    /**
     * @description stacks a != b on top of the pile, where b is on top of the pile, a just below
     * @returns output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
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
    /**
     * @description stacks a < b on top of the pile, where b is on top of the pile, a just below
     * @returns output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
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
        return this.evaluable_empiler(Number(a.value < b.value), "boolean");
    }
    /**
     * @description stacks a <= b on top of the pile, where b is on top of the pile, a just below
     * @returns output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
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
    /**
     * @description stacks a > b on top of the pile, where b is on top of the pile, a just below
     * @returns output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
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
    /**
     * @description stacks a >= b on top of the pile, where b is on top of the pile, a just below
     * @returns output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
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
    /**
     * @description stacks a && b on top of the pile, where b is on top of the pile, a just below
     * @returns output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
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
        return this.evaluable_empiler(Number(b.value && a.value), "boolean");
    }
    /**
     * @description stacks a || b on top of the pile, where b is on top of the pile, a just below
     * @returns output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
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
        return this.evaluable_empiler(Number(b.value || a.value), "boolean");
    }
    /**
     * @description stacks !a on top of the pile, where a is on top of the pile
     * @returns output status
     * @author Sébastien HERT
     * @author Simon JOURDAN
     * @author Adam RIVIÈRE
     */
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
        return this.evaluable_empiler(Number(!a.value), "boolean");
    }
    /**
     * @description jumps to the line n
     * @returns output status
     * @author Sébastien HERT
     * @author Simon JOURDAN
     * @author Adam RIVIÈRE
     */
    evaluable_tra(n) {
        if (this.traRec[n] === undefined) {
            this.traRec[n] = { nbRec: 1 };
        }
        else if (this.traRec[n].nbRec == this.maxRec) {
            this.maxRecursionError();
            return 1;
        }
        else {
            this.traRec[n].nbRec++;
        }
        this.currentLineCpt = n - 1;
        return 0;
    }
    /**
     * @description jumps to the line if the condition on top of the pile is false
     * @returns output status
     * @author Sébastien HERT
     * @author Simon JOURDAN
     * @author Adam RIVIÈRE
     */
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
    /**
     * @description stacks the local value of the variable which has the local address n (used in methods)
     * @returns output status
     * @author Sébastien HERT
     * @author Simon JOURDAN
     * @author Adam RIVIÈRE
     */
    evaluable_empilerAd(n) { return this.evaluable_empiler(this.base + 2 + n, "address"); }
    /**
     * @description stacks the global value of the variable which has the local address n (used in methods)
     * @returns output status
     * @author Sébastien HERT
     * @author Simon JOURDAN
     * @author Adam RIVIÈRE
     */
    evaluable_empilerParam(n) {
        // Let's read the variable which has the local address n, which is n + 2 (length of our linking block) + base (length of the main block)
        let v = this.pile[this.base + 2 + n];
        return this.evaluable_empiler(v.value, v.type);
    }
    /**
     * @description indicates the end of a procedure
     * @returns output status
     * @author Sébastien HERT
     * @author Simon JOURDAN
     * @author Adam RIVIÈRE
     */
    evaluable_retourProc() {
        // First we need to erase the local value from the current procedure block
        while (this.pile[this.cptPile - 1].type != "topBlock") {
            this.pile.pop();
            this.cptPile -= 1;
        }
        // Now, on top of the pile, we have 2 elements
        // the topBlock which contains the next line of the next line
        let topBlock = this.pile.pop();
        this.cptPile -= 1;
        if (topBlock === undefined) {
            return 1;
        }
        let returnValue = this.evaluable_tra(topBlock.value);
        if (returnValue != 0) {
            return 1;
        }
        // the bottomBlock which contains the line which refers to the base which called the function
        let b = this.pile.pop();
        this.cptPile -= 1;
        if (b === undefined) {
            return 1;
        }
        this.base = b.value;
        return 0;
    }
    /**
     * @description indicates the end of a function
     * @returns output status
     * @author Sébastien HERT
     * @author Simon JOURDAN
     * @author Adam RIVIÈRE
     * @see evaluable_retourProc
     */
    evaluable_retourFonct() {
        // very similar to evaluable_retourProc() but we also need to get the element on top of the pile before removing all the values, and at the end stack this element again
        let a = this.pile.pop();
        this.cptPile--;
        let returnValue = this.evaluable_retourProc();
        if (returnValue != 0 || a === undefined) {
            return 1;
        }
        this.currentLineCpt--;
        return this.evaluable_empiler(a.value, a.type);
    }
    /**
     * @description allocates 2 slots for a block (before calling methods)
     * @param Type description
     * @returns output status
     * @author Sébastien HERT
     * @author Simon JOURDAN
     * @author Adam RIVIÈRE
     * @see evaluable_traStat
     */
    evaluable_reserverBloc() {
        // the bottomBlock stacks the reference to the current base
        let returnValue = this.evaluable_empiler(this.base, "bottomBlock");
        if (returnValue != 0) {
            return 1;
        }
        // the topBlock stacks the next line (which will be affected in evaluable_traStat())
        returnValue = this.evaluable_empiler(0, "topBlock");
        if (returnValue != 0) {
            return 1;
        }
        this.currentLineCpt--;
        return 0;
    }
    /**
     * @description refers to a method line with nbParam parameters
     * @param number l the line of the method
     * @param number p the number of parameters
     * @returns output status
     * @author Sébastien HERT
     * @author Simon JOURDAN
     * @author Adam RIVIÈRE
     * @see evaluable_tra
     */
    evaluable_traStat(line, nbParam) {
        // Let's affect the topBlock value
        this.pile[this.cptPile - nbParam - 1].value = this.currentLineCpt + 2; //affectation topBlock
        this.base = (this.cptPile - nbParam) - 2;
        return this.evaluable_tra(line);
    }
}
exports.Executor = Executor;
//================================================================================//
//# sourceMappingURL=Executor.js.map