//=================================== tools.ts ===================================//


//--------------------------------- Description ----------------------------------//
//
// The files gives some tools used in different files
//
//--------------------------------------------------------------------------------//


//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
// Adam RIVIÈRE
//
//--------------------------------------------------------------------------------//


//----------------------------------- Imports ------------------------------------//

import { errors } from "./syntax/providers";
import { SyntaxError } from "./syntax/SyntaxError";

//--------------------------------------------------------------------------------//


//---------------------------------- Functions -----------------------------------//

/**
 * @description returns the line content and the line index
 * @param string the line
 * @returns {content : currentLine, index : nbLine} the content and the index of the line
 * @author Sébastien HERT
 * @author Adam RIVIÈRE
 */
export function splittingLine(line: string) {
    // $ is used to indicate the line number
    var splitLine = line.trim().split("$");

    // if there is more than two "$"
    if (splitLine.length > 3) {

        // the line number is at this end of the line
        var nbLine = parseInt(splitLine[1])

        // and we need to merge each part of the split line (except the last one) in order to look for more errors
        var currentLine = "";
        for (let i = 2; i < splitLine.length ; i++) { currentLine += splitLine[i].trim(); }
        // And don't forget to raise an error
        errors.push(new SyntaxError(402, "Unexpected character", nbLine));
    }

    // else everything is right
    else {
        var nbLine = parseInt(splitLine[1]);
        var currentLine = splitLine[2].trim();
    }
    return { content: currentLine.trim(), index: nbLine }
}

/**
 * @description Adds index before the end of the line
 * @param String file
 * @returns the indexed file as a String
 * @author Sébastien HERT
 * @author Adam RIVIÈRE
 */
export function indexingFile(file: string) {

    // We need a list of line
    var parsedFile = file.split(/\r?\n/);
    var indexedFile = "";
    var i = 1;

    // Then for each line, we recreate a single-line string with the current line and le line number
    for (let index = 0; index < parsedFile.length; index++) {
        var line = parsedFile[index];
        indexedFile = indexedFile + "$" + i + "$" + line + "\n";
        i++;
    }
    return indexedFile
}

/**
 * @description removes the comments from a file
 * @param string file to clean
 * @returns the file without comments
 * @author Sébastien HERT
 */
export function removeComments(file: string) {
    var regexpComment = /(\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/)|(\#.*)/gm;
    return file.replace(regexpComment, "");
}


/**
 * @description returns a list of string without empty ones
 * @param string[] the output lines
 * @returns the lines modified
 * @author Sébastien HERT
 */
export function removeEmptyLines(lines : string[]){

    // we need to remove all the lines which are empty or only containing its number
    lines = lines.filter(function emptyLine(line){
        line = line.trim();
        return !(new RegExp(/^\$[0-9]+\$$/).test(line)) && line.length != 0;
    });
    return lines;
}

/**
 * @description split a string into a list of words
 * @param string the line to parse
 * @returns a list of words
 * @author Sébastien HERT
 */
export function lineToWordsList(line: string) {

    // Let's define all the words separator
    const regexParser = new RegExp(/( |,|\+|\-|\/|\*|>|<|=|:|;|\(|\))/);

    // Then split the line
    var words = line.split(regexParser);

    // And remove the empty lines
    words = words.filter(function checkEmpty(word) {
        return (word != "" && word != " ");
    })
    return words;
}

/**
 * @description removes [nbWordsBegin] elements from the begin and [nbWordsEnd] from the end of a list
 * @param string[] the list of words
 * @param nbWordsBegin the number of words to remove at the beginning
 * @param nbWordsEnd the number of words to remove at the end
 * @returns the new list of words
 * @author Sébastien HERT
 */
export function removeFromWords(words :string[], nbWordsBegin :number , nbWordsEnd:number ){

    for (let i = 0; i<nbWordsBegin; i++){words.shift()}
    for (let i = 0; i<nbWordsEnd; i++){words.pop()}

    return words
}

//--------------------------------------------------------------------------------//



//================================================================================//r