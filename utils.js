/* 

    Google Earth Engine module for working with Landsat annual 
    composites and surface reflectance-derived spectral indices.
     
    Copyright: SkyTruth
    License: Apache 2.0
    Contact: Ry Covington (ry@skytruth.org)
    Date Updated: 07-09-2021

*/

function renameOli (img) {
// @param {ee.Image} img - a Landsat 8 image.
// returns {ee.Image}
    
    return img.select(
        ['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'pixel_qa'],
        ['B', 'G', 'R', 'NIR', 'SWIR1', 'SWIR2', 'pixel_qa']
    );
};

function renameEtm (img) {
// @param {ee.Image} img - a Landsat 4, 5, or 7 image.
// @returns {ee.Image}

    return img.select(
        ['B1', 'B2', 'B3', 'B4', 'B5', 'B7', 'pixel_qa'],
        ['B', 'G', 'R', 'NIR', 'SWIR1', 'SWIR2', 'pixel_qa']
    );
};
  
function etmToOli (img) {
// @param {ee.Image} img - a Landsat 4, 5, or 7 image. 
// @returns {ee.Image}
  
// Following the ETM+ to OLI Harmonization steps provided on by the EE Developer's Guide:
// https://developers.google.com/earth-engine/tutorials/community/landsat-etm-to-oli-harmonization

    var coefficients = {
        itcps: ee.Image.constant([-0.0095, -0.0016, -0.0022, -0.0021, -0.0030, 0.0029]).multiply(10000),
        slopes: ee.Image.constant([0.9785, 0.9542, 0.9825, 1.0073, 1.0171, 0.9949])
    };

    return ee.Image(img.select(['B', 'G', 'R', 'NIR', 'SWIR1', 'SWIR2'])  // Need explicit cast to ee.Image()
        .multiply(coefficients.slopes)
        .add(coefficients.itcps)
        .round()
        .toShort()
        .addBands(img.select('pixel_qa'))
        .copyProperties(img, img.propertyNames())  // Returns an ee.Element()
    )
};
  
function maskClouds (img) {
// @param {ee.Image} img - a Landsat 4, 5, 7, or 8 image.
// @returns {ee.Image}

    var cloudShadowBitMask = 1 << 3;
    var cloudsBitMask = 1 << 5;
    var qa = img.select('pixel_qa');
    var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0).and(qa.bitwiseAnd(cloudsBitMask).eq(0));
    
    return img.updateMask(mask);
};
  
function addMetrics(img){
// @param {ee.Image} img - a Landsat 4, 5, 7, or 8 image.
// @returns {ee.Image}

    var ndvi = img.normalizedDifference(['NIR','R']).rename('NDVI');
    var ndmi = img.normalizedDifference(['NIR','SWIR1']).rename('NDMI');
    var nbr = img.normalizedDifference(['NIR', 'SWIR2']).rename('NBR');
    var nbr2 = img.normalizedDifference(['SWIR1', 'SWIR2']).rename('NBR2');
    
    var evi = img.expression({
      expression: '(G * ((NIR - R) / (NIR + C1 * R - C2 * B + L)))',
      map: {
        'G': 2.5,
        'NIR': img.select('NIR'),
        'R': img.select('R'),
        'C1':6,
        'C2':7.5,
        'B':img.select('B'),
        'L':1
      }
    }).rename('EVI');
    
    var savi = img.expression({
      expression: '((C + L) * ((NIR - R) / (NIR + R + L)))',
      map: {
        'NIR': img.select('NIR'), 
        'R': img.select('R'), 
        'C': 1,
        'L': 0.5
      }
    }).rename('SAVI');
    
    var msavi = img.expression({
      expression: '((C * NIR - sqrt(((C * NIR + C2)**C3) - C4 * (NIR - R))) / C5)',
      map: {
        'C': 2,
        'NIR': img.select('NIR'),
        'R': img.select('R'),
        'C2': 1,
        'C3': 2,
        'C4': 8, 
        'C5': 2
      }
    }).rename('MSAVI');
  
    return img.addBands([ndvi, ndmi, evi, savi, msavi, nbr, nbr2]);
};

function prepOli(img) {
// @param {ee.Image} img - a Landsat 8 image.
// @returns {ee.Image} 

    var orig = img;
    img = renameOli(img);
    img = maskClouds(img);
    img = addMetrics(img);
    
    return ee.Image(img.copyProperties(orig, orig.propertyNames()));
};

function prepEtm(img) {
// @param {ee.Image} img - a Landsat 4, 5, or 7 image. 
// @returns {ee.Image}

    var orig = img;
    img = renameEtm(img); 
    img = maskClouds(img);      
    img = etmToOli(img);   
    img = addMetrics(img);
    
    return ee.Image(img.copyProperties(orig, orig.propertyNames()));
};

exports.makeAnnual = function(feature, year){
// @param {ee.Feature} feature - in this case, a single basin (huc6).
// @param {int} - the year to make the composite. 
// @returns {ee.Image} 

    var landsat4 = ee.ImageCollection("LANDSAT/LT04/C01/T1_SR")
        .filter(ee.Filter.calendarRange(year, year, 'year')) 
        .filter(ee.Filter.calendarRange(5, 9, 'month')) 
        .filterBounds(feature.geometry())
        .map(prepEtm);
    
    var landsat5 = ee.ImageCollection("LANDSAT/LT05/C01/T1_SR")
        .filter(ee.Filter.calendarRange(year, year, 'year'))
        .filter(ee.Filter.calendarRange(5, 9, 'month'))
        .filterBounds(feature.geometry())
        .map(prepEtm);
    
    var landsat7 = ee.ImageCollection("LANDSAT/LE07/C01/T1_SR")
        .filter(ee.Filter.calendarRange(year, year, 'year'))
        .filter(ee.Filter.calendarRange(5, 9, 'month'))
        .filterBounds(feature.geometry())
        .map(prepEtm);
    
    var landsat8 = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR")
        .filter(ee.Filter.calendarRange(year, year, 'year'))
        .filter(ee.Filter.calendarRange(5, 9, 'month'))
        .filterBounds(feature.geometry())
        .map(prepOli);
    
    // All images.
    var collects = ee.ImageCollection((landsat4).merge(landsat5).merge(landsat7).merge(landsat8));  
    
    return collects.median().set('Year', year); 
};

exports.makeStats = function(image, collection){
// @param {ee.Image} image - an annual composite. 
// @param {ee.FeatureCollection} collection - a feature collection of subwatersheds (huc12s).
// @returns {ee.FeatureCollection} data - a feature collection with summary stats for each band. 
    
    var data = image.reduceRegions({
      collection: collection,
      reducer: ee.Reducer.mean(),
      scale: 30, 
      tileScale: 4
    });
    
    return data;
};