// Submissions will be embedded directly into the website so wr managers can approve/reject from the website itself

// HAS has stable consistent formatting, so it can go directly into the JSON feed, no scripting neccessary

// Player/Tank Stats has inconsistent formatting since some columns have many more rows than others
// so, Player/Tank Stats will be recalculated on the website from the Records Data and the HAS data

// Secondary Records isn't worth the effort of remaking on website, so I'll just throw in a link to the spreadsheet tab instead

// WR Rules, at least the actual rules part, has a pretty consistent format, so I'll grab a JSON feed of the first 3 columns 
// and use js to stop making the table once blank rows are reached

// Records is the most important sheet, and I'll make a staging sheet of some sort here to preserve its layouts 
// and actual score values(not formatted ones) so that Player/Tank Stats can be recalculated




function getDataFromSheets()
{
  let arrayToPrint = [];
  
  for (const sheetName of SHEETS_TO_GET_DATA_FROM)
  {
    const arrayToPrintRow = makeArrayRowOfSheetData(sheetName);
    arrayToPrint.push(arrayToPrintRow);
  }
  
  const rangeToPrintTo = SpreadsheetApp.getActiveSpreadsheet().getRange(RANGE_TO_PRINT_DATA_TO);
  rangeToPrintTo.setValues(arrayToPrint);
}



// makes a 1d array of data containing the name of the sheet passed in
// as well as the stringified data in that sheet split into three segments of 50,000 chars each
// as that is the max num of characters that can fit into a single cell
function makeArrayRowOfSheetData(sheetName) 
{
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const values = sheet.getDataRange().getValues();
  
  const valuesStr = JSON.stringify(values);
  const firstThird = valuesStr.substr(0, MAX_CHARS_PER_CELL); // a Google Sheets cell can only hold 50000 characters max
  const secondThird = valuesStr.substr(MAX_CHARS_PER_CELL, MAX_CHARS_PER_CELL);
  
  // holds the next 50000 chars starting from 100000,
  // this isn't need for any sheets rn, but I'm leaving it in case
  // one of the bigger sheets like records reaches over 100,000 chars
  const thirdThird = valuesStr.substr(2*MAX_CHARS_PER_CELL, MAX_CHARS_PER_CELL); 
  
  return [sheet.getName(), firstThird, secondThird, thirdThird];
}
