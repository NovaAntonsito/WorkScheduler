import { Telegraf, Scenes, session, Markup } from "telegraf";

import { AppDataSource } from "./data-source";
import { userInfoWizard } from "./scenes/registerScene";
import "dotenv/config";
import { User } from "./entity/User";

const bot = new Telegraf(process.env.API_TOKEN);

const userRepository = AppDataSource.getRepository(User);
//@ts-ignore
const stage = new Scenes.Stage([userInfoWizard]);
bot.use(session());
bot.use(stage.middleware());

const bootstrap = () => {
  AppDataSource.initialize()
    .then(async () => {
      console.log("Bot iniciado y base de datos prendida");
      bot.start((ctx) => {});

      bot.command("register", async (ctx) => {
        const nombreTelegram = ctx.from.first_name + " " + ctx.from.last_name;
        const userFound = await userRepository.findOne({
          where: {
            nombre: nombreTelegram,
          },
        });

        ctx.reply(`Bienvenido ${nombreTelegram}`);
        if (userFound) {
          ctx.reply(
            "No es necesario un registro, ya estas en la base de datos"
          );
        } else {
          //@ts-ignore
          ctx.scene.enter("Registro");
        }
      });

      bot.command("delete", async (ctx) => {
        const allUserFound = await userRepository.find();
        allUserFound.forEach(async (user) => {
          await userRepository.delete(user.id);
        });
        ctx.reply("Todos los datos fueron borrados de la base de datos!");
      });
      bot.launch();
    })
    .catch((error) => console.log(error));
};

bootstrap();
