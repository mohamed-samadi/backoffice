// import { useState, useCallback, useRef, useEffect } from "react";
// import PropTypes from "prop-types";
// import styles from "./GeneratePdfButton.module.css";

// /* ─── helpers ────────────────────────────────────────────────────────────── */
// const currency = (v) =>
//   Number(v || 0).toLocaleString("fr-FR", { style: "currency", currency: "MAD" });

// const fmtDate = (v) => {
//   if (!v) return "—";
//   try {
//     return new Date(v).toLocaleDateString("fr-FR", {
//       day: "2-digit", month: "2-digit", year: "numeric",
//     });
//   } catch { return "—"; }
// };

// const getClientLabel = (c) =>
//   c?.nom_entreprise || c?.nom_complet || c?.email || "—";

// /* ─── PDF HTML builder ───────────────────────────────────────────────────── */
// function buildPdfHtml(doc, companyInfo = {}) {
//   // ensure companyInfo is always an object (caller may pass null)
//   companyInfo = companyInfo || {};
//   const lines    = doc.documentLines || doc.document_lines || [];
//   const payments = doc.payments || [];

//   const co = {
//     name:       companyInfo.nom || companyInfo.name || "-----------",
//     ice:        companyInfo.ice        || "------------",
//     if_:        companyInfo.identifiant_fiscal || companyInfo.if_ || "------------",
//     rc:         companyInfo.registre_commerce || companyInfo.rc || "------",
//     address:    companyInfo.adresse || companyInfo.address || "------------------",
//     phone:      companyInfo.telephone || companyInfo.phone || "+212 6 XX XX XX XX",
//     email:      companyInfo.email      || "contact@monentreprise.ma",
//     bank:       companyInfo.bank       || "Attijariwafa Bank",
//     iban:       companyInfo.iban       || "MA64 -------------------",
//     // Use document-level `conditions_paiement` if company doesn't provide them
//     conditions: companyInfo.conditions || doc.conditions_paiement || doc.conditions || "",
//   };

//   const typeLabel = (doc.type || "document").toUpperCase().replace(/_/g, " ");
//   const C = "#1a56db";

//   const linesRows = lines.length
//     ? lines.map((l, i) => {
//         const ht      = Number(l.prix_unitaire_ht || 0);
//         const qty     = Number(l.quantite || 1);
//         const remise  = Number(l.remise || 0);
//         const tva     = Number(l.tva || 0);
//         const totalHt = Math.max(qty * ht - remise, 0);
//         const ttc     = totalHt * (1 + tva / 100);
//         return `<tr>
//           <td>${l.description || l.product?.nom || `Produit ${i + 1}`}</td>
//           <td class="center">${qty}</td>
//           <td class="right">${ht.toFixed(2)} MAD</td>
//           <td class="center">${remise > 0 ? `${remise.toFixed(2)} MAD` : "0%"}</td>
//           <td class="center">${tva}%</td>
//           <td class="right bold">${ttc.toFixed(2)} MAD</td>
//         </tr>`;
//       }).join("")
//     : `<tr><td colspan="6" class="muted center">Aucune ligne</td></tr>`;

//   const payRows = payments.length
//     ? payments.map((p) => `<tr>
//         <td>${fmtDate(p.date_paiement || p.created_at)}</td>
//         <td class="right">${currency(p.montant)}</td>
//         <td>${p.statut || "—"}</td>
//       </tr>`).join("")
//     : `<tr><td colspan="3" class="muted center">Aucun paiement enregistré</td></tr>`;

//   const clientDetail = [
//     doc.client?.adresse,
//     doc.client?.email,
//     doc.client?.telephone,
//   ].filter(Boolean).join("<br/>");

