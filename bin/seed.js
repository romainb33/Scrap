require("./../config/db.config"); // fetch the db connection
const axios = require("axios"); 

const GameModel = require("./../models/Game.model");

let gamesData = [];

const scrapGames = (page) => {
  axios.get(`https://api.rawg.io/api/games?page=${page}&key=95fc1125400b41b6ac588703a63dd1fe`)
  .then(apiRes => {
    apiRes.data.results.forEach(result => {
    axios.get(`https://api.rawg.io/api/games/${result.id}?key=95fc1125400b41b6ac588703a63dd1fe`)
    .then(resultId => {
      // //extracting year
      let yearArr;
      let yearReleased;
      if (resultId.data.released) {
        yearArr = resultId.data.released.split('-');
        yearReleased = Number(yearArr[0]);
      }
      // //extracting developers
      const developersArr = [];
      resultId.data.developers.forEach(developer => developersArr.push(developer.name));
      //extracting genres
      const genresArr = [];
      resultId.data.genres.forEach(genre => genresArr.push(genre.name));
      //extracting platforms
      const platformsArr = [];
      resultId.data.platforms.forEach(result => platformsArr.push(result.platform.name));
      let gameData = {
        name : resultId.data.name,
        slug : resultId.data.slug,
        description : resultId.data.description_raw,
        background_image : resultId.data.background_image,
        developers : developersArr,
        metacritic : resultId.data.metacritic,
        genres : genresArr,
        platforms : platformsArr,
        website : resultId.data.website,
        released : yearReleased
      }
      gamesData.push(gameData);
    })
    });
  })
  .catch(err => console.log(err));
}

// const createGameData = () => {
//   for(let i = 1; i < 6; i++) {
//     scrapGames(i);
//   }
//   return gamesData
// }
// const allGamesArr = createGameData();

for(let i = 1; i <= 400; i++) {
  scrapGames(i);
}

setTimeout(() => {
  GameModel.insertMany(gamesData)
    .then(dbSucess => console.log("Done"))
    .catch(err => console.log(err))
}, 120000)

// const createGameData = () => {
//   console.log("createGameData called")
//   for(let i = 1; i < 6; i++) {
//     scrapGames(i);
//   }
//   return gamesData
// }
// let datas;

// const insertData = async () => {
//   console.log("insertData called")
//   datas = await createGameData();
//   GameModel.insertMany(datas)
//     .then(dbSucess => console.log(dbSucess))
//     .catch(err => console.log(err))
// }
// insertData()
//
// (async function insertLabels() {
//   try {
//     await GameModel.deleteMany(); // empty the album db collection

//     const inserted = await GameModel.insertMany(gamesData); // insert docs in db
//     console.log(`seed albums done : ${inserted.length} documents inserted !`);
//   } catch (err) {
//     console.error(err);
//   }
// })();