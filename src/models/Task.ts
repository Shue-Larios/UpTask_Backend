import mongoose, { Document, Schema, Types } from "mongoose";
import { Note } from "./Note";

// para tener el estado de las tareas que son 5
const taskStatus = {
    PENDING: 'pending',
    ON_HOLD: "onHold",
    IN_PROGRESS: "inProgress",
    UNDER_REVIEW: "underReview",
    COMPLETED: "completed"
} as const // indica que solo se pueden leer y no modificar

// [keyof typeof taskStatus] con esto obtenemos solo los valores y no las propiedades
export type TaskStatus = typeof taskStatus[keyof typeof taskStatus]

// estas lineas son de TypeScript
export interface ITask extends Document {
    name: string,
    description: string,
    // cada tarea va a estar asociada a un proyecto 
    // con el Types de mongo le digo que va a tener ese tipo de dato
    project: Types.ObjectId,
    status: TaskStatus,
    completedBy: {
        user: Types.ObjectId,
        status: TaskStatus
        // le pongo al final [] para que sepa que va almacenar diferentes elementos el completedBy
    }[],
    // [] por que vamops a tener un arreglo de notas
    notes: Types.ObjectId[]
}


// definimos el modelo para mongoose (los campos de la tabla en la base de datos)
const TaskSchema: Schema = new Schema({
    name: {
        // tiene que ir en mayuscula porque es de Mongoose
        type: String,
        // le digo que este campo es obligatorio
        required: true,
        // quita los espacio al inicio y al final de los datos ingresados
        trim: true,
        // garantiza que los datos sean unicos
        // unique: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    // este es el campo que se pondria en el populate
    project: {
        type: Types.ObjectId,
        // asi hacemos referencia al modelo que lo queremos enlazar
        ref: 'Project'
    },
    status: {
        type: String,
        // asi va aceptar solamente uno de los valores que tenemos en taskStatus
        enum: Object.values(taskStatus),
        // para ponerle un valor por defecto
        default: taskStatus.PENDING
    },
    // para ver quien cambia el estado de la tarea como un historial
    completedBy: [
        {
            user: {
                type: Types.ObjectId,
                ref: 'User',
                default: null
            },
            status: {
                type: String,
                // asi va aceptar solamente uno de los valores que tenemos en taskStatus
                enum: Object.values(taskStatus),
                // para ponerle un valor por defecto
                default: taskStatus.PENDING
            }
        }
    ],
    notes: [
        {
            type: Types.ObjectId,
            ref: 'Note',
        }
    ]
}, { timestamps: true })

// Middleware en Mongoo funciones que se ejecutan despues o antes de que ocurra cierta accion y son propios de cada Schema
// Quiero que se ejecute este antes que yo elimine una tarea deleteOne es de mongoose
TaskSchema.pre('deleteOne', {
    // aca puedo dejar solamente el que va como true
    // document retorna el documento o los datos que estas eliminando 
    document: true, query: false
},
    // aca va la funcion que se va aejecutar
    async function () {
        // tomamos el id de la tarea
        const taskId = this._id  // que valor del modelo queremos acceder
        if (!taskId) return
        //   deleteMany  Es un método de Mongoose que elimina varios documentos que cumplan una condición.
        // en ese campo solo se almacena el id de la tarea a la que es asociada
        await Note.deleteMany({ task: taskId })
    }
)

// definimos nuestro modelo y se registra en la instancia de mongoose
// tiene que tener un nombre unico que es la tabla en la base datos y el segundo parametro es el Schema que enlazo
const Task = mongoose.model<ITask>('Task', TaskSchema)

export default Task