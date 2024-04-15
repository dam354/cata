import * as BuffDebuffInputs from '../../core/components/inputs/buffs_debuffs';
import * as OtherInputs from '../../core/components/other_inputs.js';
import * as Mechanics from '../../core/constants/mechanics.js';
import { IndividualSimUI, registerSpecConfig } from '../../core/individual_sim_ui.js';
import { Player } from '../../core/player.js';
import { PlayerClasses } from '../../core/player_classes';
import { APLRotation } from '../../core/proto/apl.js';
import { Debuffs, Faction, IndividualBuffs, PartyBuffs, Race, RaidBuffs, Spec, Stat, TristateEffect } from '../../core/proto/common.js';
import { Stats } from '../../core/proto_utils/stats.js';
import { TypedEvent } from '../../core/typed_event.js';
import * as ShamanInputs from '../inputs.js';
import * as ElementalInputs from './inputs.js';
import * as Presets from './presets.js';

const SPEC_CONFIG = registerSpecConfig(Spec.SpecElementalShaman, {
	cssClass: 'elemental-shaman-sim-ui',
	cssScheme: PlayerClasses.getCssClass(PlayerClasses.Shaman),
	// List any known bugs / issues here and they'll be shown on the site.
	knownIssues: [],
	warnings: [
		// Warning to use all 4 totems if T6 2pc bonus is active.
		(simUI: IndividualSimUI<Spec.SpecElementalShaman>) => {
			return {
				updateOn: TypedEvent.onAny([simUI.player.rotationChangeEmitter, simUI.player.currentStatsEmitter]),
				getContent: () => {
					const hasT62P = simUI.player.getCurrentStats().sets.includes('Skyshatter Regalia (2pc)');
					const totems = simUI.player.getSpecOptions().classOptions?.totems;
					const hasAll4Totems = totems && totems.earth && totems.air && totems.fire && totems.water;
					if (hasT62P && !hasAll4Totems) {
						return 'T6 2pc bonus is equipped, but inactive because not all 4 totem types are being used.';
					} else {
						return '';
					}
				},
			};
		},
	],

	// All stats for which EP should be calculated.
	epStats: [Stat.StatIntellect, Stat.StatSpirit,  Stat.StatSpellPower, Stat.StatSpellHit, Stat.StatSpellCrit, Stat.StatSpellHaste, Stat.StatMastery],
	// Reference stat against which to calculate EP. I think all classes use either spell power or attack power.
	epReferenceStat: Stat.StatSpellPower,
	// Which stats to display in the Character Stats section, at the bottom of the left-hand sidebar.
	displayStats: [
		Stat.StatHealth,
		Stat.StatMana,
		Stat.StatStamina,
		Stat.StatIntellect,
		Stat.StatSpirit,
		Stat.StatSpellPower,
		Stat.StatSpellHit,
		Stat.StatSpellCrit,
		Stat.StatSpellHaste,
		Stat.StatMastery,
	],
	// modifyDisplayStats: (player: Player<Spec.SpecElementalShaman>) => {
	// 	let stats = new Stats();
	// 	stats = stats.addStat(Stat.StatSpellCrit, player.getTalents().tidalMastery * 1 * Mechanics.SPELL_CRIT_RATING_PER_CRIT_CHANCE);
	// 	return {
	// 		talents: stats,
	// 	};
	// },

	defaults: {
		// Default equipped gear.
		gear: Presets.P3_PRESET_HORDE.gear,
		// Default EP weights for sorting gear in the gear picker.
		epWeights: Stats.fromMap({
			[Stat.StatIntellect]: 0.22,
			[Stat.StatSpellPower]: 1,
			[Stat.StatSpellCrit]: 0.67,
			[Stat.StatSpellHaste]: 1.29,
			[Stat.StatSpellHit]: 0.00,
			[Stat.StatSpirit]: 0.00,
			[Stat.StatMastery]: 0.00
		}),
		// Default consumes settings.
		consumes: Presets.DefaultConsumes,
		// Default talents.
		talents: Presets.StandardTalents.data,
		// Default spec-specific settings.
		specOptions: Presets.DefaultOptions,
		other: Presets.OtherDefaults,
		// Default raid/party buffs settings.
		raidBuffs: RaidBuffs.create({
			arcaneBrilliance: true,
			divineSpirit: true,
			giftOfTheWild: TristateEffect.TristateEffectImproved,
			sanctifiedRetribution: true,
			demonicPactSp: 500,
			wrathOfAirTotem: true,
		}),
		partyBuffs: PartyBuffs.create({}),
		individualBuffs: IndividualBuffs.create({
			blessingOfKings: true,
			blessingOfWisdom: 2,
			vampiricTouch: true,
		}),
		debuffs: Debuffs.create({
			faerieFire: TristateEffect.TristateEffectImproved,
			judgementOfWisdom: true,
			misery: true,
			curseOfElements: true,
			shadowMastery: true,
			heartOfTheCrusader: true,
		}),
	},
	// IconInputs to include in the 'Player' section on the settings tab.
	playerIconInputs: [ShamanInputs.ShamanShieldInput()],
	// Buff and Debuff inputs to include/exclude, overriding the EP-based defaults.
	includeBuffDebuffInputs: [
		BuffDebuffInputs.MP5Buff,
		BuffDebuffInputs.ReplenishmentBuff,
	],
	excludeBuffDebuffInputs: [],
	// Inputs to include in the 'Other' section on the settings tab.
	otherInputs: {
		inputs: [ElementalInputs.InThunderstormRange, OtherInputs.TankAssignment],
	},
	customSections: [ShamanInputs.TotemsSection],
	encounterPicker: {
		// Whether to include 'Execute Duration (%)' in the 'Encounter' section of the settings tab.
		showExecuteProportion: false,
	},

	presets: {
		// Preset talents that the user can quickly select.
		talents: [Presets.StandardTalents],
		// Preset rotations that the user can quickly select.
		rotations: [Presets.ROTATION_PRESET_DEFAULT],
		// Preset gear configurations that the user can quickly select.
		gear: [Presets.PRERAID_PRESET, Presets.P1_PRESET, Presets.P2_PRESET, Presets.P3_PRESET_ALLI, Presets.P3_PRESET_HORDE, Presets.P4_PRESET],
	},

	autoRotation: (_player: Player<Spec.SpecElementalShaman>): APLRotation => {
		return Presets.ROTATION_PRESET_DEFAULT.rotation.rotation!;
	},

	raidSimPresets: [
		{
			spec: Spec.SpecElementalShaman,
			talents: Presets.StandardTalents.data,
			specOptions: Presets.DefaultOptions,
			consumes: Presets.DefaultConsumes,
			defaultFactionRaces: {
				[Faction.Unknown]: Race.RaceUnknown,
				[Faction.Alliance]: Race.RaceDraenei,
				[Faction.Horde]: Race.RaceOrc,
			},
			defaultGear: {
				[Faction.Unknown]: {},
				[Faction.Alliance]: {
					1: Presets.P1_PRESET.gear,
					2: Presets.P2_PRESET.gear,
					3: Presets.P3_PRESET_ALLI.gear,
					4: Presets.P4_PRESET.gear,
				},
				[Faction.Horde]: {
					1: Presets.P1_PRESET.gear,
					2: Presets.P2_PRESET.gear,
					3: Presets.P3_PRESET_HORDE.gear,
					4: Presets.P4_PRESET.gear,
				},
			},
		},
	],
});

export class ElementalShamanSimUI extends IndividualSimUI<Spec.SpecElementalShaman> {
	constructor(parentElem: HTMLElement, player: Player<Spec.SpecElementalShaman>) {
		super(parentElem, player, SPEC_CONFIG);
	}
}
