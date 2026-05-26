import { Composition } from "remotion";
import { BorealisPitch, type BorealisPitchProps } from "./BorealisPitch";
import { pitchDefaults } from "./pitchData";

export const RemotionRoot = () => {
  return (
    <Composition
      id="BorealisPitch"
      component={BorealisPitch}
      durationInFrames={4320}
      fps={24}
      width={1920}
      height={1080}
      defaultProps={pitchDefaults satisfies BorealisPitchProps}
    />
  );
};
