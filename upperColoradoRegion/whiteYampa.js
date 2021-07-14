/* 

  Google Earth Engine module for making a 35-year time-series for 
  the subwatersheds in the White-Yampa basin using Landsat annual 
  composites and surface reflectance-derived spectral indices.
     
  Copyright: SkyTruth
  License: Apache 2.0
  Contact: Ry Covington (ry@skytruth.org)
  Date Updated: 07-13-2021

*/

// Imports.
var utils = require('PATH/TO/REPOSITORY:PATH/TO/utils.js');

// The White-Yampa basin.
var whiteYampa = ee.FeatureCollection("USGS/WBD/2017/HUC06").filter(ee.Filter.eq('huc6', '140500'));

// The 369 subwatersheds within the White-Yampa basin.
var subwatersheds = ee.FeatureCollection("USGS/WBD/2017/HUC12")
  .filter(ee.Filter.and(
    ee.Filter.gte('huc12','140500000000'),
    ee.Filter.lt('huc12','140600000000')
  )
);

// Loop through years.
for (var i = 2020; i >= 1985; i--){
  var image = utils.makeAnnual(whiteYampa, i);
  var data = utils.makeStats(image, subwatersheds);
  var iStr = i.toString();
  
  // Export table. 
  Export.table.toCloudStorage({
    collection: data, 
    description: 'whiteYampa_export_' + iStr,
    bucket: 'YOUR-GOOGLE-CLOUD-STORAGE-BUCKET',
    fileNamePrefix: 'whiteYampa_subwatersheds_' + iStr,
    fileFormat: 'CSV',
  });
}