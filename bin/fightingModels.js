const fetch = require("node-fetch");
var axiosApi = require('./global').axiosApi;
var converters = require('./statisticConverters').converters;


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

module.exports = {
  FightingCharacter,
  FightingHero
}