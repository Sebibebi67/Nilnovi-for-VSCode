import * as vscode from "vscode";

export class Executor{
	currentLineCpt : number;
	pile : number[];
	base : number;
	lines : string[];
	// output = vscode.window.createOutputChannel("Nilnovi Executor Output");
	output : vscode.OutputChannel;


	constructor(){
		this.currentLineCpt = 1;
		this.pile = [];
		this.base = -1;
		this.lines = [];
		this.output = vscode.window.createOutputChannel("Nilnovi Executor Output");
		this.output.show();
	}
	
	loadingFile(file : string){
		this.lines = file.split(/\r?\n/);
	}


}