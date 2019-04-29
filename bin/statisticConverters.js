converters = {
  strength: {
    name: 'damage',
    converter: 0.5,
  },
  agility: {
    name: 'critic_chance',
    converter: 0.15,
  },
  intelligence: {
    name: 'mana',
    converter: 5,
  },
  health: {
    name: 'health_points',
    converter: 10,
  },
}


module.exports = {
  converters,
}