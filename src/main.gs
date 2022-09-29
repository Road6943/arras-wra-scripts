// functions that run when the Burger Button (button in top right of submissions sheet) is clicked
function BURGER_BUTTON_FUNCTION() {
  MOVE_TO_OLDER_SUBMISSIONS_DRIVER();
  //getDataForWebsite(); // This updates the wra website - road6943.github.io/wra - whenever the burger button is clicked, in order to keep the website semi-up-to-date
}

function onEdit(event) {
  
  const editedSheetName = event.range.getSheet().getName();
  
  // only call other functions when one of these specific sheets below is edited
  if (editedSheetName !== WR_SHEET_NAME && editedSheetName !== EVENT_WR_SHEET_NAME && editedSheetName !== SUBMISSIONS_SHEET_NAME && editedSheetName !== INCOG_WR_SHEET_NAME) {
    return;  
  }
  
  // get wr records sheet
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(WR_SHEET_NAME);
  let eventSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(EVENT_WR_SHEET_NAME);
  let incogSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(INCOG_WR_SHEET_NAME);
  
  // getDataRange returns the entire "Records" sheet 
  // I'm doing it like this so that I don't have to constantly update the script
  // whenever theres a new tank or gamemode
  const values = sheet.getDataRange().getValues();
  const eventValues = eventSheet.getDataRange().getValues();
  const incogValues = incogSheet.getDataRange().getValues();

  // if edited sheet is the records sheet only, then trigger the PLAYER_TANK_STATS_DRIVER() function only
  // this is for when a wr manager directly edits the records sheet, such as by approving records the old way 
  // through copy/paste or the even older way of manual editing
  if (editedSheetName === WR_SHEET_NAME) {
    PLAYER_TANK_STATS_DRIVER(values);
  }
  if (editedSheetName === EVENT_WR_SHEET_NAME) {
    EVENT_PLAYER_TANK_STATS_DRIVER(eventValues);
  }
  if (editedSheetName === INCOG_WR_SHEET_NAME) {
    INCOG_PLAYER_TANK_STATS_DRIVER(incogValues);
  }

  
  // if the edit hapenned on the submissions sheet then call WR_APPROVAL_DRIVER()
  // this is for when a wr manager types the special letter (now 'k') in order to approve a wr/has/both submission
  else if (editedSheetName === SUBMISSIONS_SHEET_NAME) {
    
    const eventRow = event.range.getRow(); // this returns the same row number as on the actual sheet
    const eventColumn = event.range.getColumn(); // returns 1-indexed column integer (B -> 2), indicating how many columns over from left side of sheet a specific column is (A = 1, B = 2)
    const eventValue = event.value; // should be equal to 'k', 'h', or 'leg'
    const eventOldValue = event.oldValue; // previous cell value
    
    WR_APPROVAL_DRIVER(values, eventRow, eventColumn, eventValue, eventOldValue);
    
    //uncomment to troll other wrm's
    // if (['k', 'h', 'v', 'x', 'leg', 'eve'].includes(event.value.toLowerCase())) { event.range.setValue(BEE_MOVIE_SCRIPT.replaceAll("\n", " ").slice(0,49999)); Browser.msgBox(`🐝`); }
  }
}
