/* 

  Google Earth Engine module for making a 35-year time-series for 
  the subwatersheds in the Upper Colorado-Dolores basin using Landsat annual 
  composites and surface reflectance-derived spectral indices.
     
  Copyright: SkyTruth
  License: Apache 2.0
  Contact: Ry Covington (ry@skytruth.org)
  Date Updated: 07-13-2021

*/

// Imports.
var utils = require('PATH/TO/REPOSITORY:PATH/TO/utils.js');

// The Upper Colorado-Dolores basin.
var upperColoradoDolores = ee.FeatureCollection("USGS/WBD/2017/HUC06").filter(ee.Filter.eq('huc6', '140300'));

// The 254 subwatersheds within the Upper Colorado-Dolores basin.
var subwatersheds = ee.FeatureCollection("USGS/WBD/2017/HUC12")
  .filter(ee.Filter.and(
    ee.Filter.gte('huc12','140300000000'),
    ee.Filter.lt('huc12','140400000000')
  )
);

// Loop through years.
for (var i = 2020; i >= 1985; i--){
  var image = utils.makeAnnual(upperColoradoDolores, i);
  var data = utils.makeStats(image, subwatersheds);
  var iStr = i.toString();
  
  // Export table. This prepares a separate export for each year.
  Export.table.toCloudStorage({
    collection: data, 
    description: 'upperColoradoDolores_export_' + iStr,
    bucket: 'YOUR-GOOGLE-CLOUD-STORAGE-BUCKET',
    fileNamePrefix: 'upperColoradoDolores_subwatersheds_' + iStr,
    fileFormat: 'CSV',
  });
}