// Run this driver function whenever you feel like theres too many already dealt-with
// submissions clogging up the Submissions sheet
// update: I added a button to the Submissions sheet that runs this function when clicked
function MOVE_TO_OLDER_SUBMISSIONS_DRIVER()
{
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SUBMISSIONS_SHEET_NAME);

  const moveOverArray = GET_ROWS_TO_MOVE(sheet);
  const notesArray = GET_NOTES_TO_MOVE(sheet, moveOverArray.length);
  
  PASTE_ROWS_INTO_OLDER_SUBMISSIONS(moveOverArray, notesArray);
  
  sheet.deleteRows(SUBMISSIONS_START_ROW, moveOverArray.length); // 1-indexed
  
  Browser.msgBox("SUCCESS", `${moveOverArray.length} submissions were moved to the Older Submissions Spreadsheet`, Browser.Buttons.OK);
}



function GET_ROWS_TO_MOVE(submissionsSheet) 
{
  const submissionsArray = submissionsSheet.getDataRange().getValues();
  const startRowZeroIndex = SUBMISSIONS_START_ROW - 1; // subtract 1 since sheet is 1-indexed, but array is 0-indexed
  
  let i; // Please don't replace this with a var. It won't break the code or anything, I just think var is bad practice.
  
  // loop only goes to len - 1 because I want to leave at least one row on the sheet
  // in case they're all 'v' or 'x', so that the google form doesn't get confused and screw up
  for (i = startRowZeroIndex; i < submissionsArray.length - 1; ++i)
  {
    // breaks if you've reached the end of actual submission rows, in case theres messages left
    // by wr managers below the actual submission rows
    // also decrements i to ensure that the last row removed is the one before the current iteration 
    // (so that at least 1 valid submission row remains on the main sheet)
    if (END_OF_ACTUAL_SUBMISSIONS_REACHED(submissionsArray[i]))
    {
      i--;
      break;
    }
    
    const submissionStatus = submissionsArray[i][1];
    
    // 'v' and 'x' submissions have been taken care of and can be moved over
    // everything else is not taken care of, so only move stuff above them
    let moveableSubmissionStatusDetected = [
      APPROVED_STATUS_CHARACTER, 
      REJECTED_STATUS_CHARACTER
    ].includes(submissionStatus.toLowerCase());
    
    if (!moveableSubmissionStatusDetected)
    {
      break;
    }
  }

  // gets array from start row to just before first non-movable row
  const moveOverArray = submissionsArray.slice(startRowZeroIndex, i);
  
  return moveOverArray;
}


function GET_NOTES_TO_MOVE(submissionsSheet, numRows) 
{
  submissionStatusColumnOneIndex = SUBMISSION_STATUS_COLUMN.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
  
  // getRange is 1-indexed
  const notesRange = submissionsSheet.getRange(SUBMISSIONS_START_ROW, submissionStatusColumnOneIndex, numRows, 1);
  
  return notesRange.getNotes();
}


function PASTE_ROWS_INTO_OLDER_SUBMISSIONS(moveOverArray, notesArray) 
{
  const olderSubmissionsSheet = SpreadsheetApp.openById(OLDER_SUBMISSIONS_SHEET_ID).getSheetByName(OLDER_SUBMISSIONS_SHEET_NAME);
  
  // set values
  const startRow = olderSubmissionsSheet.getLastRow() + 1; // get the row after last previously data-filled row
  const numRows = moveOverArray.length;
  const numCols = moveOverArray[0].length;
  const rangeToPasteInto = olderSubmissionsSheet.getRange(startRow, 1, numRows, numCols); // 1-indexed
  rangeToPasteInto.setValues(moveOverArray); 
  
  // set notes
  const submissionStatusColumnOneIndex = SUBMISSION_STATUS_COLUMN.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
  const notesRangeToPasteInto = olderSubmissionsSheet.getRange(startRow, submissionStatusColumnOneIndex, notesArray.length, 1); // 1-indexed
  notesRangeToPasteInto.setNotes(notesArray);
}


// sometimes certain wr managers will leave random messages on the sheet below the end of the actual submissions for various reasons
// this will cause google sheets to think that the actual end of the sheet is the messages left by the wr managers under the submissions
// and in turn every single row of submissions will be moved to older submissions, without leaving a single row behind to help orient
// the placement of new form submissions (the form submissions will go a row below where they should be and leave a gap or even overwrite old rows)
// this function helps prevent that by breaking the loop once the actual submission rows end
// it does this by checking to make sure that the 7 mandatory form fields (timestamp to gamemode) are all filled
function END_OF_ACTUAL_SUBMISSIONS_REACHED(submissionRow)
{
  const row = submissionRow.slice(0,7); // get all the column values required to be filled out on the form
  
  for (const cell of row)
  {
    if (cell !== 0 && !cell) return true; // return true if any of the first few required cells are empty and not 0
  }
  
  return false;
}
