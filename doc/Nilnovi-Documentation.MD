# **Nilnovi Documentation**

## **Syntax**

Nilnovi is a non-indentation sensitive language very close to pseudo-code.

Such as a lot of non-indentation sensitive language, every line should finish by a semicolon (`;`) or a key-word (`is`, `end`, `loop`, `then`, `else`).


## **Allowed Types**

* **integer** : accepts both positive and negative number
* **boolean** : *true* or *false*

## **Allowed Scopes**

Used in method declaration, define the scope (local or global) of the parameter :

* **in** : the parameter is used as a local variable, no impact in the main program
* **in out** : the parameter is used as a global variable, changing its value in both main procedure and sub method.

## **Declarations**

### **Functions and procedures**

#### **Pre implemented methods**

* **put (i : integer)** : prints i. 
* **get (i : integer)** : gets the input from the user adn affects it to i.


#### **User Methods**

All functions and procedures should be declared as follows:

```
procedure my_procedure_name(param1 : scope Type1, [...]) is
	var1 : Type;
	var2 : Type;
	[...]
	begin
		# statement
	end
```
OR

```
function my_function_name(param1 : scope Type, [...]) return Type is
	var1 : Type;
	var2 : Type;
	[...]
	begin
		# statement
		return value;
	end
```

As this is procedure and function declaration, it is always necessary to use parentheses.

### **Variables**

All variables have to be declared at the top of the method, before the key-word "begin", such as explained above.

## **Operators**

* **\+** : addition
* **\-** : substraction
* **\*** : multiplication
* **/** : quotient
* **:=** : affectation
* **=** : logical equality
* **/=** : logical inequality
* **or** : logical or
* **and** : logical and
* **not** : logical not
* **>** : superior
* **>=** : superior or equal
* **<** : inferior
* **<=** : inferior or equal


## **Comments**

* **\#** : commented line
* **/\* [...] \*/** : comments block

## **Blocks**

### **If**


```
if [condition] then
	# statement
elif [condition] then
	# statement
else
	# statement
end
```

### **While**

```
while [condition] loop
	# statement
end
```

### **For**

```
for [i] from [begin] to [end] loop
	# statement
end
```

## **Key-words**

* **procedure** 
* **function**
* **is**
* **in**
* **out**
* **begin**
* **end**
* **return**
* **if**
* **then**
* **elif**
* **else**
* **while**
* **loop**
* **for**
* **from**
* **to**



## **Authors**

* Sébastien HERT
* Adam RIVIÈRE