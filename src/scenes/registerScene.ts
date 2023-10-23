//@ts-nocheck
import { Scenes, Markup } from "telegraf";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

const userRepository = AppDataSource.getRepository(User);

const Surcursalbuttons = [
  { text: "Costanera", callback_data: "Costanera" },
  { text: "Casa Central", callback_data: "Casa Central" },

];

const Horariosbuttons = [
    {text: "8:00 a 15:30", callback_data: "8:00"},
    {text: "9:30 a 17:00", callback_data: "9:30"}
]

const SucursalKeyboard = Markup.inlineKeyboard(Surcursalbuttons, { columns: 2 });
const HorarioKeyboard = Markup.inlineKeyboard(Horariosbuttons, {columns : 2});
const userInfoWizard = new Scenes.WizardScene(
  "Registro",
  (ctx) => {
    ctx.reply("En qué sucursal estás actualmente:", SucursalKeyboard);
    ctx.wizard.state.userInfo = {}; // Crear un objeto para almacenar la información del usuario.
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.wizard.state.userInfo.sucursal = ctx.callbackQuery.data
    ctx.reply("Ahora digame su email")
    return ctx.wizard.next();
  },
  (ctx) => {
    const email = ctx.message.text
    if (email.includes("@")) {
        ctx.wizard.state.userInfo.email = email
        ctx.reply("En que horario estas?", HorarioKeyboard)
        return ctx.wizard.next()
    }else{
        return;
    }
  },
  (ctx) => {
    ctx.wizard.state.userInfo.horario = ctx.callbackQuery.data;
    ctx.reply("Ingresa tu número de teléfono:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.userInfo.telefono = ctx.message.text;
    
    const newUser = new User();

    newUser.nombre = ctx.from.first_name + " " + ctx.from.last_name;

    newUser.sucursal = ctx.wizard.state.userInfo.sucursal; 
   
    newUser.telefono = ctx.wizard.state.userInfo.telefono;

    newUser.horario = ctx.wizard.state.userInfo.horario;

    ctx.reply("Gracias por proporcionar tu información.");
    await userRepository.save(newUser);
    return ctx.scene.leave();
  }
);

export { userInfoWizard };
