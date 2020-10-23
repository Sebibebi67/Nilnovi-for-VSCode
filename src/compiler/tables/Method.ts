//================================= Class Method =================================//



//--------------------------------- Description ----------------------------------//
//
// This is a structure which describes the fields of a function or a procedure 
//
//--------------------------------------------------------------------------------//


//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
// Adam RIVIÈRE
//
//--------------------------------------------------------------------------------//


//----------------------------------- Imports ------------------------------------//

import { Variable } from "./Variable";

//--------------------------------------------------------------------------------//


export class Method {


	//------------------------------- Class Variables --------------------------------//

	public name: string;
	public scope: number;
	public type: string;
	public refLine: number;
	public params: Variable[];


	//--------------------------------------------------------------------------------//


	//--------------------------------- Constructor ----------------------------------//

	constructor(name: string, scope: number, type: string, refLine: number, params: Variable[]) {
		this.name = name;
		this.scope = scope;
		this.type = type;
		this.refLine = refLine;
		this.params = params;
	}

	//--------------------------------------------------------------------------------//


	//----------------------------------- Methods ------------------------------------//

	public isEqual(name : string){
		return (this.name == name);
	}

	//--------------------------------------------------------------------------------//


}
//================================================================================//