import { Telegraf, Scenes, session, Markup } from "telegraf";

import { AppDataSource } from "./data-source";
import { userInfoWizard } from "./scenes/registerScene";
import "dotenv/config";
import { User } from "./entity/User";
import { configActionWizard, configScene } from "./scenes/configScene";
import ProgressBar = require("progress");

const bot = new Telegraf(process.env.API_TOKEN || "6911501212:AAFkvxg_G2sDfesUfrDB65oeU2P-82WUEf8" );
const progress = new ProgressBar(':bar  :percent -Tiempo Estimado: :eta', {total : 50})
const userRepository = AppDataSource.getRepository(User);
//@ts-ignore
const stage = new Scenes.Stage([userInfoWizard, configScene, configActionWizard]);
bot.use(session());
bot.use(stage.middleware());


const bootstrap = () => {
  AppDataSource.initialize()
    .then(async () => {
      const timer = setInterval(()=>{
        progress.tick();
        if(progress.complete){
          console.log("La base de datos fue encendida");
          clearInterval(timer)
        }
      }, 100)
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
      bot.command("config", (ctx) => {
        //@ts-ignore
        ctx.scene.enter("Configuracion");
      });
      bot.launch();
    })

    .catch((error) => console.log(error));
};

bootstrap();
