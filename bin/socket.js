const fetch = require("node-fetch");
var FightingHero = require('./fightingModels').FightingHero;
var FightingCharacter = require('./fightingModels').FightingCharacter;
var axiosApi = require('./global').axiosApi;


function connection (io) {
  io.on('connection', function (socket) {
    var globalToken;
    var hero;
    var mob;
    var abilities;
    var item;
    var itemStatistics;

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
        drawItem(mob.info.level)
        .then(response => {
          item = response.data.item;
          itemStatistics = response.data.itemStatistics;
          socket.emit('itemDropped', response.data)
        })
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

    socket.on('saveItemToHero', function () {
      if (item){
        let data = { "id": item.id };
        let url = 'http://localhost:8000/api/hero/item/add/';
        // i have no idea why axios didnt work
        fetch(url, {
          method: "POST", 
          mode: "cors", 
          cache: "no-cache",
          credentials: "same-origin", 
          headers: {
              "Content-Type": "application/json",
              'Authorization': globalToken,
          },
          redirect: "follow", 
          referrer: "no-referrer", 
          body: JSON.stringify(data),
        })
        .catch(error => console.error(error));
      }
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
        .catch(error => (console.error('ERROR\n', error)))
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


const drawItem = async(level) => {
  let data = { "level": level };
  let url = 'http://localhost:8000/api/item/draw/';
  return await axiosApi.post(url, data);
}


module.exports =  {
  connection
};
