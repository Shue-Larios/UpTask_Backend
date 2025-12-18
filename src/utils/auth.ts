import bcrypt from 'bcrypt'

// para hashear el password
export const hashPassword = async (password: string) => {
    // Hash Password
    // generando lo que se conoce como salt
    // gentSalt es una funcion que nos rive para generar un valor aleatorio y unico y toma parametro que se le conoce como las rondas 10 es un buen numero
    const salt = await bcrypt.genSalt(10)
    // hash nos permite hashear esa cadena y toma dos parametros el primero el password que deseo hashear y el segundo es el salt
    return await bcrypt.hash(password, salt)
}

// para revisar un password
// enteredPassword es la contraseña que manda el usuario y storedHash es el password ya hasheado
export const checkPasswword = async (enteredPassword: string, storedHash: string) => {
    // vamos a retornar un true o false
    return await bcrypt.compare(enteredPassword, storedHash)
}