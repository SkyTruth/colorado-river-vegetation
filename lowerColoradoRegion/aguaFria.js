/* 

  Google Earth Engine module for making a 35-year time-series for 
  the subwatersheds in the Agua Fria basin using Landsat annual 
  composites and surface reflectance-derived spectral indices.
     
  Copyright: SkyTruth
  License: Apache 2.0
  Contact: Ry Covington (ry@skytruth.org)
  Date Updated: 07-13-2021

*/

// Imports.
var utils = require('PATH/TO/REPOSITORY:PATH/TO/utils.js');

// The Lower Gila-Agua Fria basin.
var aguaFria = ee.FeatureCollection("USGS/WBD/2017/HUC06").filter(ee.Filter.eq('huc6', '150701'));

// The 222 subwatersheds within the Lower Gila-Agua Fria basin.
var subwatersheds = ee.FeatureCollection("USGS/WBD/2017/HUC12")
  .filter(ee.Filter.and(
    ee.Filter.gte('huc12','150701000000'),
    ee.Filter.lt('huc12','150702000000')
  )
);

// Loop through years.
for (var i = 2020; i >= 1985; i--){
  var image = utils.makeAnnual(aguaFria, i);
  var data = utils.makeStats(image, subwatersheds);
  var iStr = i.toString();
  
  // Export table. This prepares a separate export for each year. 
  Export.table.toCloudStorage({
    collection: data, 
    description: 'aguaFria_export_' + iStr,
    bucket: 'YOUR-GOOGLE-CLOUD-STORAGE-BUCKET',
    fileNamePrefix: 'aguaFria_subwatersheds_' + iStr,
    fileFormat: 'CSV',
  });
}