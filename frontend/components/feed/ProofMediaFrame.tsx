import { useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  View,
  Image,
  type NativeSyntheticEvent,
  type ImageLoadEventData,
} from 'react-native';
import { styles } from './BetCard.styles';

/** width / height — evita cards gigantes ou faixas minúsculas */
const ASPECT_MIN = 0.5;
const ASPECT_MAX = 2.25;

function clampAspect(width: number, height: number): number {
  if (width <= 0 || height <= 0) return 3 / 4;
  const r = width / height;
  return Math.min(Math.max(r, ASPECT_MIN), ASPECT_MAX);
}

interface ProofMediaFrameProps {
  uri: string;
  backgroundColor: string;
  marginTop?: number;
  isVideo?: boolean;
  overlay?: ReactNode;
}

export function ProofMediaFrame({
  uri,
  backgroundColor,
  marginTop,
  isVideo,
  overlay,
}: ProofMediaFrameProps) {
  const defaultAspect = isVideo ? 16 / 9 : 3 / 4;
  const [aspectRatio, setAspectRatio] = useState(defaultAspect);

  useEffect(() => {
    setAspectRatio(defaultAspect);
  }, [uri, defaultAspect]);

  /** `nativeEvent.source` com width/height nem sempre existe (web, vídeo, algumas URIs). */
  const applyAspectFromDimensions = useCallback((width: number, height: number) => {
    if (width > 0 && height > 0) {
      setAspectRatio(clampAspect(width, height));
    }
  }, []);

  useEffect(() => {
    Image.getSize(
      uri,
      (w, h) => applyAspectFromDimensions(w, h),
      () => {},
    );
  }, [uri, applyAspectFromDimensions]);

  const onLoad = useCallback(
    (e: NativeSyntheticEvent<ImageLoadEventData>) => {
      const src = e.nativeEvent?.source;
      const width = src?.width;
      const height = src?.height;
      if (width != null && height != null && width > 0 && height > 0) {
        applyAspectFromDimensions(width, height);
      }
    },
    [applyAspectFromDimensions],
  );

  return (
    <View
      style={[
        styles.proofMediaPlaceholder,
        { backgroundColor, marginTop, aspectRatio },
      ]}
    >
      <Image
        source={{ uri }}
        style={styles.proofImage}
        resizeMode="cover"
        onLoad={onLoad}
      />
      {overlay}
    </View>
  );
}
