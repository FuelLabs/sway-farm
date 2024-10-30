import { cssObj } from "@fuel-ui/css";
import { BoxCentered, Spinner } from "@fuel-ui/react";

export default function Loading() {
  return (
    <BoxCentered css={styles.loading}>
      <Spinner color="#754a1e" />
    </BoxCentered>
  );
}

const styles = {
  loading: cssObj({
    height: "100%",
  }),
};
