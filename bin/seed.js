require("./../config/db.config"); // fetch the db connection
const axios = require("axios"); 

const GameModel = require("./../models/Game.model");

let gameData;

const scrapGames = async (page) => {

  try {
    const apiRes = await axios.get(`https://api.rawg.io/api/games?page=${page}&key=6aa995502d114491a15ad90bb264dc2f`);

    apiRes.data.results.forEach(async result => {
      const game = await axios.get(`https://api.rawg.io/api/games/${result.id}?key=6aa995502d114491a15ad90bb264dc2f`)

      const { name, slug, description_raw, background_image, metacritic, website, released, developers, genres, platforms } = game.data;

      gameData = {
        name : name,
        slug : slug,
        description : description_raw,
        background_image : background_image,
        metacritic : metacritic,
        website : website,
        released: Number(released.split('-')[0]),
        developers: developers.map( ({name}) => name ),
        genres: genres.map( ({name}) => name ),
        platforms: platforms.map( item => item.platform.name ),
      };

      // await GameModel.insertOne(gameData);

      GameModel.insertOne(gameData)
      .then(dbSucces => console.log('inserted 1'))
      .catch(err => console.log('cannot insert this one'));

    });

  } catch(err) {
    console.log(err);
  }
  
}

for(let i = 1; i <= 400; i++) {
  scrapGames(i);
}
