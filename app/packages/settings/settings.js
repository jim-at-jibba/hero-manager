export const Settings = {
  stepInterval: 250,
  boosterCost: 5000,
  reviveCost: (lvl) => lvl * 500,
  healCost: (maxHealth, health) => (maxHealth - health) * 2,
  classImages: {
    'Rogue': '/character-art/rogue_hm_v1.png',
    'Barbarian': '/character-art/barbarian_hm_v2.png',
    'Mage': '/character-art/mage_hm_v1.png',
    'Bard': '/character-art/bard_hm_v1.png',
    'Warlock': '/character-art/warlock_ljb_v2.png',
    'Cleric': '/character-art/cleric_hm_v1.png',
    'Paladin': '/character-art/paladin_ljb_v1.png',
    'Fighter': '/character-art/fighter_ljb_v1.png',
    'Mystic': '/character-art/mystic_ljb_v1.png',
    'Druid': '/character-art/druid_ljb_v1.png',
    'Ranger': '/character-art/ranger_hm_v1.png',
  },
  monsterImages: {
    'Rat': [
      '/monster-art/rat/rat_1.png',
      '/monster-art/rat/rat_2.png',
      '/monster-art/rat/rat_3.png',
    ],
    'Spider': [
      '/monster-art/spider/spider_1.png',
      '/monster-art/spider/spider_2.png',
      '/monster-art/spider/spider_3.png',
    ],
    'Snake': [
      '/monster-art/snake/snake_1.png',
      '/monster-art/snake/snake_2.png',
      '/monster-art/snake/snake_3.png',
    ],
    'Zombie': [
      '/monster-art/zombie/zombie_1.png',
    ],
    'Elemental': [
      '/monster-art/elemental/elemental_1.png',
      '/monster-art/elemental/elemental_2.png',
      '/monster-art/elemental/elemental_3.png',
    ],
    'Wolf': [
      '/monster-art/wolf/wolf_1.png',
    ]
  },
  expForLevel: (currentLevel) => {
    return Math.ceil(Math.pow(1.2, currentLevel) * 600);
  },
  expFromQuest: (quest) => {
    return Math.floor(quest.difficultyRating * 0.58);
  }
};
