import type { Request, Response, NextFunction } from "express"
// nombre del modelo y de la interface
import Task, { ITask } from "../models/Task"

// este middleware lo utilizamos en varios lugares

// para poder reescribir el request y podes pasar informacion de un middleware a otro este codigo es de TS
declare global {
    namespace Express {
        // la diferencia entre interface y type esque esta se puede duplicar y el type no
        interface Request {
            // agregamos un atributo nuevo y especificamos el type en este caso es un interface
            task: ITask
        }
    }
}

// para validar si la tarea existe
export async function taskExists(req: Request, res: Response, next: NextFunction) {
    try {
        // si la tarea no existe
        // para leer parametros de la url
        const { taskId } = req.params
        //    consultar la base de datos para ver si existe el proyecto por el id
        const task = await Task.findById(taskId)
        // por que sino existe el proyecto
        if (!task) {
            // creamos la variable error para almacenarlo y lo que ponemos aca lo recuperamos en error.message
            const error = new Error('Tarea no Encontrada')
            return res.status(404).json({ error: error.message })
        }
        // asi podemos compartir una informacion de este middleware hacia otro
        req.task = task
        // si el proyecto existe nos vamos al siguiente middleware
        next()
    } catch (error) {
        res.status(500).json({ error: "Hubo un error" })
    }
}



// que la tarea pertenezca al proyecto
export async function taskBelongsToProject(req: Request, res: Response, next: NextFunction) {
    try {
        // validamos si la tarea que traemos le pertenece al proyecto
        // se convierte a string xk es un id de mongose
        // como estamos compartiendo informacion del middleware esta en req
        if (req.task.project.toString() !== req.project.id.toString()) {
            const error = new Error('Accion no Valida')
            return res.status(400).json({ error: error.message })
        }
        // si el proyecto existe nos vamos al siguiente middleware
        next()
    } catch (error) {
        res.status(500).json({ error: "Hubo un error" })
    }
}


// que la tarea pertenezca al proyecto
export async function hasAutorization(req: Request, res: Response, next: NextFunction) {
    try {
        // si el id del usuario es diferente al id del manager que recibimos
        if (req.user.id.toString() !== req.project.manager.toString()) {
            const error = new Error('Accion no Valida')
            return res.status(400).json({ error: error.message })
        }
        // si es el manager nos vamos al siguiente middleware
        next()
    } catch (error) {
        res.status(500).json({ error: "Hubo un error" })
    }
}