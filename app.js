// 获取查询字符串参数
const urlParams = new URLSearchParams(window.location.search);
const wktInputValue = urlParams.get('wkt-input');

// 设置 "wkt-input" 输入字段的默认值
const wktInput = document.getElementById('wkt-input');
wktInput.value = wktInputValue;

const shareButton = document.getElementById('share-button');
shareButton.addEventListener('click', () => {
  const wktInput = document.getElementById('wkt-input');
  const url = `${window.location.origin}${window.location.pathname}?wkt-input=${encodeURIComponent(wktInput.value)}`;
  navigator.clipboard.writeText(url);
});

// 创建一个地图对象
var map = new ol.Map({
  target: 'map',
  view: new ol.View({
    center: [0, 0],
    zoom: 2
  })
});

// 添加一个矢量图层
var vectorLayer = new ol.layer.Vector({
  source: new ol.source.Vector(),
  style: function(feature) {
    return new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'blue',
        width: 1
      }),
      fill: new ol.style.Fill({
        color: 'rgba(0, 0, 255, 0.1)'
      })
    });
  }
});
map.addLayer(vectorLayer);

// 添加一个用于显示顶点坐标的矢量图层
var markerLayer = new ol.layer.Vector({
  source: new ol.source.Vector(),
  style: function(feature) {
    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({color: 'red'}),
        stroke: new ol.style.Stroke({color: 'white', width: 1})
      }),
      text: new ol.style.Text({
        font: '12px Arial',
        textBaseline: 'bottom',
        fill: new ol.style.Fill({color: 'black'}),
        text: feature.get('name') // 显示顶点坐标
      })
    });
  }
});
map.addLayer(markerLayer);

// 获取“绘制”按钮元素
var drawButton = document.getElementById('draw-button');
  
function isCoord(coords) {
  return Array.isArray(coords) && coords.length === 2 &&
         typeof coords[0] === "number" && typeof coords[1] === "number";
}

function flattenCoordinates(coords) {
  let flatArray = [];
  for (let i = 0; i < coords.length; i++) {
    if (isCoord(coords[i])) {
      flatArray.push(coords[i]);
    } else if (Array.isArray(coords[i])) {
      flatArray = flatArray.concat(flattenCoordinates(coords[i]));
    }
  }
  return flatArray;
}


// 为“绘制”按钮添加点击事件监听器
drawButton.addEventListener('click', function() {
  vectorLayer.getSource().clear();
  markerLayer.getSource().clear();

  // 获取用户输入的WKT格式数据
  var wktGeometry = document.getElementById('wkt-input').value;

  // 将WKT格式转换为多边形对象
  var parser = new ol.format.WKT();
  var feature = parser.readFeature(wktGeometry);
  var geometry = feature.getGeometry();
  var coords = geometry.getCoordinates();
  var flatCoords = flattenCoordinates(coords);

  flatCoords.forEach(function(coord) {
    console.log('Coordinate: ' + coord.toString());
    var point = new ol.geom.Point(coord);
    var name = '(' + coord.toString() + ')'; // 标注顶点坐标
    markerLayer.getSource().addFeature(new ol.Feature({
      geometry: point,
      name: name
    }));
  });

  // Add the feature to the vector layer
  vectorLayer.getSource().addFeature(feature);

  // 根据多边形的范围设置地图的中心和缩放比例
  var extent = geometry.getExtent();
  map.getView().fit(extent, map.getSize());
});

drawButton.click();
