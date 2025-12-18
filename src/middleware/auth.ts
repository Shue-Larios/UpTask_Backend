import { Response, Request, NextFunction } from "express"
import jwt, { decode } from "jsonwebtoken"
import User, { IUser } from "../models/User"

// hacemos esto para "Agregar" un campo mas a Reques y podes pasar datos mediante req
declare global {
    namespace Express {
        interface Request {
            // este seria el nombre del campo
            // y como no siempre quiero escribirle le pongo el ? y le pongo el tipo que vaya a tener
            user?: IUser
        }
    }
}

// para revisar si el usuario esta autenticado 
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {

    // dentro de esto se manda la informacion del Bearer en postman que es un header que es informacion que se manda antes del body
    const bearer = req.headers.authorization
    // si no hay un bearer mandado por el usuario
    if (!bearer) {
        // creamo un error para mostrarlo
        const error = new Error('No Autorizado')
        return res.status(401).json({ error: error.message })
    }

    //  para leer un solo campo mandado quitando la palabra bearer que es por defecto que viene
    const [, token] = bearer.split(' ')
    try {
        // verify verifica si el json web token es verdadero y este ocupa 2 argumentos el token y el Secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET)



        if (typeof decoded === 'object' && decoded.id) {
            // verificamos que el usuario exista por el id que viene en decoded enviado en el json web token
            // dentro del select le digo que campos son los que quiero unicamente separados por un espacio nada mas
            const user = await User.findById(decoded.id).select('_id name email')
            // si existe este usuario 
            if (user) {
                // escribimos en el req si escribo ahi puedo recuperarlo en otro req tambien y hay que coloocar una llave que no exista
                req.user = user
                // para que vaya al siguiente middleware
                next()
            } else {
                res.status(500).json({ error: "Token no valido" })
            }
        }
    } catch (error) {
        // puede caer en ese error si el usuario no genero token 
        res.status(500).json({ error: "Token no valido" })
    }


}