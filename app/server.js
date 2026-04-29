require('dotenv').config();
import express from 'express';
import {rateLimit} from 'express-rate-limit';

// pour limiter les tentative de login, contre le brut-force
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    // fenêtre de 15min
    windowMs: 15*60*1000,
    // max 5 tentatives par IP dans cette fenêtre
    limit: 5,
    // message quand limite est dépassée
    message: { error: 'Trop de tentatives de connexion, réessayez dans 15 minutes'},
    // applique limite sur les requêtes échouées
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
});

const express = require("express");
const path = require("path");
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware pour parser le corps des requêtes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques :CSS, images, uploads...
app.use(express.static(path.join(__dirname, "public")));

// Routes API retournent du JSON
const authRoute    = require("./routes/Auth");
const profileRoute = require("./routes/Profile");
const adminRoute   = require("./routes/Admin");

app.use("/api/auth",    authRoute);
app.use("/api/profile", profileRoute);
app.use("/api/admin",   adminRoute);

// Routes pages retournent du HTML
const homeRoute = require("./routes/Home");
const userRoute = require("./routes/User");

app.use("/", homeRoute);
app.use("/user", userRoute);

app.get("/login",    (_req, res) => res.sendFile(path.join(__dirname, "views", "login.html")));
app.get("/register", (_req, res) => res.sendFile(path.join(__dirname, "views", "register.html")));
app.get("/profile",  (_req, res) => res.sendFile(path.join(__dirname, "views", "profile.html")));
app.get("/admin", (_req, res) => res.sendFile(path.join(__dirname, "views", "admin.html")));

// Démarrage du serveur
app.get("/test",      (_req, res) => res.send("db admin: root, pwd : root"));

// pour le middleware qui gere les exeptions
app.use(errorHandler);

app.listen(3000, () => {
    console.log("Serveur démarré sur http://localhost:3000");
});
