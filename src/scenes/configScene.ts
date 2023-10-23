import { Scenes, Markup } from "telegraf";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

const userRepository = AppDataSource.getRepository(User)

const configButtons = [
    {text: "Borrar datos", callback_data: "Delete" },
    {text: "Editar datos de Usuario", callback_data: "Edit" },
    {text: "Buscar a todos los Usuarios", callback_data: "Find all" },
    {text: "Buscar a un Usuario", callback_data: "Find One" }
]

const configKeyboard = Markup.inlineKeyboard(configButtons, {columns : 4})


