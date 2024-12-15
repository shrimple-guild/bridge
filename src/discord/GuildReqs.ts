import nbt from "prismarine-nbt";
import { SkyblockProfile } from "../api/SkyblockProfile.js";
import { titleCase } from "../utils/utils.js";
import { config } from "../utils/config.js";

function getReforge(reforgeName: string, rarity: Rarity, stat: string) {
	return reforges[reforgeName]?.[rarity]?.[stat];
}

type Reforge = {
	common: Partial<Record<string, number>>;
	uncommon: Partial<Record<string, number>>;
	rare: Partial<Record<string, number>>;
	epic: Partial<Record<string, number>>;
	legendary: Partial<Record<string, number>>;
	mythic: Partial<Record<string, number>>;
};

type Rarity = keyof Reforge;

const bobberCount = 3;
const rodList = [
	"GIANT_FISHING_ROD",
	"HELLFIRE_ROD",
	"ROD_OF_THE_SEA",
	"AUGER_ROD"
];

const reforges: Partial<Record<string, Reforge>> = {
	pitchin: {
		common: {
			fishing_speed: 1,
			sea_creature_chance: 1
		},
		uncommon: {
			fishing_speed: 2,
			sea_creature_chance: 1
		},
		rare: {
			fishing_speed: 4,
			sea_creature_chance: 2
		},
		epic: {
			fishing_speed: 6,
			sea_creature_chance: 3
		},
		legendary: {
			fishing_speed: 8,
			sea_creature_chance: 4
		},
		mythic: {
			fishing_speed: 10,
			sea_creature_chance: 5
		}
	},
	chomp: {
		common: {
			strength: 5,
			crit_chance: 5,
			fishing_speed: 2
		},
		uncommon: {
			strength: 10,
			crit_chance: 10,
			fishing_speed: 3
		},
		rare: {
			strength: 17,
			crit_chance: 17,
			fishing_speed: 5
		},
		epic: {
			strength: 25,
			crit_chance: 25,
			fishing_speed: 7
		},
		legendary: {
			strength: 35,
			crit_chance: 35,
			fishing_speed: 9
		},
		mythic: {
			strength: 50,
			crit_chance: 50,
			fishing_speed: 11
		}
	},
	salty: {
		common: {
			sea_creature_chance: 1
		},
		uncommon: {
			sea_creature_chance: 2
		},
		rare: {
			sea_creature_chance: 2
		},
		epic: {
			sea_creature_chance: 3
		},
		legendary: {
			sea_creature_chance: 5
		},
		mythic: {
			sea_creature_chance: 7
		}
	},
	treacherous: {
		common: {
			strength: 5,
			sea_creature_chance: 1
		},
		uncommon: {
			strength: 10,
			sea_creature_chance: 2
		},
		rare: {
			strength: 15,
			sea_creature_chance: 2
		},
		epic: {
			strength: 20,
			sea_creature_chance: 3
		},
		legendary: {
			strength: 25,
			sea_creature_chance: 5
		},
		mythic: {
			strength: 30,
			sea_creature_chance: 7
		}
	},
	stiff: {
		common: {
			sea_creature_chance: 1,
			strength: 2
		},
		uncommon: {
			sea_creature_chance: 2,
			strength: 4
		},
		rare: {
			sea_creature_chance: 2,
			strength: 6
		},
		epic: {
			sea_creature_chance: 3,
			strength: 8
		},
		legendary: {
			sea_creature_chance: 5,
			strength: 10
		},
		mythic: {
			sea_creature_chance: 7,
			strength: 12
		}
	},
	lucky: {
		common: {
			sea_creature_chance: 1,
			magic_find: 1
		},
		uncommon: {
			sea_creature_chance: 2,
			magic_find: 2
		},
		rare: {
			sea_creature_chance: 2,
			magic_find: 3
		},
		epic: {
			sea_creature_chance: 3,
			magic_find: 4
		},
		legendary: {
			sea_creature_chance: 5,
			magic_find: 5
		},
		mythic: {
			sea_creature_chance: 7,
			magic_find: 6
		}
	},
	submerged: {
		common: {
			crit_chance: 2,
			sea_creature_chance: 0.5
		},
		uncommon: {
			crit_chance: 4,
			sea_creature_chance: 0.6,
			fishing_speed: 1
		},
		rare: {
			crit_chance: 6,
			sea_creature_chance: 0.7,
			fishing_speed: 2
		},
		epic: {
			crit_chance: 8,
			sea_creature_chance: 0.8,
			fishing_speed: 3
		},
		legendary: {
			crit_chance: 10,
			sea_creature_chance: 0.9,
			fishing_speed: 4
		},
		mythic: {
			crit_chance: 12,
			sea_creature_chance: 1,
			fishing_speed: 5
		}
	},
	festive: {
		common: {
			intelligence: 5,
			sea_creature_chance: 0.05,
			fishing_speed: 2
		},
		uncommon: {
			intelligence: 10,
			sea_creature_chance: 0.05,
			fishing_speed: 3
		},
		rare: {
			intelligence: 15,
			sea_creature_chance: 0.1,
			fishing_speed: 4
		},
		epic: {
			intelligence: 20,
			sea_creature_chance: 0.15,
			fishing_speed: 6
		},
		legendary: {
			intelligence: 25,
			sea_creature_chance: 0.2,
			fishing_speed: 8
		},
		mythic: {
			intelligence: 30,
			sea_creature_chance: 0.25,
			fishing_speed: 10
		}
	},
	snowy: {
		common: {
			sea_creature_chance: 0.2,
			fishing_speed: 0.5
		},
		uncommon: {
			sea_creature_chance: 0.2,
			fishing_speed: 1
		},
		rare: {
			sea_creature_chance: 0.4,
			fishing_speed: 1.5
		},
		epic: {
			sea_creature_chance: 0.6,
			fishing_speed: 2
		},
		legendary: {
			sea_creature_chance: 0.8,
			fishing_speed: 2.5
		},
		mythic: {
			sea_creature_chance: 1,
			fishing_speed: 3
		}
	}
};

