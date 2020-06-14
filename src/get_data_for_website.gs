// Submissions will be embedded directly into the website so wr managers can approve/reject from the website itself

// HAS has stable consistent formatting, so it can go directly into the JSON feed, no scripting neccessary

// Player/Tank Stats has inconsistent formatting since some columns have many more rows than others
// so, Player/Tank Stats will be recalculated on the website from the Records Data and the HAS data

// Secondary Records isn't worth the effort of remaking on website, so I'll just throw in a link to the spreadsheet tab instead

// WR Rules, at least the actual rules part, has a pretty consistent format, so I'll grab a JSON feed of the first 3 columns 
// and use js to stop making the table once blank rows are reached

// Records is the most important sheet, and I'll make a staging sheet of some sort here to preserve its layouts 
// and actual score values(not formatted ones) so that Player/Tank Stats can be recalculated


function getDataForWebsite()
{
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(WR_SHEET_NAME);
  
  let arrayToPrint = [];
  
  const recordsSheetData = getRecordsSheetData(sheet);
  arrayToPrint.push(recordsSheetData);
  
  const rangeToPrintTo = SpreadsheetApp.getActiveSpreadsheet().getRange(RANGE_TO_PRINT_DATA_TO);
  rangeToPrintTo.setValues(arrayToPrint);
}



// makes a 1d array of data containing the name of the sheet passed in
// as well as the stringified data in that sheet split into three segments of 50,000 chars each
// as that is the max num of characters that can fit into a single cell
function getRecordsSheetData(sheet) 
{
  // get gamemodes first
  const recordsSheetGamemodes = getGamemodesAndTheirColors(sheet);
  
  // then get tank image pics
  const tankPics = getTankImageURLs(sheet);
  
  let values = sheet.getDataRange().getValues();
  
  // cut off non essential values (anything before basic tank)
  // and add in image urls to 1st column
  values = formatWRSheetValues(values, tankPics);
  
  // split values into 3 strings because of cell char limit
  const valuesStr = JSON.stringify(values);
  const firstThird = valuesStr.substr(0, MAX_CHARS_PER_CELL); // a Google Sheets cell can only hold 50000 characters max
  const secondThird = valuesStr.substr(MAX_CHARS_PER_CELL, MAX_CHARS_PER_CELL);
  
  // holds the next 50000 chars starting from 100000,
  // this isn't need for any sheets rn, but I'm leaving it in case
  // one of the bigger sheets like records reaches over 100,000 chars
  const thirdThird = valuesStr.substr(2*MAX_CHARS_PER_CELL, MAX_CHARS_PER_CELL); 
  
  return [sheet.getName(), recordsSheetGamemodes, firstThird, secondThird, thirdThird];
}



// grab only the actual wr sheet data, not the useless stuff in the first few rows
function formatWRSheetValues(values, tankPics)
{
  const startingRowZeroIndex = STARTING_ROW - 2; // Tier 1 row before Basic tank's row
  
  // remove all rows before Basic Tank's row
  values = values.slice(startingRowZeroIndex);
  
  // add tank pic urls to 1st column of every row
  for (let row = 0; row < values.length; row++)
  {
    values[row][0] = tankPics[row-1]; // row-1 to get the image url next to the correct tank
  }
    
  return values;
}


// return array like [["FFA", "#00f00f"], ["2TDM", "#123456"], ...]
function getGamemodesAndTheirColors(sheet)
{  
  const rowOneIndex = GAMEMODE_NAMES_ROW;
  const columnOneIndex = STARTING_COLUMN.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
  
  const startColumnZeroIndex = columnOneIndex - 2; // arrays are 0-indexed (-1), and gamemodeNames are 1 to the right of score column (-1)
  
  const numCols = sheet.getMaxColumns();
  
  // returns the row at the very top with all the gamemodes in it
  const gamemodeRange = sheet.getRange(rowOneIndex, columnOneIndex, 1, numCols); // getRange is 1-indexed

  const valuesArray = gamemodeRange.getValues()[0]; // returns 2d array, so get 1st row in it
  const colorsArray = gamemodeRange.getBackgrounds()[0]; // returns 2d array, so get 1st row in it
  
  let arrayToReturn = [];
  
  // += 3 because gamemode name cells are 3 columns apart
  for (let i = startColumnZeroIndex; i < numCols; i += 3)
  {
    // repeated colors indicate the sheet's generic background color in the empty
    // spacing columns on the very far right, which means you've finished
    // going through all gamemodes --> break immediately and pop last element in return array
    // also ignore the very first iteration since theres nothing to compare against before it
    if (i > startColumnZeroIndex && colorsArray[i] === arrayToReturn[arrayToReturn.length - 1][1])
    {
      arrayToReturn.pop();
      break;
    }
    
    arrayToReturn.push( [valuesArray[i], colorsArray[i]] );
  }
  
  arrayToReturn = JSON.stringify(arrayToReturn); // turn into string
  
  return arrayToReturn;
}



// tank images are set in the formulas, not in values
// so we need to get them separately
function getTankImageURLs(sheet)
{  
  // getRange is 1-indexed
  const tankNamesColOneIndex = TANK_NAMES_COLUMN.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
  const tankPicsColOneIndex = tankNamesColOneIndex - 1; // immediately left of tank names
  
  const startingRowOneIndex = STARTING_ROW; // basic tank row
  
  const numRows = sheet.getMaxRows();
  
  const imagesRange = sheet.getRange(startingRowOneIndex, tankPicsColOneIndex, numRows, 1);
  
  const formulasArray = 
      imagesRange.getFormulas() // returns 2d array
      .flat() // converts 2d array to 1d array
      .map(formula => formula.trim().slice(8,-2)) // remove the `=image("` at start and `")` at end
      ;
    
  return formulasArray; // return array itself
}
