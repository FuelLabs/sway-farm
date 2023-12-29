import { cssObj } from "@fuel-ui/css";
import { Box, Flex } from "@fuel-ui/react";
import { Dispatch, SetStateAction } from "react";
import type { MobileControls } from "./Game";

interface MobileControlsProps {
  setMobileControlState: Dispatch<SetStateAction<MobileControls>>;
}

interface MobileButtonProps {
  direction: MobileControls;
  setMobileControlState: Dispatch<SetStateAction<MobileControls>>;
}

const MobileButton = ({
  direction,
  setMobileControlState,
}: MobileButtonProps) => {
  let degrees = 0;
  if (direction === "left") {
    degrees = -90;
  } else if (direction === "right") {
    degrees = 90;
  } else if (direction === "down") {
    degrees = 180;
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="45"
      height="45"
      viewBox="-41.5 95 165 125"
      style={{ transform: `rotate(${degrees}deg)` }}
      className="mobile-button"
      onTouchStart={() => setMobileControlState(direction)}
      onTouchEnd={() => setMobileControlState("none")}
      onTouchCancel={() => setMobileControlState("none")}
    >
      <path
        d="M 0 100 L 80 100 L 80 180 L 40 230 L 0 180 Z"
        fill="none"
        stroke="#754a1e"
        strokeWidth="10"
      />
      <path
        d="M 15 150 L 40 125 L 65 150 Z"
        fill="none"
        stroke="#754a1e"
        strokeWidth="6"
      />
    </svg>
  );
};

export default function MobileControlButtons({
  setMobileControlState,
}: MobileControlsProps) {
  return (
    <Box css={styles.root}>
      <MobileButton
        aria-label="Arrow Left"
        direction={"left"}
        setMobileControlState={setMobileControlState}
      />
      <Flex direction={"column"} gap={"$3"}>
        <MobileButton
          aria-label="Arrow Up"
          direction={"up"}
          setMobileControlState={setMobileControlState}
        />

        <MobileButton
          aria-label="Arrow Down"
          direction={"down"}
          setMobileControlState={setMobileControlState}
        />
      </Flex>
      <MobileButton
        aria-label="Arrow Right"
        direction={"right"}
        setMobileControlState={setMobileControlState}
      />
    </Box>
  );
}

const styles = {
  root: cssObj({
    position: "fixed",
    bottom: "0",
    left: "0",
    width: "calc(100vw - 5px)",
    height: "100px",
    border: "3px solid #754a1e",
    borderRadius: "8px",
    background: "#ac7339",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }),
};
