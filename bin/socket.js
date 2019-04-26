var axios = require('axios');
var axiosApi = axios.create({
  baseURL: 'http://localhost:8000/api/',
})

const fetch = require("node-fetch");

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
  constructor(info, statistics, token){
    this.info = info;
    this.mainStatistics = statistics;
    this.token = token;
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

  deleteInDatabase(token){
    const url = 'combat/fighting_mob/' + this.info.id + '/';
    const config = {
        headers: {
        Authorization: token,
      },
    };
    axiosApi.delete(
        url,
        config,
      )
      .catch(error => (console.error(error)));
    };
  }

class FightingHero extends FightingCharacter {
  constructor(info, statistics, hero_abilities) {
    super(info, statistics);
    this.abilities = hero_abilities;
  }

  addExperience(mob, token){
    let experience = mob.info.level * 10;
    let data = { "experience": experience };
    let url = 'http://localhost:8000/api/hero/upgrade/';
    // i have no idea why axios didnt work
    fetch(url, {
      method: "POST", 
      mode: "cors", 
      cache: "no-cache",
      credentials: "same-origin", 
      headers: {
          "Content-Type": "application/json",
          'Authorization': token,
      },
      redirect: "follow", 
      referrer: "no-referrer", 
      body: JSON.stringify(data),
    })
  }
}


// how can I make this code better?

function connection (io) {
  io.on('connection', function (socket) {
    var hero;
    var mob;
    var abilities;
    var globalToken;

    socket.on('userLeaveFight', function () {
      // mob win
      if (mob){
        mob.deleteInDatabase(globalToken);
      }
      return true;
    });

    socket.on('attack', function () {
      hero.attack(mob);
      if (mob.isDead()) {
        const winner = 'hero';
        socket.emit('fightResult', { hero, mob, winner });
        mob.deleteInDatabase(globalToken);
        hero.addExperience(mob, globalToken);
        return true;
      };

      mob.attack(hero);
      if (hero.isDead()) {
        // mob win
        const winner = 'mob';
        socket.emit('fightResult', { hero, mob, winner })
        mob.deleteInDatabase(globalToken);
        return true;
      };
    });

    socket.on('abilityUse', function () {
      null;
    });

    socket.on('getData', function ({ token, locationId}) {
      globalToken = token;
      const url = 'artifical/expedition/' + locationId + '/';
      const config = {
        headers: {
          Authorization: token,
        },
      };

      axiosApi
        .get(url, config)
        .then(response => (returnFightersAndData(response, token)))
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
  mobInfo['id'] = response.data.fighting_mob.id;
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