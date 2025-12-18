import colors from 'colors'
import server from './server'

// 4mil seria el puerto en el que estoy corriendo el servidor
const port = process.env.PORT || 4000

server.listen(port, () => {
    console.log(colors.cyan.bold(`desde api en el puerto ${port}`))
})


