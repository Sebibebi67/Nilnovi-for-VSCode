import * as vscode from "vscode";

const dictionary = ["debutProg", "finProg"]

export class Executor{
	currentLineCpt : number;
	pile : number[];
	base : number;
	lines : string[];
	output : vscode.OutputChannel;
	end : boolean;


	constructor(){
		this.currentLineCpt = 0;
		this.pile = [];
		this.base = -1;
		this.lines = [];
		this.end = false;
		this.output = vscode.window.createOutputChannel("Nilnovi Executor Output");
		this.output.show(true);
	}
	
	public loadingFile(file : string){
		this.lines = file.split(/\r?\n/);
	}

	public run(delay?: number){
		this.end = false;
		while (!this.end){
			try {
				this.eval(this.lines[this.currentLineCpt]);	
			} catch (error) {
				console.log(error);
				
			}
		}
	}

	private eval(line : string){
		let method = line.split(";")[0];
		let keyword = method.split("(")[0];

		if (dictionary.includes(keyword)){
			eval("this."+method);
		}
		else{
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
	private debutProg(){
		this.output.appendLine("Début de Programme");
		this.currentLineCpt++;	
	}

	private finProg(){
		this.output.appendLine("Fin de Programme");
		this.output.appendLine("toto")
		this.end = true;
		this.currentLineCpt = 0;
	}






}