const level50Xp = 55_172_425;
const petXpRequired = 25_353_230;

const miningLeveling = [
	0, 50, 175, 375, 675, 1175, 1925, 2925, 4425, 6425, 9925, 14925, 22425, 32425,
	47425, 67425, 97425, 147425, 222425, 322425, 522425, 822425, 1222425, 1722425,
	2322425, 3022425, 3822425, 4722425, 5722425, 6822425, 8022425, 9322425,
	10722425, 12222425, 13822425, 15522425, 17322425, 19222425, 21222425,
	23322425, 25522425, 27822425, 30222425, 32722425, 35322425, 38072425,
	40972425, 44072425, 47472425, 51172425, 55172425, 59472425, 64072425,
	68972425, 74172425, 79672425, 85472425, 91572425, 97972425, 104672425,
	111672425
];

const hotmLeveling = [0, 3000, 9000, 25000, 60000, 100000, 150000];

type APISkyblockProfiles = {
	success: boolean;
	profiles?: APISkyblockProfile[];
};

type APISkyblockProfile = {
	profile_id: string;
	community_upgrades: any;
	created_at: number;
	members: Record<string, APISkyblockMember>;
	game_mode: string;
	cute_name: string;
	selected: boolean;
};

interface APIPet {
	uuid: string;
	uniqueId: string;
	type: string;
	exp: number;
	active: number;
	tier: string;
	heldItem: string | null;
	candyUsed: number;
	skin: string | null;
}

interface APISkyblockMember {
	pets_data?: {
		pets?: APIPet[];
	};
	trophy_fish?: {
		rewards?: number[];
	};
	leveling?: {
		experience: number;
	};
	inv_armor?: {
		type: number;
		data: string;
	};
	inventory?: {
		inv_contents?: {
			type: number;
			data: string;
		};
		equippment_contents?: {
			type: number;
			data: string;
		};
		wardrobe_contents?: {
			type: number;
			data: string;
		};
		backpack_contents?: Record<number, { type: number; data: string }>;
		ender_chest_contents?: {
			type: number;
			data: string;
		};
		talisman_bag?: {
			type: number;
			data: string;
		};
	};
	player_data?: {
		experience?: {
			SKILL_FISHING?: number;
		};
	}
	mining_core?: {
		experience?: number;
	};
}

