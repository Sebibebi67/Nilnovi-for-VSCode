# **Documentation Nilnovi**

## **Syntaxe**

Nilnovi est un langage non sensible à l'indentation relativement proche du pseudo-code.

Comme la plupart des langages non sensibles à l'indentation, chaque ligne doit finir par un point-virgule (`;`) ou un mot-clef (`is`, `end`, `loop`, `then`, `else`).



## **Types autorisés**

* **integer** : nombres entiers positifs ou négatifs
* **boolean** : *true* ou *false*

## **Portées autorisées**

* **in** : le paramètre est utilisé comme variable locale, aucun impact sur la procédure principale
* **in out** : le paramètre est utilisé comme variable globale, changer sa valeur aura un effet sur la procédure principale

## **Déclarations**

### **Fonctions et procédures**

#### **Méthodes pré-implémentées**

* **put (i : integer)** : affiche i. 
* **get (i : integer)** : récupère une valeur de l'utilisateur et l'affecte à i.


#### **Méthodes définies par l'utilisateur**

Toutes les fonctions et procédures doivent être déclarées comme suit:

```
procedure my_procedure_name(param1 : scope Type1, [...]) is
	var1 : Type;
	var2 : Type;
	[...]
	begin
		# statement
	end
```
OU

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

Comme il s'agit d'une déclaration de procédure et de fonction, il est toujours nécessaire d'utiliser des parenthèses.

### **Variables**

Toutes les variables doivent être déclarées en haut de la méthode, avant le mot-clé "begin", comme expliqué ci-dessus.

## **Opérateurs**

* **\+** : addition
* **\-** : sustraction
* **\*** : multiplication
* **/** : quotient
* **:=** : affectation
* **=** : egalité logique
* **/=** : inégalité logique
* **or** : ou logique
* **and** : et logique
* **not** : non logique
* **>** : supérieur à
* **>=** : supérieur ou égal à
* **<** : inférieur à
* **<=** : inférieur ou égal à


## **Commentaires**

* **\#** : ligne commentée
* **/\* [...] \*/** : bloc de commentaires

## **Structures de blocs**

### **Si**

```
if [condition] then
	# statement
elif [condition] then
	# statement
else
	# statement
end
```

### **Tant que**

```
while [condition] loop
	# statement
end
```

### **Pour**

```
for [i] from [begin] to [end] loop
	# statement
end
```


## **Mots-clefs**

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

## **Différences**

* Ajout de la boucle for
* Ajout du commentaire de bloc avec ```/* commented block */```
* Changement du commentaire de ligne ```//``` en ```#```
* Suppression du ```.``` en fin de programme
* Obligation de finir une ligne par un mot-clef approprié ou par un ```;```




## **Auteurs**

* Sébastien HERT
* Simon JOURDAN
* Adam RIVIÈRE