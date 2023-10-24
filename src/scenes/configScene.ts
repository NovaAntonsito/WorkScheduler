//@ts-nocheck
import { Scenes, Markup } from "telegraf";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

const userRepository = AppDataSource.getRepository(User)

const configButtons = [
    { text: "Borrar a un Usuario", callback_data: "Delete" },
    { text: "Editar datos de Usuario", callback_data: "Edit" },
    { text: "Buscar a todos los Usuarios", callback_data: "Find all" },
    { text: "Buscar a un Usuario", callback_data: "Find One" }
]

const confirmacionButtons = [
    {text: "Si", callback_data: "Yes" },
    {text: "No", callback_data: "Nope" }
]

const configKeyboard = Markup.inlineKeyboard(configButtons, { columns: 2 })
const confirmacionKeyboard = Markup.inlineKeyboard(confirmacionButtons, {columns : 1})


const configScene = new Scenes.BaseScene('Configuracion');

configScene.enter((ctx) => {
    ctx.reply('Que deseas hacer?', configKeyboard)
});


configScene.action("Delete", (ctx) => {
    ctx.scene.enter("Eliminacion")
})



const configActionWizard = new Scenes.WizardScene("Eliminacion",
    (ctx) => {
        ctx.reply("Ingrese el nombre del usuario")
        ctx.wizard.state.nameTemp = ""
        return ctx.wizard.next()
    },
    async (ctx) => {
        let nombreTemp = ctx.message.text;
        const userFound = await userRepository.findOne({
            where : {
                nombre : nombreTemp
            }
        })
        if(userFound){
            ctx.reply(`Usuario encontrado \n -Nombre : ${userFound.nombre} \n -Telefono : ${userFound.telefono}`)
            return ctx.wizard.next()
        }
        ctx.reply("El usuario no fue encontrado \n Quieres intentar de nuevo?", confirmacionKeyboard )
    })




export { configScene, configActionWizard }


