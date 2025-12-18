import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { hanldeInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router()

// para crear cuenta
// a estas url es que hago las peticiones de posmant
router.post('/create-account',
      body('name').notEmpty().withMessage("El nombre no puede ir vacio"),
      body('password').isLength({ min: 8 }).withMessage("la contraseña es muy corta, minimo 8 caracteres"),
      // value es donde viene los datos que el usuario ingresa en este campo q es password_confirmation
      // y req son los valores que ya tiene el campo en este caso el de password
      body('password_confirmation').custom((value, { req }) => {
            // para entrar a los datos del campo password
            if (value !== req.body.password) {
                  throw new Error('Las Contraseñas no son iguales ')
            }
            // en caso que si sean igualess
            return true
      }),
      body('email').isEmail().withMessage("E-mail no valido"),
      hanldeInputErrors,
      AuthController.createAccount
)
// para confirmar la cuenta con el token
router.post('/confirm-account',
      body('token').notEmpty().withMessage("El Token no puede ir vacio"),
      hanldeInputErrors,
      AuthController.confirmAccount
)

// para ingresar
router.post('/login',
      body('email').isEmail().withMessage("E-mail no valido"),
      body('password').notEmpty().withMessage("la contraseña no puede ir vacio"),
      hanldeInputErrors,
      AuthController.login
)


// para solicitar un nuevo token
router.post('/request-code',
      body('email').isEmail().withMessage("E-mail no valido"),
      hanldeInputErrors,
      AuthController.requestConfirmationCode
)

// para restablecer el password
router.post('/forgot-password',
      body('email').isEmail().withMessage("E-mail no valido"),
      hanldeInputErrors,
      AuthController.forgotPassword
)


// para validar el token al momneto de solicitar una nueva contraseña
router.post('/validate-token',
      body('token').notEmpty().withMessage("El token no puede ir vacio"),
      hanldeInputErrors,
      AuthController.validateToken
)

// para actualizar la contraseña y via parametro mandar el token
router.post('/update-password/:token',
      // revisa que el token sean numeros
      param('token').isNumeric().withMessage('Token no valido'),
      body('password').isLength({ min: 8 }).withMessage("la contraseña es muy corta, minimo 8 caracteres"),
      // value es donde viene los datos que el usuario ingresa en este campo q es password_confirmation
      // y req son los valores que ya tiene el campo en este caso el de password
      body('password_confirmation').custom((value, { req }) => {
            // para entrar a los datos del campo password
            if (value !== req.body.password) {
                  throw new Error('Las Contraseñas no son iguales ')
            }
            // en caso que si sean igualess
            return true
      }),
      hanldeInputErrors,
      AuthController.updatePasswordWithToken
)

// si el usuario no esta autenticado lo mandamos al login
router.get('/user',
      authenticate,
      // si authenticate manda un error no pasa al siguiente middeleware
      AuthController.user
)

/** Profile */

// para la actualizxacion de nombre o email del usuario en perfil
router.put('/profile',
      // comprueba si estas autenticado este middleware
      authenticate,
      body('name').notEmpty().withMessage("El nombre no puede ir vacio"),
      body('email').isEmail().withMessage("E-mail no valido"),
      hanldeInputErrors,
      AuthController.updateProfile
)

// para el cambio de contraseña desde el perfil de usuario
router.post('/update-password',
      // comprueba si estas autenticado este middleware
      authenticate,
      // estas solo son validaciones
      body('current_password').notEmpty().withMessage("la contraseña actual no puede ir vacia"),
      body('password').isLength({ min: 8 }).withMessage("la contraseña es muy corta, minimo 8 caracteres"),
      // value es donde viene los datos que el usuario ingresa en este campo q es password_confirmation
      // y req son los valores que ya tiene el campo en este caso el de password
      body('password_confirmation').custom((value, { req }) => {
            // para entrar a los datos del campo password
            if (value !== req.body.password) {
                  throw new Error('Las Contraseñas no son iguales ')
            }
            // en caso que si sean igualess
            return true
      }),
      hanldeInputErrors,
      AuthController.updateCurrentUserPassword
)

// para preguntar la contraseña al momentoo de eliminar un proyecto
router.post('/check-password',
      // comprueba si estas autenticado este middleware
      authenticate,
      // estas solo son validaciones
      body('password').notEmpty().withMessage("la contraseña no puede ir vacia"),
      hanldeInputErrors,
      AuthController.checkPassword
)


export default router