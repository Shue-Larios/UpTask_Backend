import type { Request, Response, NextFunction } from "express"
// nombre del modelo y de la interface
import Project, { IProject } from "../models/Project"

// este middleware lo utilizamos en varios lugares

// para poder reescribir el request y podes pasar informacion de un middleware a otro este codigo es de TS
declare global {
    namespace Express {
        // la diferencia entre interface y type esque esta se puede duplicar y el type no
        interface Request {
            // agregamos un atributo nuevo y especificamos el type en este caso es un interface
            project: IProject
        }
    }
}

// para validar si el proyecto existe
export async function projectExists(req: Request, res: Response, next: NextFunction) {
    try {
        // revisa si el proyecto existe
        // para leer parametros de la url
        const { projectId } = req.params
        //    consultar la base de datos para ver si existe el proyecto por el id
        // Project es el modelo
        const project = await Project.findById(projectId)
        // por que sino existe el proyecto
        if (!project) {
            // creamos la variable error para almacenarlo y lo que ponemos aca lo recuperamos en error.message
            const error = new Error('Proyecto no Encontrado')
            return res.status(404).json({ error: error.message })
        }
        // asi podemos compartir una informacion de este middleware hacia otro
        req.project = project
        // si el proyecto existe nos vamos al siguiente middleware
        next()
    } catch (error) {
        res.status(500).json({ error: "Hubo un error" })
    }
}