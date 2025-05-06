export const UnsupportedWalletsNoticeModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  const styles = {
    modalOverlay: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: "rgb(18, 18, 18)",
      padding: window.innerWidth <= 480 ? "30px 20px" : "50px",
      borderRadius: "8px",
      maxWidth: "500px",
      width: "90%",
      position: "relative" as const,
    },
    title: {
      fontWeight: "bold",
      marginBottom: window.innerWidth <= 480 ? "25px" : "35px",
      fontSize: window.innerWidth <= 480 ? "20px" : "26px",
      color: "green",
      lineHeight: "1.5",
    },
    text: {
      fontSize: window.innerWidth <= 480 ? "16px" : "18px",
      color: "white",
      marginTop: window.innerWidth <= 480 ? "14px" : "25px",
      lineHeight: window.innerWidth <= 480 ? "1.6" : "2",
      letterSpacing: window.innerWidth <= 480 ? "0.2px" : "0.4px",
    },
    button: {
      marginTop: window.innerWidth <= 480 ? "30px" : "40px",
      padding: window.innerWidth <= 480 ? "12px 24px" : "14px 28px",
      borderRadius: "4px",
      border: "none",
      backgroundColor: "#102a9e",
      color: "#d0cdcd",
      cursor: "pointer",
      fontSize: window.innerWidth <= 480 ? "16px" : "18px",
    },
  };

  return (
    <div onClick={onClose} style={styles.modalOverlay}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={styles.modalContent}
      >
        <div style={styles.title}>Wallet Support Notice</div>
        <div style={styles.text}>
          Note: Swayfarm with pre-confirmations is only supported for the Burner
          wallet to ensure a smooth experience.
          <br />
          <br />
          Support for other wallets is coming soon.
        </div>
        <button onClick={onClose} style={styles.button}>
          Continue
        </button>
      </div>
    </div>
  );
};
