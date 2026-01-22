declare namespace OFABot {
  type TaskSource = "console" | "minecraft-dm" | "discord" | string;

  interface Task {
    priority: number;
    displayName: string;
    source: TaskSource;
    content: string[];
    timestamp: number;
    sendNotification: boolean;
    minecraftUser: string;
    discordUser: string | null;
    console?: Logger;
  }

  type CommandExecute = (task: Task) => void | Promise<void>;

  interface Command {
    name: string;
    identifiers: string[];
    execute: CommandExecute;
    longRunning?: boolean;
  }

  type CommandGroupInit = (
    bot: any,
    userId: string,
    logger: Logger,
  ) => void | Promise<void>;

  interface CommandGroup {
    identifiers: string[];
    commands: Command[];
    commandHelper?: Command;
    init?: CommandGroupInit;
  }

  interface BasicCommandModule {
    label: string;
    commands: Command[];
    init: CommandGroupInit;
  }

  interface CommandContext {
    bot: any;
    logger: Logger;
    mcData: any;
    userId: string | null;
  }

  type Logger = (
    logToFile?: boolean,
    type?: string,
    name?: string,
    ...args: unknown[]
  ) => void;
}

declare module "toml-require";
declare module "prismarine-chat";
declare module "prismarine-registry";
declare module "prismarine-schematic";
declare module "prismarine-nbt";
declare module "prismarine-item";
declare module "prismarine-recipe";
declare module "minecraft-data";
declare module "minecraft-protocol";
declare module "mineflayer";
declare module "vec3";
declare module "p-timeout";
declare module "js-binary";
declare module "silly-datetime";
declare module "chinese-numbers-to-arabic";
