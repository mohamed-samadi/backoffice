import { useEffect, useMemo, useState } from "react";
import { documentsApi } from "../../../../features/documents/api/documentsApi";
import styles from "./DocumentForm.module.css";

const DOCUMENT_TYPES = [
  { value: "facture", label: "Facture" },
  { value: "devis", label: "Devis" },
  { value: "bon_livraison", label: "Bon de livraison" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "payé", label: "Payé" },
  { value: "partiel", label: "Partiel" },
  { value: "impaye", label: "Impayé" },
];

const STATUT_OPTIONS = [
  { value: "brouillon", label: "Brouillon" },
  { value: "envoyé", label: "Envoyé" },
  { value: "accepté", label: "Accepté" },
];

const currency = (value) =>
  Number(value || 0).toLocaleString("fr-FR", {
    style: "currency",
    currency: "MAD",
  });

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toDateInputValue = (value) => {
  if (!value) return "";
  return String(value).split("T")[0];
};

const createEmptyLine = () => ({
  product_id: "",
  description: "",
  quantite: "1",
  prix_unitaire_ht: "",
  remise: "0",
  tva: "20",
  ordre: "0",
});

const createEmptyForm = () => ({
  client_id: "",
  numero: "",
  type: "facture",
  date_creation: toDateInputValue(new Date().toISOString()),
  date_validite: "",
  statut: "brouillon",
  montant_paye: "0",
  statut_paiement: "non_paye",
  lines: [createEmptyLine()],
});

const normalizeLine = (line, index = 0) => ({
  product_id: String(line?.product_id ?? line?.product?.id ?? ""),
  description: line?.description ?? line?.product?.description ?? "",
  quantite: String(line?.quantite ?? "1"),
  prix_unitaire_ht: String(line?.prix_unitaire_ht ?? line?.product?.prix_unitaire_ht ?? ""),
  remise: String(line?.remise ?? "0"),
  tva: String(line?.tva ?? line?.product?.tva ?? "20"),
  ordre: String(line?.ordre ?? index),
});

const normalizeForm = (documentData) => ({
  client_id: String(documentData?.client_id ?? documentData?.client?.id ?? ""),
  numero: documentData?.numero ?? "",
  type: documentData?.type ?? "facture",
  date_creation: toDateInputValue(documentData?.date_creation),
  date_validite: toDateInputValue(documentData?.date_validite),
  statut: documentData?.statut ?? "brouillon",
  montant_paye: String(documentData?.montant_paye ?? "0"),
  statut_paiement: documentData?.statut_paiement ?? "non_paye",
  lines: Array.isArray(documentData?.documentLines || documentData?.document_lines)
    ? (documentData.documentLines || documentData.document_lines).map((line, index) =>
        normalizeLine(line, index)
      )
    : [createEmptyLine()],
});

const getClientLabel = (client) =>
  client?.nom_entreprise || client?.nom_complet || client?.email || client?.telephone || "Client";

const getProductLabel = (product) =>
  product?.nom ? `${product.nom} · ${currency(product.prix_unitaire_ht)}` : "Produit";

const formatPaymentLabel = (value) => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "paye" || normalized === "payé") return "Payé";
  if (normalized === "partiel") return "Partiel";
  if (normalized === "impaye" || normalized === "impayé") return "Impayé";
  return value || "—";
};

