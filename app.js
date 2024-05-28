const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const { exec } = require("child_process");

const app = express();
const PORT = 3000;
const SECRET = "secret"; // Remplacez par le secret configuré dans GitHub

// Middleware pour parser les corps JSON
app.use(bodyParser.json());

// Fonction pour vérifier la signature du webhook
function verifySignature(req, res, buf, encoding) {
    const signature = req.headers['x-hub-signature'];
    const hmac = crypto.createHmac('sha1', SECRET);
    hmac.update(buf, encoding);
    const digest = `sha1=${hmac.digest('hex')}`;
    if (signature !== digest) {
        throw new Error('Invalid signature');
    }
}

// Middleware pour vérifier la signature
app.use(bodyParser.json({ verify: verifySignature }));

// Endpoint pour le webhook
app.post("/webhook", (req, res) => {
    const event = req.body;
    console.log(event)

    // Vérifiez le type d'événement
    if (event.ref === "refs/heads/main") { // Remplacez par la branche souhaitée
        console.log("Changement détecté dans la branche principale:", event);

        // Pull le dernier code et construisez-le
        exec("git pull origin main && npm install && npm run build", (error, stdout, stderr) => {
            if (error) {
                console.error(`Erreur lors de l'exécution de la commande: ${error}`);
                return;
            }
            console.log(`Sortie: ${stdout}`);
            console.error(`Erreurs: ${stderr}`);
        });
    }

    // Répondez pour accuser réception de l'événement
    res.status(200).send("Événement reçu");
});

// Démarrez le serveur
app.listen(PORT, () => {
    console.log(`Le serveur fonctionne sur le port ${PORT}`);
});