type NBTItem = {
	id: number;
	Count: number;
	tag?: {
		ench: { level: number; id: number }[];
		Unbreakable: number;
		HideFlags: number;
		display: {
			Lore: string[];
			color?: number;
			Name: string;
		};
		ExtraAttributes: any;
	};
	Damage: number;
};

const petNames: { [key: string]: string } = {
	mythic_ff: "Mythic Flying Fish",
	legendary_ff: "Legendary Flying Fish",
	ammonite: "Legendary Ammonite"
};

type Requirements = {
	skyblockLevel: number;
	overflowFishingXp: number;
	flyingFish: "none" | "legendary" | "mythic";
	magmaLord: boolean;
	bobbinTime: number;
	hellfire: boolean;
	trophyHunter: "none" | "bronze" | "silver" | "gold" | "diamond";
	statsCheck: boolean;
	magmaLordSets: string[];
	rods: string[];
	petNames: string[];
	scc: number;
};

type GuildJoinStatus = {
	canJoin: boolean;
	rank: string;
};

export function getGuildRank(reqs: Requirements): GuildJoinStatus {
	const crayfishReqs = config.guildRoles.find((role) => role.name == "Crayfish")!;
	const shrimpReqs = config.guildRoles.find((role) => role.name == "Shrimp")!;
	const lobsterReqs = config.guildRoles.find((role) => role.name == "Lobster")!;

	const canJoinXpLVL = config.joinRequirements.some((req) => {
		return (
			reqs.skyblockLevel >= req.sbLevel &&
			reqs.overflowFishingXp >= req.overflowFishingXp
		);
	});

	const meetsReqs =
		canJoinXpLVL &&
		reqs.flyingFish != "none" &&
		reqs.magmaLord &&
		reqs.hellfire &&
		(reqs.bobbinTime >= 16 || reqs.statsCheck);

	const meetsCrawfish =
		meetsReqs &&
		reqs.skyblockLevel >= crayfishReqs.sbLevel &&
		reqs.overflowFishingXp >= crayfishReqs.fishingXp - level50Xp;

	const meetsShrimp =
		meetsCrawfish &&
		reqs.skyblockLevel >= shrimpReqs.sbLevel &&
		reqs.overflowFishingXp >= shrimpReqs.fishingXp - level50Xp &&
		(reqs.trophyHunter == "gold" || reqs.trophyHunter == "diamond");

	const meetsLobster =
		meetsShrimp &&
		reqs.skyblockLevel >= lobsterReqs.sbLevel &&
		reqs.overflowFishingXp >= lobsterReqs.fishingXp - level50Xp &&
		reqs.trophyHunter == "diamond";

	let rank: string;
	if (meetsLobster) {
		rank = "Lobster";
	} else if (meetsShrimp) {
		rank = "Shrimp";
	} else if (meetsCrawfish) {
		rank = "Crawfish";
	} else {
		rank = "Krill";
	}
	return {
		canJoin: meetsReqs,
		rank: rank
	};
}

