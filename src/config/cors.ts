import { CorsOptions } from 'cors'

export const corsConfig: CorsOptions = {
    origin: function (origin, callback) {
        // colocamos como lista blanca la url puesta en env
        const whitelist = [process.env.FRONTEND_URL]
        console.log(origin, "origen");
        console.log(whitelist, "whitelist");
        // // argv es como leer parametros que agregamos momento de correr el programa con npm run dev:api en package.json
        // if (process.argv[2] === '--api') {
        //     // por que undefined xk thunderClient o postman envian el origen como undefined
        //     whitelist.push(undefined)
        // }
        // si la peticion se esta realizando de la lista blanca
        if (whitelist.includes(origin)) {
            // el primer campo es un error en este caso no hay error entoncs le decimos que si permitimos la conexion con el true
            callback(null, true)
        } else {
            // en este caso si hay error entoncs mandamos un error
            callback(new Error('Error de CORS'))
        }
    }
}