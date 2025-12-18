import mongoose, { Schema, Document, Types } from "mongoose";

// este es el modelo de la tabla de la base de datos
export interface IToken extends Document {

    token: string
    // para hacer referencia al usuario
    user: Types.ObjectId // lo ponemos asi xk vamos almacenar la referencia al usuario
    // para saber cuando fue creado ese token
    created: Date
}

const tokenSchema: Schema = new Schema({
    token: {
        type: String,
        require: true
    },
    user: {
        type: Types.ObjectId,
        // aca se nombra como se nombre el modelo al que hacemos referencia
        ref: 'User'
    },
    // para que el campo se elimine correctamente al tiempo establecido
    expiresAt: {
        type: Date,
        default: Date.now(),
        // cada que se genere un token despues de 10min se elimina de la base de datos
        expires: "10m"
    }
})

// Definimos el modelo, con el nombre de la tabla y el userSchema para que tome esos datos
const Token = mongoose.model<IToken>('Token', tokenSchema)
export default Token