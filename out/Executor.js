"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Executor = void 0;
const vscode = require("vscode");
const dictionary = ["debutProg", "finProg"];
class Executor {
    constructor() {
        this.currentLineCpt = 0;
        this.pile = [];
        this.base = -1;
        this.lines = [];
        this.end = false;
        this.output = vscode.window.createOutputChannel("Nilnovi Executor Output");
        this.output.show(true);
    }
    loadingFile(file) {
        this.lines = file.split(/\r?\n/);
    }
    run(delay) {
        this.end = false;
        while (!this.end) {
            try {
                this.eval(this.lines[this.currentLineCpt]);
            }
            catch (error) {
                console.log(error);
            }
        }
    }
    eval(line) {
        let method = line.split(";")[0];
        let keyword = method.split("(")[0];
        if (dictionary.includes(keyword)) {
            eval("this." + method);
        }
        else {
            // this.output.append("%cTOTO", "color:yellow")
            console.log("nope");
            this.currentLineCpt++;
        }
    }
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
    debutProg() {
        this.output.appendLine("Début de Programme");
        this.currentLineCpt++;
    }
    finProg() {
        this.output.appendLine("Fin de Programme");
        this.output.appendLine("toto");
        this.end = true;
        this.currentLineCpt = 0;
    }
}
exports.Executor = Executor;
//# sourceMappingURL=Executor.js.map