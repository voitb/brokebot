import { useSearchParams } from "react-router-dom";
import { MODAL_REGISTRY } from "./modal-registry";

export function ModalRoot() {
  const [searchParams, setSearchParams] = useSearchParams();

  const modalParam = searchParams.get("modal");
  const modalType =
    modalParam && Object.hasOwn(MODAL_REGISTRY, modalParam) ? modalParam : null;

  if (!modalType) {
    return null;
  }

  const ModalComponent = MODAL_REGISTRY[modalType];

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearchParams((prev) => {
        prev.delete("modal");
        if (modalType === "settings") {
          prev.delete("tab");
        } else {
          for (const key of [...prev.keys()]) {
            prev.delete(key);
          }
        }
        return prev;
      });
    }
  };

  return <ModalComponent open={true} onOpenChange={handleOpenChange} />;
}
