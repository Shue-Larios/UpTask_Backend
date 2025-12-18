// son funciones que se ejecutan en las peticiones http

import type { Request, Response, NextFunction } from "express"
// la forma en la que se obtiene el resultado de una validacion viene de express validator
import { validationResult } from 'express-validator'

export const hanldeInputErrors = (req: Request, res: Response, next: NextFunction) => {
    // dentro de este req estan los errores y se guardan en la variable errors
    let errors = validationResult(req)
    // si no esta vacio errors
    if (!errors.isEmpty()) {
        // si hay un error retorna y detiene la ejecucion
        // al finalizar lo convertimos en array xk puede tener varios errores que son objetos
        return res.status(400).json({ errors: errors.array() })
    }
    // para que se vaya al siguiente middleware
    next()
}