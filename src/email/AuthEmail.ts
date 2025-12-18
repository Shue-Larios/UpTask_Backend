import { transporter } from "../config/nodemailer"

interface IEmail {
  email: string,
  name: string
  token: string
}

export class AuthEmail {
  // es un metodo estatico
  // no necesitan instanciarse
  // static sendConfirmationEmail = async (user: IEmail) => {
  //     await transporter.sendMail({
  //         from: 'Uptask <admin@uptask.com>',
  //         // como arriba tenemos la instancia del email del usuario que se acaba de registrar
  //         to: user.email,
  //         subject: 'Uptask - Confirma tu cuenta',
  //         text: 'Uptask - Confirma tu cuenta',
  //         html: `<p>Probando e-mail</p>`

  //     })
  // }
//   static sendConfirmationEmail = async (user: IEmail, type: 'confirm' | 'reset' | 'token') => {
//     // ESTO SERIA SOLO EL CUERPO DEL CORREO
//     // estas de actionLinks serian el tipo de accion secundarias que espera la instancia de sendConfirmationEmail
//     const actionLinks = {
//       // para confirmar la cuenta 
//       confirm: {
//         title: 'Confirma tu cuenta',
//         message: 'Gracias por registrarte en Uptask. Usa el siguiente token para confirmar tu cuenta:',
//         page: "Confirma tu cuenta",
//         link: `${process.env.FRONTEND_URL}/auth/confirm-account`
//       },
//       reset: {
//         title: 'Reestablece tu contraseña',
//         message: 'Usa el siguiente token para restablecer tu contraseña:',
//         page: "Reestablece tu contraseña",
//         link: `${process.env.FRONTEND_URL}/auth/new-password`
//       },
//       token: {
//         title: 'Verifica tu token',
//         message: 'Aquí tienes tu token de verificación:',
//         page: "Visita el siguient enlace",
//         link: 'http://localhost:5173/404'
//       },
//     }

//     const { title, message, page, link } = actionLinks[type]
//     const year = new Date().getFullYear()

//     const html = `
// <!DOCTYPE html>
// <html lang="es">
// <head>
//   <meta charset="UTF-8" />
//   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//   <title>${title}</title>
// </head>
// <body style="margin:0;padding:0;background-color:#f6f9fc;font-family:Helvetica,Arial,sans-serif;color:#333;">
//   <div style="max-width:600px;margin:40px auto;background-color:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.05);">
    
//     <!-- HEADER -->
//     <div style="background-color:#007bff;color:#fff;text-align:center;padding:30px 20px;">
//       <h1 style="margin:0;font-size:24px;">${title}</h1>
//     </div>

//     <!-- CONTENT -->
//     <div style="padding:30px 40px;line-height:1.6;">
//       <p>Hola <strong>${user.name || 'usuario'}</strong>,</p>
//       <p>${message}</p>
//       <p>Token expira en 10 minutos</p>

//       <!-- INFORMACIÓN DE PAGE -->
//       <p>Visita el siguiente enlace:</p>
  

//      <!-- LINK PERSONALIZADO (si existe) -->
// ${link
//         ? `<p style="text-align:left;margin:20px 0;">
//        <a href="${link}" 
//           style="color:#007bff;text-decoration:underline;"
//           target="_blank"
//           rel="noopener noreferrer">
//          ${page}
//        </a>
//      </p>`
//         : ''
//       }
//       <!-- TOKEN -->
//       <div style="background-color:#f0f0f0;border:1px dashed #ccc;padding:15px;text-align:center;margin:30px 0;font-size:18px;font-weight:bold;letter-spacing:2px;color:#333;">
//         ${user.token}
//       </div>

//       <p>Si no solicitaste esta acción, puedes ignorar este correo.</p>
//     </div>

//     <!-- FOOTER -->
//     <div style="text-align:center;font-size:12px;color:#888;padding:20px;">
//       © ${year} Uptask. Todos los derechos reservados.
//     </div>
//   </div>
// </body>
// </html>
// `

//     // ESTO SERIA LA CONFIGURACION DEL ENVIO DEL CORREO QUE DEVULVE INFORMACION
//     const info = await transporter.sendMail({
//       from: 'Uptask <admin@uptask.com>',
//       to: user.email,
//       subject: `Uptask - ${title}`,
//       text: `${message} Tu token es: ${user.token}`,
//       html,
//     })

//     console.log('Mensaje enviado', info.messageId);

//   }
// }
static sendConfirmationEmail = async (
  user: IEmail,
  type: 'confirm' | 'reset' | 'token'
): Promise<boolean> => {
  try {
    // --- CONFIGURACIÓN DE LOS TIPOS DE CORREO ---
    const actionLinks = {
      confirm: {
        title: 'Confirma tu cuenta',
        message: 'Gracias por registrarte en Uptask. Usa el siguiente token para confirmar tu cuenta:',
        page: "Confirma tu cuenta",
        link: `${process.env.FRONTEND_URL}/auth/confirm-account`
      },
      reset: {
        title: 'Reestablece tu contraseña',
        message: 'Usa el siguiente token para restablecer tu contraseña:',
        page: "Reestablece tu contraseña",
        link: `${process.env.FRONTEND_URL}/auth/new-password`
      },
      token: {
        title: 'Verifica tu token',
        message: 'Aquí tienes tu token de verificación:',
        page: "Visita el siguient enlace",
        link: 'http://localhost:5173/404'
      },
    };

    const { title, message, page, link } = actionLinks[type];
    const year = new Date().getFullYear();

    // --- HTML COMPLETO (TAL COMO LO TENÍAS) ---
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f6f9fc;font-family:Helvetica,Arial,sans-serif;color:#333;">
  <div style="max-width:600px;margin:40px auto;background-color:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.05);">
    
    <!-- HEADER -->
    <div style="background-color:#007bff;color:#fff;text-align:center;padding:30px 20px;">
      <h1 style="margin:0;font-size:24px;">${title}</h1>
    </div>

    <!-- CONTENT -->
    <div style="padding:30px 40px;line-height:1.6;">
      <p>Hola <strong>${user.name || 'usuario'}</strong>,</p>
      <p>${message}</p>
      <p>Token expira en 10 minutos</p>

      <!-- INFORMACIÓN DE PAGE -->
      <p>Visita el siguiente enlace:</p>

      <!-- LINK PERSONALIZADO (si existe) -->
      ${
        link
          ? `<p style="text-align:left;margin:20px 0;">
              <a href="${link}" 
                style="color:#007bff;text-decoration:underline;"
                target="_blank"
                rel="noopener noreferrer">
                ${page}
              </a>
             </p>`
          : ''
      }

      <!-- TOKEN -->
      <div style="background-color:#f0f0f0;border:1px dashed #ccc;padding:15px;text-align:center;margin:30px 0;font-size:18px;font-weight:bold;letter-spacing:2px;color:#333;">
        ${user.token}
      </div>

      <p>Si no solicitaste esta acción, puedes ignorar este correo.</p>
    </div>

    <!-- FOOTER -->
    <div style="text-align:center;font-size:12px;color:#888;padding:20px;">
      © ${year} Uptask. Todos los derechos reservados.
    </div>
  </div>
</body>
</html>
    `;

    // --- ENVÍO DE CORREO ---
    const info = await transporter.sendMail({
      from: 'Uptask <admin@uptask.com>',
      to: user.email,
      subject: `Uptask - ${title}`,
      text: `${message} Tu token es: ${user.token}`,
      html,
    });

    console.log("📧 Correo enviado:", info.messageId);
    return true; // <<< ÉXITO
// para ver sinoo hay problemas con el envio de email por ejm limite de envio
  } catch (error: any) {
    // mensajes que funcionar para debugear la aplicacion solo se ven en el log de backend
    console.error("Error al enviar correo:", error.message);
    return false; // <<< FALLO
  }
}}
