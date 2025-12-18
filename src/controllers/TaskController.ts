import type { Request, Response } from "express"
import Task from "../models/Task"



export class TaskController {
    // Crear Tareas
    static createTask = async (req: Request, res: Response) => {
        try {
            // Task es nuestro modelo
            const task = new Task(req.body)
            // para guardar el id del proyecto puede ser id o _id este esta guardado en req que lo compartimos del middlewware/project.ts
            task.project = req.project.id
            // con push agregamos al proyecto las tareas que vamos creando
            req.project.tasks.push(task.id)

            // garantiza que todos los promises se ejecuten esto seria como el await para guardar pero lo hacemos asi para guardar en la base de datos al mismo tiempo 
            await Promise.allSettled([task.save(), req.project.save()])
            res.send('Tarea Creada correctamente')
        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }


    // obtener tareas de un proyecto
    static getProjectTasks = async (req: Request, res: Response) => {
        try {
            // find es como que si fuera un where en las base de datos relacionales
            // project es el de la base de datos
            // populate funciona igual que el join en las base de datos relacionales dentro del parentecis NO VA EL NOMBRE DE MODELO es el campo de project en el models Task
            const tasks = await Task.find({ project: req.project.id }).populate('project')
            res.json({ tasks })
        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }

    // Traer la tarea por el id
    static getTaskById = async (req: Request, res: Response) => {
        try {
            // con populate le digo que llene todo el campos de path:completedBy en user y con select le digo que campos quiero nada mas
            const task = await Task.findById(req.task.id)
                // esta es para traer toda la informacion del historial de cambios
                .populate({ path: "completedBy.user", select: 'id name email' })
                // este es para traerse toda la informacion de la nota y traer tambien la informacion del completeby
                  .populate({ path: "notes", populate: { path: "createdBy", select: 'id name email' } })
            // si la tarea existe
            res.json(task)
        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }
    // actualizar la tarea
    static updateTask = async (req: Request, res: Response) => {
        try {
            // este codigo lo pasamos para un middleware
            //  ===Inicio==
            // // validamos si la tarea que traemos le pertenece al proyecto
            // // se convierte a string xk es un id de mongose
            // if (req.task.project.toString() !== req.project.id) {
            //     const error = new Error('Accion no Valida')
            //     return res.status(400).json({ error: error.message })
            // } ====Fin=========
            req.task.name = req.body.name
            req.task.description = req.body.description
            // guardamos en la base de datos
            await req.task.save()
            // si la tarea existe
            res.send("Tarea Actualizada Correctamente ")
        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }
    // para eliminar la tarea y su registro en el proyecto
    static deleteTask = async (req: Request, res: Response) => {
        try {
            // trae todas las tareas que no son la misma a la que estamos eliminando y se asigna a poject.task
            // req.project.tasks = req.project.tasks.filter(task => task.toString() !== taskId)
            req.project.tasks = req.project.tasks.filter((task) => task.toString() !== req.task.id.toString());
            // esto se encarga de eliminar el documento en la coleccion ded tareas
            //  await task.deleteOne()
            // para guardar el cambio que hicimos sacando el que borramos
            //  await req.project.save()
            // lo hacemos aca para no tener doble await como en la parte de arriba
            await Promise.allSettled([req.task.deleteOne(), req.project.save()])
            // si la tarea existe
            res.send("Tarea Eliminada Correctamente ")
        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }


    // para actualizar el estado de la tarea
    static updateStatus = async (req: Request, res: Response) => {
        try {
            // req.body son los datos que esto mandando desde postman
            const { status } = req.body
            // guardamos en task el status que le estamos mandando
            req.task.status = status

            const data = {
                user: req.user.id,
                status
            }

            // codigo condicional de si la tarea se regrese a pendiente no guarde nada solamente se usa si solo quiero el ultimo datoa
            // if (status === 'pending') {
            //     req.task.completedBy = null
            // } else {
            //     // en el campo de completado le almaceno el id del usuario que hizo alguna actualizacion
            //     req.task.completedBy = req.user.id
            // }
            // push para que vaya agregando cada actualizacion
            req.task.completedBy.push(data)
            await req.task.save()
            res.send(("Tarea Actualizada"))
        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }
}