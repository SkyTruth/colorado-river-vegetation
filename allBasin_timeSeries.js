/* 
Google Earth Engine module for making a 35-year time-series for subwatersheds in the Colorado River basin using Landsat annual composites and surface 
reflectance-derived spectral indices.

Copyright: SkyTruth
License: Apache 2.0
Contact: Christian Thomas (christian@skytruth.org)
Date Updated: 2021-08-24
*/

// IMPORTS
var utils = require('PATH/TO/REPOSITORY:PATH/TO/utils.js');

//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\

var watersheds = [
  {'ws_name': 'agua_fria', 'HUC6':'150701', 'HUC12':['150701000000','150702000000'], 'region':'lowerColorado', 'export_description':'aguaFria_export_', 'file_name_prefix':'aguaFria_subwatersheds_'},
  {'ws_name': 'bavispe', 'HUC6':'150803', 'HUC12':['150803000000','150804000000'], 'region':'lowerColorado', 'export_description':'bavispe_export_', 'file_name_prefix':'bavispe_subwatersheds_'},
  {'ws_name': 'bill_williams', 'HUC6':'150302', 'HUC12':['150302000000','150303000000'], 'region':'lowerColorado', 'export_description':'billWilliams_export_', 'file_name_prefix':'billWilliams_subwatersheds_'},
  {'ws_name': 'colorado_headwaters', 'HUC6':'140100', 'HUC12':['140100000000','140200000000'], 'region':'upperColorado', 'export_description':'coloradoHeadwaters_export_', 'file_name_prefix':'coloradoHeadwaters_subwatersheds_'},
  {'ws_name': 'dirty_devil', 'HUC6':'140700', 'HUC12':['140700000000','140800000000'], 'region':'upperColorado', 'export_description':'dirtyDevil_export_', 'file_name_prefix':'dirtyDevil_subwatersheds_'},
  {'ws_name': 'great_divide', 'HUC6':'140402', 'HUC12':['140402000000','140403000000'], 'region':'upperColorado', 'export_description':'greatDivide_export_', 'file_name_prefix':'greatDivide_subwatersheds_'},
  {'ws_name': 'gunnison', 'HUC6':'140200', 'HUC12':['140200000000','140300000000'], 'region':'upperColorado', 'export_description':'gunnison_export_', 'file_name_prefix':'gunnison_subwatersheds_'},
  {'ws_name': 'la_conception', 'HUC6':'150802', 'HUC12':['150802000000','150803000000'], 'region':'lowerColorado', 'export_description':'laConception_export_', 'file_name_prefix':'laConception_subwatersheds_'},
  {'ws_name': 'lake_mead', 'HUC6':'150100', 'HUC12':['150100000000','150200000000'], 'region':'lowerColorado', 'export_description':'lakeMead_export_', 'file_name_prefix':'lakeMead_subwatersheds_'},
  {'ws_name': 'little_colorado', 'HUC6':'150200', 'HUC12':['150200000000','150300000000'], 'region':'lowerColorado', 'export_description':'littleColorado_export_', 'file_name_prefix':'littleColorado_subwatersheds_'},
  {'ws_name': 'lower_colorado', 'HUC6':'150301', 'HUC12':['150301000000','150302000000'], 'region':'lowerColorado', 'export_description':'lowerColorado_export_', 'file_name_prefix':'lowerColorado_subwatersheds_'},
  {'ws_name': 'lower_gila', 'HUC6':'150702', 'HUC12':['150702000000','150703000000'], 'region':'lowerColorado', 'export_description':'lowerGila_export_', 'file_name_prefix':'lowerGila_subwatersheds_'},
  {'ws_name': 'lower_green', 'HUC6':'140600', 'HUC12':['140600000000','140700000000'], 'region':'upperColorado', 'export_description':'lowerGreen_export_', 'file_name_prefix':'lowerGreen_subwatersheds_'},
  {'ws_name': 'lower_san_juan', 'HUC6':'140802', 'HUC12':['140802000000','140803000000'], 'region':'upperColorado', 'export_description':'lowerSanJuan_export_', 'file_name_prefix':'lowerSanJuan_subwatersheds_'},
  {'ws_name': 'middle_gila', 'HUC6':'150501', 'HUC12':['150501000000','150502000000'], 'region':'lowerColorado', 'export_description':'middleGila_export_', 'file_name_prefix':'middleGila_subwatersheds_'},
  {'ws_name': 'salt', 'HUC6':'150601', 'HUC12':['150601000000','150602000000'], 'region':'lowerColorado', 'export_description':'salt_export_', 'file_name_prefix':'salt_subwatersheds_'},
  {'ws_name': 'san_pedro', 'HUC6':'150502', 'HUC12':['150502000000','150503000000'], 'region':'lowerColorado', 'export_description':'sanPedro_export_', 'file_name_prefix':'sanPedro_subwatersheds_'},
  {'ws_name': 'santa_cruz', 'HUC6':'150503', 'HUC12':['150503000000','150504000000'], 'region':'lowerColorado', 'export_description':'santaCruz_export_', 'file_name_prefix':'santaCruz_subwatersheds_'},
  {'ws_name': 'sonoyta', 'HUC6':'150801', 'HUC12':['150801000000','150802000000'], 'region':'lowerColorado', 'export_description':'sonoyta_export_', 'file_name_prefix':'sonoyta_subwatersheds_'},
  {'ws_name': 'upper_colorado_dolores', 'HUC6':'140300', 'HUC12':['140300000000','140400000000'], 'region':'upperColorado', 'export_description':'upperColoradoDolores_export_', 'file_name_prefix':'upperColoradoDolores_subwatersheds_'},
  {'ws_name': 'upper_gila', 'HUC6':'150400', 'HUC12':['150400000000','150401000000'], 'region':'lowerColorado', 'export_description':'upperGila_export_', 'file_name_prefix':'upperGila_subwatersheds_'},
  {'ws_name': 'upper_green', 'HUC6':'140401', 'HUC12':['140401000000','140402000000'], 'region':'upperColorado', 'export_description':'upperGreen_export_', 'file_name_prefix':'upperGreen_subwatersheds_'},
  {'ws_name': 'upper_san_juan', 'HUC6':'140801', 'HUC12':['140801000000','140802000000'], 'region':'upperColorado', 'export_description':'upperSanJuan_export_', 'file_name_prefix':'upperSanJuan_subwatersheds_'},
  {'ws_name': 'verde', 'HUC6':'150602', 'HUC12':['150602000000','150603000000'], 'region':'lowerColorado', 'export_description':'verde_export_', 'file_name_prefix':'verde_subwatersheds_'},
  {'ws_name': 'white_yampa', 'HUC6':'140500', 'HUC12':['140500000000','140600000000'], 'region':'upperColorado', 'export_description':'whiteYampa_export_', 'file_name_prefix':'whiteYampa_subwatersheds_'},
];

