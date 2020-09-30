//== Class Executor ==//


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

import * as vscode from "vscode";

//--------------------------------------------------------------------------------//


export class Executor{

//------------------------------- Class Variables --------------------------------//

	currentLineCpt : number;
	pile : number[];
	base : number;
	private lines : string[];
	output : vscode.OutputChannel;
	private end : boolean;
	private commentedLine : boolean;

//--------------------------------------------------------------------------------//


//--------------------------------- Constructor ----------------------------------//

	constructor(){
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

	public loadingFile(file : string){
		this.lines = file.split(/\r?\n/);
	}

	public run(delay?: number){
		this.end = false;
		while (!this.end){
			this.eval(this.lines[this.currentLineCpt]);
		}
	}

//--------------------------------------------------------------------------------//

//-------------------------------- Private Methods -------------------------------//

	private eval(line : string){

		// First, we need to remove the spaces at begin and end of the line
		line = line.trim();

		// checks if the line is commented or empty
		if (!(line.length == 0) && !line.startsWith("#")){
			if (line.startsWith("/*")){
				this.commentedLine = true;
			}

			// If it's not
			if (!this.commentedLine){
				let method = (line.split(";")[0]).split("=>")[0];
				try {
					eval("this.evaluable_"+method);
				} catch (error) {
					// console.log(error);
					this.currentLineCpt++;
					this.end = true;
					this.output.appendLine("\nERROR at line "+this.currentLineCpt+".");
					this.output.appendLine("Please check if it's a correct method");
					this.currentLineCpt = 0;
				}

			// else, we should increase the currentLineCpt
			}else{
				this.currentLineCpt++;
			}

			// checks if it's the end of the comment
			if (line.endsWith("*/")){
				this.commentedLine = false;
			}
		}else{
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
	private evaluable_debutProg(){
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
	private evaluable_finProg(){
		this.output.appendLine("Fin de Programme");
		this.output.appendLine("toto");
		this.end = true;
		this.currentLineCpt = 0;
	}

	private evaluable_reserver(n : number){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}

	private evaluable_empiler(n : number){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}

	private evaluable_affectation(){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}

	private evaluable_valeurPile(){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}

	private evaluable_get(){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}

	private evaluable_put(){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}
	private evaluable_moins(){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}

	private evaluable_sous(){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}

	private evaluable_add(){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}

	private evaluable_mult(){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}
	private evaluable_div(){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}
	private evaluable_egal(){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}
	private evaluable_diff(){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}
	private evaluable_inf(){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}

	private evaluable_infeg(){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}
	private evaluable_sup(){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}
	private evaluable_supeg(){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}
	private evaluable_et(){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}

	private evaluable_ou(){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}

	private evaluable_non(){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}
	private evaluable_tra(n : number){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}
	private evaluable_tze(n : number){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}
	private evaluable_erreur(exp : string){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}
	private evaluable_empilerAd(n : number){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}
	private evaluable_empilerParam(n : number){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}
	private evaluable_retourProc(){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}
	private evaluable_retourFonct(){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}
	private evaluable_reserverBloc(){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}
	private evaluable_traStat(n : number ,t : number){
		this.output.appendLine("TODO");
		this.currentLineCpt++;
	}

//--------------------------------------------------------------------------------//


}
//================================================================================//