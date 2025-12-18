import type { Request, Response } from "express"
import Project from "../models/Project"

// el controlador o controller es donde vamos hacer todo el CRUD
export class ProjectController {

    // Crear proyectos
    static createProjects = async (req: Request, res: Response) => {

        // esta linea nos crea una instancia en project
        // Project es nuestro models
        const project = new Project(req.body)

        // ASIGNAR MANAGER AL PROYECTO
        // recordando que aca ya escribi un nuevo campo en req (esta en el middleware auth)
        project.manager = req.user.id


        try {
            // para guardar en la base de datos la instancia de arriba (projject)
            await project.save()
            // para indicarle al usuario que se realizo
            res.send('Proyecto Creado Correctamente')
        } catch (error) {
            console.log(error);
        }
    }

    // obtenemos todos los proyectos guardados en la base de datos
    // como son estaticos no necesitan ser instanciados
    static getAllProjects = async (req: Request, res: Response) => {
        try {
            // con find obtenemos todos los datos de la base
            const projects = await Project.find({
                // nos permite colocar  multiples condiciones por eso va en arreglo
                $or: [
                    // se trae todos los que tengan el id en el campo manager in es de mongodb
                    // req.user es la que nosotros creamos y que incluye informacion como el id
                    { manager: { $in: req.user.id } },
                    // se trae los datos si eres parte del proyecto osea colaborador
                    { team: { $in: req.user.id } },

                ]
            })
            // de esta forma retornamos una respuesta de tipo json con los datos de la variable projects
            res.json(projects)
        } catch (error) {
            console.log(error);
        }
    }


    // traer el proyecto solo por el id solo si lo creaste
    static getProjectById = async (req: Request, res: Response) => {
        const { id } = req.params
        try {
            // con findById obtenemos el registro con ese id
            const project = await Project.findById(id).populate('tasks')

            // por que puede existir el ID pero puede devolver null
            if (!project) {
                // creamos la variable error para almacenarlo y lo que ponemos aca lo recuperamos en error.message
                const error = new Error('Proyecto no Encontrado')
                return res.status(404).json({ error: error.message })
            }

            // comprobamos si la persona que esta autenticada es el manager del projecto o si pertenece a los colaboradores
            // la negamos para que entre aca y como si es true pasa al siguiente
            if (project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)) {
                const error = new Error('Accion no valida')
                return res.status(404).json({ error: error.message })
            }
            // de esta forma retornamos una respuesta de tipo json con los datos de la variable projects
            res.json(project)
        } catch (error) {
            console.log(error);
        }
    }

    // actualiza el proyecto
    static updateProject = async (req: Request, res: Response) => {

        try {
            // esto es de mongoose findByIdAndUpdate lo que hace es eencontrar un registro por su id y lo actualiza
            // req.body son los datos que le estamos mandando pero con findById no lo ocupo
            // AL FINAL COMENTO ESTO POR QUE SE HIZO ALGO PARA QUE DEJARAMOS DE TENER CODIGO REPETIDO EN EL UPDATE Y DELETE
            // const project = await Project.findById(id)
            // // por que puede existir el ID pero puede devolver null
            // if (!project) {
            //     // creamos la variable error para almacenarlo y lo que ponemos aca lo recuperamos en error.message
            //     const error = new Error('Proyecto no Encontrado')
            //     return res.status(404).json({ error: error.message })
            // }
            // comprobamos si la persona que esta autenticada es el manager del projecto
            // if (project.manager.toString() !== req.user.id.toString()) {
            //     const error = new Error('Solo el manager puede actualizar un proyecto')
            //     return res.status(404).json({ error: error.message })
            // }
            // en este campo va a tener esta informacion que mandamos por el body
            req.project.clientName = req.body.clientName
            req.project.projectName = req.body.projectName
            req.project.description = req.body.description
            // guardamos en la base de datos
            await req.project.save()
            res.send('Proyecto Actualizado')
        } catch (error) {
            console.log(error);
        }
    }

    // borra el proyecto
    static deleteProject = async (req: Request, res: Response) => {
        const { id } = req.params
        try {
            // // ESTO LO COMENTAMOS POR QUE HICIMOS ALGO EN EL MIDDLEWARE PARA EVITAR REPETIR CUENTA
            // const project = await Project.findById(id)
            // // por que puede existir el ID pero puede devolver null
            // if (!project) {
            //     // creamos la variable error para almacenarlo y lo que ponemos aca lo recuperamos en error.message
            //     const error = new Error('Proyecto no Encontrado')
            //     return res.status(404).json({ error: error.message })
            // }
            // // comprobamos si la persona que esta autenticada es el manager del projecto
            // if (project.manager.toString() !== req.user.id.toString()) {
            //     const error = new Error('Solo el manager puede eliminar un proyecto')
            //     return res.status(404).json({ error: error.message })
            // }

            // para eliminar un registro de la base de datos
            await req.project.deleteOne()
            res.send('Proyecto Eliminado')
        } catch (error) {
            console.log(error);
        }
    }


}