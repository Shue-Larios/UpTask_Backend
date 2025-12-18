import type { Request, Response } from "express"
import User from "../models/User"
import { checkPasswword, hashPassword } from "../utils/auth"
import { generateToken } from "../utils/token"
import Token from "../models/Token"
import { AuthEmail } from "../email/AuthEmail"
import { log } from "node:console"
import { generateJWT } from "../utils/jwt"



export class AuthController {
    // crea la cuenta es como la funcion
    static createAccount = async (req: Request, res: Response) => {
        try {
            // saco los datos que mandan
            const { password, email } = req.body

            // prevenir usuario duplicados por su email
            // va a buscar un usuario por el campo de email
            const userExists = await User.findOne({ email })
            // si existe ya el usuario
            if (userExists) {
                const error = new Error('El usuario ya esta registrado')
                return res.status(409).json({ error: error.message })
            }
            // CREAR USUARIO
            // User es mi modelo
            const user = new User(req.body)
            // Hash Password
            // la funcion hashPassword toma un dato tipo string que es el dato que quiero hashear y esta me retorna un valor ya hasheado y que el campo user.password va a tener ese valor
            user.password = await hashPassword(password)

            // GENERANDO EL TOKEN
            // generamos una instancia del modelo
            const token = new Token()
            // para agregar el valor al campo de token de la base
            token.token = generateToken()
            // para agregar el usuario al campo de la base de datos como ya esta instanciado con la base arriba 
            token.user = user.id

            // ENVIAR EL EMAIL
            // como este es una clase y dentro tiene un static que es la de sendConfirmationEmail
            const sendEmail = await AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            }, 'confirm')

            // para revisar si no hay problemas con el envio  de email
            if (!sendEmail) {
                // para crear un nuevo error y que se vaya como respuesta
                const error = new Error('Error al enviar correo')
                return res.status(500).json({ error: error.message })
            }

