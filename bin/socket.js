var axios = require('axios');
var apiAxios = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {Authorization: token, },
})

const converters = {
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

class FightingCharacter {
  constructor(info, statistics){
    this.info = info;
    this.mainStatistics = statistics;
    this.derivativeStatistics = this.getDerivativeStatistics(statistics);
  }

  getDerivativeStatistics(statistics) {
    let derivativeStatistics = {};
    for (var i=0; i<statistics.length; i++){
      let name = converters[statistics[i].name].name;
      let points = converters[statistics[i].name].converter * statistics[i].points;
      derivativeStatistics[name] = points;
    }
    return derivativeStatistics;
  }

  attack(opponent){
    let opponentHealth = opponent.derivativeStatistics.health_points - this.derivativeStatistics.damage
    opponent.derivativeStatistics.health_points = opponentHealth;
  }

  isDead(){
    if (this.derivativeStatistics.health_points <= 0) {
      return true;
    }
  }

  delete(){
    const url = 'http://localhost:8000/api/' + 'mob/delete/pk' 
    const config = {
        headers: {
        Authorization: token,
      },
    }
    axios.post(

    )
  }
  }

class FightingHero extends FightingCharacter {
  constructor(info, statistics, hero_abilities) {
    super(info, statistics);
    this.abilities = hero_abilities;
  }
}


function connection (io) {
  io.on('connection', function (socket) {
    var hero;
    var mob;
    var abilities;
    var globalToken;

    socket.on('attack', function () {
      hero.attack(mob);
      if (mob.isDead()) {
        const winner = 'hero';
        socket.emit('fightResult', { hero, mob, winner });
        return true;
        // Add hero experience 
        // create api for hero upgrade --> Exp.
      };

      mob.attack(hero);
      if (hero.isDead()) {
        const winner = 'mob';
        socket.emit('fightResult', { hero, mob, winner })
        return true;
      };
      
      socket.emit('fightersChanged', { hero, mob })
    });

    socket.on('abilityUse', function () {
      null;
    });

    socket.on('getData', function ({ token, locationId}) {
      globalToken = token;
      const url = 'http://localhost:8000/api/artifical/expedition/' + locationId + '/';
      const config = {
        headers: {
          Authorization: token,
        },
      };

      axios
        .get(url, config)
        .then(response => (returnFightersAndData(response)))
        .then(data => {
          hero = data.fightingHero;
          mob = data.fightingMob;
          abilities = data.abilities;
          socket.emit('getData', data)
        })
        .catch(error => (console.log('ERROR\n', error)))
    });
  }); 
};

function returnFightersAndData (response) {
  mobInfo =  response.data.mob;
  mobInfo['level'] = response.data.fighting_mob.level;
  data = {
    fightingMob: new FightingCharacter(mobInfo, response.data.fighting_mob_statistics),
    fightingHero: new FightingHero(response.data.hero, response.data.hero_statistics, response.data.hero_abilities),
    abilities: response.data.abilities,
  };
  return data;
};

module.exports =  {
  connection
};