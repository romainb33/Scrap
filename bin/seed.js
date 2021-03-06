require("./../config/db.config"); // fetch the db connection
const axios = require("axios"); 

const GameModel = require("./../models/Game.model");

let gamesData = [];

const scrapGames = async (page, onDone) => {

  try {

    const apiRes = await axios.get(`https://api.rawg.io/api/games?page=${page}&key=6aa995502d114491a15ad90bb264dc2f`);

    //to check if this all data of this page is pushed in gamesData
    let nbDone = 0;

    apiRes.data.results.forEach(async (result, index) => {
      const game = await axios.get(`https://api.rawg.io/api/games/${result.id}?key=6aa995502d114491a15ad90bb264dc2f`)

      const { name, slug, description_raw, background_image, metacritic, website, released, developers, genres, platforms } = game.data;

      gamesData.push({
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
      });

      nbDone++;
      if (nbDone === apiRes.data.results.length && onDone) onDone();

    });

  } catch(err) {
    console.log(err);
  }
  
};

//to check if all loops are done before inserting data in db
let loopDone = 0;
const nbToDo = 400;


for(let i = 1; i <= nbToDo; i++) {
  scrapGames(i, () => {
    loopDone++;
    if(loopDone === nbToDo) {
      GameModel.insertMany(gamesData)
      .then(dbSuccess => console.log(dbSuccess, "WELL INSERTED"))
      .catch(err => console.log(err, "FAIL"));
    };
  });
}
