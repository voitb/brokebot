import { useSearchParams } from "react-router-dom";
import { MODAL_REGISTRY } from "./modal-registry";

export function ModalRoot() {
  const [searchParams, setSearchParams] = useSearchParams();

  const modalParam = searchParams.get("modal");
  const modalType = modalParam && modalParam in MODAL_REGISTRY ? modalParam : null;
  const props = Object.fromEntries(searchParams.entries());

  if (!modalType) {
    return null;
  }

  const ModalComponent = MODAL_REGISTRY[modalType];

  if (!ModalComponent) {
    return null;
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearchParams((prev) => {
        prev.delete("modal");
        if (modalType === "settings") {
          prev.delete("status");
          prev.delete("session_id");
          prev.delete("tab");
        } else {
          Object.keys(props).forEach((key) => {
            if (key !== "modal") {
              prev.delete(key);
            }
          });
        }
        return prev;
      });
    }
  };

  return (
    <ModalComponent
      open={true}
      onOpenChange={handleOpenChange}
      {...props}
    />
  );
} 