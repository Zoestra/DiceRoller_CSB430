/**
 * Textured die renderer with face value overlay.
 *
 * Extends the base textured die approach to support multiple die types and
 * render the rolled result directly on the die face.
 *
 * ---
 * NOTE: This file was written with AI assistance (GitHub Copilot, GPT-5.3-Codex).
 * ---
 */

import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Svg, { ClipPath, Defs, G, Image, Path, Pattern, Rect, Text as SvgText } from 'react-native-svg';

import { getSkinBySetId } from '@/db/skins';

const SKIN_ASSETS = {
  'dark-wood': {
    texture: require('assets/images/Skin_Textures/dark-wood.png'),
  },
  golden: {
    texture: require('assets/images/Skin_Textures/golden.png'),
  },
  rock: {
    texture: require('assets/images/Skin_Textures/rock.png'),
  },
  diamond: {
    texture: require('assets/images/Skin_Textures/diamond.png'),
  },
};

const DIE_GEOMETRY = {
  4: {
    groupTransform: 'translate(-59.996948,-1.8433758)',
    outline: {
      d: 'M 85.014465,6.4605927 62.994627,32.539697 84.995262,46.53372 107.22852,32.540523 Z',
    },
    details: [{ d: 'm 84.955694,6.6476742 0.03957,39.9256148' }],
  },
  6: {
    outline: {
      d: 'm 24.897072,2.5212231 20.96105,12.1018679 -1e-6,24.203736 -20.96105,12.101867 -20.9610492,-12.101868 7e-7,-24.203736 z',
      transform: 'matrix(0.92878336,0,0,0.94365692,1.746978,0.15153729)',
    },
    details: [
      { d: 'M 44.158312,14.151288 25.249146,26.064064 5.39452,14.214319' },
      { d: 'M 24.870963,48.31385 25.123085,26.064064' },
    ],
  },
  8: {
    groupTransform: 'translate(-119.97469)',
    outline: {
      d: 'M 145.29916,3.798671 165.08497,15.587537 164.76841,38.61698 144.66605,49.857556 124.88024,38.06869 125.1968,15.039247 Z',
      transform: 'rotate(119.30516,145.34507,26.163633)',
    },
    details: [{ d: 'M 164.50814,14.207253 144.86598,48.192233 125.39343,14.196547 Z' }],
  },
  10: {
    groupTransform: 'translate(-180.12032,-0.31655592)',
    outline: {
      d: 'm 204.86849,2.6301063 -19.92165,17.4034697 0.056,7.890318 19.92165,19.809738 20.1455,-19.865697 -0.056,-7.7784 z',
    },
    details: [
      { d: 'm 204.86849,3.1337437 -12.42305,21.9921653 12.36709,8.002239 12.70286,-8.058199 z' },
      { d: 'M 224.95803,27.811976 217.57135,25.01399' },
      { d: 'm 204.81253,47.509792 0.056,-14.437603' },
      { d: 'm 184.83492,27.979854 7.66648,-2.853945' },
    ],
  },
  12: {
    groupTransform: 'translate(-239.63283)',
    outline: {
      d: 'm 264.80135,47.118076 -12.93819,-4.276601 -7.95349,-11.06472 0.0692,-13.626492 8.06541,-10.9834061 12.98094,-4.1450332 12.93819,4.2766017 7.95349,11.0647206 -0.0692,13.626491 -8.06541,10.983406 z',
    },
    details: [
      { d: 'm 264.91327,11.5277 12.87944,9.357465 -4.91951,15.140695 -15.91987,0 -4.91951,-15.140696 z' },
      { d: 'm 251.87465,20.872971 -7.66648,-2.686066' },
      { d: 'm 264.91327,11.5277 0.0559,-8.3939563' },
      { d: 'm 277.784,20.761052 8.0582,-2.462227' },
      { d: 'm 272.85955,36.094013 5.09233,6.883043' },
      { d: 'm 256.91102,36.094013 -4.98041,6.771124' },
    ],
  },
  20: {
    groupTransform: 'translate(-300.09501,0.31655592)',
    outline: {
      d: 'm 324.86552,2.215891 19.6989,11.46455 -0.0791,22.792026 -19.77804,11.327477 -19.69891,-11.46455 0.0791,-22.792027 z',
      transform: 'rotate(-0.29495437,324.8983,-18.47336)',
    },
    details: [
      {
        d: 'm 325.02378,40.215497 -12.6035,-21.555749 24.96958,-0.137073 z',
        transform: 'matrix(0.45625705,0.80018885,-0.80018885,0.45625705,197.32998,-245.86572)',
      },
      { d: 'm 305.26021,36.37381 8.17012,-3.86122 -7.97227,-18.706933 19.49996,-1.214723' },
      { d: 'm 324.94163,2.2547786 0.039,10.3457574 19.61249,1.188732 -8.33121,18.723322' },
      { d: 'M 344.71181,36.37381 336.31785,32.51259 325.01398,47.677673 313.43033,32.68047' },
    ],
  },
  100: {
    groupTransform: 'translate(-180.12032,-0.31655592)',
    outline: {
      d: 'm 204.86849,2.6301063 -19.92165,17.4034697 0.056,7.890318 19.92165,19.809738 20.1455,-19.865697 -0.056,-7.7784 z',
    },
    details: [
      { d: 'm 204.86849,3.1337437 -12.42305,21.9921653 12.36709,8.002239 12.70286,-8.058199 z' },
      { d: 'M 224.95803,27.811976 217.57135,25.01399' },
      { d: 'm 204.81253,47.509792 0.056,-14.437603' },
      { d: 'm 184.83492,27.979854 7.66648,-2.853945' },
    ],
  },
};

