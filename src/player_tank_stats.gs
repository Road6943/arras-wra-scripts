// main entry point to this file, controls which functions get called when
function PLAYER_TANK_STATS_DRIVER(values) {
  const playerArray = GET_PLAYER_STATS(values);
  const tankArray = GET_TANK_STATS(values);
  
  PRINT_ARRAY(playerArray, PLAYER_SHEET_TO_DISPLAY_RESULTS_ON, PLAYER_COLUMN_OF_TOP_LEFT_CELL, PLAYER_ROW_OF_TOP_LEFT_CELL);
  PRINT_ARRAY(tankArray, TANK_SHEET_TO_DISPLAY_RESULTS_ON, TANK_COLUMN_OF_TOP_LEFT_CELL, TANK_ROW_OF_TOP_LEFT_CELL);
}





function GET_PLAYER_STATS(values) {
  
  const startingRowZeroIndex = STARTING_ROW - 1;
  const startingColZeroIndex = STARTING_COLUMN.charCodeAt(0) - 'A'.charCodeAt(0);
  
  const numRows = values.length;
  const numCols = values[startingRowZeroIndex].length;
    
  let playerObj = {};

  // iterate through every record, and adjust each player's numRecords and combinedRecordScore
  for (let row = startingRowZeroIndex; row < numRows; ++row) {  
    for (let col = startingColZeroIndex; col < numCols; col += 3) { // yes, its += 3
      
      // if the proof link cell is empty, then you're currently not looking at a record and should skip ahead
      // for example, the blank row between tier 1,2,3,4 tank records or the gamemode name rows
      const proofLink = values[row][col + 2];
      const score = values[row][col]
      const name = values[row][col + 1];

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



function GET_TANK_STATS(values) {
  
  const startingRowZeroIndex = STARTING_ROW - 1;
  const startingColZeroIndex = STARTING_COLUMN.charCodeAt(0) - 'A'.charCodeAt(0);
  const tankNamesColZeroIndex = TANK_NAMES_COLUMN.charCodeAt(0) - 'A'.charCodeAt(0);
  
  const numRows = values.length;
  const numCols = values[startingRowZeroIndex].length;
    
  let tankObj = {};
  
  // for each row, make a tank property and fill it with the sum of the record scores done with that tank
  for (let row = startingRowZeroIndex; row < numRows; ++row) {
    
    /* NOTE: THIS WAS CAUSING TANK ROWS TO BE SKIPPED IF NO FFA RECORD EXISTED FOR THAT TANK ROW
             THIS WAS AMENDED BY CHECKING THAT THE TANKNAME CELL ISN'T EMPTY AND ALSO DOESN'T CONTAIN "TIER "

    // if the proof link cell is empty, then you're currently not looking at a record and should skip ahead to the next row
    // for example, the blank row between tier 1,2,3,4 tank records or the gamemode name rows
    const proofLink = values[row][startingColZeroIndex + 2];
    if (proofLink === "") {
      continue;
    }
    */
    
    // gets the actual name of the tank in the current row
    const tankName = values[row][tankNamesColZeroIndex]; 
    
    // skip over non-tankname rows like the empty rows between tiers and the gamemode name rows (which contain Tier _ in place of a tankname)
    if ((tankName.trim() === "") || tankName.toLowerCase().includes("tier ")) {
      continue;
    }
    
    // initialize a tank's combined record score as 0
    tankObj[tankName] = 0;
    
    for (let col = startingColZeroIndex; col < numCols; col += 3) { //yes, its += 3
      
      const score = values[row][col] || 0; // if theres no existing record for a gamemode, assume that that record is 0 points
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



function PRINT_ARRAY(arrayToPrint, sheetName, cellColumn, cellRow) {
  
  const numRows = arrayToPrint.length;
  const numCols = arrayToPrint[0].length;
  
  // These are NOT zero-indexed, they start at 1
  const startingColIndex = cellColumn.charCodeAt(0) - 'A'.charCodeAt(0) + 1; // 1-indexed, not 0-indexed
  const startingRowIndex = cellRow;
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const printRange = sheet.getRange(startingRowIndex, startingColIndex, numRows, numCols);
  
  // Clear out the columns that the new stats will be printed into
  const numRowsToClear = sheet.getLastRow() - cellRow + 1; // e.g. (3 to 100) is 98 rows
  const rangeToClear = sheet.getRange(startingRowIndex, startingColIndex, numRowsToClear, numCols);
  rangeToClear.clearContent();
  
  // Array will be printed on sheetName starting at, and extending down and to the right of, the cell at (cellColumn,cellRow)
  printRange.setValues(arrayToPrint);
}



