// PLAYER_TANK_STATS CONSTANTS -- BEGIN: ---------------------------------------------------------------------



  const WR_SHEET_NAME = "Records" // Name of the sheet with all the records
  
  // STARTING_ROW and STARTING_COLUMN are NOT Zero-Indexed
  // Enter the actual row and col you see on the spreadsheet
  
  const STARTING_COLUMN = 'C'; // the column of basic tank FFA's score (or whatever the leftmost score column is)
                            // MAKE SURE TO SURROUND THE LETTER WITH '', like 'C'
  
  const STARTING_ROW = 16; // the row number of basic tank
   
  const MIN_RECORDS_TO_CALCULATE_RATIO = 5; // players with less than this many wr's will not have their ratio calculated

  /* TANK_NAMES_COLUMN and GAMEMODE_NAMES_ROW is a bit farther down */


  const PLAYER_SHEET_TO_DISPLAY_RESULTS_ON = "New_Calculations"; // sheet on which the results of PLAYER_STATS() are printed

  // cell where the results will begin being printed in
  // this value is the top left, so the results will be printed to the right and below it
  // make sure nothing is immediately to the right or bottom of this cell or it will be overwritten
  const PLAYER_COLUMN_OF_TOP_LEFT_CELL = 'F';
  const PLAYER_ROW_OF_TOP_LEFT_CELL = 3;



  const TANK_SHEET_TO_DISPLAY_RESULTS_ON = "New_Calculations"; // sheet on which the results of TANK_STATS() are printed

  // cell where the results will begin being printed in
  // this value is the top left, so the results will be printed to the right and below it
  // make sure nothing is immediately to the right or bottom of this cell or it will be overwritten
  const TANK_COLUMN_OF_TOP_LEFT_CELL = 'M';
  const TANK_ROW_OF_TOP_LEFT_CELL = 3;



// PLAYER_TANK_STATS CONSTANTS -- END ---------------------------------------------------------------------


  const TANK_NAMES_COLUMN = 'B'; // column that the tanknames are in -- this is here because it is used in both PLAYER_TANK_STATS and WR_APPROVAL
  
  // technically theres multiple, but I'm using row 1 because I know for sure
  // that all the gamemode names are found in the center of the three columns for each gamemode
  const GAMEMODE_NAMES_ROW = 1; // row that the gamemode names are in


// WR_APPROVAL CONSTANTS -- BEGIN: ---------------------------------------------------------------------



  // name of the wr sheet tab where the submission form results appear and where the records approval process happens
  const SUBMISSIONS_SHEET_NAME = "Submissions";

  // column in which you type the SCRIPT_LAUNCH_CHARACTER, v, or x to indicate the status of the submission
  const SUBMISSION_STATUS_COLUMN = 'B';

  // the letter to type in the submission status column to call this script
  // the letter the wr managers type to approve a submission with this new automated method
  // OFF LIMITS (DO NOT SET SCRIPT_LAUNCH_CHARACTER TO ONE OF THESE): v, x, ~, ?
  const SCRIPT_LAUNCH_CHARACTER = 'k';  

  /* TANK_NAMES_COLUMN and GAMEMODE_NAMES_ROW is a bit farther up */

  const APPROVED_STATUS_CHARACTER = 'v';
  const NEUTRAL_STATUS_CHARACTER = '~'; // indicates that a record still needs to be looked at and approved/rejected
  const REJECTED_STATUS_CHARACTER = 'x';
  
  const SPECIAL_SUBMISSION_SECONDARY_RECORD = "Secondary Record"; // name of the special submission item on form that is used to indicate a submission to Secondary Records
  

// WR_APPROVAL CONSTANTS -- END ---------------------------------------------------------------------

// ADD_TO_HAS CONSTANTS -- BEGIN: ---------------------------------------------------------------------


  
  const HAS_STAGING_SHEET_NAME = "HAS_Calculations";

  const SPECIAL_SUBMISSION_HIGHEST_ARRAS_SCORES = "Highest Arras Scores"; // name of the special submission item on form that is used to indicate a submission to HAS

  const MINIMUM_SCORE_FOR_HIGHEST_ARRAS_SCORES = 2000000; // 2 mil at the moment



// ADD_TO_HAS CONSTANTS -- END ---------------------------------------------------------------------
