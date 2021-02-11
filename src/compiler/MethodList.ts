//=============================== Class MethodList ===============================//



//--------------------------------- Description ----------------------------------//
//
// This is a structure which stores the known methods
//
//--------------------------------------------------------------------------------//


//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
//
//--------------------------------------------------------------------------------//


//----------------------------------- Imports ------------------------------------//

import { Method } from "./Method"

//--------------------------------------------------------------------------------//


export class MethodList {


//------------------------------- Class Variables --------------------------------//

private dictionary : { [id: string]: Method } = {}


//--------------------------------------------------------------------------------//


//--------------------------------- Constructor ----------------------------------//

	constructor(){}
//--------------------------------------------------------------------------------//


//----------------------------------- Methods ------------------------------------//

/**
 * @description gets the chosen method
 * @param string id of the chosen method
 * @author Sébastien HERT
 */
public get(id : string){
	return this.dictionary[id];
}

/**
 * @description adds a new method to the dictionary
 * @param Method method to add
 * @author Sébastien HERT
 */
public add(method : Method){
	this.dictionary[method.name] = method;
}

//--------------------------------------------------------------------------------//


}
//================================================================================//