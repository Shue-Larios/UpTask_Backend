import mongoose, { Document, Schema, Types } from "mongoose";

// estas lineas son de TypeScript
// INote de interface Note
export interface INote extends Document {
    content: string,
    // tenemos una referencia al usuario que creo la nota
    createdBy: Types.ObjectId,
    // y una tarea a la cual pertenece esa nota
    task: Types.ObjectId
}

// definimos el modelo para mongoose (los campos de la tabla en la base de datos)
const NoteSchema: Schema = new Schema({
    content: {
        type: String,
        // dice que el  campo es requerido
        required: true
    },
    createdBy: {
        type: Types.ObjectId,
        // a que tabla hace la referencia
        ref: 'User',
        required: true
    },
    task: {
        type: Types.ObjectId,
        // a que tabla hace la referencia
        ref: 'Task',
        required: true
    }
    // cada que creamos un registro se almacena cuando se creo y tambien cuando se actualiza
}, { timestamps: true })

// definimos nuestro modelo y se registra en la instancia de mongoose
// tiene que tener un nombre unico que es la tabla en la base datos y asi se puede enlazar y el segundo parametro es el Schema que enlazo
export const Note = mongoose.model<INote>('Note', NoteSchema)