function renderPathShape(pathSpec, props = {}) {
  const { key, ...pathProps } = props;
  return <Path key={key} d={pathSpec.d} transform={pathSpec.transform} {...pathProps} />;
}

function getLabelFontSize(dieType) {
  if (dieType >= 100) {
    return 10.5;
  }
  if (dieType >= 10) {
    return 15;
  }
  return 17;
}

export default function TexturedDieFace({
  setId,
  dieType = 20,
  resultValue = null,
  displayLabel = null,
  labelX = 25,
  labelY = 29,
  labelHaloOffsetY = 0.35,
  labelFontSize = null,
  size = 200,
}) {
  const [skinData, setSkinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const svgIdPrefixRef = useRef(`die-${Math.random().toString(36).slice(2, 10)}`);

  useEffect(
    function loadSkinEffect() {
      async function loadSkin() {
        try {
          setLoading(true);
          setError(null);

          const skin = await getSkinBySetId(setId);
          if (!skin) {
            throw new Error('Skin not found');
          }

          const assets = SKIN_ASSETS[skin.skin_folder];
          if (!assets) {
            throw new Error(`No assets for folder: ${skin.skin_folder}`);
          }

          setSkinData({
            texture: assets.texture,
            fillColor: skin.skin_fill_color ?? '#e0e0e0',
            edgeColor: skin.skin_edge_color ?? '#000000',
            skinName: skin.skin_name,
          });
        } catch (err) {
          setError(err?.message ?? 'Unknown dice texture error');
        } finally {
          setLoading(false);
        }
      }

      void loadSkin();
    },
    [setId]
  );

  if (loading) {
    return (
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    throw new Error(`TexturedDieFace failed for set ${setId}, d${dieType}: ${error}`);
  }

  if (!skinData) {
    throw new Error(`TexturedDieFace missing skin data for set ${setId}, d${dieType}`);
  }

  const geometry = DIE_GEOMETRY[dieType];
  if (!geometry) {
    throw new Error(`Unsupported die type: d${dieType}`);
  }

  const clipId = `${svgIdPrefixRef.current}-clip-${setId}-${dieType}`;
  const patternId = `${svgIdPrefixRef.current}-texture-${setId}-${dieType}`;
  const displayValue =
    typeof displayLabel === 'string' && displayLabel.length > 0
      ? displayLabel
      : Number.isInteger(resultValue)
        ? String(resultValue)
        : '?';
  const resolvedLabelFontSize = labelFontSize ?? getLabelFontSize(dieType);

  return (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Defs>
        <ClipPath id={clipId}>
          <G transform={geometry.groupTransform}>
            {renderPathShape(geometry.outline)}
          </G>
        </ClipPath>

        <Pattern id={patternId} patternUnits="userSpaceOnUse" x="0" y="0" width="50" height="50">
          <Image
            href={skinData.texture}
            x="0"
            y="0"
            width="50"
            height="50"
            preserveAspectRatio="xMidYMid slice"
          />
        </Pattern>
      </Defs>

      {/* Layer 1: Texture clipped to die shape */}
      <Rect
        x="0"
        y="0"
        width="50"
        height="50"
        fill={`url(#${patternId})`}
        clipPath={`url(#${clipId})`}
      />

      {/* Layer 2: Fill color overlay */}
      <G transform={geometry.groupTransform}>
        {renderPathShape(geometry.outline, {
          fill: skinData.fillColor,
          fillOpacity: 0.2,
          stroke: 'none',
        })}
      </G>

      {/* Layer 3: Outer edge */}
      <G transform={geometry.groupTransform}>
        {renderPathShape(geometry.outline, {
          fill: 'none',
          stroke: skinData.edgeColor,
          strokeWidth: 0.628999,
        })}
        {geometry.details.map(function renderDetailPath(pathSpec, index) {
          return renderPathShape(pathSpec, {
            key: `die-detail-${dieType}-${index}`,
            fill: 'none',
            stroke: skinData.edgeColor,
            strokeWidth: 0.628999,
          });
        })}
      </G>

      <SvgText
        x={labelX}
        y={labelY + labelHaloOffsetY}
        textAnchor="middle"
        fontSize={resolvedLabelFontSize + 0.35}
        fontWeight="900"
        fill="#FFFFFF"
        fillOpacity={0.72}>
        {displayValue}
      </SvgText>

      <SvgText
        x={labelX}
        y={labelY}
        textAnchor="middle"
        fontSize={resolvedLabelFontSize}
        fontWeight="900"
        fill={skinData.edgeColor}>
        {displayValue}
      </SvgText>
    </Svg>
  );
}
