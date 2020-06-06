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
  
  
// Move To Older Submissions Constants:
  const SUBMISSIONS_START_ROW = 3; // rows above this on submissions sheet are to be ignored as they are mere example rows
                                   // rows >= to this row are actual submissions, and can be moved to older submissions sheet

  const OLDER_SUBMISSIONS_SHEET_ID = "1iYS59nu9EOwu2fct0SaOxVV8ZwQBXld94AVvFdUggfo";
  const OLDER_SUBMISSIONS_SHEET_NAME = "OlderSubmissions"; // the sheet tab where the older submissions are stored

// WR_APPROVAL CONSTANTS -- END ---------------------------------------------------------------------

// ADD_TO_HAS CONSTANTS -- BEGIN: ---------------------------------------------------------------------


  
  const HAS_STAGING_SHEET_NAME = "HAS_Calculations";

  const SPECIAL_SUBMISSION_HIGHEST_ARRAS_SCORES = "Highest Arras Scores"; // name of the special submission item on form that is used to indicate a submission to HAS

  const MINIMUM_SCORE_FOR_HIGHEST_ARRAS_SCORES = 2000000; // 2 mil at the moment

  const HAS_ONLY_LAUNCH_CHARACTER = 'h'; // for when you want to approve an HAS submission but not a WR submission, like maybe theres not enough screenshots to approve a wr


// ADD_TO_HAS CONSTANTS -- END ---------------------------------------------------------------------


// ADD_TO_LEGACY_HAS CONSTANTS -- BEGIN -------------------------------------------------

  const LEGACY_LAUNCH_CHARACTER = "leg"; // I'm making it 3 chars instead of 1, because its rare to approve something for legacy, 
                                         // and because 'l' is right next to 'k' on keyboard so I don't want accidental finger slips

  const EVENT_GAMEMODE_NAME_ON_SUBMISSION_FORM = "Event (for Legacy HAS only)"; // event gamemodes automatically go to legacy and nowhere else

  const LEGACY_HAS_INDICATION_CHARACTER = 'k'; // in HAS calculations, this indicates that a score belongs on the legacy has

// ADD_TO_LEGACY_HAS CONSTANTS -- END -------------------------------------------------




// GET_DATA_FOR_WEBSITE CONSTANTS -- BEGIN: ---------------------------------------------------------------------
  

  const SHEETS_TO_GET_DATA_FROM = ["WR Rules", "Records", "Highest Arras Scores", "Player/Tank Stats", "Secondary Records"];
  
  // printing to WR Rules is only temporary
  // this can't stay because printing to wr rules
  // means the printed data becomes part of wr rules itself, and will exceed the cell char limit
  const RANGE_TO_PRINT_DATA_TO = "'WR Rules'!E5:H9"; // the range from where the website will retireve a json feed of cell data  
                                                     // make sure its 4 cols wide, and (SHEETS_TO_GET_DATA_FROM.length) rows tall

  const MAX_CHARS_PER_CELL = 50000; // this is the max number of characters that a cell in Google Sheets can hold


// GET_DATA_FOR_WEBSITE CONSTANTS -- END: ---------------------------------------------------------------------
