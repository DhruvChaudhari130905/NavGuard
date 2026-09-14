import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useNavigation } from '../../context/NavigationContext';
import { BLACKOUT_END, BLACKOUT_START } from '../../context/NavigationContext';
import { DEMO_ROUTE, positionAtProgress } from '../../data/demoRoute';

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function bearingAtProgress(progress: number, route: typeof DEMO_ROUTE): number {
  const current = positionAtProgress(progress, route);
  const next = positionAtProgress(Math.min(1, progress + 0.002), route);
  const latitude1 = current[1] * Math.PI / 180;
  const latitude2 = next[1] * Math.PI / 180;
  const longitudeDelta = (next[0] - current[0]) * Math.PI / 180;
  const y = Math.sin(longitudeDelta) * Math.cos(latitude2);
  const x = Math.cos(latitude1) * Math.sin(latitude2)
    - Math.sin(latitude1) * Math.cos(latitude2) * Math.cos(longitudeDelta);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

export const ExpoMapView: React.FC<{ showRoute?: boolean }> = ({ showRoute = true }) => {
  const { routeProgress, isInsideBlackoutZone, activeRoute } = useNavigation();
  const webViewRef = useRef<WebView>(null);
  const [webViewReady, setWebViewReady] = useState(false);
  const html = useMemo(() => {
    const route = activeRoute.map(([lng, lat]) => `[${lat},${lng}]`).join(',');
    const start = activeRoute[0];
    const end = activeRoute[activeRoute.length - 1];
    const blackoutStart = Math.floor((activeRoute.length - 1) * BLACKOUT_START);
    const blackoutEnd = Math.ceil((activeRoute.length - 1) * BLACKOUT_END);
    const blackout = activeRoute.slice(blackoutStart, blackoutEnd + 1)
      .map(([lng, lat]) => `[${lat},${lng}]`).join(',');
    const vehicle = positionAtProgress(0, activeRoute);
    const mapCenter = showRoute ? `[${vehicle[1]},${vehicle[0]}]` : '[18.5204,73.8567]';

    return `<!doctype html>
      <html><head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
        <style>
          html,body,#map{height:100%;margin:0;background:#edf2f5}
          .legend{position:absolute;z-index:1000;top:12px;left:12px;right:12px;padding:10px;border-radius:10px;background:#ffffffe8;font:14px sans-serif;color:#10243a;box-shadow:0 2px 8px #0002}
          .arrow-icon{background:transparent;border:0}
          .arrow-body{width:0;height:0;border-left:12px solid transparent;border-right:12px solid transparent;border-bottom:34px solid #1664e8;filter:drop-shadow(0 2px 3px #0008);transform-origin:50% 50%}
          .arrow-body:after{content:'';position:absolute;left:-5px;top:12px;width:10px;height:10px;border-radius:50%;background:#d6e3ff;border:2px solid #fff}
          .arrow-outage{border-bottom-color:#ea4335}
          .map-control{position:absolute;z-index:1100;right:12px;width:42px;height:42px;border:0;border-radius:10px;background:#fff;color:#10243a;font:bold 22px sans-serif;box-shadow:0 2px 7px #0004;pointer-events:auto}
          .map-control:active{background:#d6e3ff}
          #zoom-in{top:78px} #zoom-out{top:126px} #recenter{top:174px;font-size:19px}
        </style>
      </head><body><div id="map"></div>
        ${showRoute ? '<div class="legend"><b>NavGuard route</b><br>Red dashed section: dead signal area</div>' : ''}
        <button id="zoom-in" class="map-control" aria-label="Zoom in">+</button>
        <button id="zoom-out" class="map-control" aria-label="Zoom out">−</button>
        <button id="recenter" class="map-control" aria-label="Recenter">◎</button>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          const route=[${route}], blackout=[${blackout}];
          let followMode=true;
          const map=L.map('map');
          map.setView(${mapCenter},${showRoute ? 17 : 12});
          map.on('dragstart',()=>{followMode=false;});
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
          ${showRoute ? `
          L.polyline(route,{color:'#1664e8',weight:5}).addTo(map);
          const deadZoneLayer=L.polyline(blackout,{color:'#ea4335',weight:9,dashArray:'10 8'})
            .addTo(map)
            .bindPopup('<b>GNSS dead zone</b><br>Signal blocked in this red section.<br><br><b>AI + INS dead reckoning active</b><br>Position is estimated from inertial sensors until GNSS returns.')
            .on('click',()=>deadZoneLayer.openPopup());
          L.circleMarker([${start[1]},${start[0]}],{radius:8,color:'#ffffff',weight:2,fillColor:'#1664e8',fillOpacity:1}).addTo(map).bindPopup('Start: Zems Cycles');
          L.circleMarker([${end[1]},${end[0]}],{radius:8,color:'#ffffff',weight:2,fillColor:'#ea4335',fillOpacity:1}).addTo(map).bindPopup('End: MIT WPU Campus');
          ` : ''}
          const carIcon=(color,heading)=>L.divIcon({className:'arrow-icon',iconSize:[28,40],iconAnchor:[14,20],html:'<div class="arrow-body '+(color==='#ea4335'?'arrow-outage':'')+'" style="transform:rotate('+heading+'deg)"></div>'});
          const vehicleMarker=${showRoute ? `L.marker([${vehicle[1]},${vehicle[0]}],{icon:carIcon('#1664e8',0)}).addTo(map)` : 'null'};
          const cameraTarget=(lat,lng,heading)=>{
            const radians=heading*Math.PI/180;
            const forwardMeters=showRoute ? Math.max(55, Math.min(95, 900 / Math.pow(2, map.getZoom()-14))) : 0;
            const targetLat=lat+(Math.cos(radians)*forwardMeters)/111320;
            const targetLng=lng+(Math.sin(radians)*forwardMeters)/(111320*Math.cos(lat*Math.PI/180));
            return [targetLat,targetLng];
          };
          document.getElementById('zoom-in').onclick=()=>map.setZoom(Math.min(19,map.getZoom()+1));
          document.getElementById('zoom-out').onclick=()=>map.setZoom(Math.max(3,map.getZoom()-1));
          document.getElementById('recenter').onclick=()=>{
            followMode=true;
            if(vehicleMarker){
              const vehiclePosition=vehicleMarker.getLatLng();
              map.setView(cameraTarget(vehiclePosition.lat,vehiclePosition.lng,vehicleMarker.options.heading||0),17,{animate:true});
            }
            else map.setView(${mapCenter},12,{animate:true});
          };
          window.updateVehicle=function(lat,lng,color,label,heading){
            if(!vehicleMarker) return;
            vehicleMarker.setLatLng([lat,lng]);
            vehicleMarker.setIcon(carIcon(color,heading));
            vehicleMarker.options.heading=heading;
            vehicleMarker.bindPopup(label);
            if(followMode) map.panTo(cameraTarget(lat,lng,heading),{animate:false});
          };
        </script>
      </body></html>`;
  }, [activeRoute, showRoute]);

  useEffect(() => {
    if (!showRoute) return;
    const [longitude, latitude] = positionAtProgress(routeProgress, activeRoute);
    const color = isInsideBlackoutZone ? '#ea4335' : '#1664e8';
    const label = escapeHtml(isInsideBlackoutZone ? 'AI + INS dead reckoning' : 'GNSS active');
    const heading = bearingAtProgress(routeProgress, activeRoute);
    webViewRef.current?.injectJavaScript(
      `window.updateVehicle && window.updateVehicle(${latitude},${longitude},'${color}','${label}',${heading}); true;`,
    );
  }, [activeRoute, isInsideBlackoutZone, routeProgress, showRoute, webViewReady]);

  const handleWebViewMessage = useCallback((_event: WebViewMessageEvent) => {}, []);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        onLoadEnd={() => setWebViewReady(true)}
        onMessage={handleWebViewMessage}
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#edf2f5' },
  webview: { flex: 1, backgroundColor: '#edf2f5' },
});
