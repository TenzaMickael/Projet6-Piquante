// On importe notre model User
const User = require("../models/User");

// On importe le package bcrypt pour hasher le mot de passe des utilisateurs
const bcrypt = require('bcrypt');

// On importe le package jsonwebtoken pour attribuer un token à un utilisateur au moment ou il se connecte
const jwt = require('jsonwebtoken');

require('dotenv').config();


//* *****Permet de créer un nouvel utilisateur***** *//

// Nous appelons la fonction de hachage de bcrypt dans notre mot de passe et lui demandons de « saler » le mot de passe 10 fois
// Il s'agit d'une fonction asynchrone qui renvoie une Promise dans laquelle nous recevons le hash généré
// Dans notre bloc then , nous créons un utilisateur et l'enregistrons dans la base de données, en renvoyant une réponse de réussite en cas de succès, et des erreurs avec le code d'erreur en cas d'échec
exports.signup = (req, res, next) => {
    const emailHash = Buffer.from(req.body.email).toString('hex');
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: emailHash,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur crée !'}))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));

};


//* *****Permet de vérifier si un utilisateur qui tente de se connecter dispose d'identifiants valides***** *//

// nous utilisons notre modèle Mongoose pour vérifier que l'e-mail entré par l'utilisateur correspond à un utilisateur existant de la base de données :

/*dans le cas contraire, nous renvoyons une erreur 401 Unauthorized*/
/*si l'e-mail correspond à un utilisateur existant, nous continuons*/

//nous utilisons la fonction compare debcrypt pour comparer le mot de passe entré par l'utilisateur avec le hash enregistré dans la base de données :

/*s'ils ne correspondent pas, nous renvoyons une erreur 401 Unauthorized et un message « Mot de passe incorrect ! »*/
/*s'ils correspondent, les informations d'identification de notre utilisateur sont valides. Dans ce cas, nous renvoyons une réponse 200 contenant l'ID utilisateur et un token.*/
exports.login = (req, res, next) => {
    const emailHash = Buffer.from(req.body.email).toString('hex');
    User.findOne({ email: emailHash })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !'});
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !'}); 
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            {userId: user._id},
                            process.env.SECRET_TOKEN,
                            { expiresIn: '24h'}
                        )
                    });
                })
                .catch( error => res.stratus(500).json({ error }));
        })
        .catch( error => res.stratus(500).json({ error }));
};