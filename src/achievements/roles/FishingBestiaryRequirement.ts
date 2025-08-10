import { SkyblockProfiles } from "../../api/SkyblockProfiles"
import { Requirement } from "./Requirement"

const requiredMobs = [
	"abyssal miner",
	"agarimoo",
	"carrot king",
	"catfish",
	"deep sea protector",
	"guardian defender",
	"night squid",
	"oasis rabbit",
	"oasis sheep",
	"poisoned water worm",
	"rider of the deep",
	"sea archer",
	"sea guardian",
	"sea leech",
	"sea walker",
	"sea witch",
	"squid",
	"loch emperor",
	"water hydra",
	"water worm",
	"fire eel",
	"flaming worm",
	"lava blaze",
	"lava flame",
	"lava leech",
	"lava pigman",
	"lord jawbus",
	"magma slug",
	"moogma",
	"plhlegblast",
	"pyroclastic worm",
	"taurus",
	"thunder",
	"grim reaper",
	"nightmare",
	"phantom fisher",
	"scarecrow",
	"werewolf",
	"blue shark",
	"great white shark",
	"nurse shark",
	"tiger shark",
	"frosty",
	"frozen steve",
	"grinch",
	"nutcracker",
	"reindrake",
	"yeti",
	"mithril grubber",
	"fried chicken",  
	"fireproof witch",
	"fiery scuttler",  
	"ragnarok",  
	"trash gobbler",  
	"dumpster diver",  
	"banshee",  
	"snapping turtle",  
	"bayou sludge",  
	"alligator",  
	"titanoboa",  
	"blue ringed octopus",  
	"wiki tiki",
	"tadgang",
	"ent",
	"stridersurfer"
	"bogged",
	"wetwing"
]

export class FishingBestiaryRequirement implements Requirement {
	meetsRequirement(profiles: SkyblockProfiles): boolean {
		return profiles.profiles.some((profile) => {
			return requiredMobs.every((mob) => {
				const mobData = profile.bestiary.getByMob(mob)
				if (!mobData) return false
				return mobData.kills >= mobData.cap
			})
		})
	}
}
