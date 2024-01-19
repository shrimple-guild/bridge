export interface IMineflayerBot {
	on(event: "messagestr", callback: (chat: string) => void): void;
	on(event: "end", callback: (reason: string) => void): void;
	on(event: "spawn", callback: () => void): void;

	chat(msg: string): void;
	quit(): void;
	isOnline(): boolean;
	tryReloadBot(): Promise<void>;
}