//   return `<!doctype html>
// <html lang="fr"><head><meta charset="utf-8"/>
// <title>${doc.numero || "Document"}</title>
// <style>
//   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
//   body { font-family: Arial, Helvetica, sans-serif; color: #1a1a2e; font-size: 11px; line-height: 1.5; background: #fff; padding: 32px 40px; }
//   .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid ${C}; }
//   .company-name { font-size: 17px; font-weight: 700; color: ${C}; margin-bottom: 5px; }
//   .company-meta { color: #555; font-size: 9.5px; line-height: 1.7; }
//   .doc-type { font-size: 26px; font-weight: 700; color: ${C}; text-align: right; letter-spacing: 1px; }
//   .doc-ref  { text-align: right; color: #555; font-size: 9.5px; margin-top: 5px; line-height: 1.8; }
//   .doc-ref strong { color: #1a1a2e; font-size: 11px; }
//   .parties { display: flex; gap: 14px; margin-bottom: 20px; }
//   .party-box { flex: 1; border: 1px solid #e5e7eb; border-radius: 5px; padding: 11px 13px; }
//   .party-label { font-size: 8px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: ${C}; margin-bottom: 6px; }
//   .party-name  { font-weight: 600; font-size: 11px; color: #1a1a2e; margin-bottom: 3px; }
//   .party-detail{ color: #555; font-size: 9.5px; line-height: 1.7; }
//   .section-title { font-size: 8.5px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #555; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb; }
//   table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
//   thead tr { background: #eff4ff; }
//   th { padding: 7px 8px; text-align: left; font-size: 8px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #444; border-bottom: 2px solid ${C}; }
//   td { padding: 7px 8px; border-bottom: 1px solid #f3f4f6; vertical-align: top; font-size: 10px; }
//   tbody tr:last-child td { border-bottom: none; }
//   tbody tr:nth-child(even) { background: #fafafa; }
//   .center { text-align: center; }
//   .right  { text-align: right; }
//   .bold   { font-weight: 600; }
//   .muted  { color: #9ca3af; font-style: italic; }
//   .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 20px; }
//   .totals { width: 220px; border: 1px solid #e5e7eb; border-radius: 5px; overflow: hidden; }
//   .totals-row { display: flex; justify-content: space-between; padding: 5px 12px; font-size: 10px; color: #374151; border-bottom: 1px solid #f3f4f6; }
//   .totals-row:last-child { border-bottom: none; }
//   .totals-row.final { background: #eff4ff; border-top: 2px solid ${C}; padding: 8px 12px; font-size: 11.5px; font-weight: 700; color: ${C}; }
//   .conditions { margin-bottom: 18px; }
//   .conditions p { font-size: 9.5px; color: #555; margin-top: 4px; }
//   .signature-row { display: flex; justify-content: flex-end; margin-bottom: 28px; }
//   .signature-box { width: 165px; height: 72px; border: 1px solid #d1d5db; border-radius: 5px; display: flex; align-items: center; justify-content: center; }
//   .signature-label { font-size: 8px; letter-spacing: 1px; text-transform: uppercase; color: #9ca3af; }
//   .footer { border-top: 1px solid #e5e7eb; padding-top: 8px; display: flex; justify-content: space-between; color: #9ca3af; font-size: 8px; }
//   @media print { body { padding: 0; } @page { margin: 18mm 14mm; size: A4 portrait; } }
// </style>
// </head>
// <body>
//   <div class="header">
//     <div>
//       <div class="company-name">${co.name}</div>
//       <div class="company-meta">
//         ICE : ${co.ice} | IF : ${co.if_} | RC : ${co.rc}<br/>
//         ${co.address}<br/>
//         Tél : ${co.phone} | ${co.email}
//       </div>
//     </div>
//     <div>
//       <div class="doc-type">${typeLabel}</div>
//       <div class="doc-ref">
//         <strong>N° ${doc.numero || "—"}</strong><br/>
//         Date : ${fmtDate(doc.date_creation)}<br/>
//         Échéance : ${fmtDate(doc.date_validite)}
//       </div>
//     </div>
//   </div>

//   <div class="parties">
//     <div class="party-box">
//       <div class="party-label">Émetteur</div>
//       <div class="party-name">${co.name}</div>
//       <div class="party-detail">${co.address}<br/>${co.phone} · ${co.email}<br/>${co.bank} — IBAN : ${co.iban}</div>
//     </div>
//     <div class="party-box">
//       <div class="party-label">Client</div>
//       <div class="party-name">${getClientLabel(doc.client)}</div>
//       <div class="party-detail">${clientDetail || "—"}</div>
//     </div>
//   </div>