var watershed_name_list = ['agua_fria', 'bavispe', 'bill_williams', 'colorado_headwaters', 'dirty_devil', 'great_divide', 'gunnison', 'la_conception', 'lake_mead', 'little_colorado', 'lower_colorado', 'lower_gila', 'lower_green', 
                           'lower_san_juan', 'middle_gila', 'salt', 'san_pedro', 'santa_cruz', 'sonoyta', 'upper_colorado_dolores', 'upper_gila', 'upper_green', 'upper_san_juan', 'verde', 'white_yampa'];

var watershed_list_length = watershed_name_list.length;


// Print the index and name for each watershed, if desired. Valid index for single region exports are 0-24.
for (var i = 0; i <watershed_list_length; i++) {
  // print('INDEX: '+ i+ ', WS Name: ' + watershed_name_list[i]);
}

//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
// // RUN ANNUAL EXPORTS FOR SINGLE, SPECIFIED WATERSHEDS. THIS MUST BE RUN FOR EACH WATERSHED INDIVIDUALLY  \\  \\
//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\

// SPECIFY THE WATERSHED BY LIST INDEX, RANGE 0 - 24 (SEE OUTPUT FROM LINE 34 FOR MORE DETAILS).
var watershed_index = 0;
var watershed = watersheds[watershed_index];

// Retrieve the Name, HUC6, HUC12, Export Description, and File Name Prefix for the watershed
var watershed_name = watershed.ws_name;
var ws_huc6 = watershed.HUC6;
var ws_huc12 = watershed.HUC12;
var ws_expName = watershed.export_description;
var ws_filePrefix = watershed.file_name_prefix;

var huc_06 = ee.FeatureCollection("USGS/WBD/2017/HUC06").filter(ee.Filter.eq('huc6', ws_huc6));
var huc_12 = ee.FeatureCollection("USGS/WBD/2017/HUC12").filter(ee.Filter.and(ee.Filter.gte('huc12', ws_huc12[0]),ee.Filter.lt('huc12', ws_huc12[1])));

// Visualize the HUC6 and HUC12s
Map.addLayer(huc_06,{color:'#FF0000'},watershed_name+'- HUC 6');
Map.addLayer(huc_12,{color:'#FF7F00'},watershed_name+'- HUC 12');

// Test Run Loop (dry run). This will print the Export Descriptions and File Name Prefixes for the specified watershed, it will not start any of the export tasks.
print('\n\n\n DRY RUN. Uncomment lines 90-106 to run data exports.\n\n\n');
for (var i = 1985; i <= 2020; i++) {
  var yearString = i.toString();
  var testDesc = ws_expName + yearString;
  var testPref = ws_filePrefix + yearString;
  print('Export Description: '+ testDesc + '\nFile Name Prefix:   ' + testPref);
}

// UNCOMMENT BELOW TO RUN THE EXPORTS.
/*
// // Export the annual data for the specified watershed. This exports the data referenced in the dry run loop above
for (var i = 1985; i <= 2020; i++) {
  var image = utils.makeAnnual(huc_06, i);
  var data = utils.makeStats(image, huc_12);
  var yearString = i.toString();
  
  // Export table. This prepares a separate export for each year. 
  Export.table.toCloudStorage({
    collection: data, 
    description: ws_expName + yearString,
    bucket: 'YOUR-GOOGLE-CLOUD-STORAGE-BUCKET',
    fileNamePrefix: ws_filePrefix + yearString,
    fileFormat: 'CSV',
  });
}
*/

// fin CT 2021/08/24
