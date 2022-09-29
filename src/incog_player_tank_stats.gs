// NOTE: This was made by TJL

// main entry point to this file, controls which functions get called when
function INCOG_PLAYER_TANK_STATS_DRIVER(incogValues) {
  const incogPlayerArray = GET_INCOG_PLAYER_STATS(incogValues);
  const incogTankArray = GET_INCOG_TANK_STATS(incogValues);

  
  PRINT_ARRAY(incogPlayerArray, INCOG_PLAYER_SHEET_TO_DISPLAY_RESULTS_ON, INCOG_PLAYER_COLUMN_OF_TOP_LEFT_CELL, INCOG_PLAYER_ROW_OF_TOP_LEFT_CELL);
  PRINT_ARRAY(incogTankArray, INCOG_TANK_SHEET_TO_DISPLAY_RESULTS_ON, INCOG_TANK_COLUMN_OF_TOP_LEFT_CELL, INCOG_TANK_ROW_OF_TOP_LEFT_CELL);
}





function GET_INCOG_PLAYER_STATS(incogValues) {
  
  const startingRowZeroIndex = STARTING_ROW - 1;
  const startingColZeroIndex = STARTING_COLUMN.charCodeAt(0) - 'A'.charCodeAt(0);
  
  const numRows = incogValues.length;
  const numCols = incogValues[startingRowZeroIndex].length;
    
  let playerObj = {};

  // iterate through every record, and adjust each player's numRecords and combinedRecordScore
  for (let row = startingRowZeroIndex; row < numRows; ++row) {  
    for (let col = startingColZeroIndex; col < numCols; col += 3) { // yes, its += 3
      
      // if the proof link cell is empty, then you're currently not looking at a record and should skip ahead
      // for example, the blank row between tier 1,2,3,4 tank records or the gamemode name rows
      const proofLink = incogValues[row][col + 2];
      const score = incogValues[row][col]
      const name = incogValues[row][col + 1];

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



function GET_INCOG_TANK_STATS(incogValues) {
  
  const startingRowZeroIndex = STARTING_ROW - 1;
  const startingColZeroIndex = STARTING_COLUMN.charCodeAt(0) - 'A'.charCodeAt(0);
  const tankNamesColZeroIndex = TANK_NAMES_COLUMN.charCodeAt(0) - 'A'.charCodeAt(0);

  
  const numRows = incogValues.length;
  const numCols = incogValues[startingRowZeroIndex].length;
    
  let tankObj = {};
  
  // for each row, make a tank property and fill it with the sum of the record scores done with that tank
  for (let row = startingRowZeroIndex; row < numRows; ++row) {
    
    /* NOTE: THIS WAS CAUSING TANK ROWS TO BE SKIPPED IF NO FFA RECORD EXISTED FOR THAT TANK ROW
             THIS WAS AMENDED BY CHECKING THAT THE TANKNAME CELL ISN'T EMPTY AND ALSO DOESN'T CONTAIN "TIER "

    // if the proof link cell is empty, then you're currently not looking at a record and should skip ahead to the next row
    // for example, the blank row between tier 1,2,3,4 tank records or the gamemode name rows
    const proofLink = incogValues[row][startingColZeroIndex + 2];
    if (proofLink === "") {
      continue;
    }
    */
    
    // gets the actual name of the tank in the current row
    const tankName = incogValues[row][tankNamesColZeroIndex]; 
    
    // skip over non-tankname rows like the empty rows between tiers and the gamemode name rows (which contain Tier _ in place of a tankname)
    if ((tankName.trim() === "") || tankName.toLowerCase().includes("tier ")) {
      continue;
    }
    
    // initialize a tank's combined record score as 0
    tankObj[tankName] = 0;
    
    for (let col = startingColZeroIndex; col < numCols; col += 3) { //yes, its += 3
      
      const score = incogValues[row][col] || 0; // if theres no existing record for a gamemode, assume that that record is 0 points
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
