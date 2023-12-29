import { useEffect } from "react";

const usePreventLongPressMenu = () => {
  useEffect(() => {
    const handleContextMenu = (event: any) => {
      event.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);
};

export default usePreventLongPressMenu;
