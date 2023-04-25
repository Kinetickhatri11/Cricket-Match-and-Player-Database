const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const app = express();

let db = null;

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => console.log("server running"));
  } catch (error) {
    console.log(`DB Error ${error.message}`);
  }
};

initializeDbAndServer();

//Returning a list of all the players in the player table

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT player_id as playerId,
    player_name as playerName
    FROM PLAYER_DETAILS;`;

  const playersList = await db.all(getPlayersQuery);
  response.send(playersList);
});

//Returning a specific player based on the player ID

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerQuery = `
    SELECT player_id as playerId,
    player_name as playerName
    FROM PLAYER_DETAILS WHERE PLAYER_ID=${playerId};`;

  const player = await db.get(getPlayerQuery);
  response.send(player);
});

//Updating the details of a specific player based on the player ID

app.use(express.json());
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetail = request.body;
  const { playerName } = playerDetail;

  const getPlayerQuery = `
    UPDATE PLAYER_DETAILS SET PLAYER_NAME='${playerName}'
    WHERE PLAYER_ID=${playerId};`;

  const player = await db.run(getPlayerQuery);
  response.send("Player Details Updated");
});

//Returning the match details of a specific match
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;

  const getMatchQuery = `
    SELECT match_id as matchId,match,year FROM MATCH_DETAILS WHERE MATCH_ID=${matchId};`;

  const match = await db.get(getMatchQuery);
  response.send(match);
});

//Returning a list of all the matches of a player
app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;

  const getMatchQuery = `
    SELECT match_details.match_id as matchId,
    match_details.match as match,
    match_details.year as year FROM PLAYER_MATCH_SCORE
    NATURAL JOIN MATCH_DETAILS WHERE PLAYER_ID=${playerId};`;

  const match = await db.all(getMatchQuery);
  response.send(match);
});

//Returning a list of players of a specific match
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;

  const getMatchPlayersQuery = `
	    SELECT
	      player_details.player_id AS playerId,
	      player_details.player_name AS playerName
	    FROM player_match_score NATURAL JOIN player_details
        WHERE match_id=${matchId};`;

  const match = await db.all(getMatchPlayersQuery);
  response.send(match);
});

//Returning the statistics of the total score, fours, sixes of a specific player based on the player ID

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerScored = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};
    `;

  const player = await db.get(getPlayerScored);
  response.send(player);
});

module.exports = app;
