// NOTE: This file was written with AI assistance (Claude), as well as StackOverflow

import Svg, { Defs, ClipPath, Pattern, Image, Path, Rect } from 'react-native-svg';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { getSkinBySetId } from '../db/skins';

const SKIN_ASSETS = {
  classic: {
    texture: require('../../assets/images/Skin_Textures/dark-wood.png'),
  },
  golden: {
    texture: require('../../assets/images/Skin_Textures/golden.png'),
  },
  obsidian: {
    texture: require('../../assets/images/Skin_Textures/rock.png'),
  },
  crystal: {
    texture: require('../../assets/images/Skin_Textures/diamond.png'),
  },
};

// The d20 die shape path extracted from d20_mask.svg (translated back to 0,0 origin)
const D20_CLIP_PATH =
  'M 24.97212,2.2158854 L 44.73008,13.5790160 L 44.7683,36.370907 L 25.04858,47.800183 L 5.29113,36.437052 L 5.25293,13.645162 Z';

// Inner line paths extracted from d20_empty.svg
const D20_LINES = [
  'M 5.2602095,36.37381 13.43033,32.51259 5.4580595,13.805657 24.95802,12.590934',
  'm 24.94163,2.2547786 0.039,10.3457574 19.61249,1.188732 -8.33121,18.723322',
  'M 44.71181,36.37381 36.31785,32.51259 25.01398,47.677673 13.43033,32.68047',
];

// Center triangle needs its transform applied separately
const D20_CENTER_TRIANGLE = {
  d: 'm 325.02378,40.215497 -12.6035,-21.555749 24.96958,-0.137073 z',
  transform:
    'matrix(0.45625706,0.80018886,-0.80018886,0.45625706,-102.67002,-245.86572)',
};

export default function DiceView({ setId, size = 200 }) {
  const [skinData, setSkinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSkin() {
      try {
        setLoading(true);
        console.log('Loading skin for setId:', setId);

        const skin = await getSkinBySetId(setId);
        console.log('Skin query result:', JSON.stringify(skin));

        if (!skin) throw new Error('Skin not found');

        const assets = SKIN_ASSETS[skin.skin_folder];
        console.log('skin_folder value:', skin.skin_folder);
        console.log('Assets found:', JSON.stringify(assets));

        if (!assets) throw new Error(`No assets for folder: ${skin.skin_folder}`);

        setSkinData({
          texture: assets.texture,
          fillColor: skin.skin_fill_color ?? '#e0e0e0',
          edgeColor: skin.skin_edge_color ?? '#000000',
          skinName: skin.skin_name,
        });

        console.log('skinData set successfully');
      } catch (err) {
        console.log('ERROR in loadSkin:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadSkin();
  }, [setId]);

  if (loading) {
    return (
      <View
        style={{
          width: size,
          height: size,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !skinData) {
    return null;
  }

  const clipId = `d20-clip-${setId}`;
  const patternId = `d20-texture-${setId}`;

  return (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Defs>
        <ClipPath id={clipId}>
          <Path d={D20_CLIP_PATH} />
        </ClipPath>

        <Pattern
          id={patternId}
          patternUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="50"
          height="50">
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

      <Rect
        x="0"
        y="0"
        width="50"
        height="50"
        fill={`url(#${patternId})`}
        clipPath={`url(#${clipId})`}
      />

      <Path d={D20_CLIP_PATH} fill={skinData.fillColor} fillOpacity={0.2} />

      <Path
        d={D20_CLIP_PATH}
        fill="none"
        stroke={skinData.edgeColor}
        strokeWidth={0.63}
      />

      {D20_LINES.map((d, i) => (
        <Path
          key={i}
          d={d}
          fill="none"
          stroke={skinData.edgeColor}
          strokeWidth={0.63}
        />
      ))}

      <Path
        d={D20_CENTER_TRIANGLE.d}
        fill="none"
        stroke={skinData.edgeColor}
        strokeWidth={0.63}
        transform={D20_CENTER_TRIANGLE.transform}
      />
    </Svg>
  );
}
