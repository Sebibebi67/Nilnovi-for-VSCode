"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Executor = void 0;
const vscode = require("vscode");
class Executor {
    constructor() {
        this.currentLineCpt = 1;
        this.pile = [];
        this.base = -1;
        this.lines = [];
        this.output = vscode.window.createOutputChannel("Nilnovi Executor Output");
        this.output.show();
    }
    loadingFile(file) {
        this.lines = file.split(/\r?\n/);
    }
}
exports.Executor = Executor;
//# sourceMappingURL=Executor.js.map