export async function getGuildRequirementResults(profile: SkyblockProfile) {
	const member = profile.memberRaw as APISkyblockMember;
	const reqs: Partial<Requirements> = {};

	reqs.skyblockLevel = Math.floor((member.leveling?.experience ?? 0) / 100);

	const fishingXp = member.player_data?.experience?.SKILL_FISHING;

	if (!fishingXp) {
		throw new Error("Couldn't find Fishing XP! Is your skills API off?");
	}

	reqs.overflowFishingXp = fishingXp - level50Xp;

	if (!member.pets_data?.pets) {
		throw new Error("Couldn't find any pets for this profile. Weird!");
	}

	if (
		member.pets_data?.pets.find(
			(pet) =>
				pet.type == "FLYING_FISH" &&
				pet.tier == "MYTHIC" &&
				pet.exp >= petXpRequired
		)
	) {
		reqs.flyingFish = "mythic";
	} else if (
		member.pets_data?.pets.find(
			(pet) =>
				pet.type == "FLYING_FISH" &&
				pet.tier == "LEGENDARY" &&
				pet.exp >= petXpRequired
		)
	) {
		reqs.flyingFish = "legendary";
	} else {
		reqs.flyingFish = "none";
	}

	const trophyHunterLevels = [
		"none",
		"bronze",
		"silver",
		"gold",
		"diamond"
	] as const;

	const tfish = member.trophy_fish?.rewards?.filter((level) => level < 5) ?? [];

	reqs.trophyHunter = trophyHunterLevels[Math.max(...tfish)];

	const items = await getItemsInInventories(member);

	const equipment = getPresumedEquipmentStats(items);

	const hellfireRods = items
		.filter((item) => item?.tag?.ExtraAttributes?.id == "HELLFIRE_ROD")
		.map((rod) => ({
			rod,
			stats: getHellfireRodStats(rod)
		}));

	const allRods = items
		.filter((item) => rodList.includes(item?.tag?.ExtraAttributes?.id ?? ""))
		.map((rod) => getItemNameWithAttributes(rod));

	reqs.hellfire = hellfireRods.length != 0;

	reqs.rods = allRods;

	const accessoryStats = await getAccessoryStats(member.inventory?.talisman_bag?.data);

	const wardrobe = await getAllWardrobeSets(member);

	const magmaLordSets = getMagmaLordSets(wardrobe);

	reqs.magmaLord = magmaLordSets.length != 0;

	reqs.magmaLordSets = magmaLordSets.map((set) => {
		return set
			.map((piece) => {
				if (Object.keys(piece).length == 0) return "[Empty]";
				let pieceName = getItemNameWithAttributes(piece);
				let btLevel =
					piece.tag?.ExtraAttributes.enchantments?.ultimate_bobbin_time;
				if (btLevel) {
					pieceName += ` [BT ${btLevel}]`;
				}
				return pieceName;
			})
			.join("\n");
	});

	reqs.bobbinTime = magmaLordSets
		.map((set) =>
			set.reduce(
				(bobbin, cur) =>
					bobbin +
					(cur.tag?.ExtraAttributes.enchantments?.ultimate_bobbin_time ?? 0),
				0
			)
		)
		.reduce((a, b) => (a > b ? a : b), 0);

	const pets = getPetStats(member);

	reqs.petNames = pets.map((pet) => {
		let name = petNames[pet.pet];
		if (pet.item != null) {
			name += ` (${titleCase(pet.item)})`;
		}
		return name;
	});

	const setups: { scc: number; speed: number }[] = [];
	for (let pet of pets) {
		const sets = magmaLordSets.map((set) => ({
			set: set,
			stats: getArmorStats(set, pet.pet == "mythic_ff")
		}));
		for (let magmaLord of sets) {
			const bobbinBonus = 1 + magmaLord.stats.bobbin * 0.0016 * bobberCount;
			for (let hellfireRod of hellfireRods) {
				const cakeScc = 1;
				const beaconScc = 5;
				const baseScc = 20;
				const tonicSpeed = 30;
				const baitSpeed = 45;
				const scc =
					(baseScc +
						beaconScc +
						cakeScc +
						equipment.scc +
						accessoryStats.scc +
						hellfireRod.stats.scc +
						magmaLord.stats.scc +
						pet.scc) *
					bobbinBonus;
				const speed =
					(20 +
						tonicSpeed +
						baitSpeed +
						equipment.speed +
						accessoryStats.speed +
						hellfireRod.stats.speed +
						magmaLord.stats.speed +
						pet.speed) *
					bobbinBonus;
				setups.push({ speed, scc });
			}
		}
	}

	reqs.statsCheck = setups.some(
		(setup) => setup.scc >= 100 && setup.speed >= 350
	);

	reqs.scc = Math.max(
		...setups
			.filter((setup) => (reqs.statsCheck ? setup.speed >= 350 : true))
			.map((setup) => setup.scc)
	);

	return reqs as Requirements;
}

