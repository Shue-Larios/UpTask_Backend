import mongoose, { Document, Schema, PopulatedDoc, Types } from "mongoose";
import Task, { ITask } from "./Task";
import { IUser } from "./User";
import { Note } from "./Note";

// estas lineas son de TypeScript
// IProject de interface project
export interface IProject extends Document {
    projectName: string,
    clientName: string,
    description: string
    // sirve para hacer referencia a la tabla hija 
    // arreglo al final por que un proyecto puede tener multiples tareas
    // ese Document es una herencia hay que ponerla
    // por que pueden ser muchos agregamos el []
    tasks: PopulatedDoc<ITask & Document>[]
    // la persona que crea el proyecto
    // como aca no puede haber multiples creadores quitamos los []
    manager: PopulatedDoc<IUser & Document>
    // por que el grupo de trabajo va a estar conformado por usuario
    team: PopulatedDoc<IUser & Document>[]
}

// definimos el modelo para mongoose (los campos de la tabla en la base de datos)
const ProjectSchema: Schema = new Schema({
    projectName: {
        // tiene que ir en mayuscula porque es de Mongoose
        type: String,
        // le digo que este campo es obligatorio
        required: true,
        // quita los espacio al inicio y al final de los datos ingresados
        trim: true,
        // garantiza que los datos sean unicos
        // unique: true
    },
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    // por que van a ver multiples tareas por eso guardamos un arreglo
    // este seria el campo para el populate que funciona como el join en base relacionales
    tasks: [
        {
            // le digo el tipo de dato que va a tener solo la del objectId
            type: Types.ObjectId,
            // la referencia al modelo
            ref: 'Task'

        }
    ],
    manager: {
        // le digo el tipo de dato que va a tener solo la del objectId
        type: Types.ObjectId,
        ref: 'User'

    },
    team: [
        {
            // le digo el tipo de dato que va a tener solo la del objectId
            type: Types.ObjectId,
            // la referencia al modelo de mongoo
            ref: 'User'

        }
    ],
    // cada que creamos un registro se almacena cuando se creo y tambien cuando se actualiza
}, { timestamps: true })

// Middleware en Mongoo funciones que se ejecutan despues o antes de que ocurra cierta accion y son propios de cada Schema
// Quiero que se ejecute este antes que yo elimine una tarea deleteOne es de mongoose
ProjectSchema.pre('deleteOne', {
    // aca puedo dejar solamente el que va como true
    // document retorna el documento o los datos que estas eliminando 
    document: true, query: false
},
    // aca va la funcion que se va aejecutar
    async function () {
        // tomamos el id de la tarea
        const projectId = this._id  // que valor del modelo queremos acceder
        if (!projectId) return

        // encontrar todas las tareas que le pertenecen a este proyecto en ese campo
        const tasks = await Task.find({ project: projectId })
        // identificamos todas las notas de las tareas
        for (const task of tasks) {
            // eliminamos todas las notas de ese proyecto
            await Note.deleteMany({ task: task.id })
        }
        //   deleteMany  Es un método de Mongoose que elimina varios documentos que cumplan una condición.
        // en ese campo solo se almacena el id de la tarea a la que es asociada
        await Task.deleteMany({ project: projectId })
    }
)



// definimos nuestro modelo y se registra en la instancia de mongoose
// tiene que tener un nombre unico que es la tabla en la base datos y asi se puede enlazar y el segundo parametro es el Schema que enlazo
const Project = mongoose.model<IProject>('Project', ProjectSchema)

export default Project