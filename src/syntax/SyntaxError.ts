//============================== Class SyntaxError ===============================//


//--------------------------------- Description ----------------------------------//
//
// This class stores all the data used for each error.
//
//--------------------------------------------------------------------------------//


//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
// Adam RIVIÈRE
//
//--------------------------------------------------------------------------------//


//----------------------------------- Imports ------------------------------------//

export var isError: boolean = false;

//--------------------------------------------------------------------------------//


export class SyntaxError {


//------------------------------- Class Variables --------------------------------//

    public code: number;
    public message: string;
    public line: number;

//--------------------------------------------------------------------------------//


//--------------------------------- Constructor ----------------------------------//

    constructor(code: number, message: string, line: number) {
        this.code = code;
        this.message = "SyntaxError at line " + line + " : " + message
        this.line = line;
    }
//--------------------------------------------------------------------------------//

}
//================================================================================//