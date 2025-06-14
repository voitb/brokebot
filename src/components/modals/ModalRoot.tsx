import { useSearchParams } from "react-router-dom";
import { MODAL_REGISTRY, type ModalType } from "./modal-registry";

export function ModalRoot() {
  const [searchParams, setSearchParams] = useSearchParams();

  const modalType = searchParams.get("modal") as ModalType | null;
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
        // Usuń tylko parametry związane z modalem, ale zachowaj inne
        // Dla settings usuwamy wszystkie parametry modala
        if (modalType === "settings") {
          prev.delete("status");
          prev.delete("session_id");
          prev.delete("tab");
        } else {
          // Dla innych modali usuń wszystkie parametry
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