# **Nilnovi Extension README**

This extension allows you to write, compile and execute programs in Nilnovi.

## **Features**

This extension provides :
- a description of the Nilnovi **Grammar** and **Syntax** in [french](./doc/Nilnovi-Documentation-Fr.MD) and in [english](./doc/Nilnovi-Documentation.MD)
- **IntelliSense**
- Tracking of **Compilation** and **Execution** errors
- **Dynamic display** of the pile

## **Quick start**

TODO

* First, open a file with the ```.nn``` extension to activate all the features of this extension
* Then, write your program with all those wonderful tools
* With that done, you can run your program by tapping ```F1``` (by default) to open the VSCode commands list and use ```run Nilnovi```
* This will generate a new file called ```yourFileName.machine_code``` and open a new tab where you will see the machine_code and the pile.

## **Requirements**

All you need is VScode 1.49.0 or upper.

## **Known Issues**

ø

## **Release Notes**



### **2.0.0**

- Corrected issues :
  - Return type is now verified in functions and should match declaration.
  - Indexing lines should now work with comments.
  - Variable and Procedures declarations with the same name is no longer a problem.
  - Variable scope should no longer be a problem.
  - No parameter methods fixed.
  - Opération on methods.
  - Fixing non symmetrical operators.
  - Boolean functions can now be given as boolean condition in ```while``` and ```if```.
  - Solving scope issues.
  - Binary operators now check both operands.
  - "moins" no longer returns null. 


### **1.0.1**

 - Corrected issues :
	- Procedures (which don't return a value) cannot be placed as parameter anymore.
	- "put" method now requires one unique parameter.
	- Cannot run an empty file anymore.

### **1.0.0**

Initial release



## **Authors**

Enssat Compilation Team of Students (ECTS):
- HERT Sébastien
- JOURDAN Simon
- RIVIÈRE Adam

**Have fun!**
