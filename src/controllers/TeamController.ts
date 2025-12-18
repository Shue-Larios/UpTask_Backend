import { Request, Response } from "express"
import User from "../models/User"
import Project from "../models/Project"

export class TeamMemberController {

    // busca al usuario por el id
    static findMemberByEmail = async (req: Request, res: Response) => {

        // extraemos el email que nos mandan
        const { email } = req.body

        // FIND USER
        // select para seleccionar solo los campos que necesito
        const user = await User.findOne({ email }).select(' id email name')

        // si no hay un usuario
        if (!user) {
            const error = new Error('Usuario no encontrado')
            return res.status(404).json({ error: error.message })
        }
        // retornamos la informacion necesariio del usuario
        res.json(user)
    }
    // para obtener todos los colaboradores del proyecto
    static getProjecTeam = async (req: Request, res: Response) => {
        // hacemos una consulta para saber quienes son los miembros del equipo de trabajo
        // el populate es para que me traiga todos los datosy no me muestre solo el id
        const project = await Project.findById(req.project.id).populate({
            // le digo el campo
            path: "team",
            // le digo que campos son los unicos que quiero
            select: 'id email name'
        })
        res.json(project.team)
    }


    // agrega al colaborador al projecto por su id el manager nos manda el email
    static addMemberById = async (req: Request, res: Response) => {

        // extraemos el email que nos mandan
        const { id } = req.body

        // FIND USER
        // select para seleccionar solo los campos que necesito
        const user = await User.findById(id).select(' id')

        // si no hay un usuario
        if (!user) {
            const error = new Error('Usario no encontrado')
            return res.status(404).json({ error: error.message })
        }

        // que el manager no sea un colaborador mas
        if (req.project.manager.toString() === user.id.toString()) {
            const error = new Error('El manager no puede ser colaborador')
            return res.status(409).json({ error: error.message })
        }

        // revisamos si el colaborador no esta agregado todavia
        // some dice si incluye
        if (req.project.team.some(team => team.toString() === user.id.toString())) {
            const error = new Error('Colaborador ya registrado')
            return res.status(409).json({ error: error.message })
        }
        // agregamos al colaborador al projecto
        req.project.team.push(user.id)
        // para almacenarlo en la base
        await req.project.save()

        // retornamos un mensaje
        res.send('Colaborador agregado correctamente')
    }


    // elimina el colaborador al projecto por su id el manager nos manda el email
    static removeMemberById = async (req: Request, res: Response) => {

        // extraemos el id de la url
        const { userId } = req.params

        // revisa si el usuario no existe en el proyecto  
        if (!req.project.team.some(team => team.toString() === userId)) {
            const error = new Error('El usuario no existe en el proyecto')
            return res.status(409).json({ error: error.message })
        }

        // si el usuario existe lo elimina
        req.project.team = req.project.team.filter(team => team.toString() !== userId)
        await req.project.save()

        // retornamos un mensaje
        res.send('Colaborador eliminado correctamente')
    }


}