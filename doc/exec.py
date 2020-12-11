#!/usr/bin/python3

#======================exec.py=====================#


#---------------------Encodage---------------------#

# -*- coding: utf-8 -*-

#--------------------------------------------------#


#---------------------Imports----------------------#

import sys #Permet de forcer la fin du programme et 
# de gérer les paramètres d'entrées
import time #Permet d'utiliser un délai

#--------------------------------------------------#


#--------------------Description-------------------#

# Ce fichier gère l'exécution du code compilé dans
#les langages NNP et NNA

#--------------------------------------------------#


#----------------------Auteurs---------------------#

# Sébastien HERT
# Adam RIVIERE

#--------------------------------------------------#


#----------------Variables globales----------------#

pile = [] # Contient les valeurs stockées en mémoire
cptLigne = 0 # Indique la ligne actuelle
pointeurLigne = [] # Stocke les indices de ligne et
# de décalages mémoire en cas d'appel de fonction ou
# de procédure
programme = [] # Stocke les lignes lues dans le
# fichier copilé
fin = False # Permet de gérer la fin du programme

#--------------------------------------------------#


#---------------------Méthodes---------------------#

def debutProg():
    """
    Description : Indique le début du programme

    Paramètres : None

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """

    print("Début de Programme")
    global cptLigne
    cptLigne += 1


def finProg():
    """
    Description : Indique la fin du programme

    Paramètres : None

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """
    print("Fin de Programme")
    global fin
    fin = True


def reserver(n):
    """
    Description : Réserve n emplacements dans la pile

    Paramètres :
    - n : le nombre d'emplacements à reserver

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """
    global cptLigne
    cpt = cptLigne
    for i in range(0, n):
        empiler(0)
    cptLigne = cpt+1


def empiler(n):
    """
    Description : Empile la valeur n en sommet de pile

    Paramètres :
    - n : la valeur à empiler

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """
    pile.append(n)
    global cptLigne
    cptLigne += 1


def affectation():
    """
    Description : Effectue l'affectation Ad(a):=n où Ad(a) est l'adresse de a et n la nouvelle valeur de a, toutes les deux en sommet de pile.

    Paramètres : None

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """

    global pile
    n = pile.pop()
    a = pile.pop()
    pile[a] = n
    global cptLigne
    cptLigne += 1


def valeurPile():
    """
    Description : Recherche la valeur a, située à l'adresse n, avec n donné en sommet de pile

    Paramètres : None

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """
    
    global cptLigne
    cpt = cptLigne
    n = pile.pop()
    a = pile[n]
    empiler(a)
    cptLigne = cpt+1


def get():
    """
    Description : Récupère l'élément saisi au clavier

    Paramètres : None

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """
    
    global cptLigne
    cpt = cptLigne
    ok = False
    while not ok:
        a = input("Entrez un nombre à empiler : ")
        try:
            data = int(a)
            empiler(data)
            affectation()
            ok = True
        except ValueError:
            print("Rentrez une valeur entière")
    cptLigne = cpt+1


def put():
    """
    Description : Affiche le sommet de pile

    Paramètres : None

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """
    a = pile.pop()
    print(a)
    global cptLigne
    cptLigne += 1


def moins():
    """
    Description : Évalue l'expression "-a" où a est la valeur du sommet de pile interprétée comme un entier, et empile le résultat sous forme d'un entier

    Paramètres : None

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """

    global cptLigne
    cpt = cptLigne
    a = pile.pop()
    empiler(-a)
    cptLigne = cpt+1


def sous():
    """
    Description : Évalue l'expression "a-b" où a et b sont les deux valeurs du sommet de pile interprétées comme des entiers, et empile le résultat sous forme d'un entier

    Paramètres : None

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """
    
    global cptLigne
    cpt = cptLigne
    b = pile.pop()
    a = pile.pop()
    empiler(a-b)
    cptLigne = cpt+1


