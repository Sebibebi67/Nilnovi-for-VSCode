# **Nilnovi Extension README**

This extension allows you to write, compile and execute programs in Nilnovi.

## **Features**

This extension provides :
- a description of the Nilnovi **Grammar** and **Syntax** in [french](./doc/Nilnovi-Documentation-Fr.MD) and in [english](./doc/Nilnovi-Documentation.MD)
- **IntelliSense**
- Tracking of **Compilation** and **Execution** errors
- **Dynamic display** of the pile

## **Quick start**

* First, open a file with the ```.nn``` extension to activate all the features of this extension
* Then, write your program with all those wonderful tools
* You can now play with the following buttons :
  * ![](./src/icons/PlayButton.png) : Runs the entire program.
  * ![](./src/icons/StopButton.png) : Stops the program.
  * ![](./src/icons/ForwardButton.png) : Moves forward.
  * ![](./src/icons/BackwardButton.png) : Moves backward.
  * ![](./src/icons/PlayPauseButton.png) : Pauses and resumes the execution.
  * ![](./src/icons/ResetButton.png) : Resets the output.
  * ![](./src/icons/DelayButton.png) : Sets the delay between each instruction.
  * ![](./src/icons/MaxRecButton.png) : Sets the max recursions number.
* Notice that you can also use the same features by using their corresponding command using the VSCode commands list.
* This will generate a new file called ```yourFileName.machine_code``` and open a new tab where you will see the machine_code and the pile.


## **Requirements**

All you need is VScode 1.49.0 or higher.

## **Known Issues**

ø

## **Release Notes**

### **2.0.1**

- Corrected issues :
  - line indexing in "for" messed up compilation


### **2.0.0**



- New features :
  - Adding a Run button to run the program.
  - Adding a Play/Pause button to pause and replay the execution.
  - Adding a Next Step button to execute the next line in the machine code.
  - Adding a Previous Step button to execute the previous line in the machine code.
  - Adding a Reset button to reset the display windows.
  - Adding a Stop button to stop a running program.
  - Adding a Delay button to configure the delay between executed lines.
  - Adding a Max Recursion button to configure the maximum number of recursions.
  - Adding a highlight to the current machine code line.

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
  - Variable declaration in procedure should no longer be a problem.


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
