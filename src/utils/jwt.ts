import jwt from 'jsonwebtoken'
import Type from "mongoose"

type userPayload = {
    id: Type.ObjectId
}

// para generar el JsonWebToken
export const generateJWT = (payload: userPayload) => {
    // sign es para generar el json web token
    // este sign toma 3 parametros, 
    // 1) Payload: es lo que voy a colocar en el json, 
    // 2)Secret o llave privada: se coloca en variables de entorno,
    // 3)Options es una serie de opciones
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        //    este es el tiempo que va a tener de validez el json
        expiresIn: '180d'
    })
    // para generar el json y mandarlo
    return token
}