            // para guardar en la base de datos
            // await user.save()
            // para guardar en la base de datos al mismo tiempo
            await Promise.allSettled([user.save(), token.save()])
            res.send('Cuenta creada, Revisa tu email para confirmarla')

        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }

    }

    // confirmar la cuenta con el token
    static confirmAccount = async (req: Request, res: Response) => {

        try {
            // extraemos el token
            // como el token lo mandamos por correo entonces esperamos que el usuario los ingrese por eso va por req.body
            const { token } = req.body

            // buscamos que el token exista
            const tokenExists = await Token.findOne({ token })
            //    en caso del que token no exista
            if (!tokenExists) {
                const error = new Error('Token no valido')
                return res.status(404).json({ error: error.message })
            }
            // buscamos si el usuario existe por su id que lo tenemos registrado en la tabla token
            const user = await User.findOne(tokenExists.user)
            // si existe cambiamos el campo confirmed a true
            user.confirmed = true

            // ahora eliminamos el token por que es de un solo uso y guardamos el usuario por el cambio que le hacemos al confirmed
            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            res.send('Cuenta Confirmada correctamente')
        }
        catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }
    // para lograr hacer el login 
    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            // findOne() siempre recibe un objeto que describe los criterios de búsqueda.
            const user = await User.findOne({ email })
            // si un usuario no existe
            if (!user) {
                const error = new Error('Usuario no encontrado')
                return res.status(404).json({ error: error.message })
            }
            // ver si ya confirmo su cuenta (sino es true)
            if (!user.confirmed) {
                // generar un token nuevo por si el usuario no confirmo su cuenta
                const token = new Token
                // para identificar el usuario
                token.user = user.id
                token.token = generateToken()
                // y almacenamos el token en la base de datos
                await token.save()


                // ENVIAR EL EMAIL
                // como este es una clase y dentro tiene un static que es la de sendConfirmationEmail
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                }, 'confirm')


                const error = new Error('la cuenta no ha sido confirmada, hemos enviado un e-mail de confirmacion')
                return res.status(401).json({ error: error.message })
            }

            // si la password no es igual
            const isPasswordCorrect = await checkPasswword(password, user.password)

            // en caso de que la contraseña sea incorrecta
            if (!isPasswordCorrect) {
                const error = new Error('La contraseña es incorrecta')
                return res.status(401).json({ error: error.message })
            }

            //  para generar el json web token
            const token = generateJWT({
                id: user.id
            })
            res.send(token)
        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }

    // para solicitar un nuevo token desde la pagina confirmar cuenta
    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            // saco los datos que mandan
            const { email } = req.body

            //   Usuario existe
            const user = await User.findOne({ email })
            // si el usuario no existe
            if (!user) {
                const error = new Error('El usuario no esta registrado')
                return res.status(404).json({ error: error.message })
            }

            // si el usuario ya esta confirmado 
            if (user.confirmed) {
                const error = new Error('El usuario ya esta confirmado')
                return res.status(403).json({ error: error.message })
            }

            // GENERANDO EL TOKEN
            // generamos una instancia del modelo
            const token = new Token()
            // para agregar el valor al campo de token de la base
            token.token = generateToken()
            // para agregar el usuario al campo de la base de datos como ya esta instanciado con la base arriba 
            token.user = user.id

            // ENVIAR EL EMAIL
            // como este es una clase y dentro tiene un static que es la de sendConfirmationEmail
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            }, 'confirm')


            // para guardar en la base de datos
            // await user.save()
            // para guardar en la base de datos al mismo tiempo
            await Promise.allSettled([user.save(), token.save()])
            res.send('Se envio un nuevo Token a tu E-mail')

        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }

    }


    // para restablecer el password
    static forgotPassword = async (req: Request, res: Response) => {
        try {
            // saco los datos que mandan
            const { email } = req.body

            //   Usuario existe
            const user = await User.findOne({ email })
            // si el usuario no existe
            if (!user) {
                const error = new Error('El usuario no esta registrado')
                return res.status(404).json({ error: error.message })
            }


            // GENERANDO EL TOKEN
            // generamos una instancia del modelo
            const token = new Token()
            // para agregar el valor al campo de token de la base
            token.token = generateToken()
            // para agregar el usuario al campo de la base de datos como ya esta instanciado con la base arriba 
            token.user = user.id

            // para guardar en la base de datos
            await token.save()
            // ENVIAR EL EMAIL
            // como este es una clase y dentro tiene un static que es la de sendConfirmationEmail
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
                // esta opcion es la que dice si esta reseteando password o confirmando
            }, 'reset')
            res.send('Revisa tu Email para instrucciones')

        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }


    // confirmar la cuenta con el token cuando se solicita un password nuevo
    static validateToken = async (req: Request, res: Response) => {

        try {
            // extraemos el token
            // como el token lo mandamos por correo entonces esperamos que el usuario los ingrese por eso va por req.body
            const { token } = req.body

            // buscamos que el token exista
            const tokenExists = await Token.findOne({ token })
            //    en caso del que token no exista
            if (!tokenExists) {
                const error = new Error('Token no valido')
                return res.status(404).json({ error: error.message })
            }

            // le avisamos al usuario que el token es valido
            res.send('Token valido, Define tu nueva contraseña')
        }
        catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }


    // para actualizar la contraseña
    static updatePasswordWithToken = async (req: Request, res: Response) => {

        try {
            // extraemos el token de la url
            const { token } = req.params

            // buscamos que el token exista
            const tokenExists = await Token.findOne({ token })
            //    en caso del que token no exista
            if (!tokenExists) {
                const error = new Error('Token no valido')
                return res.status(404).json({ error: error.message })
            }

            // buscamos si el usuario existe por su id que lo tenemos registrado en la tabla token
            const user = await User.findById(tokenExists.user)

            // hasheamos la contraseña pasandole los datos que leemos que nos envia el usuario
            user.password = await hashPassword(req.body.password)

            //  guardardamos la nueva contraseña y borramos el token existente
            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            // le avisamos al usuario que el token es valido
            res.send('La contraseña se modifico correctamente')
        }
        catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }


    // para saber si el usuario esta autenticado
    static user = async (req: Request, res: Response) => {
        return res.json(req.user)
    }


    static updateProfile = async (req: Request, res: Response) => {
        //  extraemos el nombre como el email que el usuario ingreso
        const { name, email } = req.body

        // revisar si el correo ya esta utilizado
        //    {email} Porque findOne() espera un objeto con los campos por los que va a buscar
        const userExist = await User.findOne({ email })

        // si el usuario ya existe con el correo y si es diferente al usuario autenticado
        // req.user.id por que inicia sesion un usuario se crea el req.user y ahi esta su informacion
        if (userExist && userExist.id.toString() !== req.user.id.toString()) {
            const error = new Error('Ese correo ya esta registrado')
            return res.status(409).json({ error: error.message })
        }

        // como gracias al middleware de autenticate estamos interactuando con la base aca solo cambiamos los datos por los nuevos
        req.user.name = name
        req.user.email = email
        try {
            // guardamos en la base de datos
            await req.user.save()
            // mandamos un anuncio al frontend
            res.send('Perfil Actualizado Correctamente')
        } catch (error) {
            res.status(500).send("Hubo un error")
        }
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        // tomamos de req.body
        const { current_password, password } = req.body

        // comprobar si la contraseña es igual a la que hay en base de datos
        // como ya sabemos que el usuario existe por el req.user nos traemos toda la informacion de ese usuario
        const user = await User.findById(req.user.id)

        // esto retorna un false o true si es la contraseña igual
        // checkPasswword es un helper y los datos una es la contraseña que manda el usuario y la otra es el password ya hasheado que viene de la base de datos
        const isPasswordCorrect = await checkPasswword(current_password, user.password)
        // si la Contraseña es incorrecta
        if (!isPasswordCorrect) {
            const error = new Error('La Contraseña actual no es correcta')
            return res.status(401).json({ error: error.message })
        }

        try {
            // si la Contraseña es correcta la guardamos  
            // hashPassword tambien es un helper que hashea la Contraseña
            user.password = await hashPassword(password)
            // almacenamos en la base de datos
            await user.save()
            // mandamos mensaje al frontend
            res.send('la Contraseña se modifico correctamente')
        } catch (error) {
            res.status(500).send("Hubo un error")
        }
    }


    // para la contraseña al momento de eliminar un proyecto
    static checkPassword = async (req: Request, res: Response) => {
        // tomamos de req.body
        const { password } = req.body

        // comprobar si la contraseña es igual a la que hay en base de datos
        // como ya sabemos que el usuario existe por el req.user nos traemos toda la informacion de ese usuario
        const user = await User.findById(req.user.id)

        // esto retorna un false o true si es la contraseña igual
        // checkPasswword es un helper y los datos una es la contraseña que manda el usuario y la otra es el password ya hasheado que viene de la base de datos
        const isPasswordCorrect = await checkPasswword(password, user.password)
        // si la Contraseña es incorrecta
        if (!isPasswordCorrect) {
            const error = new Error('La Contraseña no es correcta')
            return res.status(401).json({ error: error.message })
        }
        res.send("Contraseña correcta")
    }


}