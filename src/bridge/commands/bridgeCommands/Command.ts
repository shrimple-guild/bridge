import { config } from "../../../utils/config.js";

export abstract class SimpleCommand {
    usage?: string;
    
    abstract aliases: (string | undefined)[];
    abstract execute(args: string[], isStaff?: boolean, username?: string): Promise<string | void>;

    error(message: string): never {
        throw new Error(message);
    }

    throwUsageError(): never {
        this.error(`Usage: ${config.bridge.prefix}${this.aliases[0]} ${this.usage ?? ""}`);
    }
}
