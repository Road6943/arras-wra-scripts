// main entry point to this file, controls which functions get called when
function WR_APPROVAL_DRIVER(values, eventRow, eventColumn, eventValue, eventOldValue) {
    
  // return early if edit is not in Submission Status column or is not the Approval Letter
  if (!EDITS_ARE_VALID_FOR_RUNNING_SCRIPT(eventColumn, eventValue)) {
    return;  
  }
  
  
  // get score, name, proofLink, tank, gamemode, specialSubmission
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SUBMISSIONS_SHEET_NAME);
  
  const editedRowOneIndex = eventRow; // this returns the same row number as on the actual sheet
  const editedColOneIndex = eventColumn; // returns 1-indexed column integer (B -> 2)
  const editedCell = sheet.getRange(editedRowOneIndex, editedColOneIndex); // gets the cell that was edited
  
  // getRange parameters are (row, col, numRows, numCols)
  // start col at the editedCol + 1, since we don't need the Submission Status
  // return 1 row, and 6 cols - score, name, proofLink, tank, gamemode, specialSubmission
  // also the row and col are 1-indexed, not 0-indexed
  // the [0] at the end is because getRange returns a 2d array, so we need to grab the 1st (and only) row in it
  const submissionDetailsArray = sheet.getRange(editedRowOneIndex, editedColOneIndex + 1, 1, 6).getValues()[0];
  
  // then, destructure array into individual variables
  const [submissionScore, submissionPlayerName, submissionProofLink, submissionTank, submissionGamemode, submissionSpecialSubmission] = submissionDetailsArray;

  let isEventRecord = false;

  // if we're dealing with an event record, use the EVENT WR SHEET values instead of the main Records Sheet values
  if (submissionSpecialSubmission === SPECIAL_SUBMISSION_EVENT_RECORD) {
    values = (
      SpreadsheetApp
        .getActiveSpreadsheet()
        .getSheetByName(EVENT_WR_SHEET_NAME)
        .getDataRange()
        .getValues()
    )

    isEventRecord = true;
  }

  let isIncogRecord = false;

  // if we're dealing with an incog record, use the INCOG WR SHEET values instead of the main Records Sheet values
  if (submissionSpecialSubmission === SPECIAL_SUBMISSION_INCOG_RECORD) {
    values = (
      SpreadsheetApp
        .getActiveSpreadsheet()
        .getSheetByName(INCOG_WR_SHEET_NAME)
        .getDataRange()
        .getValues()
    )

    isIncogRecord = true;
  }
    
  
  // if wr manager uses the Legacy Launch Sequence 'leg' on people submitting older screenshots for instance
  // or if gamemode is event, then see if score can be added to Legacy HAS and return early if so
  // is not error checked, since legacy submissions may have removed tanks/gamemodes or event gamemodes not on the sheet
  if (eventValue === LEGACY_LAUNCH_CHARACTER) {
    ADD_SCORE_TO_LEGACY_HAS(submissionDetailsArray, editedCell);
    return;  
  }
  // if 'eve' launch text is used to only approve for EAS, then do only that and return early
  else if (eventValue === EVENT_LAUNCH_CHARACTER) {
    ADD_SCORE_TO_EAS(submissionDetailsArray, editedCell);
    return;
  }
  // if 'inc' launch text is used to only approve for IAS, then do only that and return early
  else if (eventValue === INCOG_LAUNCH_CHARACTER) {
    ADD_SCORE_TO_IAS(submissionDetailsArray, editedCell);
    return;
  }
  
  
  // get 1-indexed row and col of the record to replace on the sheet
  // return value of -1 means that the tank/gamemode was not found
  const recordRow = GET_TANK_ROW_1_INDEXED(values, submissionTank); // 1-indexed (actual wr sheet row)
  const recordCol = GET_GAMEMODE_SCORE_COL_1_INDEXED(values, submissionGamemode); // 1-indexed column number of the score column for the given gamemode (A=1, B=2, etc)
  
  
  // return early if any errors found with finding tank/gamemode, or if submission is secondary record
  // and reset the edited cell back to its previous value
  if (ERRORS_PRESENT_IN_SUBMISSION_DETAILS(recordRow, recordCol, submissionTank, submissionGamemode, submissionSpecialSubmission) ) {
    editedCell.setValue(eventOldValue);
    return;
  }
  
  
  // if 'h' launch character is used to only approve for HAS, then do that and return early
  if (eventValue === HAS_ONLY_LAUNCH_CHARACTER) {
    ONLY_APPROVE_FOR_HAS(submissionDetailsArray, editedCell);
    return;
  }

  // values array is 0-indexed, so we need to subtact 1 from recordRow and recordCol to get the correct oldRecordScore
  const oldRecordScore = values[recordRow - 1][recordCol - 1];
    
  // handle event records that may or may not also be for EAS
  if (submissionSpecialSubmission === SPECIAL_SUBMISSION_EVENT_RECORD) {
    let eventRecordApproved = false;
    let easApproved = false;

    // event record
    if (submissionScore > oldRecordScore) {
      editedCell.setValue(APPROVED_STATUS_CHARACTER);
      eventRecordApproved = true;

      // last param === isEventRecord
      ADD_APPROVED_WR_TO_SHEET_AND_CALL_PLAYER_STATS(
        values, recordRow, recordCol, submissionScore, submissionPlayerName, submissionProofLink, true
      );
      
    } else {
      // record too low
      editedCell.setValue(REJECTED_STATUS_CHARACTER);
    }

    // EAS
    if (submissionScore > MINIMUM_SCORE_FOR_EVENT_ARRAS_SCORES) {
      editedCell.setValue(APPROVED_STATUS_CHARACTER);
      easApproved = true;
      ADD_SCORE_TO_EAS(submissionDetailsArray, editedCell, false);
    }

    

    if (eventRecordApproved && easApproved) {
      Browser.msgBox("EVENT RECORD & EAS SUBMISSION BOTH APPROVED", `${PRINT_SUBMISSION_DETAILS(submissionDetailsArray)} has replaced the previous event record of ${FORMAT_SCORE(oldRecordScore)} and has been added to Event Arras Scores`, Browser.Buttons.OK);

    } else if (eventRecordApproved) {
      Browser.msgBox("EVENT RECORD SUBMISSION APPROVED", `${PRINT_SUBMISSION_DETAILS(submissionDetailsArray)} has replaced the previous event record of ${FORMAT_SCORE(oldRecordScore)}`, Browser.Buttons.OK);

    } else if (easApproved) {
      Browser.msgBox("EAS SUBMISSION APPROVED", `${PRINT_SUBMISSION_DETAILS(submissionDetailsArray)} has been added to Event Arras Scores`, Browser.Buttons.OK);

    } else {
      Browser.msgBox("EVENT RECORD & EAS SUBMISSIONS BOTH REJECTED", `${PRINT_SUBMISSION_DETAILS(submissionDetailsArray)} is lower than the current event record of ${FORMAT_SCORE(oldRecordScore)}\\nand is lower than the minimum score needed for Event Arras Scores, currently ${FORMAT_SCORE(MINIMUM_SCORE_FOR_EVENT_ARRAS_SCORES)}`, Browser.Buttons.OK);
    }

    return;
  }

  // handle incog records that may or may not also be for IAS
  if (submissionSpecialSubmission === SPECIAL_SUBMISSION_INCOG_RECORD) {
    let incogRecordApproved = false;
    let iasApproved = false;

    // incog record
    if (submissionScore > oldRecordScore) {
      editedCell.setValue(APPROVED_STATUS_CHARACTER);
      incogRecordApproved = true;

      // last param === isIncogRecord
      ADD_APPROVED_WR_TO_SHEET_AND_CALL_PLAYER_STATS(
        values, recordRow, recordCol, submissionScore, submissionPlayerName, submissionProofLink, false, true
      );
      
    } else {
      // record too low
      editedCell.setValue(REJECTED_STATUS_CHARACTER);
    }

    // IAS
    if (submissionScore > MINIMUM_SCORE_FOR_INCOG_ARRAS_SCORES) {
      editedCell.setValue(APPROVED_STATUS_CHARACTER);
      iasApproved = true;
      ADD_SCORE_TO_IAS(submissionDetailsArray, editedCell, false);
    }

    

    if (incogRecordApproved && iasApproved) {
      Browser.msgBox("INCOG RECORD & IAS SUBMISSION BOTH APPROVED", `${PRINT_SUBMISSION_DETAILS(submissionDetailsArray)} has replaced the previous incog record of ${FORMAT_SCORE(oldRecordScore)} and has been added to Incog Arras Scores`, Browser.Buttons.OK);

    } else if (incogRecordApproved) {
      Browser.msgBox("Incog RECORD SUBMISSION APPROVED", `${PRINT_SUBMISSION_DETAILS(submissionDetailsArray)} has replaced the previous incog record of ${FORMAT_SCORE(oldRecordScore)}`, Browser.Buttons.OK);

    } else if (iasApproved) {
      Browser.msgBox("IAS SUBMISSION APPROVED", `${PRINT_SUBMISSION_DETAILS(submissionDetailsArray)} has been added to Incog Arras Scores`, Browser.Buttons.OK);

    } else {
      Browser.msgBox("INCOG RECORD & IAS SUBMISSIONS BOTH REJECTED", `${PRINT_SUBMISSION_DETAILS(submissionDetailsArray)} is lower than the current incog record of ${FORMAT_SCORE(oldRecordScore)}\\nand is lower than the minimum score needed for Incog Arras Scores, currently ${FORMAT_SCORE(MINIMUM_SCORE_FOR_INCOG_ARRAS_SCORES)}`, Browser.Buttons.OK);
    }

    return;
  }
  
  


  // WR submission is too low, and not an HAS submission
  if (submissionSpecialSubmission !== SPECIAL_SUBMISSION_HIGHEST_ARRAS_SCORES 
        && submissionScore <= oldRecordScore) { 
    
    editedCell.setValue(REJECTED_STATUS_CHARACTER);
    Browser.msgBox("WR SUBMISSION REJECTED", `${PRINT_SUBMISSION_DETAILS(submissionDetailsArray)} is lower than the current wr of ${FORMAT_SCORE(oldRecordScore)}`, Browser.Buttons.OK);
  }


  // WR submission is higher than old WR, and its not an HAS submission
  else if (submissionSpecialSubmission !== SPECIAL_SUBMISSION_HIGHEST_ARRAS_SCORES 
             && submissionScore > oldRecordScore) { 
    
    editedCell.setValue(APPROVED_STATUS_CHARACTER);
    ADD_APPROVED_WR_TO_SHEET_AND_CALL_PLAYER_STATS(values, recordRow, recordCol, submissionScore, submissionPlayerName, submissionProofLink);
    
    Browser.msgBox("WR SUBMISSION APPROVED", `${PRINT_SUBMISSION_DETAILS(submissionDetailsArray)} has replaced the previous wr of ${FORMAT_SCORE(oldRecordScore)}`, Browser.Buttons.OK);
  }
  
  
  // WR submission is too low, but its also an HAS submission
  else if (submissionSpecialSubmission === SPECIAL_SUBMISSION_HIGHEST_ARRAS_SCORES
             && submissionScore <= oldRecordScore) {
    
    const hasSubmissionAddedSuccessfully = ADD_HAS_SUBMISSION_TO_HAS(submissionDetailsArray, false);
    
    if (hasSubmissionAddedSuccessfully) {
      
      editedCell.setValue(APPROVED_STATUS_CHARACTER);  
      Browser.msgBox("HAS SUBMISSION APPROVED", `${PRINT_SUBMISSION_DETAILS(submissionDetailsArray)} has been added to Highest Arras Scores`, Browser.Buttons.OK);
    }
    else {
      
      editedCell.setValue(REJECTED_STATUS_CHARACTER);
      Browser.msgBox("WR & HAS SUBMISSIONS BOTH REJECTED", `${PRINT_SUBMISSION_DETAILS(submissionDetailsArray)} is lower than the current wr of ${FORMAT_SCORE(oldRecordScore)}\\nand is lower than the minimum score needed for Highest Arras Scores, currently ${FORMAT_SCORE(MINIMUM_SCORE_FOR_HIGHEST_ARRAS_SCORES)}`, Browser.Buttons.OK);
    }
  }
  

  
  // WR submission is higher than old WR, and its also an HAS submission
  else if (submissionSpecialSubmission === SPECIAL_SUBMISSION_HIGHEST_ARRAS_SCORES
             && submissionScore > oldRecordScore) {
    
    ADD_APPROVED_WR_TO_SHEET_AND_CALL_PLAYER_STATS(values, recordRow, recordCol, submissionScore, submissionPlayerName, submissionProofLink);
    editedCell.setValue(APPROVED_STATUS_CHARACTER);  
    
    const hasSubmissionAddedSuccessfully = ADD_HAS_SUBMISSION_TO_HAS(submissionDetailsArray, false);
    
    if (hasSubmissionAddedSuccessfully) {
      
      Browser.msgBox("WR & HAS SUBMISSIONS BOTH APPROVED", `${PRINT_SUBMISSION_DETAILS(submissionDetailsArray)} has replaced the previous wr of ${FORMAT_SCORE(oldRecordScore)}\\nand has been added to Highest Arras Scores`, Browser.Buttons.OK);
    }
    else {
      
      Browser.msgBox("WR SUBMISSION APPROVED, HAS SUBMISSION REJECTED", `${PRINT_SUBMISSION_DETAILS(submissionDetailsArray)} has replaced the previous wr of ${FORMAT_SCORE(oldRecordScore)}\\nbut is lower than the minimum score needed for Highest Arras Scores, currently ${FORMAT_SCORE(MINIMUM_SCORE_FOR_HIGHEST_ARRAS_SCORES)}`, Browser.Buttons.OK);
    }
  }
}





