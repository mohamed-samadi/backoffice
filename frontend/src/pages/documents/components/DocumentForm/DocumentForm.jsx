import { useEffect, useMemo, useRef, useState } from "react";
import { documentsApi } from "../../../../features/documents/api/documentsApi";
import styles from "./DocumentForm.module.css";

const DOCUMENT_TYPES = [
  { value: "facture", label: "Facture" },
  { value: "devis", label: "Devis" },
  { value: "bon_livraison", label: "Bon de livraison" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "paye", label: "Payé" },
  { value: "partial", label: "Partiel" },
  { value: "non_paye", label: "Impayé" },
];

const PAYMENT_CONDITIONS_OPTIONS = [
  { value: "comptant", label: "Comptant" },
  { value: "net_7", label: "Net 7 jours" },
  { value: "net_15", label: "Net 15 jours" },
  { value: "net_30", label: "Net 30 jours" },
  { value: "fin_de_mois", label: "Fin de mois" },
];

const STATUT_OPTIONS = [
  { value: "brouillon", label: "Brouillon" },
  { value: "envoyé", label: "Envoyé" },
  { value: "accepté", label: "Accepté" },
];

const DOCUMENT_TYPE_CONFIG = {
  facture: {
    dateCreationLabel: "Date facture",
    secondaryDateField: "date_echeance",
    secondaryDateLabel: "Échéance",
    showSecondaryDate: true,
    showPayment: true,
    showPaymentConditions: true,
    showFinancialLines: true,
    showFinancialSummary: true,
  },
  devis: {
    dateCreationLabel: "Date devis",
    secondaryDateField: "date_validite",
    secondaryDateLabel: "Validité",
    showSecondaryDate: true,
    showPayment: false,
    showPaymentConditions: true,
    showFinancialLines: true,
    showFinancialSummary: true,
  },
  bon_livraison: {
    dateCreationLabel: "Date livraison",
    secondaryDateField: "date_livraison",
    secondaryDateLabel: "Livraison",
    showSecondaryDate: true,
    showPayment: false,
    showPaymentConditions: false,
    showFinancialLines: false,
    showFinancialSummary: false,
  },
};

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

const createEmptyLine = (order = 1) => ({
  product_id: "",
  description: "",
  quantite: "1",
  prix_unitaire_ht: "",
  remise: "0",
  tva: "20",
  ordre: String(order),
});

const createEmptyForm = () => ({
  client_id: "",
  numero: "",
  type: "facture",
  date_creation: toDateInputValue(new Date().toISOString()),
  date_validite: "",
  date_echeance: "",
  date_livraison: "",
  statut: "brouillon",
  montant_paye: "0",
  statut_paiement: "non_paye",
  conditions_paiement: "",
  lines: [createEmptyLine(1)],
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
  date_echeance: toDateInputValue(documentData?.date_echeance),
  date_livraison: toDateInputValue(documentData?.date_livraison),
  statut: documentData?.statut ?? "brouillon",
  montant_paye: String(documentData?.montant_paye ?? "0"),
  statut_paiement: documentData?.statut_paiement ?? "non_paye",
  conditions_paiement: documentData?.conditions_paiement ?? "",
  lines: Array.isArray(documentData?.documentLines || documentData?.document_lines)
    ? (documentData.documentLines || documentData.document_lines).map((line, index) =>
        normalizeLine(line, index)
      )
    : [createEmptyLine(1)],
});

const getClientLabel = (client) =>
  client?.nom_entreprise || client?.nom_complet || client?.email || client?.telephone || "Client";

const getDocumentTypeLabel = (value) =>
  DOCUMENT_TYPES.find((type) => type.value === value)?.label || value || "Document";

const getProductLabel = (product) =>
  product?.nom ? `${product.nom} · ${currency(product.prix_unitaire_ht)}` : "Produit";

const formatPaymentLabel = (value) => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "paye" || normalized === "payé") return "Payé";
  if (normalized === "partiel") return "Partiel";
  if (normalized === "impaye" || normalized === "impayé") return "Impayé";
  return value || "—";
};

const formatPaymentConditionLabel = (value) => {
  const match = PAYMENT_CONDITIONS_OPTIONS.find((option) => option.value === value);
  return match ? match.label : value || "—";
};

const getSecondaryDateInfo = (documentData) => {
  const config = DOCUMENT_TYPE_CONFIG[documentData?.type] || DOCUMENT_TYPE_CONFIG.facture;
  return {
    label: config.secondaryDateLabel || "Date",
    value: documentData?.[config.secondaryDateField],
  };
};

