function loadCsvInNewSheet(fileUrl, sheetName) {
  // Fetch content and assume it is a CSV
  var response = UrlFetchApp.fetch(fileUrl);
  var csvData = Utilities.parseCsv(response);
  
  // Create new sheet for Vision Cluster data
  var activeSs = SpreadsheetApp.getActiveSpreadsheet();
  var newSheet = activeSs.insertSheet(0).setName(sheetName);

  // Have to add one row at a time, as far as I can tell
  for (i = 0; i < csvData.length; i++) {
    newSheet.appendRow(csvData[i]);
  }
}

function loadCveCsv() {
  var cveCsvId = '0B69xlFeuS9FJQnNhcmJXQThVT1E';

  // DIRECT DOWNLOAD link to file
  var cveCsvUrl = 'https://drive.google.com/uc?export=download&id='.concat(cveCsvId);
  
  var timestamp = Utilities.formatDate(new Date(), "JST", "yyy-MM-dd_HH:mm:ss");
  var sheetName = 'Vision Clusters '.concat(timestamp);
  
  loadCsvInNewSheet(cveCsvUrl, sheetName);
}


/* General chart construction. There are a few helper functions for each type */
function buildChart(chart, rangeA1, title, anchorX, anchorY,
                    offsetX, offsetY, doTranspose) {
  var activeSheet = SpreadsheetApp.getActiveSheet();
  
  anchorX = anchorX || 1; anchorY = anchorY || 1;
  offsetX = offsetX || 1; offsetY = offsetY || 1;
  
  chart.addRange(activeSheet.getRange(rangeA1))
       .setTitle(title)
       .setPosition(anchorX, anchorY, offsetX, offsetY)
       .reverseCategories();

  activeSheet.insertChart(chart.build());
}


/* Pie chart helper function */
function buildPieChart(rangeA1, title, anchorX, anchorY, offsetX, offsetY) {
  buildChart(SpreadsheetApp.getActiveSheet().newChart().asPieChart(),
             rangeA1, title, anchorX, anchorY, offsetX, offsetY);
}

/* Bar chart helper function */
function buildBarChart(rangeA1, title, anchorX, anchorY, offsetX, offsetY) {
  buildChart(SpreadsheetApp.getActiveSheet().newChart().asBarChart(),
             rangeA1, title, anchorX, anchorY, offsetX, offsetY);
}

/* Stacked Bar chart helper function */
function buildStackedBarChart(rangeA1, title, anchorX, anchorY, offsetX, offsetY) {
  buildChart(SpreadsheetApp.getActiveSheet().newChart().asBarChart().setStacked(),
             rangeA1, title, anchorX, anchorY, offsetX, offsetY);
}


function generateSampleCharts() {
  buildPieChart('AE3:AF12', 'Most Common Labels for "Clothing" Cluster', 10, 1);
  buildPieChart('AO3:AP12', 'Most Common Labels for "Vehicle" Cluster', 10, 6);
}

                    
function onOpen() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var objMenuEntries = [{name: '1. Load Most Recent Cluster Data', functionName: 'loadCveCsv'},
                        //{name: 'Load Cluster Analysis', functionName: 'showCveSheet'},
                        {name: '2. Generate Sample Charts', functionName: 'generateSampleCharts'}
                        ];
  ss.addMenu('Cloud Vision Explorer',  objMenuEntries);
}
                    