// Makes sure that the rest of script only runs when SCRIPT_LAUNCH_CHARACTER is entered in SUBMISSION_STATUS_COLUMN
function EDITS_ARE_VALID_FOR_RUNNING_SCRIPT(eventColumn, eventValue) {
  
  // event .range.getColumn returns a 1-indexed (NOT 0-indexed) integer,
  // indicating how many columns over from left side of sheet a specific column is (A = 1, B = 2)
  // this code converts that integer back into the actual Column Letter (2 back into B)
  const editedColumn = String.fromCharCode(eventColumn + 'A'.charCodeAt(0) - 1);
  
  if (editedColumn !== SUBMISSION_STATUS_COLUMN) {
    return false;
  }
  
  
  const newCellValueAfterEdit = eventValue.toLowerCase();
  
  if (newCellValueAfterEdit !== SCRIPT_LAUNCH_CHARACTER.toLowerCase() 
        && newCellValueAfterEdit !== HAS_ONLY_LAUNCH_CHARACTER
        && newCellValueAfterEdit !== LEGACY_LAUNCH_CHARACTER
        && newCellValueAfterEdit !== EVENT_LAUNCH_CHARACTER
        && newCellValueAfterEdit !== INCOG_LAUNCH_CHARACTER) {
    return false;
  }
  
  
  return true;
}



