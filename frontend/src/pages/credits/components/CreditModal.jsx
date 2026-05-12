import { useState, useEffect, useCallback } from "react";
import styles from "./CreditModal.module.css";

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const SaveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);
const CoinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </svg>
);

const STATUT_OPTIONS = [
  { value: "en_attente", label: "En attente" },
  { value: "actif",      label: "Actif"      },
  { value: "en_retard",  label: "En retard"  },
  { value: "impaye",     label: "Impayé"     },
  { value: "solde",      label: "Soldé"      },
  { value: "annule",     label: "Annulé"     },
];

const EMPTY_FORM = {
  client_id:     "",
  document_id:   "",
  numero_credit: "",
  montant_total: "",
  montant_paye:  "0",
  date_debut:    new Date().toISOString().split("T")[0],
  date_echeance: "",
  statut:        "en_attente",
};

const fmt = (val) =>
  Number(val || 0).toLocaleString("fr-FR", { style: "currency", currency: "MAD" });

export default function CreditModal({
  mode         = "create",
  initialData  = null,
  clients      = [],
  numeroPreview = "",
  onClose,
  onSubmit,
  onPaiement,
  loading      = false,
  paiementLoading = false,
}) {
  const isView  = mode === "view";
  const isEdit  = mode === "edit";
  const title   = mode === "create" ? "Nouveau crédit"
                : mode === "edit"   ? "Modifier le crédit"
                :                     "Détails du crédit";

  const [form,          setForm]         = useState(EMPTY_FORM);
  const [errors,        setErrors]       = useState({});
  const [paiementForm,  setPaiementForm] = useState({ montant: "", show: false });

  // ─── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialData) {
      setForm({
        ...EMPTY_FORM,
        ...initialData,
        client_id:   initialData.client?.id ?? initialData.client_id ?? "",
        date_debut:  initialData.date_debut?.split("T")[0]   || initialData.date_debut   || "",
        date_echeance: initialData.date_echeance?.split("T")[0] || initialData.date_echeance || "",
      });
    } else {
      setForm({ ...EMPTY_FORM, numero_credit: numeroPreview });
    }
    setErrors({});
    setPaiementForm({ montant: "", show: false });
  }, [initialData, numeroPreview]);

  // ─── Escape ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  }, [errors]);

  const reste = Math.max(0,
    (parseFloat(form.montant_total) || 0) - (parseFloat(form.montant_paye) || 0)
  );

  // ─── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.client_id)                            errs.client_id     = "Le client est obligatoire";
    if (!form.montant_total || Number(form.montant_total) <= 0)
                                                    errs.montant_total = "Montant obligatoire et > 0";
    if (!form.date_debut)                           errs.date_debut    = "Date de début obligatoire";
    if (!form.date_echeance)                        errs.date_echeance = "Date d'échéance obligatoire";
    if (form.date_echeance && form.date_debut && form.date_echeance < form.date_debut)
                                                    errs.date_echeance = "Doit être après la date de début";
    if (form.montant_paye && Number(form.montant_paye) > Number(form.montant_total))
                                                    errs.montant_paye  = "Ne peut pas dépasser le montant total";
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit(form);
  };

  const handlePaiementSubmit = () => {
    const montant = parseFloat(paiementForm.montant);
    if (!montant || montant <= 0)    { setPaiementForm((p) => ({ ...p, erreur: "Montant invalide" })); return; }
    if (montant > reste)             { setPaiementForm((p) => ({ ...p, erreur: `Max : ${fmt(reste)}` })); return; }
    onPaiement(montant);
    setPaiementForm({ montant: "", show: false });
  };

  // ─── View helpers ──────────────────────────────────────────────────────────
  const ViewValue = ({ children }) => (
    <div className={styles.viewValue}>
      {children ?? <span className={styles.viewEmpty}>—</span>}
    </div>
  );

  const statutMeta = {
    en_attente: { color: "purple", label: "En attente" },
    actif:      { color: "accent", label: "Actif"      },
    en_retard:  { color: "amber",  label: "En retard"  },
    impaye:     { color: "red",    label: "Impayé"     },
    solde:      { color: "green",  label: "Soldé"      },
    annule:     { color: "red",    label: "Annulé"     },
  };
  const meta = statutMeta[form.statut] || { color: "accent", label: form.statut };

  return (
    <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={`${styles.modeBadge} ${styles[`modeBadge--${mode}`]}`}>
              {mode === "create" ? "NOUVEAU" : mode === "edit" ? "MODIFIER" : "VUE"}
            </div>
            <h2 className={styles.title}>{title}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><XIcon /></button>
        </div>

        {/* Body */}
        <div className={styles.body}>

          {/* ── Résumé financier (view) ──────────────────────────────────── */}
          {isView && (
            <div className={styles.financialSummary}>
              <div className={styles.finItem}>
                <span className={styles.finLabel}>Total</span>
                <span className={styles.finValue}>{fmt(form.montant_total)}</span>
              </div>
              <div className={styles.finDivider} />
              <div className={styles.finItem}>
                <span className={styles.finLabel}>Payé</span>
                <span className={`${styles.finValue} ${styles.finGreen}`}>{fmt(form.montant_paye)}</span>
              </div>
              <div className={styles.finDivider} />
              <div className={styles.finItem}>
                <span className={styles.finLabel}>Reste</span>
                <span className={`${styles.finValue} ${reste > 0 ? styles.finRed : styles.finGreen}`}>
                  {fmt(reste)}
                </span>
              </div>
              <div className={styles.finDivider} />
              <div className={styles.finItem}>
                <span className={styles.finLabel}>Statut</span>
                <span className={`${styles.statutBadge} ${styles[`statut--${meta.color}`]}`}>
                  <span className={styles.dot} />{meta.label}
                </span>
              </div>
            </div>
          )}

          {/* ── Paiement partiel (view + reste > 0) ─────────────────────── */}
          {isView && reste > 0 && (
            <div className={styles.paiementSection}>
              {!paiementForm.show ? (
                <button
                  className={styles.paiementBtn}
                  onClick={() => setPaiementForm((p) => ({ ...p, show: true }))}
                >
                  <CoinIcon /> Enregistrer un paiement
                </button>
              ) : (
                <div className={styles.paiementForm}>
                  <span className={styles.paiementLabel}>Montant à payer (max {fmt(reste)})</span>
                  <div className={styles.paiementInputRow}>
                    <div className={styles.inputWithAddon}>
                      <span className={styles.inputAddon}>MAD</span>
                      <input
                        type="number"
                        min="0.01"
                        max={reste}
                        step="0.01"
                        className={`${styles.input} ${styles.inputAddonned}`}
                        value={paiementForm.montant}
                        placeholder="0.00"
                        onChange={(e) => setPaiementForm((p) => ({ ...p, montant: e.target.value, erreur: null }))}
                      />
                    </div>
                    <button
                      className={styles.paiementConfirmBtn}
                      onClick={handlePaiementSubmit}
                      disabled={paiementLoading}
                    >
                      {paiementLoading ? "…" : "Confirmer"}
                    </button>
                    <button
                      className={styles.paiementCancelBtn}
                      onClick={() => setPaiementForm({ montant: "", show: false })}
                    >
                      Annuler
                    </button>
                  </div>
                  {paiementForm.erreur && <span className={styles.errorMsg}>{paiementForm.erreur}</span>}
                </div>
              )}
            </div>
          )}

          {/* ── Section Identification ───────────────────────────────────── */}
          <div className={styles.sectionTitle}>Identification</div>
          <div className={styles.grid2}>

            {/* Numéro crédit */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>N° Crédit</label>
              {isView || isEdit ? (
                <ViewValue>
                  <code className={styles.monoCode}>{form.numero_credit || "—"}</code>
                </ViewValue>
              ) : (
                <div className={styles.inputWithAddon}>
                  <span className={styles.inputAddon}>#</span>
                  <input
                    type="text"
                    className={`${styles.input} ${styles.inputAddonned}`}
                    value={form.numero_credit || ""}
                    placeholder="Auto-généré…"
                    readOnly
                  />
                </div>
              )}
            </div>

            {/* Client */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="client">Client *</label>
              {isView ? (
                <ViewValue>{form.client?.nom_complet || clients.find((c) => c.id === Number(form.client_id))?.nom_complet}</ViewValue>
              ) : (
                <>
                  <select
                    id="client"
                    className={`${styles.input} ${errors.client_id ? styles.inputError : ""}`}
                    value={form.client_id || ""}
                    onChange={(e) => handleChange("client_id", e.target.value)}
                  >
                    <option value="">Sélectionner un client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.nom_complet}</option>
                    ))}
                  </select>
                  {errors.client_id && <span className={styles.errorMsg}>{errors.client_id}</span>}
                </>
              )}
            </div>

            {/* Statut — seulement en edit/view */}
            {(isEdit || isView) && (
              <div className={`${styles.fieldGroup} ${styles.colSpan2}`}>
                <label className={styles.label}>Statut</label>
                {isView ? (
                  <span className={`${styles.statutBadge} ${styles[`statut--${meta.color}`]}`}>
                    <span className={styles.dot} />{meta.label}
                  </span>
                ) : (
                  <select
                    className={styles.input}
                    value={form.statut || "en_attente"}
                    onChange={(e) => handleChange("statut", e.target.value)}
                  >
                    {STATUT_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

          </div>

          {/* ── Section Montants ─────────────────────────────────────────── */}
          {!isView && (
            <>
              <div className={styles.sectionTitle}>Montants</div>
              <div className={styles.grid2}>

                {/* Montant total */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="montant_total">Montant total *</label>
                  <div className={styles.inputWithAddon}>
                    <span className={styles.inputAddon}>MAD</span>
                    <input
                      id="montant_total"
                      type="number" min="0" step="0.01"
                      className={`${styles.input} ${styles.inputAddonned} ${errors.montant_total ? styles.inputError : ""}`}
                      value={form.montant_total || ""}
                      placeholder="0.00"
                      onChange={(e) => handleChange("montant_total", e.target.value)}
                    />
                  </div>
                  {errors.montant_total && <span className={styles.errorMsg}>{errors.montant_total}</span>}
                </div>

                {/* Montant payé */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="montant_paye">Montant payé</label>
                  <div className={styles.inputWithAddon}>
                    <span className={styles.inputAddon}>MAD</span>
                    <input
                      id="montant_paye"
                      type="number" min="0" step="0.01"
                      className={`${styles.input} ${styles.inputAddonned} ${errors.montant_paye ? styles.inputError : ""}`}
                      value={form.montant_paye || ""}
                      placeholder="0.00"
                      onChange={(e) => handleChange("montant_paye", e.target.value)}
                    />
                  </div>
                  {errors.montant_paye && <span className={styles.errorMsg}>{errors.montant_paye}</span>}
                </div>

                {/* Reste calculé */}
                {(form.montant_total || form.montant_paye) && (
                  <div className={`${styles.fieldGroup} ${styles.colSpan2}`}>
                    <span className={styles.label}>Reste (calculé automatiquement)</span>
                    <div className={`${styles.viewValue} ${reste > 0 ? styles.viewValueRed : styles.viewValueGreen}`}>
                      {fmt(reste)}
                    </div>
                  </div>
                )}

              </div>
            </>
          )}

          {/* ── Section Dates ─────────────────────────────────────────────── */}
          <div className={styles.sectionTitle}>Dates</div>
          <div className={styles.grid2}>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="date_debut">Date de début *</label>
              {isView ? (
                <ViewValue>
                  {form.date_debut
                    ? new Date(form.date_debut).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
                    : null}
                </ViewValue>
              ) : (
                <>
                  <input
                    id="date_debut"
                    type="date"
                    className={`${styles.input} ${errors.date_debut ? styles.inputError : ""}`}
                    value={form.date_debut || ""}
                    onChange={(e) => handleChange("date_debut", e.target.value)}
                  />
                  {errors.date_debut && <span className={styles.errorMsg}>{errors.date_debut}</span>}
                </>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="date_echeance">Date d'échéance *</label>
              {isView ? (
                <ViewValue>
                  {form.date_echeance ? (
                    <span className={
                      new Date(form.date_echeance) < new Date() && form.statut !== "solde"
                        ? styles.dateOverdue
                        : ""
                    }>
                      {new Date(form.date_echeance).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  ) : null}
                </ViewValue>
              ) : (
                <>
                  <input
                    id="date_echeance"
                    type="date"
                    className={`${styles.input} ${errors.date_echeance ? styles.inputError : ""}`}
                    value={form.date_echeance || ""}
                    min={form.date_debut || undefined}
                    onChange={(e) => handleChange("date_echeance", e.target.value)}
                  />
                  {errors.date_echeance && <span className={styles.errorMsg}>{errors.date_echeance}</span>}
                </>
              )}
            </div>

          </div>

        </div>{/* /body */}

        {/* Footer */}
        {!isView && (
          <div className={styles.footer}>
            <button className={styles.cancelBtn} type="button" onClick={onClose}>Annuler</button>
            <button className={styles.submitBtn} type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : <SaveIcon />}
              {loading ? "Enregistrement…" : mode === "create" ? "Créer le crédit" : "Enregistrer"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}