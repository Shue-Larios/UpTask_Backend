import mongoose, { Schema, Document } from "mongoose";

// este es el modelo de la tabla de la base de datos
export interface IUser extends Document {
    // lo que va a tener un usuario
    email: string
    password: string
    name: string
    confirmed: boolean
}

// esto ya es de mongoose
const userShcema: Schema = new Schema({
    email: {
        type: String,
        require: true,
        //convertirá automáticamente a minúsculas
        lowercase: true,
        // para que el correo sea unico
        unique: true
    },
    password: {
        type: String,
        require: true,
    },
    name: {
        type: String,
        require: true,
    },
    confirmed: {
        type: Boolean,
        default: false,
    }
})

// Definimos el modelo, con el nombre de la tabla y el userSchema para que tome esos datos
const User = mongoose.model<IUser>('User', userShcema)
export default User