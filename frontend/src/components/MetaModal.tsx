import { FormEvent, useEffect, useRef, useState } from "react";
import { ErrorMessage } from "./Feedback";
import { createMeta, desactivarMeta, updateMeta } from "../services/metasApi";
import { HitoInput, Meta, MetaInput } from "../types";

interface MetaModalProps {
  open: boolean;
  videojuegoId: string;
  metaActual: Meta | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onDesactivada: () => Promise<void>;
}

export function MetaModal({
  open,
  videojuegoId,
  metaActual,
  onClose,
  onSaved,
  onDesactivada,
}: MetaModalProps) {
  const [horasSemana, setHorasSemana] = useState(5);
  const [diasSemana, setDiasSemana] = useState(4);
  const [hitos, setHitos] = useState<HitoInput[]>([]);
  const [nuevoHitoNombre, setNuevoHitoNombre] = useState("");
  const [nuevoHitoHoras, setNuevoHitoHoras] = useState(10);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [desactivando, setDesactivando] = useState(false);

  const horasInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setError("");
      if (metaActual) {
        setHorasSemana(metaActual.horasSemanaDeseadas);
        setDiasSemana(metaActual.diasSemanaDeseados);
        setHitos(
          metaActual.hitos
            ? metaActual.hitos.map((h) => ({
                nombre: h.nombre,
                horasRequeridas: h.horasRequeridas,
              }))
            : [],
        );
      } else {
        setHorasSemana(5);
        setDiasSemana(4);
        setHitos([]);
      }
      setNuevoHitoNombre("");
      setNuevoHitoHoras(10);
      setTimeout(() => horasInputRef.current?.focus(), 50);
    }
  }, [open, metaActual]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !guardando && !desactivando) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, guardando, desactivando, onClose]);

  if (!open) return null;

  function agregarHito() {
    setError("");
    const nombre = nuevoHitoNombre.trim();
    if (!nombre) {
      setError("El nombre del hito es obligatorio.");
      return;
    }
    if (hitos.length >= 5) {
      setError("No puedes añadir más de 5 hitos por meta.");
      return;
    }
    if (nuevoHitoHoras < 1 || nuevoHitoHoras > 100) {
      setError("Las horas del hito deben estar entre 1 y 100.");
      return;
    }
    if (hitos.some((h) => h.horasRequeridas === nuevoHitoHoras)) {
      setError("Ya existe un hito con ese mismo objetivo de horas.");
      return;
    }

    setHitos([...hitos, { nombre, horasRequeridas: nuevoHitoHoras }]);
    setNuevoHitoNombre("");
    setNuevoHitoHoras(Math.min(100, nuevoHitoHoras + 10));
  }

  function eliminarHito(index: number) {
    setHitos(hitos.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (horasSemana <= 0 || horasSemana > 100) {
      setError("Las horas semanales deben ser mayores a 0 y hasta 100.");
      return;
    }
    if (diasSemana < 1 || diasSemana > 7) {
      setError("Los días semanales deben estar entre 1 y 7.");
      return;
    }

    setGuardando(true);
    try {
      const datos: MetaInput = {
        videojuego: videojuegoId,
        horasSemanaDeseadas: horasSemana,
        diasSemanaDeseados: diasSemana,
        hitos,
        activa: true,
      };

      if (metaActual) {
        await updateMeta(metaActual._id, datos);
      } else {
        await createMeta(datos);
      }

      await onSaved();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Error al guardar la meta.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleDesactivar() {
    if (!metaActual) return;
    setError("");
    setDesactivando(true);
    try {
      await desactivarMeta(metaActual._id);
      await onDesactivada();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Error al desactivar la meta.");
    } finally {
      setDesactivando(false);
    }
  }

  return (
    <div
      className="confirm-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !guardando && !desactivando) {
          onClose();
        }
      }}
    >
      <section
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="meta-modal-title"
        style={{ width: "min(100%, 540px)", maxHeight: "90vh", overflowY: "auto" }}
      >
        <span className="eyebrow">CONFIGURACIÓN</span>
        <h2 id="meta-modal-title">
          {metaActual ? "Editar meta semanal" : "Nueva meta semanal"}
          <span className="title-dot">.</span>
        </h2>
        <p style={{ margin: "4px 0 16px", color: "var(--muted)", fontSize: "12px" }}>
          Establece tu compromiso semanal de tiempo e hitos acumulados para este título.
        </p>

        {error && <ErrorMessage message={error} />}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <label className="field">
              Horas semanales deseadas
              <input
                ref={horasInputRef}
                type="number"
                min="0.5"
                max="100"
                step="0.5"
                required
                value={horasSemana}
                onChange={(e) => setHorasSemana(Number(e.target.value))}
              />
              <small>Entre 0.5 y 100 horas</small>
            </label>

            <label className="field">
              Días por semana deseados
              <input
                type="number"
                min="1"
                max="7"
                step="1"
                required
                value={diasSemana}
                onChange={(e) => setDiasSemana(Number(e.target.value))}
              />
              <small>Entre 1 y 7 días</small>
            </label>
          </div>

          <div className="field">
            <span className="field-label">
              Hitos de dedicación acumulada <small>MÁXIMO 5</small>
            </span>

            {hitos.length > 0 && (
              <ul className="initial-achievements" style={{ marginBottom: "10px" }}>
                {hitos.map((hito, idx) => (
                  <li key={`${hito.horasRequeridas}-${idx}`}>
                    <span>
                      <strong>{hito.nombre}</strong> ({hito.horasRequeridas}h)
                    </span>
                    <button
                      type="button"
                      aria-label={`Quitar hito ${hito.nombre}`}
                      onClick={() => eliminarHito(idx)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {hitos.length < 5 && (
              <div
                style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "flex-end" }}
              >
                <input
                  style={{ flex: 2, minWidth: "140px" }}
                  placeholder="Ej. Mitad de campaña"
                  maxLength={50}
                  value={nuevoHitoNombre}
                  onChange={(e) => setNuevoHitoNombre(e.target.value)}
                />
                <input
                  style={{ flex: 1, minWidth: "90px" }}
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  placeholder="Horas"
                  value={nuevoHitoHoras}
                  onChange={(e) => setNuevoHitoHoras(Number(e.target.value))}
                />
                <button
                  type="button"
                  className="button button-secondary button-small"
                  onClick={agregarHito}
                  disabled={!nuevoHitoNombre.trim()}
                >
                  ＋ Añadir
                </button>
              </div>
            )}
          </div>

          <div
            className="confirm-actions"
            style={{ marginTop: "12px", borderTop: "1px solid var(--line)", paddingTop: "16px" }}
          >
            {metaActual && metaActual.activa && (
              <button
                type="button"
                className="button button-ghost danger-text"
                style={{ marginRight: "auto" }}
                disabled={guardando || desactivando}
                onClick={handleDesactivar}
              >
                {desactivando ? "Desactivando..." : "Desactivar meta"}
              </button>
            )}
            <button
              type="button"
              className="button button-ghost"
              disabled={guardando || desactivando}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={guardando || desactivando}
            >
              {guardando ? "Guardando..." : metaActual ? "Guardar cambios" : "Crear meta"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
