#!/usr/bin/python

## 	@package machine
# 	virtual machine package
#
#0 est false, 1 est vrai

import sys, argparse, re

pile = [] #pile des adresses et valeurs
ip = 1 #pointeur vers le sommet
instructions = []
fin = False
pointeurInstruction=1

def init(filename): #Initialisation de la file de commandes
    file = open(filename, "r") #On ouvre le fichier compilé
    global instructions
    instructions = ["Liste d'instructions"]+[tupleFirstTwo(re.split('\(|\)',x)) for x in file] #On créé une file d'instructions (chaque instruction est
    if(instructions[1][0] != "debutProg"): #On vérifie que le programme commence et finit par debutProg() et finProg()
        print("Error: file does not start with debutProg()")
    if(instructions[-1][0] != "finProg"):
        print("Error: file does not end with finProg()")
    print(instructions);

def main():
    parser = argparse.ArgumentParser(description='Do the syntactical analysis of a NNP program.')
    parser.add_argument('inputfile', type=str, nargs=1, help='name of the input source file')
    args = parser.parse_args()
    filename = args.inputfile[0]

    global pointeurInstruction
    global fin
    pointeurInstruction = 1
    fin = False

    init(filename)
    
    while(not(fin)): #tant que fin est False
        instruction = instructions[pointeurInstruction]
        fonction = globals()[instruction[0]]
        if(instruction[1] == ''): #sans paramètre
            fonction()
        elif(instruction[0] == 'error'): #error est la seule fonction avec un paramètre non int
            fonction(instruction[1])
        elif("," in instruction[1]): #TraStat possède 2 paramètres
            fonction(int(re.split(',',instruction[1])[0]),int(re.split(',',instruction[1])[1]))
        else: #avec 1 paramètre
            fonction(int(instruction[1]))
        pointeurInstruction += 1

def test(filename, debug = False):
    global pointeurInstruction
    global fin
    global pile
    pile = []
    pointeurInstruction = 1
    fin = False

    init(filename)
    
    while(not(fin)): #tant que fin est False
        instruction = instructions[pointeurInstruction]
        if(debug):print([pointeurInstruction]+[instruction[i] for i in range(2)])
        fonction = globals()[instruction[0]]
        if(instruction[1] == ''): #sans paramètre
            fonction()
        elif(instruction[0] == 'error'): #error est la seule fonction avec un paramètre non int
            fonction(instruction[1])
        elif("," in instruction[1]): #TraStat possède 2 paramètres
            fonction(int(re.split(',',instruction[1])[0]),int(re.split(',',instruction[1])[1]))
        else: #avec 1 paramètre
            fonction(int(instruction[1]))
        pointeurInstruction += 1
        if(debug):print(pile)

def tupleFirstTwo(l):
    return (l[0],l[1])

#~~~~# Début fonctions appelées #~~~~#

#~~~~# NNA #~~~~#

def debutProg():
    global pile, ip, base
    pile = [] #pile des adresses et valeurs
    ip = -1 #pointeur vers le sommet
    base = -1 #pointeur vers la base du bloc de liaison courant #eventuellement le faire démarrer à -1

def finProg(): #arret de la machine
    global fin
    fin = True

def reserver(val): #permet de réserver n emplacements pour n variables au sommet de la pile
    global pile, ip
    for i in range (val):
        pile.append(0)
    ip = ip+val

def empiler(val): #empile les adresses de variables et valeurs dans une expression
    global pile, ip
    pile.append(val)
    ip = ip+1

def affectation(): #place la valeur en sommet dans l'adresse désignée par l'emplacement sous le sommet
    global pile, ip
    val = pile.pop()
    insert = pile.pop()
    if insert == len(pile):
        pile.append(val)
    else:
        pile[insert] = val
    ip=ip-2

def valeurPile(): #remplace le sommet de la pile par le contenu de l'emplacement désigné par le sommet
    global pile, ip
    ad=pile[ip]
    pile[ip]=pile[ad]

def get(): #place la valeur lu par le clavier dans la variable qui est désignée par le sommet de la pile
    global pile, ip
    val=int(input())
    pile.append(val)
    ip=ip+1


def put(): #affiche la valeur présente au sommet de la pile
    global pile, ip
    print(pile.pop())
    ip=ip-1

def moins(): #calcule l'opposé de la valeur entière au sommet de la pile
    global pile, ip
    pile[ip]=-pile[ip]

