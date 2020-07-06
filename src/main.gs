function onEdit(event) {
  
  const editedSheetName = event.range.getSheet().getName();
  
  // only call other functions when one of these specific sheets below is edited
  if (editedSheetName !== WR_SHEET_NAME && editedSheetName !== SUBMISSIONS_SHEET_NAME) {
    return;  
  }
  
  // get wr records sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(WR_SHEET_NAME);
  
  // getDataRange returns the entire "Records" sheet 
  // I'm doing it like this so that I don't have to constantly update the script
  // whenever theres a new tank or gamemode
  const values = sheet.getDataRange().getValues();
  
  
  // if edited sheet is the records sheet only, then trigger the PLAYER_TANK_STATS_DRIVER() function only
  // this is for when a wr manager directly edits the records sheet, such as by approving records the old way 
  // through copy/paste or the even older way of manual editing
  if (editedSheetName === WR_SHEET_NAME) {
    PLAYER_TANK_STATS_DRIVER(values);
  }

  
  // if the edit hapenned on the submissions sheet then call WR_APPROVAL_DRIVER()
  // this is for when a wr manager types the special letter (now 'k') in order to approve a wr/has/both submission
  else if (editedSheetName === SUBMISSIONS_SHEET_NAME) {
    
    const eventRow = event.range.getRow(); // this returns the same row number as on the actual sheet
    const eventColumn = event.range.getColumn(); // returns 1-indexed column integer (B -> 2), indicating how many columns over from left side of sheet a specific column is (A = 1, B = 2)
    const eventValue = event.value; // should be equal to 'k', 'h', or 'leg'
    const eventOldValue = event.oldValue; // previous cell value
    
    WR_APPROVAL_DRIVER(values, eventRow, eventColumn, eventValue, eventOldValue);
  }
}