// returns a 1-indexed row number (the actual row number on the spreadsheet)
// returns -1 if tankName not found
function GET_TANK_ROW_1_INDEXED(values, tankName) {
    
  // format tankName to ensure maximum chance that its correct row will be found 
  // (since the submission form and the sheet might spell the tank names slightly differently for some reason)
  tankName = tankName // start with "  Auto Tri-Angle  "
               .trim() // "  Auto Tri-Angle  " --> "Auto Tri-Angle"
               .toLowerCase() // "Auto Tri-Angle" --> "auto tri-angle"
               .replace(/-/gi, "") // "auto tri-angle" --> "auto triangle" (uses regex to remove all dashes)
               .replace(/ /gi, ""); // "auto triangle" --> "autotriangle" (uses regex to remove all spaces)
  
  
  const tankNamesColZeroIndex = TANK_NAMES_COLUMN.charCodeAt(0) - 'A'.charCodeAt(0); // (A -> 0), (B -> 1), etc...
  const startingRowZeroIndex = STARTING_ROW - 1;
  
  const numRows = values.length;
  
  // iterate over the entire tanknames column and return the row you find the given tankname at
  for (let row = startingRowZeroIndex; row < numRows; ++row) {
       
    // format tankNameAtRow to ensure maximum chance that its correct row will be found 
    // (since the submission form and the sheet might spell the tank names slightly differently for some reason)
    const tankNameAtRow = values[row][tankNamesColZeroIndex] // start with "  Auto Tri-Angle  "
                            .trim() // "  Auto Tri-Angle  " --> "Auto Tri-Angle"
                            .toLowerCase() // "Auto Tri-Angle" --> "auto tri-angle"
                            .replace(/-/gi, "") // "auto tri-angle" --> "auto triangle" (uses regex to remove all dashes)
                            .replace(/ /gi, ""); // "auto triangle" --> "autotriangle" (uses regex to remove all spaces)   
    
    // skip past the empty rows, such as gaps between tanks of different tiers
    if (tankNameAtRow === "") {
      continue;  
    }
    
    
    // when you find a match, return the row that the tank's wr's are in
    // row+1 is to return a 1-indexed row (the actual row number on sheet) instead of a 0-indexed row
    if (tankName === tankNameAtRow) {
      return row + 1;  
    }
  }
  
  return -1; // return -1 if the tankName could not be found in the wr sheet
}



