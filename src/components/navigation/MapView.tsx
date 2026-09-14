import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  G,
  Line,
  Polygon,
  Text as SvgText,
} from 'react-native-svg';
import { Plus, Minus, LocateFixed, Play, Pause, Layers, Compass, Navigation } from 'lucide-react-native';
import { useNavigation, BLACKOUT_START, BLACKOUT_END } from '../../context/NavigationContext';

const { width: W, height: H } = Dimensions.get('window');

// Map coordinate space
const ROUTE_START_Y_RATIO = 0.70;
const ROUTE_END_Y_RATIO = 0.22;

export const MapView: React.FC = () => {
  const {
    isInsideBlackoutZone,
    zoomIn,
    zoomOut,
    recenterMap,
    zoomLevel,
    routeProgress,
    setRouteProgress,
    isSimulationPlaying,
    toggleSimulationPlay,
    estimatedDriftMeters,
    positionConfidence,
    driftRatePerKm,
    currentSpeedKmh,
  } = useNavigation();

  // ── ROUTE WAYPOINTS (Fully framed in screen coordinate space 0..W × 0..H) ─────────────
  const ROUTE: { x: number; y: number }[] = [
    { x: W * 0.20, y: H * ROUTE_START_Y_RATIO },         // 0 Origin (Zems Cycles)
    { x: W * 0.54, y: H * ROUTE_START_Y_RATIO },         // 1 East along Paud Road
    { x: W * 0.54, y: H * 0.64 },                        // 2 Turn north on DP Road
    { x: W * 0.56, y: H * 0.58 },                        // 3 Diagonal → underpass entry (dragged further back)
    { x: W * 0.60, y: H * 0.50 },                        // 4 INSIDE UNDERPASS (mid)
    { x: W * 0.64, y: H * 0.43 },                        // 5 Underpass curve
    { x: W * 0.68, y: H * 0.36 },                        // 6 Underpass exit
    { x: W * 0.72, y: H * 0.29 },                        // 7 Highway north
    { x: W * 0.78, y: H * 0.23 },                        // 8 East turn near top
    { x: W * 0.78, y: H * ROUTE_END_Y_RATIO },           // 9 Destination (MIT WPU Campus)
  ];

  const BLACKOUT_SEG = ROUTE.slice(3, 7);
  const PRE_SEG      = ROUTE.slice(0, 4);
  const POST_SEG     = ROUTE.slice(6);

  function pts2Path(pts: { x: number; y: number }[]) {
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  }

  // Smooth position along the route with natural rounded corners at vertices
  function getPosition(p: number): { x: number; y: number } {
    const clampedP = Math.min(1, Math.max(0, p));
    const total = ROUTE.length - 1;
    const st = clampedP * total;
    const idx = Math.min(total - 1, Math.floor(st));
    const t = st - idx;
    const cur = ROUTE[idx];
    const next = ROUTE[idx + 1];

    const CORNER_THRESHOLD = 0.16;

    // Corner filleting: smooth quadratic Bezier arc around turn vertices
    if (t > 1 - CORNER_THRESHOLD && idx < total - 1) {
      const afterNext = ROUTE[idx + 2];
      const p0 = {
        x: cur.x + (next.x - cur.x) * (1 - CORNER_THRESHOLD),
        y: cur.y + (next.y - cur.y) * (1 - CORNER_THRESHOLD),
      };
      const p1 = next;
      const p2 = {
        x: next.x + (afterNext.x - next.x) * CORNER_THRESHOLD,
        y: next.y + (afterNext.y - next.y) * CORNER_THRESHOLD,
      };
      const q = (t - (1 - CORNER_THRESHOLD)) / (2 * CORNER_THRESHOLD); // 0 to 0.5
      const invQ = 1 - q;
      return {
        x: invQ * invQ * p0.x + 2 * invQ * q * p1.x + q * q * p2.x,
        y: invQ * invQ * p0.y + 2 * invQ * q * p1.y + q * q * p2.y,
      };
    } else if (t < CORNER_THRESHOLD && idx > 0) {
      const prev = ROUTE[idx - 1];
      const p0 = {
        x: prev.x + (cur.x - prev.x) * (1 - CORNER_THRESHOLD),
        y: prev.y + (cur.y - prev.y) * (1 - CORNER_THRESHOLD),
      };
      const p1 = cur;
      const p2 = {
        x: cur.x + (next.x - cur.x) * CORNER_THRESHOLD,
        y: cur.y + (next.y - cur.y) * CORNER_THRESHOLD,
      };
      const q = 0.5 + t / (2 * CORNER_THRESHOLD); // 0.5 to 1.0
      const invQ = 1 - q;
      return {
        x: invQ * invQ * p0.x + 2 * invQ * q * p1.x + q * q * p2.x,
        y: invQ * invQ * p0.y + 2 * invQ * q * p1.y + q * q * p2.y,
      };
    }

    // Straight segment
    return {
      x: cur.x + (next.x - cur.x) * t,
      y: cur.y + (next.y - cur.y) * t,
    };
  }

  // Exact instantaneous velocity tangent (eliminates drifting completely)
  function carAt(p: number): { x: number; y: number; angle: number } {
    const pos = getPosition(p);
    const eps = 0.002;
    const ahead = getPosition(Math.min(1, p + eps));
    const behind = getPosition(Math.max(0, p - eps));

    let dx = ahead.x - behind.x;
    let dy = ahead.y - behind.y;

    if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) {
      dx = ROUTE[1].x - ROUTE[0].x;
      dy = ROUTE[1].y - ROUTE[0].y;
    }

    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    return { x: pos.x, y: pos.y, angle };
  }

  const car = carAt(routeProgress);

  // Effective zoom level: default 1.0 is full static route overview
  const zoom = Math.max(1.0, Math.min(3.0, zoomLevel || 1.0));
  const VB_W = W / zoom;
  const VB_H = H / zoom;

  // When zoom is 1.0, show the complete static overview (0, 0, W, H).
  // When zoomed in (> 1.0), center the camera on the vehicle.
  const vbX = zoom <= 1.0 ? 0 : car.x - VB_W / 2;
  const vbY = zoom <= 1.0 ? 0 : car.y - VB_H / 2;

  // Road grid positions across entire map
  const hRoads = [0.14, 0.22, 0.32, 0.44, 0.56, 0.70, 0.82].map(r => H * r);
  const vRoads = [0.12, 0.26, 0.40, 0.54, 0.68, 0.84].map(c => W * c);

  return (
    <View style={styles.container}>
      {/* ════════════════════════════════════════════════════════════ */}
      {/* MAP SVG — FULL OVERVIEW (1.0x) OR DYNAMIC ZOOM IN (>1.0x)   */}
      {/* ════════════════════════════════════════════════════════════ */}
      <Svg
        width="100%"
        height="100%"
        viewBox={`${vbX} ${vbY} ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        style={styles.svg}
      >
        <Defs>
          <RadialGradient id="carHalo" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={isInsideBlackoutZone
              ? 'rgba(234,67,53,0.5)' : 'rgba(66,133,244,0.5)'} />
            <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </RadialGradient>
          <RadialGradient id="startHalo" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="rgba(46,125,50,0.4)" />
            <Stop offset="100%" stopColor="rgba(46,125,50,0)" />
          </RadialGradient>
          <RadialGradient id="destHalo" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="rgba(234,67,53,0.4)" />
            <Stop offset="100%" stopColor="rgba(234,67,53,0)" />
          </RadialGradient>
        </Defs>

        {/* 1. BASE GROUND (Extends generously for zoom panning) */}
        <Rect x={-W * 3} y={-H * 3} width={W * 7} height={H * 7} fill="#f5f0e8" />

        {/* 2. GREEN PARKS / LANDMARKS */}
        <Path
          d={`M 0,${H*0.06} Q 60,${H*0.02} 110,${H*0.14} Q 70,${H*0.26} 0,${H*0.22} Z`}
          fill="#d4edd6" stroke="#bddebe" strokeWidth={1.5}
        />
        <SvgText x={10} y={H*0.15} fill="#3a7a3d" fontSize={11} fontWeight="700">
          Kothrud Hill
        </SvgText>

        <Path
          d={`M ${W*0.6},${H*0.74} Q ${W*0.9},${H*0.72} ${W*0.92},${H*0.88}
              Q ${W*0.65},${H*0.92} ${W*0.58},${H*0.82} Z`}
          fill="#d4edd6" stroke="#bddebe" strokeWidth={1.5}
        />
        <SvgText x={W*0.64} y={H*0.82} fill="#3a7a3d" fontSize={10} fontWeight="700">
          Mission Park
        </SvgText>

        {/* 3. SECONDARY ROAD GRID */}
        {/* Outlines */}
        <G stroke="#d0c9b6" strokeWidth={8} fill="none" strokeLinecap="round">
          {hRoads.map((y, i) => <Line key={`ho${i}`} x1={-W * 2} y1={y} x2={W * 3} y2={y} />)}
          {vRoads.map((x, i) => <Line key={`vo${i}`} x1={x} y1={-H * 2} x2={x} y2={H * 3} />)}
        </G>
        {/* White fill */}
        <G stroke="#faf7f2" strokeWidth={6} fill="none" strokeLinecap="round">
          {hRoads.map((y, i) => <Line key={`hf${i}`} x1={-W * 2} y1={y} x2={W * 3} y2={y} />)}
          {vRoads.map((x, i) => <Line key={`vf${i}`} x1={x} y1={-H * 2} x2={x} y2={H * 3} />)}
        </G>

        {/* 4. MAJOR NAMED ROADS */}
        {/* Rahulnath Rd horizontal */}
        <Line x1={-W * 2} y1={H*0.44} x2={W * 3} y2={H*0.44} stroke="#ddd5c0" strokeWidth={14} />
        <Line x1={-W * 2} y1={H*0.44} x2={W * 3} y2={H*0.44} stroke="#ffffff" strokeWidth={10} />
        <SvgText x={W*0.28} y={H*0.435} fill="#9b9286" fontSize={10} fontWeight="600">
          Rahulnath Rd
        </SvgText>

        {/* DP Road vertical */}
        <Line x1={W*0.54} y1={-H * 2} x2={W*0.54} y2={H * 3} stroke="#ddd5c0" strokeWidth={14} />
        <Line x1={W*0.54} y1={-H * 2} x2={W*0.54} y2={H * 3} stroke="#ffffff" strokeWidth={10} />
        <SvgText x={W*0.55} y={H*0.62} fill="#9b9286" fontSize={10} fontWeight="600">
          DP Road
        </SvgText>

        {/* Paud Rd horizontal */}
        <Line x1={-W * 2} y1={H*ROUTE_START_Y_RATIO} x2={W * 3} y2={H*ROUTE_START_Y_RATIO} stroke="#ddd5c0" strokeWidth={14} />
        <Line x1={-W * 2} y1={H*ROUTE_START_Y_RATIO} x2={W * 3} y2={H*ROUTE_START_Y_RATIO} stroke="#ffffff" strokeWidth={10} />
        <SvgText x={W*0.06} y={H*ROUTE_START_Y_RATIO - 4} fill="#9b9286" fontSize={10} fontWeight="600">
          Paud Rd
        </SvgText>

        {/* 5. NEIGHBOURHOOD LABELS */}
        {[
          { x: 12,      y: H*0.30, t: 'MATOBA NAGAR' },
          { x: 12,      y: H*0.52, t: 'ALKAPURI SOCIETY' },
          { x: W*0.62,  y: H*0.64, t: 'IDEAL COLONY' },
          { x: W*0.62,  y: H*0.16, t: 'RAMBAUG COLONY' },
        ].map((l, i) => (
          <SvgText key={i} x={l.x} y={l.y} fill="#b0aaa0" fontSize={9.5} fontWeight="600">
            {l.t}
          </SvgText>
        ))}

        {/* 6. UNDERPASS TUNNEL SHADOW (blackout region - positioned earlier along the route) */}
        <Path d={pts2Path(BLACKOUT_SEG)}
          stroke="rgba(80,60,20,0.18)" strokeWidth={36} fill="none"
          strokeLinecap="round" strokeLinejoin="round" />
        <Path d={pts2Path(BLACKOUT_SEG)}
          stroke="rgba(80,60,20,0.10)" strokeWidth={52} fill="none"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Underpass entry badge */}
        <G transform={`translate(${ROUTE[3].x + 8}, ${ROUTE[3].y - 8})`}>
          <Rect x={0} y={-13} width={132} height={20} rx={4}
            fill="#fff9c4" stroke="#f9a825" strokeWidth={1.2} />
          <SvgText x={5} y={1} fill="#e65100" fontSize={8.5} fontWeight="800">
            ⚠ MIT WPU Underpass
          </SvgText>
        </G>

        {/* Underpass exit badge */}
        <G transform={`translate(${ROUTE[6].x + 8}, ${ROUTE[6].y - 6})`}>
          <Rect x={0} y={-13} width={120} height={20} rx={4}
            fill="#e8f5e9" stroke="#43a047" strokeWidth={1.2} />
          <SvgText x={5} y={1} fill="#2e7d32" fontSize={8.5} fontWeight="800">
            ✓ GNSS Reacquired
          </SvgText>
        </G>

        {/* 7. NAVIGATION ROUTE LINES */}
        {/* Full route Shadow */}
        <Path d={pts2Path(ROUTE)}
          stroke="#1557bf" strokeWidth={10} fill="none"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* Pre-underpass: blue */}
        <Path d={pts2Path(PRE_SEG)}
          stroke="#4285f4" strokeWidth={6} fill="none"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* Inside underpass: red + dashes */}
        <Path d={pts2Path(BLACKOUT_SEG)}
          stroke="#ea4335" strokeWidth={6} fill="none"
          strokeLinecap="round" strokeLinejoin="round" />
        <Path d={pts2Path(BLACKOUT_SEG)}
          stroke="#ffffff" strokeWidth={2}
          strokeDasharray="6 6" fill="none"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* Post-underpass: blue */}
        <Path d={pts2Path(POST_SEG)}
          stroke="#4285f4" strokeWidth={6} fill="none"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Turn dots */}
        {ROUTE.slice(1, -1).map((pt, i) => (
          <Circle key={i} cx={pt.x} cy={pt.y} r={4}
            fill="#ffffff" stroke="#4285f4" strokeWidth={2} />
        ))}

        {/* 8. START POINT (Green Marker & Flag Badge) */}
        <Circle cx={ROUTE[0].x} cy={ROUTE[0].y} r={18} fill="url(#startHalo)" />
        <Circle cx={ROUTE[0].x} cy={ROUTE[0].y} r={7} fill="#2e7d32" stroke="#ffffff" strokeWidth={2.5} />
        <Circle cx={ROUTE[0].x} cy={ROUTE[0].y} r={3} fill="#ffffff" />
        <G transform={`translate(${ROUTE[0].x - 48}, ${ROUTE[0].y - 32})`}>
          <Rect x={0} y={0} width={96} height={20} rx={4}
            fill="#2e7d32" stroke="#ffffff" strokeWidth={1.2} />
          <SvgText x={5} y={13} fill="#ffffff" fontSize={8.5} fontWeight="800">
            🚩 START: Zems Cycles
          </SvgText>
        </G>

        {/* 9. DESTINATION POINT (Red Pin & Badge) */}
        <Circle cx={ROUTE[ROUTE.length - 1].x} cy={ROUTE[ROUTE.length - 1].y} r={18} fill="url(#destHalo)" />
        <G transform={`translate(${ROUTE[ROUTE.length - 1].x}, ${ROUTE[ROUTE.length - 1].y})`}>
          <Path
            d="M 0,0 C -7,-7 -11,-14 -11,-22 C -11,-29 -5,-34 0,-34 C 5,-34 11,-29 11,-22 C 11,-14 7,-7 0,0 Z"
            fill="#ea4335" stroke="#c5221f" strokeWidth={1.5}
          />
          <Circle cx={0} cy={-22} r={4.5} fill="#ffffff" />
        </G>
        <G transform={`translate(${ROUTE[ROUTE.length - 1].x - 52}, ${ROUTE[ROUTE.length - 1].y - 54})`}>
          <Rect x={0} y={0} width={104} height={20} rx={4}
            fill="#ffffff" stroke="#dadce0" strokeWidth={1} />
          <SvgText x={5} y={13} fill="#202124" fontSize={8.5} fontWeight="700">
            🏁 MIT WPU Campus
          </SvgText>
        </G>

        {/* 10. TRAVELLING VEHICLE GPS DOT (Arrow pointing in exact travel direction) */}
        <G transform={`translate(${car.x}, ${car.y})`}>
          <Circle cx={0} cy={0} r={22} fill="url(#carHalo)" />
          <Circle cx={0} cy={0} r={15} fill="none"
            stroke={isInsideBlackoutZone ? '#ea4335' : '#4285f4'}
            strokeWidth={1.5} opacity={0.65} />
          {/* Arrow pointing in forward motion angle */}
          <G transform={`rotate(${car.angle})`}>
            <Path
              d="M 12,0 L -7,8 L -3,0 L -7,-8 Z"
              fill={isInsideBlackoutZone ? '#ea4335' : '#1a73e8'}
              stroke="#ffffff"
              strokeWidth={2}
            />
            <Circle cx={0} cy={0} r={3} fill="#ffffff" />
          </G>
        </G>
      </Svg>

      {/* ── COMPACT TURN BANNER ────────────────────────────────────── */}
      <View style={[styles.turnBanner, isInsideBlackoutZone && styles.turnBannerOutage]}>
        <View style={styles.arrowBox}>
          <Text style={styles.arrowText}>{isInsideBlackoutZone ? '⚠' : '↰'}</Text>
        </View>
        <View style={styles.turnTextCol}>
          <Text style={styles.turnIn} numberOfLines={1}>
            {isInsideBlackoutZone
              ? `AI+INS DR  ·  Drift: +${estimatedDriftMeters}m`
              : 'In 250 m  ·  Turn left on DP Road'}
          </Text>
          <Text style={styles.turnStreet} numberOfLines={1}>
            {isInsideBlackoutZone
              ? 'MIT WPU Underpass (GNSS Blocked)'
              : 'MIT WPU Campus'}
          </Text>
        </View>
        <View style={[styles.modeChip, isInsideBlackoutZone && styles.modeChipWarn]}>
          <Text style={styles.modeChipText}>{isInsideBlackoutZone ? 'DR' : 'GPS'}</Text>
        </View>
      </View>

      {/* ── COMPACT HUD ROW ────────────────────────────────────────── */}
      <View style={styles.hud}>
        <View style={styles.hudCell}>
          <Text style={styles.hudLbl}>MODE</Text>
          <Text style={[styles.hudVal,
            isInsideBlackoutZone ? styles.valRed : styles.valGreen]}>
            {isInsideBlackoutZone ? 'AI INS DR' : 'GNSS LOCK'}
          </Text>
        </View>
        <View style={styles.hdiv} />
        <View style={styles.hudCell}>
          <Text style={styles.hudLbl}>SPEED</Text>
          <Text style={styles.hudVal}>{currentSpeedKmh} km/h</Text>
        </View>
        <View style={styles.hdiv} />
        {isInsideBlackoutZone ? (
          <>
            <View style={styles.hudCell}>
              <Text style={styles.hudLbl}>DRIFT</Text>
              <Text style={[styles.hudVal, styles.valOrange]}>+{estimatedDriftMeters}m</Text>
            </View>
            <View style={styles.hdiv} />
            <View style={styles.hudCell}>
              <Text style={styles.hudLbl}>CONF.</Text>
              <Text style={[styles.hudVal, styles.valGreen]}>{Math.round(positionConfidence)}%</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.hudCell}>
              <Text style={styles.hudLbl}>SATS</Text>
              <Text style={[styles.hudVal, styles.valGreen]}>18 Lock</Text>
            </View>
            <View style={styles.hdiv} />
            <View style={styles.hudCell}>
              <Text style={styles.hudLbl}>HAZARD</Text>
              <Text style={[styles.hudVal, styles.valOrange]}>0.5 km</Text>
            </View>
          </>
        )}
      </View>

      {/* ── RIGHT FAB (Interactive Zoom In / Out & Recenter Controls) ── */}
      <View style={styles.fab}>
        {/* Zoom In Button */}
        <TouchableOpacity
          style={[styles.fabBtn, zoom >= 3.0 && styles.fabBtnDisabled]}
          onPress={zoomIn}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#3c4043" />
        </TouchableOpacity>

        {/* Zoom Out Button */}
        <TouchableOpacity
          style={[styles.fabBtn, zoom <= 1.0 && styles.fabBtnDisabled]}
          onPress={zoomOut}
          activeOpacity={0.8}
        >
          <Minus size={20} color="#3c4043" />
        </TouchableOpacity>

        {/* Reset to Full Overview Button */}
        <TouchableOpacity
          style={[styles.fabBtn, zoom === 1.0 && styles.fabBtnActive]}
          onPress={recenterMap}
          activeOpacity={0.8}
        >
          <LocateFixed size={20} color="#1a73e8" />
        </TouchableOpacity>
      </View>

      {/* ── BOTTOM SCRUBBER ──────────────────────────────────────── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.layersPill}
          onPress={zoom === 1.0 ? zoomIn : recenterMap}
          activeOpacity={0.8}
        >
          <Layers size={14} color="#1a73e8" />
          <Text style={styles.layersText}>
            {zoom === 1.0 ? 'Overview (1.0x)' : `Zoomed (${zoom.toFixed(1)}x)`}
          </Text>
        </TouchableOpacity>
        <View style={styles.scrubRow}>
          <TouchableOpacity style={styles.playBtn} onPress={toggleSimulationPlay} activeOpacity={0.8}>
            {isSimulationPlaying ? <Pause size={13} color="#fff" /> : <Play size={13} color="#fff" />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, routeProgress <= 0.05 && styles.chipActive]}
            onPress={() => setRouteProgress(0.0)}>
            <Text style={styles.chipText}>1. Start</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip,
              routeProgress >= BLACKOUT_START && routeProgress <= BLACKOUT_END && styles.chipOutage]}
            onPress={() => setRouteProgress(0.45)}>
            <Text style={[styles.chipText, styles.chipWarn]}>2. Underpass ⚠</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, routeProgress > BLACKOUT_END && styles.chipActive]}
            onPress={() => setRouteProgress(0.88)}>
            <Text style={styles.chipText}>3. Arrived</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f0e8', overflow: 'hidden' },
  svg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },

  turnBanner: {
    position: 'absolute', top: 10, left: 10, right: 10, height: 56,
    backgroundColor: '#1a73e8', borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22, shadowRadius: 6, elevation: 6, zIndex: 40,
  },
  turnBannerOutage: { backgroundColor: '#c62828' },
  arrowBox: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  arrowText: { fontSize: 18, color: '#fff' },
  turnTextCol: { flex: 1 },
  turnIn: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '600' },
  turnStreet: { color: '#fff', fontSize: 13, fontWeight: '700' },
  modeChip: {
    backgroundColor: '#34a853', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  modeChipWarn: { backgroundColor: '#f9a825' },
  modeChipText: { color: '#fff', fontWeight: '800', fontSize: 10 },

  hud: {
    position: 'absolute', top: 74, left: 10, right: 10, height: 44,
    backgroundColor: 'rgba(18,18,18,0.93)', borderRadius: 10,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 4, zIndex: 38,
  },
  hudCell: { flex: 1, alignItems: 'center' },
  hdiv: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.15)' },
  hudLbl: { color: 'rgba(255,255,255,0.5)', fontSize: 8, fontWeight: '700', letterSpacing: 0.4 },
  hudVal: { color: '#fff', fontSize: 12, fontWeight: '700' },
  valGreen: { color: '#81c995' },
  valRed: { color: '#ef9a9a' },
  valOrange: { color: '#fbbc04' },

  fab: { position: 'absolute', right: 12, bottom: 72, gap: 10, zIndex: 35 },
  fabBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14, shadowRadius: 5, elevation: 4,
    borderWidth: 1, borderColor: '#e8eaed',
  },
  fabBtnActive: {
    backgroundColor: '#e8f0fe',
    borderColor: '#1a73e8',
  },
  fabBtnDisabled: {
    opacity: 0.45,
    backgroundColor: '#f1f3f4',
  },

  bottomBar: {
    position: 'absolute', bottom: 12, left: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 35,
  },
  layersPill: {
    backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: '#dadce0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
  },
  layersText: { color: '#3c4043', fontSize: 12, fontWeight: '600' },
  scrubRow: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(18,18,18,0.92)',
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, gap: 5,
  },
  playBtn: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: '#1a73e8',
    alignItems: 'center', justifyContent: 'center',
  },
  chip: {
    flex: 1, paddingVertical: 5, alignItems: 'center', borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  chipActive: {
    backgroundColor: 'rgba(52,168,83,0.35)',
    borderWidth: 1, borderColor: '#34a853',
  },
  chipOutage: {
    backgroundColor: 'rgba(234,67,53,0.35)',
    borderWidth: 1, borderColor: '#ea4335',
  },
  chipText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  chipWarn: { color: '#fbbc04' },
});
