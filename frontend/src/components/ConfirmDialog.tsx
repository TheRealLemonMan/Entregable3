import { useEffect, useRef, useState } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  const [visible, setVisible] = useState(open);
  const [closing, setClosing] = useState(false);
  const [busy, setBusy] = useState(false);
  const cancelButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
      return;
    }
    if (!visible) return;
    setClosing(true);
    const timeout = window.setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 180);
    return () => window.clearTimeout(timeout);
  }, [open, visible]);

  useEffect(() => {
    if (!visible || closing) return;
    cancelButton.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, closing, busy, onCancel]);

  if (!visible) return null;

  async function confirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`confirm-backdrop ${closing ? "is-closing" : ""}`} onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) onCancel();
    }}>
      <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description">
        <span className="eyebrow">CONFIRMAR ACCIÓN</span>
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-description">{description}</p>
        <div className="confirm-actions">
          <button ref={cancelButton} className="button button-ghost" type="button" disabled={busy} onClick={onCancel}>Cancelar</button>
          <button className="button button-danger" type="button" disabled={busy} onClick={() => void confirm()}>{busy ? "Procesando..." : confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}
