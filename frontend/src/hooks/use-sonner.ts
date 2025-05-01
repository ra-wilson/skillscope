
import { toast as sonnerToast } from "sonner";

type ToastType = "default" | "success" | "info" | "warning" | "error" | "destructive";

export function useToaster() {
  const toast = ({
    title,
    description,
    variant = "default"
  }: {
    title?: string;
    description?: string;
    variant?: ToastType;
  }) => {
    if (variant === "destructive" || variant === "error") {
      return sonnerToast.error(title, {
        description
      });
    }

    if (variant === "success") {
      return sonnerToast.success(title, {
        description
      });
    }

    return sonnerToast(title, {
      description
    });
  };

  return { toast };
}