// returns the 1-indexed column number for the score column of the given gamemode (A=1, B=2, etc...)
// returns -1 if gamemode is not found
function GET_GAMEMODE_SCORE_COL_1_INDEXED(values, gamemode) {
  
  gamemode = gamemode // start with "  Open 3/4 TDM (All)  "
               .trim() // "  Open 3/4 TDM (All)  " --> "Open 3/4 TDM (All)"
               .toLowerCase() // "Open 3/4 TDM (All)" --> "open 3/4 tdm (all)"
               .replace(/\//gi, "") // "open 3/4 tdm (all)" --> "open 34 tdm (all)" == uses regex to remove forward slash
               .replace(/\(/gi, "") // "open 34 tdm (all)" --> "open 34 tdm all)" == uses regex to remove opening parenthesis
               .replace(/\)/gi, "") // "open 34 tdm all)" --> "open 34 tdm all" == uses regex to remove closing parenthesis
               .replace(/ /gi, ""); // "open 34 tdm all" --> "open34tdmall" == uses regex to remove spaces
  
  
  // STARTING_COLUMN points to the score column, but Gamemode Names are stored in the name column, 1 to the right of the score column
  const startingColZeroIndex = STARTING_COLUMN.charCodeAt(0) - 'A'.charCodeAt(0);
  const startingGamemodeNameColZeroIndex = startingColZeroIndex + 1;
  
  const gamemodesNamesRowZeroIndex = GAMEMODE_NAMES_ROW - 1;
  
  const numCols = values[gamemodesNamesRowZeroIndex].length;
  
  
  for (let col = startingGamemodeNameColZeroIndex; col < numCols; col += 3) { // yes, its += 3
    
    const gamemodeAtCol = values[gamemodesNamesRowZeroIndex][col] // start with "  Open 3/4 TDM (All)  "
                            .trim() // "  Open 3/4 TDM (All)  " --> "Open 3/4 TDM (All)"
                            .toLowerCase() // "Open 3/4 TDM (All)" --> "open 3/4 tdm (all)"
                            .replace(/\//gi, "") // "open 3/4 tdm (all)" --> "open 34 tdm (all)" == uses regex to remove forward slash
                            .replace(/\(/gi, "") // "open 34 tdm (all)" --> "open 34 tdm all)" == uses regex to remove opening parenthesis
                            .replace(/\)/gi, "") // "open 34 tdm all)" --> "open 34 tdm all" == uses regex to remove closing parenthesis
                            .replace(/ /gi, ""); // "open 34 tdm all" --> "open34tdmall" == uses regex to remove spaces 
  
    // skip empty gamemode columns
    if (gamemodeAtCol === "") {
      continue;  
    }
    
    
    // when you find a match, return the 1-indexed column number of the gamemode's score column (A=1, B=2, etc...)
    if (gamemode === gamemodeAtCol) {
      
      // this is written like this to make the intent clearer:
      // col+1 converts 0-index of array into 1-index of spreadsheet
      // col+1 points to the middle (name) column where gamemode names are stored,
      // so (col+1) - 1 gets the preceding column where the scores are stored
      return (col + 1) - 1; 
    }
  }
  
  
  return -1; // return -1 if gamemode was not found in wr sheet
}



// return true if theres errors in finding the tank/gamemode or if submission is a secondary record
function ERRORS_PRESENT_IN_SUBMISSION_DETAILS(recordRow, recordCol, submissionTank, submissionGamemode, submissionSpecialSubmission) {
  
  // if wr manager tries to use script to approve secondary record
  if (submissionSpecialSubmission === SPECIAL_SUBMISSION_SECONDARY_RECORD) {
    Browser.msgBox("ERROR", `Please approve Secondary Records Manually!`, Browser.Buttons.OK);
    return true;  
  }

  // tank wasn't found
  if (recordRow === -1) {
    Browser.msgBox("ERROR", `Could not find the tank named ${submissionTank.toString()}`, Browser.Buttons.OK);
    return true;
  }
  
  // gamemode wasn't found
  if (recordCol === -1) {
    Browser.msgBox("ERROR", `Could not find the gamemode named ${submissionGamemode.toString()}`, Browser.Buttons.OK);
    return true;
  }
  

  return false; // if no errors found, return false
}



/**
 * Converts a score like 123456 to 123.46k, and 1234567 to 1.23mil
 * also here's the spreadsheet's custom number format formula for comparison: 
 * [<999999]0.00,"k";[<999999999]0.00,,"mil"
 */
function FORMAT_SCORE(score) {
  score = Number(score);

  if (score >= 10**6) {
    return (score / 10**6).toFixed(2) + "mil";
  }
  else {
    return (score / 1000).toFixed(2) + "k";
  }
}



// add wr to sheet and call player_stats
function ADD_APPROVED_WR_TO_SHEET_AND_CALL_PLAYER_STATS(
  values, recordRow, recordCol, submissionScore, submissionPlayerName, submissionProofLink, isEventRecord=false, isIncogRecord=false) {
  
  //replace old record with new record
  const newRecordArray = [[submissionScore, submissionPlayerName, submissionProofLink]]; // needs to be a 2d array, hence the double [[]]
  
  let recordsSheetName = isEventRecord ? EVENT_WR_SHEET_NAME : isIncogRecord ? INCOG_WR_SHEET_NAME : WR_SHEET_NAME;
  let recordsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(recordsSheetName); 

  const recordRange = recordsSheet.getRange(recordRow, recordCol, 1, 3); // 1-indexed
  recordRange.setValues(newRecordArray);
  
  // update the values array with the newly approved submission, before calling Player_Tank_Stats() on it
  // values array is zero-indexed  
  values[recordRow - 1][recordCol - 1] = submissionScore;
  values[recordRow - 1][recordCol]     = submissionPlayerName;
  values[recordRow - 1][recordCol + 1] = submissionProofLink;
  
  // old method of updating the array passed to Player_Tank_Stats(), was slower since it required an extra server call
  //const newValues = recordsSheet.getDataRange().getValues(); // get the new records sheet data after new wr has been updated
  
  // update Player/Tank Stats by calling Player_Tank_Stats(),
  // since script-based editing doesnt naturally set off an onEdit trigger
  if (isEventRecord) {
    EVENT_PLAYER_TANK_STATS_DRIVER(values);
  } else if (isIncogRecord) {
    INCOG_PLAYER_TANK_STATS_DRIVER(values);
  } else {
    PLAYER_TANK_STATS_DRIVER(values);
  }
}



// makes printing the Browser.msgBox messages a litte nicer
function PRINT_SUBMISSION_DETAILS(submissionDetailsArray) {
  
  // destructure array into individual variables
  const [submissionScore, submissionPlayerName, submissionProofLink, submissionTank, submissionGamemode, submissionSpecialSubmission] = submissionDetailsArray;
  
  return `The following submission:\\n\\n${FORMAT_SCORE(submissionScore)} ${submissionTank}\\n${submissionGamemode}\\n${submissionPlayerName}\\n\\n`;
}