def sous(): # différence entre les deux valeurs au sommet de la pile (sommet-1 - sommet)
    global pile, ip
    sous=-(pile.pop()-pile.pop()) # - (sommet- sommet-1)
    pile.append(sous)
    ip=ip-1

def add(): # addition
    global pile, ip
    add=pile.pop()+pile.pop()
    pile.append(add)
    ip=ip-1

def mult(): #multiplication
    global pile, ip
    mult=pile.pop()*pile.pop()
    pile.append(mult)
    ip=ip-1

def div():# division
    global pile, ip
    op2=pile.pop()
    op1=pile.pop()
    pile.append(int(op1/op2))
    ip=ip-1


def egal(): #compare les deux valeurs du sommet de pile et empile le code bool de l'expression sommet-1==sommet
    global pile, ip
    op2=pile.pop()
    op1=pile.pop()
    if(op1==op2):
        pile.append(1)
    else:
        pile.append(0)
    ip=ip-1

def diff(): #idem égal mais sommet-1!=sommet
    global pile, ip
    op2=pile.pop()
    op1=pile.pop()
    if(op1!=op2):
        pile.append(1)
    else:
        pile.append(0)
    ip=ip-1

def inf():#idem égal mais sommet-1<sommet
    global pile, ip
    op2=pile.pop()
    op1=pile.pop()
    if(op1<op2):
        pile.append(1)
    else:
        pile.append(0)
    ip=ip-1

def infeg():#idem égal mais sommet-1<=sommet
    global pile, ip
    op2=pile.pop()
    op1=pile.pop()
    if(op1<=op2):
        pile.append(1)
    else:
        pile.append(0)
    ip=ip-1

def sup():#idem égal mais sommet-1>sommet
    global pile, ip
    op2=pile.pop()
    op1=pile.pop()
    if(op1>op2):
        pile.append(1)
    else:
        pile.append(0)
    ip=ip-1

def supeg():#idem égal mais sommet-1=>sommet
    global pile, ip
    op2=pile.pop()
    op1=pile.pop()
    if(op1>=op2):
        pile.append(1)
    else:
        pile.append(0)
    ip=ip-1

def et(): #prend en compte les deux bool sommet-1 et sommet de la pile et place dans la pile l'expression (sommet-1 AND sommet)
    global pile, ip
    op2=pile.pop()
    op1=pile.pop()
    if(op1>0 and op2>0):
        pile.append(1)
    else:
        pile.append(0)
    ip=ip-1

def ou(): #idem mais avec OU
    global pile, ip
    op2=pile.pop()
    op1=pile.pop()
    if (op1>0 or op2>0):
        pile.append(1)
    else:
        pile.append(0)
    ip=ip-1

def non(): #calcul la négation du booléen en sommmet de pile
    global pile, ip
    op1=pile.pop() 
    if(op1==0):
        pile.append(1)
    else:
        pile.append(0)

def tra(ad): #donne le controle a l'instruction situé a l'adresse ad
    global pile, ip, pointeurInstruction
    pointeurInstruction=ad-1

def tze(ad): #donne le controle  a l'instruction ad si le sommet  contient faux, sinon continue normalement
    global pile, ip    
    if (pile.pop()==0):
        tra(ad)
    ip=ip-1

def error(message): #affiche un message d'erreur
    global fin
    print(message)
    fin = True

#~~~~# NNP #~~~~#

def empilerAd(ad):
    global base
    empiler(ad+base+2)

def reserverBloc():
    global pile, ip, base
    ip += 2
    pile.append(base) #bas du bloc de liaison
    pile.append(0) #haut du bloc de liaison

def traStat(a, nbp):
    global pile, ip, pointeurInstruction, base
    pile[ip-nbp] = pointeurInstruction+1
    base = (ip-nbp)-1
    tra(a)

def retourProc():
    global pile, ip, base
    while(ip >= base+2):
        ip -= 1
        pile.pop()
    tra(pile.pop())
    ip -= 1
    adrrBase = pile.pop()
    if(adrrBase == -1):
        base = -1
    else:
        base = adrrBase
    ip -= 1

def retourFonc():
    global pile, ip, base
    v = pile.pop()
    ip -= 1
    retourProc()
    pile.append(v)
    ip += 1

def empilerParam(ad):
    global pile, ip, base
    pile.append(pile[base+2+ad])
    ip += 1

########################################################################
    
if __name__ == "__main__":
        main()

