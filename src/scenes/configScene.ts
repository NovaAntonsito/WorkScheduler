//@ts-nocheck
import { Scenes, Markup } from "telegraf";
import { deleteUser, viewAllUsers, viewOneUser } from "../services/userService";

const configButtons = [
  { text: "Borrar a un Usuario", callback_data: "Delete" },
  { text: "Editar datos de Usuario", callback_data: "Edit" },
  { text: "Buscar a todos los Usuarios", callback_data: "Find all" },
  { text: "Buscar a un Usuario", callback_data: "Find One" },
];

const confirmacionButtons = [
  { text: "Si", callback_data: "Yes" },
  { text: "No", callback_data: "Nope" },
];

const configKeyboard = Markup.inlineKeyboard(configButtons, { columns: 2 });
const confirmacionKeyboard = Markup.inlineKeyboard(confirmacionButtons, {
  columns: 1,
});

const configScene = new Scenes.BaseScene("Configuracion");

configScene.enter((ctx) => {
  ctx.reply("Que deseas hacer?", configKeyboard);
});

configScene.action("Delete", (ctx) => {
  ctx.scene.enter("Eliminacion");
});

configScene.action("Find all", (ctx) => {
  ctx.scene.enter("VerTODOS");
});

const configActionWizard = new Scenes.WizardScene(
  "Eliminacion",
  (ctx) => {
    ctx.reply("Ingrese el nombre del usuario");
    ctx.wizard.state.objectTemp = {};
    return ctx.wizard.next();
  },
  async (ctx) => {
    let nombreTemp = ctx.message.text;
    const userFound = await viewOneUser(nombreTemp);
    if (!userFound) {
      ctx.reply(
        "El usuario no fue encontrado \n Quieres intentar de nuevo?",
        confirmacionKeyboard
      );
      return;
    }
    ctx.wizard.state.objectTemp = userFound;
    ctx.reply(
      `Usuario encontrado \n -Nombre : ${userFound.nombre} \n -Telefono : ${userFound.telefono}`
    );
    ctx.wizard.next();
    return ctx.wizard.steps[ctx.wizard.cursor](ctx); // Asegúrate de llamar a ctx.wizard.next() aquí
  },
  (ctx) => {
    const verificacionDelete = deleteUser(ctx.wizard.state.objectTemp);
    if (verificacionDelete) {
      ctx.reply("Se borro el usuario con exito");
      return ctx.scene.leave();
    }
    ctx.reply("No se puedo borrar el usuario porque hubo un error");
    return ctx.scene.leave();
  }
);
const viewAllUsersWizard = new Scenes.WizardScene("VerTODOS", async (ctx) => {
  // TODO(Marcos Anton): Averiguar como hacer paginado con botones (parametros default CAMBIAR!!!)
  const allUsersFound = await viewAllUsers(1, false);

  let response = "Aquí están los usuarios:\n\n";

  allUsersFound.data.forEach((user) => {
    response += `Nombre: ${user.nombre}, Email: ${user.email}\n`;
  });

  response += `\nTotal de usuarios: ${allUsersFound.totalRecords}`;

  ctx.reply(response);
});

configActionWizard.action("Yes", (ctx) => {
  ctx.wizard.selectStep(0);
  console.log("Entre al yes");
});
configActionWizard.action("Nope", (ctx) => {
  ctx.scene.leave();
  console.log("Entre al nope");
});

export { configScene, configActionWizard, viewAllUsersWizard };