def add():
    """
    Description : Évalue l'expression "a+b" où a et b sont les deux valeurs du sommet de pile interprétées comme des entiers, et empile le résultat sous forme d'un entier

    Paramètres : None

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """

    global cptLigne
    cpt = cptLigne
    b = pile.pop()
    a = pile.pop()
    empiler(a+b)
    cptLigne = cpt+1


def mult():
    """
    Description : Évalue l'expression "a*b" où a et b sont les deux valeurs du sommet de pile interprétées comme des entiers, et empile le résultat sous forme d'un entier

    Paramètres : None

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """
    
    global cptLigne
    cpt = cptLigne
    b = pile.pop()
    a = pile.pop()
    empiler(a*b)
    cptLigne = cpt+1


def div():
    """
    Description : Évalue l'expression "a/b" où a et b sont les deux valeurs du sommet de pile interprétées comme des entiers, et empile le résultat sous forme d'un entier

    Paramètres : None

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """

    global cptLigne
    cpt = cptLigne
    b = pile.pop()
    a = pile.pop()
    empiler(a//b)
    cptLigne = cpt+1


def egal():
    """
    Description : Évalue l'expression "a=b" où a et b sont les deux valeurs du sommet de pile interprétées comme des entiers, et empile le résultat sous forme de booléen

    Paramètres : None

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """
    
    global cptLigne
    cpt = cptLigne
    b = pile.pop()
    a = pile.pop()
    empiler(int(a == b))
    cptLigne = cpt+1


def diff():
    """
    Description : Évalue l'expression "a≠b" où a et b sont les deux valeurs du sommet de pile interprétées comme des entiers, et empile le résultat sous forme de booléen

    Paramètres : None

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """

    global cptLigne
    cpt = cptLigne
    b = pile.pop()
    a = pile.pop()
    empiler(int(a != b))
    cptLigne = cpt+1


def inf():
    """
    Description : Évalue l'expression "a<b" où a et b sont les deux valeurs du sommet de pile interprétées comme des entiers, et empile le résultat sous forme de booléen

    Paramètres : None

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """

    global cptLigne
    cpt = cptLigne
    b = pile.pop()
    a = pile.pop()
    empiler(int(a < b))
    cptLigne = cpt+1


def infeg():
    """
    Description : Évalue l'expression "a≤b" où a et b sont les deux valeurs du sommet de pile interprétées comme des entiers, et empile le résultat sous forme de booléen

    Paramètres : None

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """

    global cptLigne
    cpt = cptLigne
    b = pile.pop()
    a = pile.pop()
    empiler(int(a <= b))
    # print(a, b, a <= b)
    cptLigne = cpt+1


def sup():
    """
    Description : Évalue l'expression "a>b" où a et b sont les deux valeurs du sommet de pile interprétées comme des entiers, et empile le résultat sous forme de booléen

    Paramètres : None

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """
    global cptLigne
    cpt = cptLigne
    b = pile.pop()
    a = pile.pop()
    empiler(int(a > b))
    cptLigne = cpt+1


def supeg():
    """
    Description : Évalue l'expression "a≥b" où a et b sont les deux valeurs du sommet de pile interprétées comme des entiers, et empile le résultat sous forme de booléen

    Paramètres : None

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """
    
    global cptLigne
    cpt = cptLigne
    b = pile.pop()
    a = pile.pop()
    empiler(int(a >= b))
    cptLigne = cpt+1


def et():
    """
    Description : Évalue l'expression "bool1 et bool2" où bool1 et bool2 sont les deux valeurs du sommet de pile interprétées comme des booléens, et empile le résultat  sous forme de booléen

    Paramètres : None

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """
    
    global cptLigne
    cpt = cptLigne
    bool1 = pile.pop()
    bool2 = pile.pop()
    empiler(int(bool1 and bool2))
    cptLigne = cpt+1


def ou():
    """
    Description : Évalue l'expression "bool1 ou bool2" où bool1 et bool2 sont les deux valeurs du sommet de pile interprétées comme des booléens, et empile le résultat  sous forme de booléen

    Paramètres : None

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """

    global cptLigne
    cpt = cptLigne
    bool1 = pile.pop()
    bool2 = pile.pop()
    empiler(int(bool1 or bool2))
    cptLigne = cpt+1


def non():
    """
    Description : Évalue l'expression "non bool1" où bool1 est la valeur du sommet de pile interprétée comme un booléen, et empile le résultat sous forme de booléen

    Paramètres : None

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """
    
    global cptLigne
    cpt = cptLigne
    boolean = pile.pop()
    empiler(int(not boolean))
    cptLigne = cpt+1


def tra(n):
    """
    Description : Effectue un saut vers la ligne n

    Paramètres :
    - n : la prochaine ligne à exécuter

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """

    global cptLigne
    cptLigne = n-1


def tze(n):
    """
    Description : Effectue un saut vers la ligne n si le booléen en sommet de pile est faux

    Paramètres :
    - n : la prochaine ligne à exécuter

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """

    boolean = pile.pop()
    global cptLigne
    if not bool(boolean):
        cptLigne = n-1
    else:
        cptLigne += 1


def erreur(exp):
    """
    Description : Affiche l'erreur exp et finit le programme

    Paramètres :
    - exp : l'expression à afficher

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """

    print(exp)
    print("Une Erreur est survenue - Fin de Programme")
    sys.exit()


def empilerAd(n):
    """
    Description : Empile l'adresse globale n

    Paramètres :
    - n : l'adresse n à empiler

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """

    empiler(n+pointeurLigne[-1])


def empilerParam(n):
    """
    Description : Empile l'adresse locale n

    Paramètres :
    - n : l'adresse n à empiler

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """

    global cptLigne
    pile.append(n+pointeurLigne[-1])
    valeurPile()
    cptLigne+=1


def retourFonct():
    """
    Description : Signale la fin d'une fonction

    Paramètres : None

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """

    global pile

    # On sauve la valeur à retourner
    retour = pile.pop()

    # On vide la pile de toutes les potentielles valeurs stockées
    while pile[-1] != None:
        pile.pop()

    # On retire le bloc
    for _ in range(3):
        pile.pop()

    # On remet la valeur de retour en sommet de pile
    pile.append(retour)

    # On renvoie à la ligne suivante du programme
    global cptLigne
    pointeurLigne.pop()
    cptLigne = pointeurLigne.pop()


def retourProc():
    """
    Description : Signale la fin d'une procédure

    Paramètres : None

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """

    # On vide la pile de toutes les potentielles valeurs stockées
    while pile[-1] != None:
        pile.pop()

    # On retire le bloc
    for _ in range(3):
        pile.pop()

    # On renvoie à la ligne suivante du programme
    global cptLigne
    pointeurLigne.pop()
    cptLigne = pointeurLigne.pop()


def reserverBloc():
    """
    Description : Réserve un bloc de 3 emplacements dans la pile

    Paramètres : None

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """
    
    for _ in range(3):
        pile.append(None)
    global cptLigne
    cptLigne += 1


def traStat(n, t):
    """
    Description : Appelle la ligne n avec t paramètres

    Paramètres :
	- n : la prochaine ligne à exécuter
	- t : le nombre de paramètres

    Retour : None

    Auteurs :
    - Sébastien HERT
    - Adam RIVIERE
    """

    # Sauvegarde de la prochaine ligne à exécuter après le retour de fonction
    global pointeurLigne
    global cptLigne
    pointeurLigne.append(cptLigne+1)

    # Déplacement à la ligne n
    cptLigne = n-1

    # Stockage du décalage adresse-position dans la pile
    pointeurLigne.append(len(pile)-t)

#--------------------------------------------------#


#-----------------------Main-----------------------#

# print("lets go")
f = open(sys.argv[1])

for line in f:
	programme.append(line.split(";")[0])

f.close()

while not fin:
    # print(cptLigne+1)
    eval(programme[cptLigne])
    # print(pile)
	# time.sleep(1)

#--------------------------------------------------#


#==================================================#