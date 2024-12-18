export const UnsupportedWalletsNoticeModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
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
          padding: "50px",
          borderRadius: "8px",
          maxWidth: "500px",
          width: "90%",
          position: "relative",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            marginBottom: "35px",
            fontSize: "26px",
            color: "green",
            lineHeight: "1.5",
          }}
        >
          Wallet Support Notice
        </div>
        <div
          style={{
            fontSize: "18px",
            color: "white",
            marginTop: "25px",
            lineHeight: "2",
            letterSpacing: "0.4px",
          }}
        >
          Note: Gasless transactions are currently only supported for the Burner wallet & Fuelet Wallet.
          <br />
          <br />
          Support for other wallets is coming soon. If you use these other wallets, you can still play the game by paying gas fees
          yourself.
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: "40px",
            padding: "14px 28px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#102a9e",
            color: "#d0cdcd",
            cursor: "pointer",
            fontSize: "18px",
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};
