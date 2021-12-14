/**
 * Get the highest record within a certain range. The range must contain exactly 3 columns (score/playerName/proofLink) and must start at the same row as basic tank. For example, the range for FFA is C17:E.
 * @customfunction
 */
function GET_HIGHEST_RECORD_IN_RANGE(range) {  
  /* OLD WAY (using spreadsheet formulas):
    These are the 3 formulas used for FFA:
    =MAX(C17:C)
    =Concatenate(VLOOKUP(C14, C17:E, 2, FALSE), " (" ,INDEX(B17:B,MATCH(C14,C17:C,0)), ")")
    =VLOOKUP(C14, C17:E, 3, FALSE)
  */

  // basic guarding to make sure the range passed in is in the right format
  // make sure the range is a 2d array where each subarray is 3 columns wide
  if (range[0].length !== 3) {
    return [["ERROR: The range passed in must be 3 columns wide (score/playerName/proofLink)!"]];
  }

  const recordsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(WR_SHEET_NAME);
  // tankNamesRange is something like B17:B
  const tankNamesRange = recordsSheet.getRange(TANK_NAMES_COLUMN + STARTING_ROW + ":" + TANK_NAMES_COLUMN);
  // convert 2d array to 1d array
  const tankNames = tankNamesRange.getValues().map(x => x[0]);

  let highestRecordArr = range[0];

  for (let i = 0; i < range.length; i++) {
    let recordArr = range[i];

    // compare scores
    if (Number(recordArr[0]) > Number(highestRecordArr[0])) {
      // if new score is higher than current max, set the highest record to the new record
      highestRecordArr = recordArr;

      // change the playerName of highest to include the tankName in parentheses
      highestRecordArr[1] += " (" + tankNames[i] + ")";
    }
  }

  // need to return a 2d array
  return [highestRecordArr];
}
