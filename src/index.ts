import { Telegraf, Scenes, session, Markup } from "telegraf";
import { faker } from "@faker-js/faker";
import { AppDataSource } from "./data-source";
import { userInfoWizard } from "./scenes/registerScene";
import "dotenv/config";
import { User } from "./entity/User";
import {
  configActionWizard,
  configScene,
  viewAllUsersWizard,
} from "./scenes/configScene";
import ProgressBar = require("progress");
import { viewOneUser } from "./services/userService";

const bot = new Telegraf(process.env.API_TOKEN);
const progress = new ProgressBar("## :bar :percent -Tiempo Estimado: :eta ##", {
  total: 50,
});
const userRepository = AppDataSource.getRepository(User);

//@ts-ignore
const stage = new Scenes.Stage([userInfoWizard,configScene,configActionWizard,viewAllUsersWizard,]);

bot.use(session());
bot.use(stage.middleware());

// TODO(Marcos Anton): Integrar todos los servicios de la base de datos en un solo archivo TS para mejor lectura
const bootstrap = () => {
  AppDataSource.initialize()
    .then(async () => {
      const timer = setInterval(() => {
        progress.tick();
        if (progress.complete) {
          console.log("La base de datos fue encendida");
          clearInterval(timer);
        }
      }, 100);
      bot.start((ctx) => {
        ctx.reply(
          "Bienvenido al cronograma automatizado de Triunfo Seguros \nPara empezar a usar el bot utilize el comando /register"
        );
      });

      bot.command("debug", async (ctx) => {
        const users: User[] = faker.helpers.multiple(createRandomUser, {
          count: 5,
        });
        await Promise.all(
          users.map(async (user) => {
            await userRepository.save(user);
          })
        );
      });

      bot.command("register", async (ctx) => {
        const nombreTelegram = ctx.from.first_name + " " + ctx.from.last_name;
        const userFound = await viewOneUser(nombreTelegram);
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
      bot.command("config", (ctx) => {
        //@ts-ignore
        ctx.scene.enter("Configuracion");
      });
      bot.launch();
    })
    .catch((error) => console.log(error));
};

export function createRandomUser(): User {
  return {
    id: faker.number.int(),
    nombre: faker.internet.userName(),
    email: faker.internet.email(),
    sucursal: Math.random() < 0.5 ? "Costanera" : "Casa Central",
    horario: Math.random() < 0.5 ? "8:00" : "9:30",
    esJefecito: false,
    esPermanente: false,
  };
}

bootstrap();
