/**
 * Common-build starting points for the Archive's deck builder. Each is just a
 * curated list of card names — resolved against the live archive search (one
 * exact-name lookup per card) when the user picks it, so it always reflects
 * whatever `@nexus/card-data` currently has rather than a frozen snapshot.
 */
export interface DeckPreset {
  name: string;
  blurb: string;
  cards: string[];
}

export const DECK_PRESETS: DeckPreset[] = [
  {
    name: 'Mono-Red Aggro',
    blurb: 'Cheap threats, burn to the face.',
    cards: [
      'Lightning Bolt',
      'Goblin Guide',
      'Monastery Swiftspear',
      'Lava Spike',
      'Eidolon of the Great Revel',
      'Goblin Chieftain',
      'Abrade',
      'Skewer the Critics',
      'Ragavan, Nimble Pilferer',
      'Monastery Mentor',
    ],
  },
  {
    name: 'Mono-Blue Control',
    blurb: 'Counter, draw, win late.',
    cards: [
      'Counterspell',
      'Brainstorm',
      'Ponder',
      'Snapcaster Mage',
      'Cryptic Command',
      'Mana Leak',
      'Serum Visions',
      'Jace, the Mind Sculptor',
      'Preordain',
      'Memory Lapse',
    ],
  },
  {
    name: 'Mono-Green Stompy',
    blurb: 'Ramp into big creatures.',
    cards: [
      'Llanowar Elves',
      'Birds of Paradise',
      'Rampant Growth',
      'Craterhoof Behemoth',
      'Elvish Mystic',
      'Overrun',
      'Wood Elves',
      "Kodama's Reach",
      'Sakura-Tribe Elder',
      'Genesis Wave',
    ],
  },
  {
    name: 'Golgari Midrange',
    blurb: 'Grind out value, black-green.',
    cards: [
      'Deathrite Shaman',
      'Scavenging Ooze',
      'Abrupt Decay',
      'Tarmogoyf',
      'Grave Titan',
      'Eternal Witness',
      "Liliana of the Veil",
      'Thoughtseize',
      'Golgari Charm',
      'Meren of Clan Nel Toth',
    ],
  },
];
