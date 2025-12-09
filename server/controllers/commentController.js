// import prisma from "../configs/prisma.js";

// //Add comment
// export const addComment = async (req, res) => {
//     try{
//         const{userid} = await req.auth();
//         const {taskId, content} = req.body;

//         // Check if user is projectmember
//         const task = await prisma.task.findUnique({
//             where: {id: taskId},
//         })
//         const project = await prisma.project.findUnique({
//             where: {id: task.projectId},
//             include: {members: {include: {user: true}}}
//         })
//         if(!project){
//             return res.status(404).json({message: "Project not found"})
//         }
//         const member = project.members.find((member)=> member.userId===userid)

//         if(!member){
//             return res.status(403).json({message: "You are not a member of this project"})
//         }
//         const comment = await prisma.comment.create({
//             data:{
//                 taskId,
//                 content,
//                 userId
//             },
//             include:{
//                 user: true
//             }
//         })
//         res.json({comment})
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({ message: error.code || error.message})
//     }
// }


// // Get comments for task
// export const getTaskComments = async(req, res)=>{
//     try{
//         const {taskId} = req.params;
//         const comments = await prisma.comment.findMany({
//             where: {taskId},
//             include: {user: true},
//         })
//         res.json({comments})
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({ message: error.code || error.message})
//     }
// }
import prisma from "../configs/prisma.js";

// Add comment
export const addComment = async (req, res) => {
    try {
        // Получаем userId из Clerk
        const authData = await req.auth();
        const userId = authData.userId; // важно использовать правильное поле

        const { taskId, content } = req.body;

        if (!taskId || !content) {
            return res.status(400).json({ message: "taskId and content are required" });
        }

        // Получаем задачу
        const task = await prisma.task.findUnique({
            where: { id: taskId },
        });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Получаем проект с участниками
        const project = await prisma.project.findUnique({
            where: { id: task.projectId },
            include: { members: true }, // только members, user будет не нужен
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Проверяем членство пользователя
        const isMember = project.members.some((member) => member.userId === userId);
        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this project" });
        }

        // Создаем комментарий
        const comment = await prisma.comment.create({
            data: {
                taskId,
                content,
                userId,
            },
            include: { user: true }, // чтобы вернуть данные пользователя
        });

        res.json({ comment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.code || error.message });
    }
};

// Get comments for task
export const getTaskComments = async (req, res) => {
    try {
        const { taskId } = req.params;

        if (!taskId) {
            return res.status(400).json({ message: "taskId is required" });
        }

        const comments = await prisma.comment.findMany({
            where: { taskId },
            include: { user: true },
        });

        res.json({ comments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.code || error.message });
    }
};
