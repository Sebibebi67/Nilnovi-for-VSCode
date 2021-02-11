//============================== Class VariableList ==============================//


//--------------------------------- Description ----------------------------------//
//
// This is a structure which stores the known variables
//
//--------------------------------------------------------------------------------//


//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
//
//--------------------------------------------------------------------------------//


//----------------------------------- Imports ------------------------------------//

import { Variable } from "./Variable";

//--------------------------------------------------------------------------------//


export class VariableList {

	
	
	//------------------------------- Class Variables --------------------------------//

	private dictionary: { [id: string]: Variable } = {}

	//--------------------------------------------------------------------------------//


	//--------------------------------- Constructor ----------------------------------//

	constructor() { }

	//--------------------------------------------------------------------------------//


	//----------------------------------- Methods ------------------------------------//
	
	/**
 	 * @description gets the chosen variable
 	 * @param string id of the chosen variable
	 * @author Sébastien HERT
	 */
	public get(id : string){
		return this.dictionary[id];
	}
	
	/**
	 * @description adds a new variable to the dictionary
	 * @param Variable variable to add
	 * @author Sébastien HERT
	 */
	public add(variable : Variable){
		this.dictionary[variable.methodName+"."+variable.name] = variable;
	}

	/**
	 * @description removes variables from the dictionary
	 * @param string method from which variables has to be removed
	 * @author Sébastien HERT
	 */
	public removeVariables(methodName : string){
		for (var key in this.dictionary) {
			if (this.dictionary[key].methodName == methodName) { delete this.dictionary[key] }
		}
	}

	//--------------------------------------------------------------------------------//


}
//================================================================================//