//   <p class="section-title">Détail des prestations</p>
//   <table>
//     <thead>
//       <tr>
//         <th style="width:36%">Description</th>
//         <th class="center" style="width:7%">QTÉ</th>
//         <th class="right"  style="width:13%">PRIX HT</th>
//         <th class="center" style="width:11%">REMISE</th>
//         <th class="center" style="width:8%">TVA</th>
//         <th class="right"  style="width:15%">TOTAL TTC</th>
//       </tr>
//     </thead>
//     <tbody>${linesRows}</tbody>
//   </table>

//   <div class="totals-wrap">
//     <div class="totals">
//       <div class="totals-row"><span>Sous-total HT</span><span>${currency(doc.total_ht)}</span></div>
//       <div class="totals-row"><span>TVA</span><span>${currency(doc.total_tva)}</span></div>
//       <div class="totals-row final"><span>Total TTC</span><span>${currency(doc.total_ttc)}</span></div>
//     </div>
//   </div>

//   ${payments.length ? `<div style="margin-bottom:18px">
//     <p class="section-title">Paiements</p>
//     <table>
//       <thead><tr><th>Date</th><th class="right">Montant</th><th>Statut</th></tr></thead>
//       <tbody>${payRows}</tbody>
//     </table>
//   </div>` : ""}

//   <div class="conditions">
//     <p class="section-title">Conditions</p>
//     <p>${co.conditions}</p>
//   </div>

//   <div class="signature-row">
//     <div class="signature-box"><span class="signature-label">Signature &amp; Cachet</span></div>
//   </div>

//   <div class="footer">
//     <span>Merci pour votre confiance.</span>
//     <span>${doc.numero || "—"} · Généré le ${fmtDate(new Date().toISOString())}</span>
//   </div>
// </body></html>`;
// }

// /* ─── Preview Modal ──────────────────────────────────────────────────────── */
// function PrintPreviewModal({ doc, companyInfo, onClose }) {
//   const [status, setStatus] = useState("idle"); // idle | loading | error
//   const [errMsg, setErrMsg] = useState("");
//   const iframeRef           = useRef(null);

//   /* browser print via hidden iframe — avoids popup-blocker issues */
//   const handlePrint = useCallback(() => {
//     const fw = iframeRef.current?.contentWindow;
//     if (!fw) return;
//     fw.focus();
//     fw.print();
//   }, []);

//   /* real PDF via dynamic import of html2pdf.js */
//   const handleDownloadPdf = useCallback(async () => {
//     setStatus("loading");
//     setErrMsg("");
//     try {
//       const html2pdf = (await import("html2pdf.js")).default;
//       const wrapper  = document.createElement("div");
//       wrapper.innerHTML = buildPdfHtml(doc, companyInfo);

//       await html2pdf()
//         .set({
//           filename:    `${doc.numero || "document"}.pdf`,
//           margin:      [10, 10, 10, 10],
//           image:       { type: "jpeg", quality: 0.98 },
//           html2canvas: { scale: 2, useCORS: true, letterRendering: true },
//           jsPDF:       { unit: "mm", format: "a4", orientation: "portrait" },
//         })
//         .from(wrapper)
//         .save();

//       setStatus("idle");
//     } catch (err) {
//       console.error("PDF generation failed:", err);
//       setErrMsg("Erreur de génération. Utilisez Imprimer pour enregistrer en PDF.");
//       setStatus("error");
//     }
//   }, [doc, companyInfo]);

//   const htmlContent = buildPdfHtml(doc, companyInfo);
//   const typeLabel   = (doc.type || "document").toUpperCase().replace(/_/g, " ");
//   const isLoading   = status === "loading";

//   return (
//     <div
//       className={styles.backdrop}
//       onClick={(e) => e.target === e.currentTarget && onClose()}
//       role="dialog"
//       aria-modal="true"
//       aria-label="Aperçu avant impression"
//     >
//       <div className={styles.modal}>

