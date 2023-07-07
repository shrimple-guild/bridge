import { randItem } from "../../../utils/utils.js";
import { SimpleCommand } from "./Command.js";

export class FortuneCookieCommand implements SimpleCommand {
	aliases = ["fc", "cookie"];

	fortunes = [
		"Your perseverance will lead to great achievements.",
		"A journey of a thousand miles begins with a single step.",
		"Your talents will be recognized and rewarded.",
		"The best way to predict the future is to create it.",
		"Good things come to those who wait, but better things come to those who work for it.",
		"Your kindness will open doors of opportunity.",
		"Believe in yourself, and others will too.",
		"Your optimism will bring you joy and success.",
		"The secret to success is to know that you have failed before.",
		"Your creativity will lead to great innovation.",
		"Hard work and dedication will bring you closer to your goals.",
		"You are capable of achieving anything you set your mind to.",
		"Embrace change and welcome new opportunities.",
		"Trust your instincts, they will guide you in the right direction.",
		"Your positive attitude will attract positive outcomes.",
		"Your farming (macroing) skills will yield plenty of coin.",
		"The dungeons hold great treasures for those who dare to explore.",
		"Wise investments in the Auction House will lead to great wealth.",
		"The riches of the End will reveal themselves to you in due time.",
		"Your combat prowess will be legendary.",
		"Hard work in mining will uncover rare ores and precious gems.",
        "We do not care about your networth.",
		"Your enchanting abilities will bring forth expensive enchantments.",
		"A wise adventurer knows the value of teamwork in dungeons.",
		"A dragon pet awaits you in the nest.",
		"Your fishing skills will reel in valuable rewards.",
		"A generous heart will attract good trades and friendships.",
		"The secrets of the Fairy Souls will be revealed to you.",
        "Help! I'm trapped in Minikloon's basement!",
        "Nobody cares about your complaints."
	];

	async execute(args: string[]) {
		return randItem(this.fortunes);
	}
}
