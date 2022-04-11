
// appends the submission as a new row on bottom of the HAS staging sheet if score is >= minimum for HAS
// returns true if score was >= min and thus added successfully
// returns false otherwise when score < min and thus not added successfully
function ADD_HAS_SUBMISSION_TO_HAS(submissionDetailsArray, isLegacySubmission, isEventSubmission=false) {
  
  const submissionScore = submissionDetailsArray[0];
  
  if (submissionScore >= MINIMUM_SCORE_FOR_HIGHEST_ARRAS_SCORES) {
  
    // get everything in submissionDetailsArray except the last thing
    // (specialSubmission, like HAS or Secondary Record)
    const newHASArray = submissionDetailsArray.slice(0, -1);
    
    // add the legacy indication char at the end of the new array
    // and make the gamemode just say "Event"
    if (isLegacySubmission) {
      newHASArray.push(LEGACY_HAS_INDICATION_CHARACTER);
      
      // change event submission gamemode name to shorter version for sheet
      if (newHASArray[4] === EVENT_GAMEMODE_NAME_ON_SUBMISSION_FORM) {
        newHASArray[4] = EVENT_GAMEMODE_NAME_ON_SHEET;
      }
    }

    else if (isEventSubmission) {
      newHASArray.push(EAS_INDICATION_CHARACTER);
      // change event submission gamemode name to shorter version for sheet
      if (newHASArray[4] === EVENT_GAMEMODE_NAME_ON_SUBMISSION_FORM) {
        newHASArray[4] = EVENT_GAMEMODE_NAME_ON_SHEET;
      }
    }
    
    const hasStagingSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HAS_STAGING_SHEET_NAME);
    hasStagingSheet.appendRow(newHASArray);
    
    return true;
  }
  
  return false;
}



// for when player submits a high score done in an Event gamemode (D-Day, Assault, etc...)
// these scores are not valid wr's and cannot go on the normal HAS
// however they can be added to the Legacy HAS, which this function takes care of:
// also if people submit older screenshots after a tank has been nerfed and moved to Legacy HAS
// in which case the 'leg' launch sequence would be used
function ADD_SCORE_TO_LEGACY_HAS(submissionDetailsArray, editedCell) {

  // destructure array into individual variables
  const [submissionScore, submissionPlayerName, submissionProofLink, submissionTank, submissionGamemode, submissionSpecialSubmission] = submissionDetailsArray;
  
  // add to HAS the normal way, but 2nd argument tells the ADD_TO_HAS function that its a legacy one
  // and to append an extra character in last column that tells spreadsheet to sort the score into the Legacy Sheet
  // if this function returns true, that means that everything went well and score was added
  if (ADD_HAS_SUBMISSION_TO_HAS(submissionDetailsArray, true)) {
    Browser.msgBox("LEGACY HAS SUBMISSION APPROVED", `${PRINT_SUBMISSION_DETAILS(submissionDetailsArray)} has been added to Legacy Highest Arras Scores`, Browser.Buttons.OK);
    editedCell.setValue(APPROVED_STATUS_CHARACTER);
    editedCell.setNote("Approved For Legacy HAS Only");
  }
  // else means that the function returned false, and that the score was not high enough for Legacy HAS
  else {
    Browser.msgBox("LEGACY HAS SUBMISSION REJECTED", `${PRINT_SUBMISSION_DETAILS(submissionDetailsArray)} is lower than the minimum score needed for Legacy Highest Arras Scores, currently ${FORMAT_SCORE(MINIMUM_SCORE_FOR_HIGHEST_ARRAS_SCORES)}`, Browser.Buttons.OK);
    editedCell.setValue(REJECTED_STATUS_CHARACTER);
  }
}

function ADD_SCORE_TO_EAS(submissionDetailsArray, editedCell, isOnlyEasSubmission=true) {

  // destructure array into individual variables
  const [submissionScore, submissionPlayerName, submissionProofLink, submissionTank, submissionGamemode, submissionSpecialSubmission] = submissionDetailsArray;
  
  // add to HAS the normal way, but 2nd argument tells the ADD_TO_HAS function that its NOT a legacy one
  //    and 3rd argument says that it IS an event arras scores submission
  // and to append an extra character in last column that tells spreadsheet to sort the score into the Legacy Sheet
  // if this function returns true, that means that everything went well and score was added
  if (ADD_HAS_SUBMISSION_TO_HAS(submissionDetailsArray, false, true) && isOnlyEasSubmission) {
    Browser.msgBox("EVENT HAS SUBMISSION APPROVED", `${PRINT_SUBMISSION_DETAILS(submissionDetailsArray)} has been added to Event Highest Arras Scores`, Browser.Buttons.OK);
    editedCell.setValue(APPROVED_STATUS_CHARACTER);
    editedCell.setNote("Approved For EAS Only");
  }
  // else means that the function returned false, and that the score was not high enough for Event HAS
  else if (isOnlyEasSubmission) {
    Browser.msgBox("EVENT HAS SUBMISSION REJECTED", `${PRINT_SUBMISSION_DETAILS(submissionDetailsArray)} is lower than the minimum score needed for Event Arras Scores, currently ${FORMAT_SCORE(MINIMUM_SCORE_FOR_EVENT_ARRAS_SCORES)}`, Browser.Buttons.OK);
    editedCell.setValue(REJECTED_STATUS_CHARACTER);
  }
}

// when the 'h' launch character is used instead of 'k'
// this indicates that a submission should be added to HAS but not approved as a WR
// for instance, if someone submits a score higher than current wr, but doesn't have enough proof
// then you can add to HAS only, and avoid having to delete and restore a record on the wr sheet
function ONLY_APPROVE_FOR_HAS(submissionDetailsArray, editedCell) {
  
  if (ADD_HAS_SUBMISSION_TO_HAS(submissionDetailsArray, false)) {
    Browser.msgBox("HAS ONLY SUBMISSION APPROVED", `${PRINT_SUBMISSION_DETAILS(submissionDetailsArray)} has been added to Highest Arras Scores`, Browser.Buttons.OK);
    editedCell.setValue(APPROVED_STATUS_CHARACTER);
    editedCell.setNote("Approved For HAS Only");
  }
  // else means that the function returned false, and that the score was not high enough for HAS
  else {
    Browser.msgBox("HAS ONLY SUBMISSION REJECTED", `${PRINT_SUBMISSION_DETAILS(submissionDetailsArray)} is lower than the minimum score needed for Highest Arras Scores, currently ${FORMAT_SCORE(MINIMUM_SCORE_FOR_HIGHEST_ARRAS_SCORES)}`, Browser.Buttons.OK);
    editedCell.setValue(REJECTED_STATUS_CHARACTER);
  }
}