export default function DocumentForm({
  mode = "view",
  initialData = null,
  loading = false,
  saving = false,
  onSubmit,
  onCancel,
  onSuccess,
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const [form, setForm] = useState(createEmptyForm);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [generatingNumero, setGeneratingNumero] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const clientDropdownRef = useRef(null);
  const [productDropdownOpenIndex, setProductDropdownOpenIndex] = useState(null);
  const [productSearchByLine, setProductSearchByLine] = useState({});
  const productDropdownRefs = useRef([]);
  const typeConfig = DOCUMENT_TYPE_CONFIG[form.type] || DOCUMENT_TYPE_CONFIG.facture;
  const showPaymentFields = typeConfig.showPayment;
  const showPaymentConditions = typeConfig.showPaymentConditions;
  const showFinancialLines = typeConfig.showFinancialLines;
  const showFinancialSummary = typeConfig.showFinancialSummary;

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

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (initialData) {
      setForm(normalizeForm(initialData));
    } else {
      setForm(createEmptyForm());
    }
    setErrors({});
    setNotification(null);
  }, [initialData, mode]);

  useEffect(() => {
    const selectedClient = clients.find((client) => String(client.id) === String(form.client_id));
    setClientSearch(selectedClient ? getClientLabel(selectedClient) : "");
  }, [clients, form.client_id]);

  useEffect(() => {
    setProductSearchByLine((previous) => {
      const next = {};
      form.lines.forEach((line, index) => {
        const product = products.find((item) => String(item.id) === String(line.product_id));
        next[index] = product ? getProductLabel(product) : previous[index] || "";
      });
      return next;
    });
  }, [form.lines, products]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target)) {
        setClientDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const activeProductDropdown = productDropdownRefs.current[productDropdownOpenIndex];
      if (activeProductDropdown && !activeProductDropdown.contains(event.target)) {
        setProductDropdownOpenIndex(null);
      }
    };

    if (productDropdownOpenIndex === null) return undefined;

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [productDropdownOpenIndex]);

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
  const filteredClients = useMemo(() => {
    const query = clientSearch.trim().toLowerCase();
    const match = (client) => {
      if (!query) return true;

      return [
        getClientLabel(client),
        client?.email,
        client?.telephone,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    };

    const results = clients.filter(match);
    return query ? results : results.slice(0, 8);
  }, [clients, clientSearch]);

  const handleClientSelect = (client) => {
    setForm((previous) => ({ ...previous, client_id: String(client.id) }));
    setClientSearch(getClientLabel(client));
    setClientDropdownOpen(false);
    if (errors.client_id) {
      setErrors((previous) => ({ ...previous, client_id: null }));
    }
  };

  const handleFieldChange = (field, value) => {
    setForm((previous) => {
      const next = { ...previous, [field]: value };

      if (field === "type") {
        const nextConfig = DOCUMENT_TYPE_CONFIG[value] || DOCUMENT_TYPE_CONFIG.facture;

        next.date_validite = value === "devis" ? previous.date_validite : "";
        next.date_echeance = value === "facture" ? previous.date_echeance : "";
        next.date_livraison = value === "bon_livraison" ? previous.date_livraison : "";

        if (!nextConfig.showPayment) {
          next.montant_paye = "0";
          next.statut_paiement = "non_paye";
        } else if (!next.statut_paiement) {
          next.statut_paiement = "non_paye";
        }

        if (!nextConfig.showPaymentConditions) {
          next.conditions_paiement = "";
        }

        if (!nextConfig.showFinancialLines) {
          next.lines = next.lines.map((line) => ({
            ...line,
            prix_unitaire_ht: "0",
            remise: "0",
            tva: "0",
          }));
        }
      }

      return next;
    });
    if (errors[field]) {
      setErrors((previous) => ({ ...previous, [field]: null }));
    }
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
  };

  const handleProductSelect = (index, product) => {
    setForm((previous) => {
      const lines = [...previous.lines];
      const nextConfig = DOCUMENT_TYPE_CONFIG[previous.type] || DOCUMENT_TYPE_CONFIG.facture;
      lines[index] = {
        ...lines[index],
        product_id: String(product.id),
        prix_unitaire_ht: nextConfig.showFinancialLines ? String(product.prix_unitaire_ht ?? "") : "0",
        remise: nextConfig.showFinancialLines ? lines[index].remise : "0",
        tva: nextConfig.showFinancialLines ? String(product.tva ?? 20) : "0",
        description: lines[index].description || product.description || product.nom || "",
      };
      return { ...previous, lines };
    });
    setProductSearchByLine((previous) => ({
      ...previous,
      [index]: getProductLabel(product),
    }));
    setProductDropdownOpenIndex(null);
    setNotification(null);
  };

  const handleProductSearchChange = (index, value) => {
    setProductSearchByLine((previous) => ({ ...previous, [index]: value }));
    if (productDropdownOpenIndex !== index) {
      setProductDropdownOpenIndex(index);
    }
  };

  const getFilteredProducts = (index) => {
    const query = String(productSearchByLine[index] || "").trim().toLowerCase();
    const selectedProductIds = new Set(
      form.lines
        .map((line, currentIndex) => (currentIndex === index ? null : String(line.product_id || "")))
        .filter(Boolean)
    );

    const results = products.filter((product) => {
      if (selectedProductIds.has(String(product.id))) {
        return false;
      }

      if (!query) return true;

      return [
        product?.nom,
        product?.sku,
        product?.description,
        product?.category?.name,
        product?.fournisseur?.nom,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });

    return query ? results : results.slice(0, 8);
  };

  const addLine = () => {
    setForm((previous) => ({
      ...previous,
      lines: [...previous.lines, createEmptyLine(previous.lines.length + 1)],
    }));
  };

  const removeLine = (index) => {
    setForm((previous) => {
      const lines = previous.lines
        .filter((_, currentIndex) => currentIndex !== index)
        .map((line, currentIndex) => ({
          ...line,
          ordre: String(currentIndex + 1),
        }));
      return {
        ...previous,
        lines: lines.length > 0 ? lines : [createEmptyLine(1)],
      };
    });
    setProductDropdownOpenIndex(null);
    setProductSearchByLine((previous) => {
      const next = {};
      Object.keys(previous).forEach((key) => {
        const currentIndex = Number(key);
        if (currentIndex === index) return;
        next[currentIndex > index ? currentIndex - 1 : currentIndex] = previous[key];
      });
      return next;
    });
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.client_id) nextErrors.client_id = "Le client est obligatoire";
    if (!form.numero?.trim()) nextErrors.numero = "Le numéro est obligatoire";
    if (!form.type) nextErrors.type = "Le type est obligatoire";
    if (showPaymentFields && !form.statut_paiement) nextErrors.statut_paiement = "Le statut de paiement est obligatoire";
    if (!form.lines.length) nextErrors.lines = "Ajoutez au moins une ligne";

    form.lines.forEach((line, index) => {
      if (!line.product_id) nextErrors[`line-${index}-product_id`] = "Sélectionnez un produit";
      if (!line.quantite || Number(line.quantite) <= 0)
        nextErrors[`line-${index}-quantite`] = "Quantité invalide";
      if (showFinancialLines) {
        if (line.prix_unitaire_ht === "" || Number(line.prix_unitaire_ht) < 0)
          nextErrors[`line-${index}-prix_unitaire_ht`] = "Prix invalide";
        if (line.tva === "" || Number(line.tva) < 0)
          nextErrors[`line-${index}-tva`] = "TVA invalide";
      }
    });

    return nextErrors;
  };

  const notify = (type, message, duration = 3500) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), duration);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      notify("error", "Tous les champs obligatoires doivent être remplis et les valeurs doivent être valides.", 5000);
      return;
    }

    const payload = {
      client_id: Number(form.client_id),
      numero: form.numero.trim(),
      type: form.type,
      date_creation: form.date_creation || null,
      date_validite: form.type === "devis" ? form.date_validite || null : null,
      date_echeance: form.type === "facture" ? form.date_echeance || null : null,
      date_livraison: form.type === "bon_livraison" ? form.date_livraison || null : null,
      statut: form.statut || null,
      montant_paye: showPaymentFields ? Number(form.montant_paye || 0) : 0,
      statut_paiement: showPaymentFields ? form.statut_paiement : "non_paye",
      conditions_paiement: showPaymentConditions ? form.conditions_paiement || null : null,
      lines: form.lines.map((line, index) => ({
        product_id: Number(line.product_id),
        description: line.description?.trim() || null,
        quantite: Number(line.quantite || 0),
        prix_unitaire_ht: showFinancialLines ? Number(line.prix_unitaire_ht || 0) : 0,
        remise: showFinancialLines ? Number(line.remise || 0) : 0,
        tva: showFinancialLines ? Number(line.tva || 0) : 0,
        ordre: Number(line.ordre || index),
      })),
    };

    try {
      const result = await onSubmit(payload);
      // Use message from backend API response
      const successMessage = result?.message || (mode === "create" ? "Document créé avec succès." : "Document mis à jour avec succès.");
      notify("success", successMessage);
      
      // Call onSuccess callback with documentId to trigger navigation
      if (onSuccess && result?.documentId) {
        setTimeout(() => onSuccess(result.documentId), 500);
      }
    } catch (error) {
      const msg = error?.errors
        ? Object.values(error.errors).flat().join(" — ")
        : error?.message || "Une erreur est survenue pendant l'enregistrement.";
      notify("error", msg, 5000);
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
    const secondaryDate = getSecondaryDateInfo(initialData);
    const detailConfig = DOCUMENT_TYPE_CONFIG[initialData.type] || DOCUMENT_TYPE_CONFIG.facture;
    const showFinancialDetails = detailConfig.showFinancialSummary;
    const showPaymentDetails = detailConfig.showPayment;

    return (
      <div className={styles.viewer}>
        <div className={styles.hero}>
          <div>
            <div className={styles.documentKicker}>{getDocumentTypeLabel(initialData.type)}</div>
            <div className={styles.documentNumber}>{initialData.numero}</div>
            <div className={styles.documentMeta}>{getClientLabel(initialData.client)}</div>
          </div>
          <div className={styles.badges}>
            <span className={styles.typeBadge}>{initialData.type || "—"}</span>
            <span className={styles.statusBadge}>{initialData.statut || "—"}</span>
          </div>
        </div>

        <div className={`${styles.summaryGrid} ${!showFinancialDetails ? styles.summaryGridCompact : ""}`}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Date création</span>
            <strong className={styles.summaryValue}>{formatDate(initialData.date_creation)}</strong>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>{secondaryDate.label}</span>
            <strong className={styles.summaryValue}>{formatDate(secondaryDate.value)}</strong>
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
            <span className={styles.summaryLabel}>Conditions de paiement</span>
            <strong className={styles.summaryValue}>
              {formatPaymentConditionLabel(initialData.conditions_paiement)}
            </strong>
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

        <div className={`${styles.section} ${!showPaymentDetails ? styles.hiddenSection : ""}`}>
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
    <>
      {notification && (
        <div className={`${styles.toast} ${styles[`toast--${notification.type}`]}`}>
          <span className={styles.toastDot} />
          {notification.message}
        </div>
      )}
      <form className={styles.form} onSubmit={handleSubmit}>

      <div className={styles.formGrid}>
        <section className={styles.sectionCard}>
          <div className={styles.sectionHead}>
            <h3>Informations du document</h3>
            {optionsLoading && <span className={styles.sectionHint}>Chargement des listes…</span>}
          </div>

          <div className={styles.fieldsGrid}>
            <label className={styles.field}>
              <span className={styles.label}>Client</span>
              <div className={styles.clientDropdown} ref={clientDropdownRef}>
                <button
                  type="button"
                  className={`${styles.clientDropdownTrigger} ${errors.client_id ? styles.clientDropdownTriggerError : ""}`}
                  onClick={() => setClientDropdownOpen((previous) => !previous)}
                  disabled={saving || optionsLoading}
                  aria-haspopup="listbox"
                  aria-expanded={clientDropdownOpen}
                >
                  <span className={selectedClient ? styles.clientDropdownValue : styles.clientDropdownPlaceholder}>
                    {selectedClient ? getClientLabel(selectedClient) : "Choisir un client"}
                  </span>
                  <span className={styles.clientDropdownChevron}>▾</span>
                </button>

                {clientDropdownOpen && (
                  <div className={styles.clientDropdownMenu}>
                    <input
                      className={styles.clientDropdownSearch}
                      type="search"
                      value={clientSearch}
                      onChange={(event) => setClientSearch(event.target.value)}
                      placeholder="Rechercher un client , par nom, email ou téléphone"
                      autoFocus
                      disabled={saving || optionsLoading}
                    />

                    <div className={styles.clientPicker} role="listbox">
                      {filteredClients.length > 0 ? (
                        filteredClients.map((client) => {
                          const isSelected = String(client.id) === String(form.client_id);

                          return (
                            <button
                              key={client.id}
                              type="button"
                              className={`${styles.clientOption} ${isSelected ? styles.clientOptionSelected : ""}`}
                              onClick={() => handleClientSelect(client)}
                              disabled={saving || optionsLoading}
                              role="option"
                              aria-selected={isSelected}
                            >
                              <span className={styles.clientOptionTitle}>{getClientLabel(client)}</span>
                              <span className={styles.clientOptionMeta}>
                                {[client.email, client.telephone].filter(Boolean).join(" · ") || "Client actif"}
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <div className={styles.clientPickerEmpty}>Aucun client trouvé.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {selectedClient && <div className={styles.clientSelectedHint}>Client sélectionné : <strong>{getClientLabel(selectedClient)}</strong></div>}
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
              <span className={styles.label}>{typeConfig.dateCreationLabel}</span>
              <input
                className={styles.input}
                type="date"
                value={form.date_creation}
                onChange={(event) => handleFieldChange("date_creation", event.target.value)}
                disabled={saving}
              />
            </label>

            {typeConfig.showSecondaryDate && (
              <label className={styles.field}>
                <span className={styles.label}>{typeConfig.secondaryDateLabel}</span>
                <input
                  className={styles.input}
                  type="date"
                  value={form[typeConfig.secondaryDateField] || ""}
                  onChange={(event) => handleFieldChange(typeConfig.secondaryDateField, event.target.value)}
                  disabled={saving}
                />
              </label>
            )}

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

            {showPaymentFields && (
              <>
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
              </>
            )}

            {showPaymentConditions && (
              <label className={styles.field}>
                <span className={styles.label}>Conditions de paiement</span>
                <input
                  className={styles.input}
                  type="text"
                  list="payment-conditions-options"
                  value={form.conditions_paiement}
                  onChange={(event) => handleFieldChange("conditions_paiement", event.target.value)}
                  disabled={saving}
                  placeholder="Choisir ou saisir une condition"
                />
                <datalist id="payment-conditions-options">
                  {PAYMENT_CONDITIONS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.label} />
                  ))}
                </datalist>
              </label>
            )}
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
                      <div
                        className={styles.productDropdown}
                        ref={(element) => {
                          productDropdownRefs.current[index] = element;
                        }}
                      >
                        <button
                          type="button"
                          className={`${styles.productDropdownTrigger} ${
                            errors[`line-${index}-product_id`] ? styles.productDropdownTriggerError : ""
                          }`}
                          onClick={() =>
                            setProductDropdownOpenIndex((previous) => (previous === index ? null : index))
                          }
                          disabled={saving || optionsLoading}
                          aria-haspopup="listbox"
                          aria-expanded={productDropdownOpenIndex === index}
                        >
                          <span
                            className={line.product_id ? styles.productDropdownValue : styles.productDropdownPlaceholder}
                          >
                            {line.product_id
                              ? productSearchByLine[index] || "Choisir un produit"
                              : "Choisir un produit"}
                          </span>
                          <span className={styles.productDropdownChevron}>▾</span>
                        </button>

                        {productDropdownOpenIndex === index && (
                          <div className={styles.productDropdownMenu}>
                            <input
                              className={styles.productDropdownSearch}
                              type="search"
                              value={productSearchByLine[index] || ""}
                              onChange={(event) => handleProductSearchChange(index, event.target.value)}
                              placeholder="Rechercher un produit"
                              autoFocus
                              disabled={saving || optionsLoading}
                            />

                            <div className={styles.productPicker} role="listbox">
                              {getFilteredProducts(index).length > 0 ? (
                                getFilteredProducts(index).map((product) => {
                                  const isSelected = String(product.id) === String(line.product_id);

                                  return (
                                    <button
                                      key={product.id}
                                      type="button"
                                      className={`${styles.productOption} ${
                                        isSelected ? styles.productOptionSelected : ""
                                      }`}
                                      onClick={() => handleProductSelect(index, product)}
                                      disabled={saving || optionsLoading}
                                      role="option"
                                      aria-selected={isSelected}
                                    >
                                      <span className={styles.productOptionTitle}>{getProductLabel(product)}</span>
                                      <span className={styles.productOptionMeta}>
                                        {[product.sku, product.category?.name, product.fournisseur?.nom]
                                          .filter(Boolean)
                                          .join(" · ") || "Produit actif"}
                                      </span>
                                    </button>
                                  );
                                })
                              ) : (
                                <div className={styles.productPickerEmpty}>Aucun produit trouvé.</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
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

                    {showFinancialLines && (
                      <>
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
                      </>
                    )}

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

                    {showFinancialLines && (
                      <div className={styles.totalPreview}>
                        <span className={styles.totalPreviewLabel}>Total ligne</span>
                        <strong className={styles.totalPreviewValue}>{currency(lineTtc)}</strong>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <section className={`${styles.summaryBar} ${!showFinancialSummary ? styles.summaryBarCompact : ""}`}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Client</span>
          <strong className={styles.summaryValue}>{selectedClient ? getClientLabel(selectedClient) : "—"}</strong>
        </div>
        {showFinancialSummary ? (
          <>
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
          </>
        ) : (
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Lignes</span>
            <strong className={styles.summaryValue}>{form.lines.length}</strong>
          </div>
        )}
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
    </>
  );
}
