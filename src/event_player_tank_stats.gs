// NOTE: This was made by TJL/Artificial

// main entry point to this file, controls which functions get called when
function EVENT_PLAYER_TANK_STATS_DRIVER(eventValues) {
  const eventPlayerArray = GET_EVENT_PLAYER_STATS(eventValues);
  const eventTankArray = GET_EVENT_TANK_STATS(eventValues);
  
  PRINT_ARRAY(eventPlayerArray, EVENT_PLAYER_SHEET_TO_DISPLAY_RESULTS_ON, EVENT_PLAYER_COLUMN_OF_TOP_LEFT_CELL, EVENT_PLAYER_ROW_OF_TOP_LEFT_CELL);
  PRINT_ARRAY(eventTankArray, EVENT_TANK_SHEET_TO_DISPLAY_RESULTS_ON, EVENT_TANK_COLUMN_OF_TOP_LEFT_CELL, EVENT_TANK_ROW_OF_TOP_LEFT_CELL);
}





function GET_EVENT_PLAYER_STATS(eventValues) {
  
  const startingRowZeroIndex = STARTING_ROW - 1;
  const startingColZeroIndex = STARTING_COLUMN.charCodeAt(0) - 'A'.charCodeAt(0);
  
  const numRows = eventValues.length;
  const numCols = eventValues[startingRowZeroIndex].length;
    
  let playerObj = {};

  // iterate through every record, and adjust each player's numRecords and combinedRecordScore
  for (let row = startingRowZeroIndex; row < numRows; ++row) {  
    for (let col = startingColZeroIndex; col < numCols; col += 3) { // yes, its += 3
      
      // if the proof link cell is empty, then you're currently not looking at a record and should skip ahead
      // for example, the blank row between tier 1,2,3,4 tank records or the gamemode name rows
      const proofLink = eventValues[row][col + 2];
      const score = eventValues[row][col]
      const name = eventValues[row][col + 1];

      // remove all "" empty strings, all null values, and all whitespace-only strings for proofLink, score, name
      const arrToValidate = [proofLink, score, name];
      if (arrToValidate.includes(null)
          // ensure string type first because null can't be trimmed
          // then trim to cover whitespace-only str's like " " and "  "
          || arrToValidate.filter(x => (typeof x === 'string')).map(x => x.trim()).includes("")
      ){
        continue;
      }

      // if player already exists in object, then adjust their properties accordingly
      // else, then it is the first record of that player that we have come across
      // so give make their numRecords = 1, and combinedRecordsScore = score
      if (playerObj.hasOwnProperty(name)) {
        playerObj[name].numRecords += 1;
        playerObj[name].combinedRecordScore += score;
      }
      else {
        playerObj[name] = {numRecords: 1, combinedRecordScore: score};
      }
      
    }
  }
  
  let playerArray = [];
  
  // second loop to calculate wr ratios for all players with at least MIN_RECORDS_TO_CALCULATE_RATIO wr's, alongside the name format used alongside the ratio
  // and also to convert the playerObj into a 2d array that can be used in google sheets
  // this is in a second loop so that the ratios & ratio player name format are only calculated once overall, and not for every record a player has    
  for (let playerName in playerObj) {
    
    if (playerObj[playerName].numRecords >= MIN_RECORDS_TO_CALCULATE_RATIO) {
      playerObj[playerName].ratio = (playerObj[playerName].combinedRecordScore / playerObj[playerName].numRecords); 
    }
    else {
      // this is so that the ratio for players with less than MIN_RECORDS_TO_CALCULATE_RATIO
      // will automatically fall to the bottom of the rankings
      playerObj[playerName].ratio = -1;
    }
    
    // make the ratio player name format
    playerObj[playerName].ratioPlayerNameFormat = playerName + " (" + playerObj[playerName].numRecords + " WR)";
    
    
    // convert playerObj into a 2d array usable by google sheets
    const playerArrayRow = [playerName, playerObj[playerName].numRecords, playerObj[playerName].combinedRecordScore, playerObj[playerName].ratio, playerObj[playerName].ratioPlayerNameFormat];
    playerArray.push(playerArrayRow);
  }
  
  return playerArray;
}



function GET_EVENT_TANK_STATS(eventValues) {
  
  const startingRowZeroIndex = STARTING_ROW - 1;
  const startingColZeroIndex = STARTING_COLUMN.charCodeAt(0) - 'A'.charCodeAt(0);
  const tankNamesColZeroIndex = TANK_NAMES_COLUMN.charCodeAt(0) - 'A'.charCodeAt(0);
  
  const numRows = eventValues.length;
  const numCols = eventValues[startingRowZeroIndex].length;
    
  let tankObj = {};
  
  // for each row, make a tank property and fill it with the sum of the record scores done with that tank
  for (let row = startingRowZeroIndex; row < numRows; ++row) {
    
    // if the proof link cell is empty, then you're currently not looking at a record and should skip ahead to the next row
    // for example, the blank row between tier 1,2,3,4 tank records or the gamemode name rows
    const proofLink = eventValues[row][startingColZeroIndex + 2];
    if (proofLink === "") {
      continue;
    }
    
    // initialize a tank's combined record score as 0
    const tankName = eventValues[row][tankNamesColZeroIndex]; // gets the actual name of the tank in the current row
    tankObj[tankName] = 0;
    
    for (let col = startingColZeroIndex; col < numCols; col += 3) { //yes, its += 3
      
      const score = eventValues[row][col] || 0; // if theres no existing record for a gamemode, assume that that record is 0 points
      tankObj[tankName] += score;
    }
  }
  
  
  // Convert the tankObj into a 2d array, so we can use it in Google Sheets
  let tankArray = [];
  
  for (let tankName in tankObj) {
    const tankArrayRow = [tankName, tankObj[tankName] ];
    
    tankArray.push(tankArrayRow);
  }
  
  return tankArray;
}

// deleted this files PRINT_ARRAY to avoid issues with name conflict later
