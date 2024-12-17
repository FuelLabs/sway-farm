export const UnsupportedWalletsNoticeModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "400px",
          width: "90%",
          position: "relative",
        }}
      >
        <div
          style={{ fontWeight: "bold", marginBottom: "15px", fontSize: "16px" }}
        >
          Wallet Support Notice
        </div>
        <div style={{ fontSize: "14px" }}>
          Note: Gasless transactions are currently only supported for the Burner
          wallet & Fuelet.
          <br />
          <br />
          Support for other wallets is coming soon. If you use these other
          wallets, you can still play the game, but you will need to pay gas
          fees yourself.
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: "20px",
            padding: "8px 16px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
            cursor: "pointer",
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};
