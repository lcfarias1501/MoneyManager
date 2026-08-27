import { Button } from "./button";

/** Standard modal footer: stacked full-width buttons on mobile, inline on sm+. */
export function FormActions({
  onCancel,
  submitLabel,
  cancelLabel = "Cancelar",
}: {
  onCancel: () => void;
  submitLabel: React.ReactNode;
  cancelLabel?: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
      <Button
        type="button"
        variant="ghost"
        onClick={onCancel}
        className="w-full justify-center sm:w-auto"
      >
        {cancelLabel}
      </Button>
      <Button type="submit" className="w-full justify-center sm:w-auto">
        {submitLabel}
      </Button>
    </div>
  );
}
