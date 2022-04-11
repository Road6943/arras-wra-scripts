// this is to help Skrialik and Crazy Carrot with their Player Rankings 2.0 Project
// todo:
// add in the scoring system that Skrialik posted in wram channel
// figure out how to do rammers rankings
// add all tanks to correct categories in Constants.gs
// push all changed files, not just this one, to github - this, constants, main
// switch order of functions for burger button, so moving to older submissions happens last

function PLAYER_RANKINGS_DRIVER() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HAS_STAGING_SHEET_NAME);
  let values = sheet.getDataRange().getValues(); // get entire sheet
  values = values.slice(PLAYER_RANKINGS_START_ROW_ZERO_INDEX); // remove information rows at top
  values.sort((a,b) => b[0] - a[0]); // descending sort based on the score column;
  
  ADD_PLAYERS_TO_CATEGORIES(values, PLAYER_RANKINGS_CATEGORIES);
  ADD_ROWS_TO_CATEGORIES(values, PLAYER_RANKINGS_CATEGORIES);
  const arrayToPrint = MAKE_PLAYER_RANKINGS(PLAYER_RANKINGS_CATEGORIES);
  
  const startColOneIndex = PLAYER_RANKINGS_PRINT_START_COL.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
  const numRows = arrayToPrint.length;
  const numCols = Math.max(arrayToPrint[0].length);
  
  const sheetToPrintTo = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PLAYER_RANKINGS_SHEET_TO_PRINT_TO);
  const rangeToPrintTo = sheetToPrintTo.getRange(PLAYER_RANKINGS_PRINT_START_ROW_ONE_INDEX, startColOneIndex, numRows, numCols);
  
  rangeToPrintTo.setValues(arrayToPrint);
}

// add every unique player on sheet to each category, in order to allow easier data manipulation
function ADD_PLAYERS_TO_CATEGORIES(values, Categories) {
  const playersSet = new Set();
  
  // make a set where each player in HAS_Calculations appears exactly once
  for (const row of values) {
    const player = row[1];
    playersSet.add(player);
  }

  // for each category, make an empty array for each player on HAS_Calculations
  for (const category in Categories) {
    for (const player of playersSet) {
      Categories[category].players[player] = [];
    }
  }
}

// add each HAS score row into its corresponding player array in its corresponding tank category 
function ADD_ROWS_TO_CATEGORIES(values, Categories) {
  for (const row of values) {
    const [score, player, proofLink, tank, gamemode] = row;
    
    const category = GET_TANK_CATEGORY(tank, Categories);
        
    if (category === "not found") continue; // tank might not be in any of the categories
    if (score < Categories[category].minScore) continue; // don't add if score is too low for category
    
    Categories[category].players[player].push(row)
  }
}

function GET_TANK_CATEGORY(tank, Categories) {
    tank = tank // start with "  Auto Tri-Angle  "
             .trim() // "  Auto Tri-Angle  " --> "Auto Tri-Angle"
             .toLowerCase() // "Auto Tri-Angle" --> "auto tri-angle"
             .replace(/-/gi, "") // "auto tri-angle" --> "auto triangle" (uses regex to remove all dashes)
             .replace(/ /gi, ""); // "auto triangle" --> "autotriangle" (uses regex to remove all spaces)   
    
    for (const category in Categories) {
      if (!Categories[category].tanks.includes(tank)) continue;
       
      return category;
    }
    
    // tank not found in any category
    return "not found";
}

function MAKE_PLAYER_RANKINGS(Categories) {  
  let arrayToPrint = [];
  
  for (const category in Categories) {
    const categoryArray = [category];
    
    let playersArray = Object.entries(Categories[category].players);
    playersArray.sort((a,b) => b[1].length - a[1].length); // sort players based on how many scores they have in current category
    
    for (const [player, scoresArray] of playersArray) {
      let summary = "";
      
      for (const item of scoresArray) {
        const [score, player, proofLink, tank, gamemode] = item;
        
        summary += `- ${FORMAT_SCORE(score)} ${tank} ${gamemode}\n`; // FORMAT_SCORE is in a different file
      }
      
      if (summary !== "") {
        summary = `${player}\n${summary}`; // add player name at top for non-empty cells (empty cells are when player has no scores in current category)
      }
      
      categoryArray.push([summary]);
    }
    
    arrayToPrint.push(categoryArray);
  }
  
  return arrayToPrint;
}
