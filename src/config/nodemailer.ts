import nodemailer from "nodemailer"
import dotenv from 'dotenv'


// para que lea las variables de entorno
dotenv.config()


const config = () => {
    return {
        // Todas estan en variables de entorno
        host: process.env.SMTP_HOST,
        // como el puerto tiene que ser numero y no strin se le pone el +
        port: +process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    }
}

// Looking to send emails in production? Check out our Email API/SMTP product!
// cada que vayamos a mandar un email hay que llamar esta funcion
export const transporter = nodemailer.createTransport(config());


 