// Récupération du modèle sauce
const Sauce = require("../models/Sauce");

// Récupération du package file system permettant de gérer ici les téléchargements et modifications d'images
const fs = require('fs');


//* *****Permet de récupérer toutes les sauces***** *//

// On utilise la méthode find pour obtenir la liste complète des sauces trouvées dans la base, l'array de toutes les sauves de la base de données
exports.getAllSauces =  (req, res, next) => {
    Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};


//* *****Permet de récupérer une sauce***** *//

// On utilise la méthode findOne et on lui passe l'objet de comparaison, on veut que l'id de la sauce soit le même que le paramètre de requête
exports.getOneSauce =  (req, res, next) => {
    Sauce.findOne( { _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json( { error }));
};

//* *****Permet de créer une nouvelle sauce***** *//

// On crée un object sauceObjet qui stocke les données envoyées par le front-end en les transformant en objet js
// On supprime l'id généré automatiquement et envoyé par le front-end.
// On crée ensuite une instance Sauce à partir de sauceObjet
// On traite l'image
// On valide les champs à l'aide de regex
// Sauvegarde de la sauce dans la base de données
exports.createSauce =  (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce)
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
		dislikes: 0,
		usersLiked: [' '],
		usersDisliked: [' '],

    });
    sauce
	.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
    .catch(error => res.status(400).json({ error}));  
};


//* *****Permet de modifier une sauce***** *//

// On crée un objet sauceObjet qui regarde si req.file existe ou non
// S'il existe, on traite la nouvelle image
// S'il n'existe pas, on traite l'objet entrant
// On effectue la modification
exports.updateSauce = (req, res, next) => {
    const sauceObject = req.file ?
    {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body }

	Sauce.findOne({ _id: req.params.id})
	.then(sauce => {
		const filename = sauce.imageUrl.split('/images/')[1]
		fs.unlink(`images/${filename}`, () => {

			Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
				.then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
				.catch(error => res.status(400).json({ error }));
			
		});
	});
};

//* *****Permet de supprimer une sauce***** *//

// On va chercher l'objet Sauce pour obtenir l'url de l'image et supprimer le fichier image de la base
// Nous utilisons le fait de savoir que notre URL d'image contient un segment /images/ pour séparer le nom de fichier
// Nous utilisons ensuite la fonction unlink du package fs pour supprimer ce fichier
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1]
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id})
                    .then(res.status(200).json({ message: "Sauce supprimée !"}))
                    .catch(error => res.status(400).json({ error }))
            })
        })
        .catch(error => res.status(500).json({ error}))
};


//* *****Permet de liker, disliker une sauce***** *//

// On crée des valeurs avec les différent champs de la requete
exports.likeDislikeSauce = (req, res, next) => {
	let like = req.body.like
	let userId = req.body.userId
	let sauceId = req.params.id

// Utilisation de la méthode switch pour plus de clarté dans le code 
	switch (like) {

// Si l'utilisateur aime la sauce , on incrémente le compteur "j'aime" de +1 et on le met à jour
	  case 1 :
		  Sauce.updateOne({ _id: sauceId }, { $push: { usersLiked: userId }, $inc: { likes: +1 }})
			.then(() => res.status(200).json({ message: `J'aime` }))
			.catch((error) => res.status(400).json({ error }))
			  
		break;

// Si l'utilisateur annule ce qu'il aime ou n'aime pas   
	  case 0 :
		  Sauce.findOne({ _id: sauceId })
			 .then((sauce) => {

// On annule le "like" de l'utilisateur ,on décrémente le compteur de "j'aime" , on le met à jour et l'utilisateur redeviens neutre 				 
			  if (sauce.usersLiked.includes(userId)) { 
				Sauce.updateOne({ _id: sauceId }, { $pull: { usersLiked: userId }, $inc: { likes: -1 }})
				  .then(() => res.status(200).json({ message: `Neutre` }))
				  .catch((error) => res.status(400).json({ error }))
			  }

// On annule le "dislike" de l'utilisateur ,on décrémente le compteur de "j'aime pas" , on le met à jour et l'utilisateur redeviens neutre 			  
			  if (sauce.usersDisliked.includes(userId)) { 
				Sauce.updateOne({ _id: sauceId }, { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 }})
				  .then(() => res.status(200).json({ message: `Neutre` }))
				  .catch((error) => res.status(400).json({ error }))
			  }
			})
			.catch((error) => res.status(404).json({ error }))
		break;

// Si l'utilisateur n'aime pas la sauce , on incrémente le compteur "j'aime pas" de +1 et on le met à jour
	  case -1 :
		  Sauce.updateOne({ _id: sauceId }, { $push: { usersDisliked: userId }, $inc: { dislikes: +1 }})
			.then(() => { res.status(200).json({ message: `Je n'aime pas` }) })
			.catch((error) => res.status(400).json({ error }))
		break;
		
		default:
		  console.log(error);
	}
  }
