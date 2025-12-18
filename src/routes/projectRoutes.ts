import { Router } from "express";
import { body, param } from 'express-validator'
import { ProjectController } from "../controllers/ProjectController";
import { hanldeInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExists } from "../middleware/project";
import { hasAutorization, taskBelongsToProject, taskExists } from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamMemberController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

const router = Router()

// para que todos los que usen router tengan este middleware
router.use(authenticate)

// definicion de todas las rutas

// creacion de nuevos proyectos
router.post('/',
    // como estamos protegiendo esta peticion ponemos nuestro middleware que revisa si esta autenticado
    // authenticate,
    // agregamos aca express validator  para que el controlador quede limpio
    // body es la funcion que nos permite leer los parametros que le mandamos por req.body 
    body('projectName')
        // para evitar espacios en blanco
        .trim()
        // comprobamos que el campo projectName no vaya vacio
        .notEmpty().withMessage('El Nombre del Proyecto es Obligatorio'),
    body('clientName')
        // para evitar espacios en blanco
        .trim()
        // comprobamos que el campo clientName no vaya vacio
        .notEmpty().withMessage('El Nombre del Cliente es Obligatorio'),
    body('description')
        // para evitar espacios en blanco
        .trim()
        // comprobamos que el campo description no vaya vacio
        .notEmpty().withMessage('La Descripcion del Proyecto es Obligatorio'),
    // middleware de la validacion para decirle el codigo de error 
    hanldeInputErrors,
    // le digo que en ese controller va a estar esa "funcion"
    ProjectController.createProjects)

// obtener todos los registros
router.get('/', ProjectController.getAllProjects)


// obtener un registro por su id
router.get('/:id',
    // isMongoId es un validaciion de express validator para validar si es id de mongoDB y funciona como si fuera falso
    param('id').isMongoId().withMessage('ID no Valido'),
    hanldeInputErrors,
    ProjectController.getProjectById)

// Routes for tasks (las tareas dependen del proyecto por eso van aca mismo)

// este es un parametro que se le pasaria a nuestro router lo siguiente es una funcion y asi se ejecuta de primero cuando en la ruta lleve lo de projectID
router.param('projectId', projectExists)


// actualizar un registro
router.put('/:projectId',
    // isMongoId es un validaciion de express validator para validar si es id de mongoDB y funciona como si fuera falso
    param('projectId').isMongoId().withMessage('ID no Valido'),
    // validamos tambien la entrada de datos
    body('projectName')
        // para evitar espacios en blanco
        .trim()
        // comprobamos que el campo projectName no vaya vacio
        .notEmpty().withMessage('El Nombre del Proyecto es Obligatorio'),
    body('clientName')
        // para evitar espacios en blanco
        .trim()
        // comprobamos que el campo clientName no vaya vacio
        .notEmpty().withMessage('El Nombre del Cliente es Obligatorio'),
    body('description')
        // para evitar espacios en blanco
        .trim()
        // comprobamos que el campo description no vaya vacio
        .notEmpty().withMessage('La Descripcion del Proyecto es Obligatorio'),
    hanldeInputErrors,
    hasAutorization,
    ProjectController.updateProject)




// eliminar un registro por su id
router.delete('/:projectId',
    // isMongoId es un validaciion de express validator para validar si es id de mongoDB y funciona como si fuera falso
    param('projectId').isMongoId().withMessage('ID no Valido'),
    hanldeInputErrors,
    hasAutorization,
    ProjectController.deleteProject)




// algo asi se miraria la url  /api/project/1012384/tasks
router.post('/:projectId/tasks',
    hasAutorization,
    // validamos que el proyecto exista
    // validateProjectExists la oculto xk la puse a que se ejecute en el param
    //    validamos la entrada de datos
    body('name')
        // para evitar espacios en blanco
        .trim()
        // comprobamos que el campo name no vaya vacio
        .notEmpty().withMessage('El Nombre de la tarea es Obligatoria'),
    body('description')
        // para evitar espacios en blanco
        .trim()
        // comprobamos que el campo description no vaya vacio
        .notEmpty().withMessage('La descripcion de la tarea es Obligatoria'),
    // middleware de la validacion para decirle el codigo de error 
    hanldeInputErrors,
    TaskController.createTask
)