export default function DocumentForm({
  mode = "view",
  initialData = null,
  loading = false,
  saving = false,
  onSubmit,
  onCancel,
  onEdit,
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const [form, setForm] = useState(createEmptyForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [generatingNumero, setGeneratingNumero] = useState(false);

  useEffect(() => {
    let active = true;

    const loadReferences = async () => {
      setOptionsLoading(true);

      try {
        const [clientsResponse, productsResponse] = await Promise.all([
          documentsApi.getActiveClients(),
          documentsApi.getSelectableProducts(),
        ]);

        if (!active) return;

        setClients(clientsResponse.data?.data || []);
        setProducts(productsResponse.data?.data || []);
      } catch {
        if (!active) return;
        setClients([]);
        setProducts([]);
      } finally {
        if (active) {
          setOptionsLoading(false);
        }
      }
    };

    loadReferences();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm(normalizeForm(initialData));
    } else {
      setForm(createEmptyForm());
    }
    setErrors({});
    setSubmitError("");
  }, [initialData, mode]);

  // Auto-generate numero when type changes (only for create mode)
  useEffect(() => {
    if (!isEdit && !isView && form.type) {
      const generateNumero = async () => {
        setGeneratingNumero(true);
        try {
          const response = await documentsApi.generateNumero(form.type);
          if (response.data?.sku) {
            setForm((previous) => ({ ...previous, numero: response.data.sku }));
          }
        } catch (error) {
          console.error("Erreur lors de la génération du numéro:", error);
        } finally {
          setGeneratingNumero(false);
        }
      };

      generateNumero();
    }
  }, [form.type, isEdit, isView]);

  const totals = useMemo(() => {
    return form.lines.reduce(
      (accumulator, line) => {
        const quantity = Number(line.quantite || 0);
        const price = Number(line.prix_unitaire_ht || 0);
        const discount = Number(line.remise || 0);
        const tva = Number(line.tva || 0);

        const totalHt = Math.max(quantity * price - discount, 0);
        const totalTva = totalHt * (tva / 100);
        const totalTtc = totalHt + totalTva;

        accumulator.total_ht += totalHt;
        accumulator.total_tva += totalTva;
        accumulator.total_ttc += totalTtc;

        return accumulator;
      },
      {
        total_ht: 0,
        total_tva: 0,
        total_ttc: 0,
      }
    );
  }, [form.lines]);

  const selectedClient = clients.find((client) => String(client.id) === String(form.client_id));

  const handleFieldChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    if (errors[field]) {
      setErrors((previous) => ({ ...previous, [field]: null }));
    }
    setSubmitError("");
  };

  const handleLineChange = (index, field, value) => {
    setForm((previous) => {
      const lines = [...previous.lines];
      const currentLine = { ...lines[index], [field]: value };

      if (field === "product_id") {
        const product = products.find((item) => String(item.id) === String(value));
        if (product) {
          currentLine.prix_unitaire_ht = String(product.prix_unitaire_ht ?? "");
          currentLine.tva = String(product.tva ?? 20);
          if (!currentLine.description) {
            currentLine.description = product.description || product.nom || "";
          }
        }
      }

      lines[index] = currentLine;
      return { ...previous, lines };
    });
    setSubmitError("");
  };

  const addLine = () => {
    setForm((previous) => ({
      ...previous,
      lines: [...previous.lines, createEmptyLine()],
    }));
  };

  const removeLine = (index) => {
    setForm((previous) => {
      const lines = previous.lines.filter((_, currentIndex) => currentIndex !== index);
      return {
        ...previous,
        lines: lines.length > 0 ? lines : [createEmptyLine()],
      };
    });
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.client_id) nextErrors.client_id = "Le client est obligatoire";
    if (!form.numero?.trim()) nextErrors.numero = "Le numéro est obligatoire";
    if (!form.type) nextErrors.type = "Le type est obligatoire";
    if (!form.statut_paiement) nextErrors.statut_paiement = "Le statut de paiement est obligatoire";
    if (!form.lines.length) nextErrors.lines = "Ajoutez au moins une ligne";

    form.lines.forEach((line, index) => {
      if (!line.product_id) nextErrors[`line-${index}-product_id`] = "Sélectionnez un produit";
      if (!line.quantite || Number(line.quantite) <= 0)
        nextErrors[`line-${index}-quantite`] = "Quantité invalide";
      if (line.prix_unitaire_ht === "" || Number(line.prix_unitaire_ht) < 0)
        nextErrors[`line-${index}-prix_unitaire_ht`] = "Prix invalide";
      if (line.tva === "" || Number(line.tva) < 0)
        nextErrors[`line-${index}-tva`] = "TVA invalide";
    });

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      client_id: Number(form.client_id),
      numero: form.numero.trim(),
      type: form.type,
      date_creation: form.date_creation || null,
      date_validite: form.date_validite || null,
      statut: form.statut || null,
      montant_paye: Number(form.montant_paye || 0),
      statut_paiement: form.statut_paiement,
      lines: form.lines.map((line, index) => ({
        product_id: Number(line.product_id),
        description: line.description?.trim() || null,
        quantite: Number(line.quantite || 0),
        prix_unitaire_ht: Number(line.prix_unitaire_ht || 0),
        remise: Number(line.remise || 0),
        tva: Number(line.tva || 0),
        ordre: Number(line.ordre || index),
      })),
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      setSubmitError(error?.message || "Une erreur est survenue pendant l'enregistrement.");
    }
  };

  if (loading && !initialData && !isView) {
    return <div className={styles.loadingState}>Chargement du document…</div>;
  }

  if (isView && !initialData && loading) {
    return <div className={styles.loadingState}>Chargement du document…</div>;
  }

  if (isView && !initialData) {
    return <div className={styles.emptyState}>Document introuvable.</div>;
  }

  if (isView && initialData) {
    const documentLines = initialData.documentLines || initialData.document_lines || [];
    const documentPayments = initialData.payments || [];

    return (
      <div className={styles.viewer}>
        <div className={styles.hero}>
          <div>
            <div className={styles.documentNumber}>{initialData.numero}</div>
            <div className={styles.documentMeta}>{getClientLabel(initialData.client)}</div>
          </div>
          <div className={styles.badges}>
            <span className={styles.typeBadge}>{initialData.type || "—"}</span>
            <span className={styles.statusBadge}>{initialData.statut || "—"}</span>
          </div>
        </div>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Date création</span>
            <strong className={styles.summaryValue}>{formatDate(initialData.date_creation)}</strong>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Date validité</span>
            <strong className={styles.summaryValue}>{formatDate(initialData.date_validite)}</strong>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Montant payé</span>
            <strong className={styles.summaryValue}>{currency(initialData.montant_paye)}</strong>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Statut paiement</span>
            <strong className={styles.summaryValue}>{formatPaymentLabel(initialData.statut_paiement)}</strong>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>HT</span>
            <strong className={styles.summaryValue}>{currency(initialData.total_ht)}</strong>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>TTC</span>
            <strong className={styles.summaryValue}>{currency(initialData.total_ttc)}</strong>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Reste à payer</span>
            <strong className={styles.summaryValue}>{currency(initialData.reste_a_payer)}</strong>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Client</h3>
          <div className={styles.clientCard}>
            <div className={styles.clientAvatar}>
              {(initialData.client?.nom_complet || initialData.client?.nom_entreprise || "C")
                .slice(0, 1)
                .toUpperCase()}
            </div>
            <div className={styles.clientInfo}>
              <div className={styles.clientName}>{getClientLabel(initialData.client)}</div>
              <div className={styles.clientSub}>
                {initialData.client?.email || initialData.client?.telephone || "Client enregistré"}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Lignes</h3>
          {documentLines.length > 0 ? (
            <div className={styles.linesList}>
              {documentLines.map((line) => {
                const lineTotal = Number(line.total_ttc || 0);
                return (
                  <div key={line.id || `${line.product_id}-${line.ordre}`} className={styles.lineItem}>
                    <div className={styles.lineTop}>
                      <div>
                        <div className={styles.lineTitle}>
                          {line.description || line.product?.nom || `Produit #${line.product_id}`}
                        </div>
                        <div className={styles.lineSub}>
                          Qté {line.quantite} · PU {currency(line.prix_unitaire_ht)} · TVA {line.tva ?? 0}%
                        </div>
                      </div>
                      <div className={styles.lineAmount}>{currency(lineTotal)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>Aucune ligne disponible pour ce document.</div>
          )}
        </div>

        <div className={styles.section}>
          <h3>Paiements</h3>
          {documentPayments.length > 0 ? (
            <div className={styles.paymentsList}>
              {documentPayments.map((payment) => (
                <div key={payment.id} className={styles.paymentItem}>
                  <div className={styles.paymentAmount}>{currency(payment.montant)}</div>
                  <div className={styles.paymentMeta}>
                    {formatDate(payment.date_paiement)} · {formatPaymentLabel(payment.statut)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>Aucun paiement associé à ce document.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {submitError && <div className={styles.alert}>{submitError}</div>}

      <div className={styles.formGrid}>
        <section className={styles.sectionCard}>
          <div className={styles.sectionHead}>
            <h3>Informations du document</h3>
            {optionsLoading && <span className={styles.sectionHint}>Chargement des listes…</span>}
          </div>

          <div className={styles.fieldsGrid}>
            <label className={styles.field}>
              <span className={styles.label}>Client</span>
              <select
                className={styles.input}
                value={form.client_id}
                onChange={(event) => handleFieldChange("client_id", event.target.value)}
                disabled={saving || optionsLoading}
              >
                <option value="">Choisir un client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {getClientLabel(client)}
                  </option>
                ))}
              </select>
              {errors.client_id && <span className={styles.error}>{errors.client_id}</span>}
            </label>

          

            <label className={styles.field}>
              <span className={styles.label}>Type</span>
              <select
                className={styles.input}
                value={form.type}
                onChange={(event) => handleFieldChange("type", event.target.value)}
                disabled={saving}
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type && <span className={styles.error}>{errors.type}</span>}
            </label>
            
              <label className={styles.field}>
              <span className={styles.label}>Numéro {generatingNumero && <span className={styles.sectionHint}>(génération...)</span>}</span>
              <input
                className={styles.input}
                type="text"
                value={form.numero}
                onChange={(event) => handleFieldChange("numero", event.target.value)}
                disabled={saving || generatingNumero}
                placeholder={generatingNumero ? "Génération en cours..." : ""}
              />
              {errors.numero && <span className={styles.error}>{errors.numero}</span>}
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Date création</span>
              <input
                className={styles.input}
                type="date"
                value={form.date_creation}
                onChange={(event) => handleFieldChange("date_creation", event.target.value)}
                disabled={saving}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Date validité</span>
              <input
                className={styles.input}
                type="date"
                value={form.date_validite}
                onChange={(event) => handleFieldChange("date_validite", event.target.value)}
                disabled={saving}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Statut</span>
              <select
                className={styles.input}
                value={form.statut}
                onChange={(event) => handleFieldChange("statut", event.target.value)}
                disabled={saving}
              >
                {STATUT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Montant payé</span>
              <input
                className={styles.input}
                type="number"
                min="0"
                step="0.01"
                value={form.montant_paye}
                onChange={(event) => handleFieldChange("montant_paye", event.target.value)}
                disabled={saving}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Statut paiement</span>
              <select
                className={styles.input}
                value={form.statut_paiement}
                onChange={(event) => handleFieldChange("statut_paiement", event.target.value)}
                disabled={saving}
              >
                {PAYMENT_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.statut_paiement && <span className={styles.error}>{errors.statut_paiement}</span>}
            </label>
          </div>
        </section>

        <section className={styles.sectionCard}>
          <div className={styles.sectionHead}>
            <h3>Lignes du document</h3>
            <button type="button" className={styles.secondaryBtn} onClick={addLine} disabled={saving}>
              Ajouter une ligne
            </button>
          </div>

          {errors.lines && <div className={styles.error}>{errors.lines}</div>}

          <div className={styles.linesEditor}>
            {form.lines.map((line, index) => {
              const lineHt = Math.max(Number(line.quantite || 0) * Number(line.prix_unitaire_ht || 0) - Number(line.remise || 0), 0);
              const lineTva = lineHt * (Number(line.tva || 0) / 100);
              const lineTtc = lineHt + lineTva;

              return (
                <article key={`${index}-${line.product_id || "line"}`} className={styles.lineEditorCard}>
                  <div className={styles.lineEditorHead}>
                    <strong>Ligne {index + 1}</strong>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => removeLine(index)}
                      disabled={saving || form.lines.length === 1}
                      aria-label="Supprimer la ligne"
                    >
                      ×
                    </button>
                  </div>

                  <div className={styles.lineFieldsGrid}>
                    <label className={styles.field}>
                      <span className={styles.label}>Produit</span>
                      <select
                        className={styles.input}
                        value={line.product_id}
                        onChange={(event) => handleLineChange(index, "product_id", event.target.value)}
                        disabled={saving || optionsLoading}
                      >
                        <option value="">Choisir un produit</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {getProductLabel(product)}
                          </option>
                        ))}
                      </select>
                      {errors[`line-${index}-product_id`] && (
                        <span className={styles.error}>{errors[`line-${index}-product_id`]}</span>
                      )}
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>Description</span>
                      <input
                        className={styles.input}
                        type="text"
                        value={line.description}
                        onChange={(event) => handleLineChange(index, "description", event.target.value)}
                        disabled={saving}
                      />
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>Quantité</span>
                      <input
                        className={styles.input}
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={line.quantite}
                        onChange={(event) => handleLineChange(index, "quantite", event.target.value)}
                        disabled={saving}
                      />
                      {errors[`line-${index}-quantite`] && (
                        <span className={styles.error}>{errors[`line-${index}-quantite`]}</span>
                      )}
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>Prix HT</span>
                      <input
                        className={styles.input}
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.prix_unitaire_ht}
                        onChange={(event) => handleLineChange(index, "prix_unitaire_ht", event.target.value)}
                        disabled={saving}
                      />
                      {errors[`line-${index}-prix_unitaire_ht`] && (
                        <span className={styles.error}>{errors[`line-${index}-prix_unitaire_ht`]}</span>
                      )}
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>Remise</span>
                      <input
                        className={styles.input}
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.remise}
                        onChange={(event) => handleLineChange(index, "remise", event.target.value)}
                        disabled={saving}
                      />
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>TVA %</span>
                      <input
                        className={styles.input}
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.tva}
                        onChange={(event) => handleLineChange(index, "tva", event.target.value)}
                        disabled={saving}
                      />
                      {errors[`line-${index}-tva`] && (
                        <span className={styles.error}>{errors[`line-${index}-tva`]}</span>
                      )}
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>Ordre</span>
                      <input
                        className={styles.input}
                        type="number"
                        min="0"
                        step="1"
                        value={line.ordre}
                        onChange={(event) => handleLineChange(index, "ordre", event.target.value)}
                        disabled={saving}
                      />
                    </label>

                    <div className={styles.totalPreview}>
                      <span className={styles.totalPreviewLabel}>Total ligne</span>
                      <strong className={styles.totalPreviewValue}>{currency(lineTtc)}</strong>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <section className={styles.summaryBar}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Client</span>
          <strong className={styles.summaryValue}>{selectedClient ? getClientLabel(selectedClient) : "—"}</strong>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total HT</span>
          <strong className={styles.summaryValue}>{currency(totals.total_ht)}</strong>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total TVA</span>
          <strong className={styles.summaryValue}>{currency(totals.total_tva)}</strong>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total TTC</span>
          <strong className={styles.summaryValue}>{currency(totals.total_ttc)}</strong>
        </div>
      </section>

      <div className={styles.actions}>
        <button type="button" className={styles.secondaryBtn} onClick={onCancel} disabled={saving}>
          Annuler
        </button>
        <button type="submit" className={styles.primaryBtn} disabled={saving}>
          {isEdit ? "Mettre à jour" : "Créer le document"}
        </button>
      </div>
    </form>
  );
}