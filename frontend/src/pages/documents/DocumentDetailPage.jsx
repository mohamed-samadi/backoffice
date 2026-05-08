import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import { useDocuments } from "../../hooks/useDocuments";
import DocumentForm from "./components/DocumentForm/DocumentForm";
import styles from "./DocumentDetailPage.module.css";

export default function DocumentDetailPage({ mode = "view" }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    current,
    fetchOneLoading,
    createLoading,
    updateLoading,
    fetchDocumentById,
    createDocument,
    updateDocument,
    resetCurrent,
  } = useDocuments();

  useEffect(() => {
    if (mode === "create") {
      resetCurrent();
      return undefined;
    }

    if (id) {
      fetchDocumentById(id);
    }

    return () => {
      resetCurrent();
    };
  }, [fetchDocumentById, id, mode, resetCurrent]);

  const documentData = useMemo(() => {
    if (mode === "create") return null;
    if (!current) return null;
    if (id && String(current.id) !== String(id)) return null;
    return current;
  }, [current, id, mode]);

  const title =
    mode === "create"
      ? "Créer un document"
      : mode === "edit"
        ? "Modifier le document"
        : "Détails du document";

  const subtitle =
    mode === "create"
      ? "Renseignez les informations du document et ajoutez ses lignes."
      : mode === "edit"
        ? "Modifiez le document sélectionné et ses lignes."
        : "Consultez le contenu complet du document.";

  const handleSubmit = async (payload) => {
    if (mode === "create") {
      const created = await createDocument(payload);
      navigate(`/documents/${created.id}`);
      return created;
    }

    if (!id) {
      return null;
    }

    const updated = await updateDocument(id, payload);
    navigate(`/documents/${updated.id || id}`);
    return updated;
  };

  const handleBack = () => navigate("/documents");

  const handleEdit = () => {
    if (!id) return;
    navigate(`/documents/${id}/edit`);
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <div className={styles.headerActions}>
            <button className={styles.backBtn} type="button" onClick={handleBack}>
              ← Retour aux documents
            </button>
            {mode === "view" && documentData && (
              <button className={styles.editBtn} type="button" onClick={handleEdit}>
                Modifier
              </button>
            )}
          </div>
        }
      />

      <div className={styles.contentGrid}>
        <section className={styles.mainCard}>
          <DocumentForm
            mode={mode}
            initialData={documentData}
            loading={mode !== "create" && fetchOneLoading && !documentData}
            saving={createLoading || updateLoading}
            onSubmit={handleSubmit}
            onCancel={handleBack}
            onEdit={handleEdit}
          />
        </section>
      </div>
    </div>
  );
}