//         {/* ── Left: iframe preview ── */}
//         <div className={styles.previewPane}>
//           <div className={styles.previewBar}>
//             <span className={styles.previewDots}>
//               <span className={styles.dot} />
//               <span className={styles.dot} />
//               <span className={styles.dot} />
//             </span>
//             <span className={styles.previewBarTitle}>
//               {typeLabel} — {doc.numero || "—"}
//             </span>
//             <span />
//           </div>
//           <div className={styles.previewScroll}>
//             <iframe
//               ref={iframeRef}
//               className={styles.previewIframe}
//               srcDoc={htmlContent}
//               title="Aperçu du document"
//               sandbox="allow-same-origin allow-modals"
//             />
//           </div>
//         </div>

//         {/* ── Right: controls ── */}
//         <div className={styles.controlPane}>

//           <div className={styles.controlHeader}>
//             <span className={styles.controlTitle}>Imprimer</span>
//             <button
//               type="button"
//               className={styles.closeBtn}
//               onClick={onClose}
//               aria-label="Fermer"
//             >
//               <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
//                 <line x1="18" y1="6" x2="6" y2="18"/>
//                 <line x1="6" y1="6" x2="18" y2="18"/>
//               </svg>
//             </button>
//           </div>

//           <div className={styles.controlDivider} />

//           <div className={styles.controlBody}>

//             {/* document summary card */}
//             <div className={styles.docSummary}>
//               <div className={styles.summaryType}>{typeLabel}</div>
//               <div className={styles.summaryNum}>{doc.numero || "—"}</div>
//               <div className={styles.summaryMeta}>{getClientLabel(doc.client)}</div>
//               <div className={styles.summaryMeta}>
//                 {fmtDate(doc.date_creation)}
//                 {doc.date_validite ? ` · Éch. ${fmtDate(doc.date_validite)}` : ""}
//               </div>
//               <div className={styles.summaryTotal}>{currency(doc.total_ttc)}</div>
//             </div>

//             <div className={styles.controlDivider} />

//             {/* settings */}
//             <div className={styles.controlRow}>
//               <span className={styles.controlLabel}>Destination</span>
//               <div className={styles.controlSelect}>
//                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
//                   <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
//                   <polyline points="14 2 14 8 20 8"/>
//                 </svg>
//                 <span>Fichier PDF</span>
//                 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.chevron} aria-hidden="true">
//                   <polyline points="6 9 12 15 18 9"/>
//                 </svg>
//               </div>
//             </div>

//             <div className={styles.controlRow}>
//               <span className={styles.controlLabel}>Pages</span>
//               <div className={styles.controlSelect}>
//                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
//                   <rect x="3" y="3" width="18" height="18" rx="2"/>
//                   <line x1="9" y1="3" x2="9" y2="21"/>
//                 </svg>
//                 <span>Toutes</span>
//                 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.chevron} aria-hidden="true">
//                   <polyline points="6 9 12 15 18 9"/>
//                 </svg>
//               </div>
//             </div>

//             <div className={styles.controlRow}>
//               <span className={styles.controlLabel}>Mise en page</span>
//               <div className={styles.controlSelect}>
//                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
//                   <rect x="6" y="2" width="12" height="20" rx="2"/>
//                 </svg>
//                 <span>Portrait</span>
//                 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.chevron} aria-hidden="true">
//                   <polyline points="6 9 12 15 18 9"/>
//                 </svg>
//               </div>
//             </div>

//             <div className={styles.controlRowCollapse}>
//               <span>Plus de paramètres</span>
//               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
//                 <polyline points="6 9 12 15 18 9"/>
//               </svg>
//             </div>

//             {/* error banner */}
//             {status === "error" && (
//               <div className={styles.errorBanner} role="alert">
//                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
//                   <circle cx="12" cy="12" r="10"/>
//                   <line x1="12" y1="8" x2="12" y2="12"/>
//                   <line x1="12" y1="16" x2="12.01" y2="16"/>
//                 </svg>
//                 {errMsg}
//               </div>
//             )}
//           </div>

//           <div className={styles.controlDivider} />

