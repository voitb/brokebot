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
        // also delete any other params that were passed to the modal
        Object.keys(props).forEach((key) => prev.delete(key));
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