// para obtener las tareas de un proyecto
router.get('/:projectId/tasks',
    TaskController.getProjectTasks
)

// se va a ejecutar esta funcion cuando la routa incluya lo que va de primer parametro NO se ponen los puntos
router.param('taskId', taskExists)
// no se pueden poner dos funciones por eso se hacen separadas
router.param('taskId', taskBelongsToProject)


// para obtener la tarea por su id
router.get('/:projectId/tasks/:taskId',
    param('taskId').isMongoId().withMessage('ID no Valido'),
    hanldeInputErrors,
    TaskController.getTaskById
)

// para actualizar las tareas
// para obtener la tarea por su id
router.put('/:projectId/tasks/:taskId',
    // para revisar que tenga autorizacion
    hasAutorization,
    param('taskId').isMongoId().withMessage('ID no Valido'),
    body('name')
        // para evitar espacios en blanco
        .trim()
        // comprobamos que el campo name no vaya vacio
        .notEmpty().withMessage('El Nombre de la tarea es Obligatoria'),
    body('description')
        // para evitar espacios en blanco
        .trim()
        // comprobamos que el campo description no vaya vacio
        .notEmpty().withMessage('La descripcion de la tarea es Obligatoria'),
    hanldeInputErrors,
    TaskController.updateTask
)

// para eliminar una tarea y su registro en el proyecto
router.delete('/:projectId/tasks/:taskId',
    hasAutorization,
    param('taskId').isMongoId().withMessage('ID no Valido'),
    hanldeInputErrors,
    TaskController.deleteTask
)

// para actualizar el estado de una tarea
router.post('/:projectId/tasks/:taskId/status',
    param('taskId').isMongoId().withMessage('ID no Valido'),
    // para validar el campo
    body('status')
        // para evitar espacios en blanco
        .trim()
        // comprobamos que el campo description no vaya vacio
        .notEmpty().withMessage('El estado es obligatorio'),
    hanldeInputErrors,
    TaskController.updateStatus
)

/** Routes for teams */

// busca el colaborador por el id
router.post('/:projectId/team/find',
    body('email')
        .isEmail().toLowerCase().withMessage('Email no valido'),
    hanldeInputErrors,
    TeamMemberController.findMemberByEmail
)
// para obtener todos los colaboradores del proyecto
router.get('/:projectId/team',
    TeamMemberController.getProjecTeam
)


// para agregar un colaborador por su id en el proyecto
router.post('/:projectId/team',
    body('id').isMongoId().withMessage('ID no valido'),
    hanldeInputErrors,
    TeamMemberController.addMemberById
)

// para eliminar un colaborador del proyecto
router.delete('/:projectId/team/:userId',
    // param por que como es un delete y traemos el id del usuario a eliminar por la url
    param('userId').isMongoId().withMessage('ID no valido'),
    hanldeInputErrors,
    TeamMemberController.removeMemberById
)



/** Routes for Notes */

// para crear la nota en la tarea
router.post('/:projectId/task/:taskId/notes',
    // param por que como es un delete y traemos el id del usuario a eliminar por la url
    body('content').notEmpty().withMessage('El contenido de la nota es obligatorio'),
    hanldeInputErrors,
    NoteController.createNote
)

// para obtener las notas de un proyecto
router.get('/:projectId/task/:taskId/notes',
    NoteController.getTaskNote
)

// para eliminar una nota
router.delete('/:projectId/task/:taskId/notes/:noteId',
    param('noteId').isMongoId().withMessage('ID no valido'),
    NoteController.deleteNote
)


export default router