async function getItemsInInventories(
	member: APISkyblockMember
): Promise<NBTItem[]> {
	if (member.inventory?.inv_contents == null) {
		throw new Error("No inventory found! Is your inventory API off?");
	}

	const itemPromises: Promise<NBTItem[]>[] = [];

	itemPromises.push(getItemsInInventory(member.inventory?.inv_contents?.data));
	itemPromises.push(getItemsInInventory(member.inventory?.equippment_contents?.data));
	itemPromises.push(getItemsInInventory(member.inventory?.ender_chest_contents?.data));

	if (member.inventory?.backpack_contents != null) {
		Object.values(member.inventory?.backpack_contents).forEach((inventory) =>
			itemPromises.push(getItemsInInventory(inventory.data))
		);
	}

	return Promise.all(itemPromises).then((items) => items.flat());
}

function getItemNameWithAttributes(item: NBTItem) {
	let name = item.tag?.display?.Name?.replaceAll(/§[a-f0-9k-or]/g, "")!;
	const attributes = item.tag?.ExtraAttributes.attributes;
	if (attributes) {
		const attributesFormatted = Object.entries(attributes)
			.map(([name, level]) => {
				let abbreviated: string;
				if (name.includes("_")) {
					abbreviated = name
						.replaceAll("_", " ")
						.match(/\b(\w)/g)!
						.join("")
						.toUpperCase();
				} else {
					abbreviated = name.slice(0, 2).toUpperCase();
				}
				return `${abbreviated} ${level}`;
			})
			.join(", ");
		name += ` (${attributesFormatted})`;
	}
	return name;
}

async function getItemsInInventory(
	inventory: string | undefined
): Promise<NBTItem[]> {
	if (!inventory) return [];
	const buffer = Buffer.from(inventory, "base64");
	const items = await nbt
		.parse(buffer)
		.then((data) => nbt.simplify(data.parsed).i as any[]);
	return items;
}

function getPresumedEquipmentStats(items: NBTItem[]) {
	const equipment = {
		NECKLACE: { scc: 0, speed: 0 },
		BELT: { scc: 0, speed: 0 },
		GLOVES: { scc: 0, speed: 0 },
		CLOAK: { scc: 0, speed: 0 }
	};
	for (let item of items) {
		const id = item?.tag?.ExtraAttributes?.id;
		if (!id) continue;
		let baseRarity = "";
		let nextRarity = "";
		let baseSpeed = 0;
		let isFishingEquipment = false;
		if (id.startsWith("GILLSPLASH_") || id == "RIFT_NECKLACE_OUTSIDE") {
			if (id.startsWith("GILLSPLASH_")) {
				baseSpeed = 12;
			}
			baseRarity = "legendary";
			nextRarity = "mythic";
			isFishingEquipment = true;
		} else if (id.startsWith("FINWAVE_")) {
			baseSpeed = 8;
			baseRarity = "epic";
			nextRarity = "legendary";
			isFishingEquipment = true;
		} else if (id.startsWith("ICHTHYIC_")) {
			baseSpeed = 4;
			baseRarity = "rare";
			nextRarity = "epic";
			isFishingEquipment = true;
		}
		if (isFishingEquipment) {
			const rarity =
				item.tag?.ExtraAttributes?.rarity_upgrades == 1
					? nextRarity
					: baseRarity;
			const data = {
				scc:
					getReforge(
						item.tag?.ExtraAttributes?.modifier,
						// @ts-ignore
						rarity,
						"sea_creature_chance"
					) ?? 0,
				speed:
					baseSpeed +
					(getReforge(
						item.tag?.ExtraAttributes?.modifier,
						// @ts-ignore
						rarity,
						"fishing_speed"
					) ?? 0)
			};
			const type =
				id == "RIFT_NECKLACE_OUTSIDE"
					? "NECKLACE"
					: id.slice(id.indexOf("_") + 1);
			// @ts-ignore
			if (data.speed > equipment[type].speed) {
				// @ts-ignore
				equipment[type] = data;
			}
		}
	}
	return Object.values(equipment).reduce(
		(prev, cur) => ({ scc: prev.scc + cur.scc, speed: prev.scc + cur.scc }),
		{
			speed: 0,
			scc: 0
		}
	);
}

