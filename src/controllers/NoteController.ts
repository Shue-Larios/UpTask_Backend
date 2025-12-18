import type { Request, Response } from "express"
import { Note, INote } from "../models/Note"
import { Types } from "mongoose"


type NoteParams = {
    noteId: Types.ObjectId

}

export class NoteController {
    // crea la nota es como la funcion
    // <{}, {}, INote> es un generic para darle tipo de dato a los req consta de 4 partes
    // parte 1 es la de los params 
    // la 2 da es de 
    // la 3 es la de req.body por eso ese tiene tipo de dato INote
    static createNote = async (req: Request<{}, {}, INote>, res: Response) => {

        const { content } = req.body

        // crea la instancia en la base de datos Note es el modelo
        const note = new Note()
        // para llenar el campo de content con el content que viene del usuario en req.body
        note.content = content
        // como en req creamos una de usuario utilizamos esa para guardar el id
        note.createdBy = req.user.id
        note.task = req.task.id

        // lo agrregamos a la tarea
        req.task.notes.push(note.id)

        // guardamos en la base de datos
        try {
            await Promise.allSettled([req.task.save(), note.save()])
            res.send('Nota Creada Correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }


    // para obtener las notas de una tarea
    static getTaskNote = async (req: Request, res: Response) => {
        try {
            // find devuelve todas las notas que tengan el id pasado
            const notes = await Note.find({ task: req.task.id })
            res.json(notes)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }
    // para eliminar una nota
    // cuando es solo uno no ocupo ponerle los {} sino que va de un solo
    static deleteNote = async (req: Request<NoteParams>, res: Response) => {
        const { noteId } = req.params
        const note = await Note.findById(noteId)
  
        // hay que revisar que la nota exista
        if (!note) {
            const error = new Error('Nota no encontrada')
            return res.status(404).json({ error: error.message })
        }
        // la persona que intenta eliminar la nota no la creo
        // si la persona que esta autenticada en req.user no creo la nota por el id
        if (note.createdBy.toString() !== req.user.id.toString()) {
            const error = new Error('Accion no valida')
            return res.status(401).json({ error: error.message })
        }


        // eliminar la referencia que tenemos en la tarea de la nota
        req.task.notes = req.task.notes.filter(note => note.toString() !== noteId.toString())

        try {
            // para guardar en la base de datos
           await Promise.allSettled([req.task.save(), note.deleteOne()])
            res.json('Nota Eliminada')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }
}