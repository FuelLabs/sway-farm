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
        backgroundColor: "rgba(0, 0, 0, 0.7)",
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
          backgroundColor: "rgb(18, 18, 18)",
          padding: "30px",
          borderRadius: "8px",
          maxWidth: "400px",
          width: "90%",
          position: "relative",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            marginBottom: "15px",
            fontSize: "18px",
            color: "green",
          }}
        >
          Wallet Support Notice
        </div>
        <div style={{ fontSize: "14px", color: "white", marginTop: "10px" }}>
          Note: Gasless transactions are currently only supported for the Burner
          wallet & Fuelet Wallet.
          <br />
          <br />
          Support for other wallets is coming soon. If you use these other
          wallets, you can still play the game by paying gas fees yourself.
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: "20px",
            padding: "8px 16px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#102a9e",
            color: "#d0cdcd",
            cursor: "pointer",
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};