async function getAllWardrobeSets(
	member: APISkyblockMember
): Promise<NBTItem[][]> {
	const wardrobeContents = await getItemsInInventory(
		member.inventory?.wardrobe_contents?.data
	);
	const equippedSetContents = await getItemsInInventory(member.inv_armor?.data);
	if (!wardrobeContents) return [];
	const sets: NBTItem[][] = [];
	for (let page = 0; page < 2; page++) {
		for (let col = 0; col < 9; col++) {
			const set: NBTItem[] = [];
			for (let row = 0; row < 4; row++) {
				set.push(wardrobeContents[page * 36 + row * 9 + col]);
			}
			sets.push(set);
		}
	}
	sets.push(equippedSetContents);
	return sets;
}

function hasAccessory(accessories: NBTItem[], accessory: string) {
	return accessories.some((item) => {
		if (!item.tag) console.log(item);
		return item?.tag?.ExtraAttributes?.id == accessory;
	});
}

function getPetStats(member: APISkyblockMember) {
	const fishingPets: {
		pet: string;
		scc: number;
		speed: number;
		item: string | null;
	}[] = [];
	const pets = member.pets_data?.pets;
	if (!pets) return [];
	const mythicFf = pets.find(
		(pet) =>
			pet.type == "FLYING_FISH" &&
			pet.tier == "MYTHIC" &&
			pet.exp >= petXpRequired
	);

	if (mythicFf) {
		fishingPets.push({
			pet: "mythic_ff",
			scc: mythicFf.heldItem == "WASHED_UP_SOUVENIR" ? 5 : 0,
			speed: 80,
			item: mythicFf.heldItem
		});
	} else {
		const legFf = pets.find(
			(pet) =>
				pet.type == "FLYING_FISH" &&
				pet.tier == "LEGENDARY" &&
				pet.exp >= petXpRequired
		);
		if (legFf) {
			fishingPets.push({
				pet: "legendary_ff",
				scc: legFf.heldItem == "WASHED_UP_SOUVENIR" ? 5 : 0,
				speed: 80,
				item: legFf.heldItem
			});
		}
	}
	const ammonite = pets.find(
		(pet) =>
			pet.type == "AMMONITE" &&
			pet.tier == "LEGENDARY" &&
			pet.exp >= petXpRequired
	);
	if (ammonite != null) {
		const miningLevel = miningLeveling.findLastIndex(
			(levelXp) => (member.player_data?.experience?.SKILL_FISHING ?? 0) >= levelXp
		);
		const fishingLevel = Math.min(
			50,
			miningLeveling.findLastIndex(
				(levelXp) => (member.player_data?.experience?.SKILL_FISHING ?? 0) >= levelXp
			)
		);
		const hotmLevel = hotmLeveling.findLastIndex(
			(levelXp) => (member.mining_core?.experience ?? 0) >= levelXp
		);
		fishingPets.push({
			pet: "ammonite",
			scc: 5 + hotmLevel + (ammonite.heldItem == "WASHED_UP_SOUVENIR" ? 5 : 0),
			speed: (miningLevel + fishingLevel) * 0.5,
			item: ammonite.heldItem
		});
	}
	return fishingPets;
}

function getMagmaLordSets(sets: NBTItem[][]): NBTItem[][] {
	return sets.filter((set) => {
		const ids: string[] = set.map(
			(piece) => piece?.tag?.ExtraAttributes?.id ?? ""
		);
		const pieces = ids.reduce(
			(count, cur) => count + (cur.startsWith("MAGMA_LORD_") ? 1 : 0),
			0
		);
		return pieces >= 3;
	});
}

