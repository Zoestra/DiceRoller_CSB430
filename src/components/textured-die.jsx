import Svg, { Defs, Pattern, Image, Rect } from 'react-native-svg';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { getSkinBySetID } from '@/db/skins';

const SKIN_ASSETS = {
  classic: {
    texture: require('assets/images/Skin_Textures/classic.png'),
    svg: require('assets/images/Dice_Blanks/d20.svg'),
  },
};

export default function DiceView({ setId, size = 50 }) {
  const [skinAssets, setSkinAssets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSkin() {
      try {
        setLoading(true);
        const skin = await getSkinBySetID(setId);

        if (!skin) throw new Error('Skin not found');

        const assets = SKIN_ASSETS[skin.skin_folder];
        if (!assets) throw new Error(`No assets for folder: ${skin.skin_folder}`);

        setSkinAssets({ ...assets, skinName: skin.skin_name });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadSkin();
  }, [setId]);

  if (loading) {
    return (
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !skinAssets) {
    return null;
  }

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <Pattern
          id={`texture-${setId}`}
          patternUnits="userSpaceOnUse"
          width={size}
          height={size}
        >
          <Image
            href={skinAssets.texture}
            x="0"
            y="0"
            width={size}
            height={size}
            preserveAspectRatio="xMidYMid slice"
          />
        </Pattern>
      </Defs>
      <Rect
        width={size}
        height={size}
        rx="20"
        fill={`url(#texture-${setId})`}
      />
    </Svg>
  );
}