//           <div className={styles.controlFooter}>
//             <button
//               type="button"
//               className={styles.pdfBtn}
//               onClick={handleDownloadPdf}
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <><span className={styles.spinner} aria-hidden="true" />Génération…</>
//               ) : (
//                 <>
//                   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
//                     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
//                     <polyline points="7 10 12 15 17 10"/>
//                     <line x1="12" y1="15" x2="12" y2="3"/>
//                   </svg>
//                   Enregistrer PDF
//                 </>
//               )}
//             </button>

//             <button
//               type="button"
//               className={styles.printBtn}
//               onClick={handlePrint}
//               disabled={isLoading}
//             >
//               <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
//                 <polyline points="6 9 6 2 18 2 18 9"/>
//                 <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
//                 <rect x="6" y="14" width="12" height="8"/>
//               </svg>
//               Imprimer
//             </button>

//             <button type="button" className={styles.cancelBtn} onClick={onClose}>
//               Annuler
//             </button>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }

// PrintPreviewModal.propTypes = {
//   doc:         PropTypes.object.isRequired,
//   companyInfo: PropTypes.object,
//   onClose:     PropTypes.func.isRequired,
// };

// /* ─── Main export ────────────────────────────────────────────────────────── */
// export default function GeneratePdfButton({ document: doc, companyInfo, className, children }) {
//   const [showModal, setShowModal] = useState(false);
//   const [fetchedCompany, setFetchedCompany] = useState(null);
//   const [companyError, setCompanyError] = useState(null);

//   useEffect(() => {
//     // if companyInfo prop is provided, no need to fetch
//     if (companyInfo) return;

//     let active = true;
//     const fetchCompany = async () => {
//       try {
//         const res = await fetch('/api/companies');
//         if (!active) return;
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const payload = await res.json();
//         // API returns { success: true, data: { ... } }
//         const data = payload?.data || payload;

//         // Normalize backend company shape to the keys used by buildPdfHtml
//         const mapped = data
//           ? {
//               name: data.nom || data.name || data.nom_commercial || "Mon Entreprise SARL",
//               ice: data.ice || "",
//               // fiscal id (IF) may be stored in settings JSON or not present
//               if_: (data.settings && (data.settings.if || data.settings.if_)) || data.if || "",
//               // registre_commerce -> rc
//               rc: data.registre_commerce || data.rc || "",
//               address: [data.adresse, data.ville, data.code_postal, data.pays].filter(Boolean).join(", ") || "",
//               phone: data.telephone || data.phone || "",
//               email: data.email || "",
//               bank: data.settings?.bank || data.bank || "",
//               iban: data.settings?.iban || data.iban || "",
//               conditions: data.settings?.conditions || data.conditions || "",
//             }
//           : null;

//         setFetchedCompany(mapped);
//       } catch (err) {
//         console.error('Failed to load company info', err);
//         setCompanyError('Impossible de charger les informations de la société');
//       }
//     };

//     fetchCompany();
//     return () => { active = false; };
//   }, [companyInfo]);
//   if (!doc) return null;

//   return (
//     <>
//       <button type="button" className={className} onClick={() => setShowModal(true)}>
//         {children || (
//           <>
//             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
//               <polyline points="6 9 6 2 18 2 18 9"/>
//               <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
//               <rect x="6" y="14" width="12" height="8"/>
//             </svg>
//             Imprimer / PDF
//           </>
//         )}
//       </button>

//       {showModal && (
//         <PrintPreviewModal
//           doc={doc}
//           companyInfo={companyInfo || fetchedCompany}
//           onClose={() => setShowModal(false)}
//         />
//       )}
//     </>
//   );
// }

// GeneratePdfButton.propTypes = {
//   document:    PropTypes.object,
//   companyInfo: PropTypes.shape({
//     nom: PropTypes.string,
//     name: PropTypes.string,
//     ice: PropTypes.string,
//     if_: PropTypes.string,
//     identifiant_fiscal: PropTypes.string,
//     rc: PropTypes.string,
//     registre_commerce: PropTypes.string,
//     address: PropTypes.string,
//     adresse: PropTypes.string,
//     phone: PropTypes.string,
//     telephone: PropTypes.string,
//     email: PropTypes.string,
//     bank: PropTypes.string,
//     iban: PropTypes.string,
//   }),
//   className: PropTypes.string,
//   children:  PropTypes.node,
// };
