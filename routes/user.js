/* *****Création du rooter qui contient les fonctions qui s'appliquent aux différentes routes pour les utilisateur***** */

// Importation du Framework Express
const express = require('express');

// Appel du router avec la méthode mise à disposition par Express
const router = express.Router();

//* *****Ajout des middlewares***** *//

// On associe les fonctions aux différentes routes, on importe le controller
const userCtrl = require('../controllers/user');

//* *****Création des routes Inscription et Connexion de l'API avec les middlewares et les controllers d'authentification et de sécurité qui leur sont appliquées***** *//

// Chiffre le mot de passe de l'utilisateur, ajoute l'utilisateur à la base de données
router.post('/signup', userCtrl.signup);

// Vérifie les informations d'identification de l'utilisateur, en renvoyant l'identifiant userID depuis la base de données et un TokenWeb JSON signé(contenant également l'identifiant userID)
router.post('/login', userCtrl.login);

// Nous exportons ensuite le router
module.exports = router;