function getArmorStats(set: NBTItem[], mythicFish: boolean) {
	return set.reduce(
		(last, piece) => {
			const lore: string[] = piece?.tag?.display?.Lore ?? [];
			let scc = 0;
			const isMagmaLord =
				piece.tag?.ExtraAttributes?.id?.startsWith("MAGMA_LORD_");
			if (isMagmaLord) {
				const rarity =
					piece?.tag?.ExtraAttributes?.rarity_upgrades == 1
						? "mythic"
						: "legendary";
				scc =
					4.5 +
					(getReforge(
						piece?.tag?.ExtraAttributes?.modifier,
						rarity,
						"sea_creature_chance"
					) ?? 0);
				if (mythicFish) {
					scc *= 1.2;
				}
			} else {
				const sccLine = lore.find((line) =>
					line.startsWith("§7Sea Creature Chance: §c+")
				);
				scc = parseFloat(sccLine?.slice(25, sccLine.indexOf("%")) ?? "0");
			}
			const bobbin: number =
				piece?.tag?.ExtraAttributes.enchantments?.ultimate_bobbin_time ?? 0;
			const fishingSpeedLine = lore.find((line) =>
				line.startsWith("§7Fishing Speed: §a+")
			);
			let speed = parseFloat(
				fishingSpeedLine?.slice(19, fishingSpeedLine.indexOf(" ", 19)) ?? "0"
			);
			if (mythicFish && isMagmaLord) speed *= 1.2;
			return {
				scc: last.scc + scc,
				speed: last.speed + speed,
				bobbin: last.bobbin + bobbin
			};
		},
		{ scc: 0, speed: 0, bobbin: 0 }
	);
}

async function getAccessoryStats(accessoryBag: string | undefined) {
	const accessories = await getItemsInInventory(accessoryBag);
	const enrichments = accessories.reduce(
		(count, accessory) =>
			count +
			(Object.hasOwn(
				accessory.tag?.ExtraAttributes ?? {},
				"talisman_enrichment"
			)
				? 1
				: 0),
		0
	);
	const enrichmentScc = 0.3 * enrichments;

	const fishAffinitySpeed = hasAccessory(accessories, "FISH_AFFINITY_TALISMAN")
		? 10
		: 0;
	let agarimooSpeed = 0;
	if (hasAccessory(accessories, "AGARIMOO_ARTIFACT")) {
		agarimooSpeed = 3;
	} else if (hasAccessory(accessories, "AGARIMOO_RING")) {
		agarimooSpeed = 2;
	} else if (hasAccessory(accessories, "AGARIMOO_TALISMAN")) {
		agarimooSpeed = 1;
	}
	const chummingSpeed = hasAccessory(accessories, "CHUMMING_TALISMAN") ? 1 : 0;
	let odgerScc = 0;
	if (hasAccessory(accessories, "ODGERS_DIAMOND_TOOTH")) {
		odgerScc = 2;
	} else if (hasAccessory(accessories, "ODGERS_GOLD_TOOTH")) {
		odgerScc = 1.5;
	} else if (hasAccessory(accessories, "ODGERS_SILVER_TOOTH")) {
		odgerScc = 1;
	} else if (hasAccessory(accessories, "ODGERS_BRONZE_TOOTH")) {
		odgerScc = 0.5;
	}

	return {
		enrichments: enrichments,
		scc: odgerScc + enrichmentScc,
		speed: chummingSpeed + fishAffinitySpeed + agarimooSpeed
	};
}

function getHellfireRodStats(rod: any) {
	const starBonus = (rod.tag.ExtraAttributes.upgrade_level ?? 0) * 0.02;
	const baseSpeed = 75;
	const baseScc = 14;
	const starSpeed = baseSpeed * starBonus;
	const starScc = baseScc * starBonus;
	const rarity =
		rod.tag.ExtraAttributes.rarity_upgrades == 1 ? "mythic" : "legendary";
	const reforgeScc =
		getReforge(
			rod.tag.ExtraAttributes.modifier,
			rarity,
			"sea_creature_chance"
		) ?? 0;
	const reforgeSpeed =
		getReforge(rod.tag.ExtraAttributes.modifier, rarity, "fishing_speed") ?? 0;
	const attributes = rod.tag.ExtraAttributes.attributes;
	const attributeSpeed = (attributes.fishing_speed ?? 0) * 3;
	const piscarySpeed = rod.tag.ExtraAttributes.enchantments?.piscary ?? 0;
	const anglerScc = rod.tag.ExtraAttributes.enchantments?.angler ?? 0;
	const expertiseScc =
		(rod.tag.ExtraAttributes.enchantments?.expertise ?? 0) * 0.6;
	const totalScc = baseScc + starScc + reforgeScc + anglerScc + expertiseScc;
	const totalSpeed =
		baseSpeed + starSpeed + reforgeSpeed + attributeSpeed + piscarySpeed;
	return {
		scc: totalScc,
		speed: totalSpeed
	};
}
