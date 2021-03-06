//============================ Class CompilationError ============================//


//--------------------------------- Description ----------------------------------//
//
// This class stores all the data used for each error for the compiler.
//
//--------------------------------------------------------------------------------//


//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
// Adam RIVIÈRE
//
//--------------------------------------------------------------------------------//


export var isError: boolean = false;

export function setError(bool : boolean){
    isError = bool;
}

export class CompilationError {


//------------------------------- Class Variables --------------------------------//

    public code: number;
    public message: string;
    public line: number;

//--------------------------------------------------------------------------------//


//--------------------------------- Constructor ----------------------------------//

    constructor(code: number, message: string, line: number) {
        this.code = code;
        this.message = "Compilation error at line " + line + " : " + message + ".";
        this.line = line;
        isError = true;
    }
//--------------------------------------------------------------------------------//

}
//================================================================================//