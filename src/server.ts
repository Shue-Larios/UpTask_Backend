import express from "express";
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from "morgan"
import {conectDB } from './config/db'
// aca el que estamos importando es router default pero se esta renombrando
import projectRoutes from "./routes/projectRoutes";
import authRoutes from "./routes/authRoutes";


import { corsConfig } from "./config/cors";




// instancia de dotenv
dotenv.config()



// coneccion a la base de datos
conectDB()


// creamos la aplicacion
const app = express()

// permitimos las conexiones
app.use(cors(corsConfig))

// Logging
app.use(morgan('dev'))

// leer datos de formulario
// esta linea es para poder leer los datos que mandamos por el body de tipo json con postman
app.use(express.json())

// Routes
// asi definimos la ruta principal para un controlador
// de esta ruta hacia delante programamos las otras
app.use('/api/auth', authRoutes) // todo lo relacionado con autenticacion en esta
// todo relacionado a proyectos y tareas
app.use('/api/projects', projectRoutes)




export default app