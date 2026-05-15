import { useState, useMemo, useCallback } from "react";

const C = {
  bg: "#0A0B0F",
  surface: "#111318",
  surfaceHover: "#181B22",
  border: "#1E2230",
  accent: "#4F7FFF",
  accentSoft: "rgba(79,127,255,0.08)",
  green: "#22C55E",
  greenSoft: "rgba(34,197,94,0.1)",
  red: "#EF4444",
  redSoft: "rgba(239,68,68,0.1)",
  amber: "#F59E0B",
  amberSoft: "rgba(245,158,11,0.1)",
  purple: "#A855F7",
  purpleSoft: "rgba(168,85,247,0.1)",
  cyan: "#06B6D4",
  cyanSoft: "rgba(6,182,212,0.1)",
  teal: "#14B8A6",
  tealSoft: "rgba(20,184,166,0.1)",
  text: "#F1F5F9",
  textMuted: "#64748B",
  textDim: "#94A3B8",
};

// ─── SHARED PRIMITIVES ────────────────────────────────────────────────────────
const Badge = ({ color, children }) => {
  const map = {
    green:  { bg: C.greenSoft,  text: C.green },
    red:    { bg: C.redSoft,    text: C.red },
    amber:  { bg: C.amberSoft,  text: C.amber },
    blue:   { bg: C.accentSoft, text: C.accent },
    purple: { bg: C.purpleSoft, text: C.purple },
    cyan:   { bg: C.cyanSoft,   text: C.cyan },
    teal:   { bg: C.tealSoft,   text: C.teal },
  };
  const s = map[color] || map.blue;
  return (
    <span style={{
      background: s.bg, color: s.text, border: `1px solid ${s.text}30`,
      borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 700,
      letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap",
    }}>{children}</span>
  );
};

const statusBadge = (status) => {
  const map = {
    Active: "green", Confirmed: "green", Paid: "green", Published: "green", Cashed: "green",
    Accepted: "teal",
    Pending: "amber", Partial: "blue", Script: "blue", Editing: "purple", Recording: "purple",
    Ready: "cyan", "Follow-up": "amber", Idea: "amber", Sent: "blue", Draft: "amber",
    Overdue: "red", Cancelled: "red", Rejected: "red", Expired: "red", Unpaid: "red",
  };
  return <Badge color={map[status] || "blue"}>{status}</Badge>;
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, ...style }}>
    {children}
  </div>
);
const MetricCard = ({ label, value, sub, color, icon }) => (
  <div
    style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 8, transition: "border-color 0.2s", cursor: "default" }}
    onMouseEnter={e => e.currentTarget.style.borderColor = color + "55"}
    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <span style={{ fontSize: 26, lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: C.textMuted }}>{sub}</div>}
  </div>
);

const Table = ({ headers, rows }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}
            style={{ borderBottom: `1px solid ${C.border}20`, transition: "background 0.15s", cursor: "default" }}
            onMouseEnter={e => e.currentTarget.style.background = C.surfaceHover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            {row.map((cell, j) => (
              <td key={j} style={{ padding: "12px 14px", fontSize: 13, color: C.textDim, whiteSpace: "nowrap" }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const FInput = ({ label, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && <label style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>{label}</label>}
    <input {...props} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box", ...(props.style || {}) }}
      onFocus={e => e.target.style.borderColor = C.accent}
      onBlur={e => e.target.style.borderColor = C.border}
    />
  </div>
);

const FSelect = ({ label, options, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && <label style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>{label}</label>}
    <select {...props} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box", cursor: "pointer", ...(props.style || {}) }}>
      {options.map(o => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const FTextarea = ({ label, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && <label style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>{label}</label>}
    <textarea {...props} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box", ...(props.style || {}) }}
      onFocus={e => e.target.style.borderColor = C.accent}
      onBlur={e => e.target.style.borderColor = C.border}
    />
  </div>
);

const Btn = ({ children, variant = "primary", color, ...props }) => {
  const styles = {
    primary: { background: C.accent, color: "#fff", border: "none" },
    ghost: { background: "transparent", color: C.textDim, border: `1px solid ${C.border}` },
    danger: { background: C.redSoft, color: C.red, border: `1px solid ${C.red}30` },
    success: { background: C.greenSoft, color: C.green, border: `1px solid ${C.green}30` },
    custom: { background: (color || C.accent) + "15", color: color || C.accent, border: `1px solid ${(color || C.accent)}30` },
  };
  const s = styles[variant] || styles.primary;
  return (
    <button {...props} style={{ ...s, borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: props.disabled ? "default" : "pointer", whiteSpace: "nowrap", transition: "opacity 0.15s", opacity: props.disabled ? 0.4 : 1, ...(props.style || {}) }}>
      {children}
    </button>
  );
};

// ─── FORMATTERS ───────────────────────────────────────────────────────────────
const MAD = (n) => `${Number(n).toLocaleString()} MAD`;
const fmtN = (n) => Number(n || 0).toFixed(2);
const fmtMAD = (n) => `${Number(n || 0).toLocaleString("fr-MA", { minimumFractionDigits: 2 })} MAD`;

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────
const DEFAULT_COMPANY = {
  name: "Mon Entreprise SARL",
  ice: "001234567000012",
  if_: "12345678",
  rc: "123456",
  address: "123 Rue Hassan II, Tanger, Maroc",
  phone: "+212 6 XX XX XX XX",
  email: "contact@monentreprise.ma",
  logo: "",
  bank: "Attijariwafa Bank — IBAN: MA64 0001 2345 6789 0123 4567",
  footer: "Merci pour votre confiance.",
};

const mkItem = (desc, qty, price, vat = 20, disc = 0) => ({
  id: Math.random().toString(36).slice(2),
  description: desc, qty, unitPrice: price, discount: disc, vat,
});

const initialData = {
  // ── CRM ──
  clients: [
    { id: 1, name: "Sara Benali",  business: "Boutique Sara",  phone: "+212 6 12 34 56 78", email: "sara@boutique.ma",  status: "Active",    credit: 3200 },
    { id: 2, name: "Karim Alaoui", business: "Tech Solutions", phone: "+212 6 98 76 54 32", email: "karim@tech.ma",    status: "Active",    credit: 0    },
    { id: 3, name: "Fatima Zahra", business: "FZ Design",      phone: "+212 6 55 44 33 22", email: "fz@design.ma",    status: "Follow-up", credit: 1500 },
  ],
  // ── APPOINTMENTS ──
  appointments: [
    { id: 1, client: "Sara Benali",  date: "2026-03-09", time: "10:00", location: "Café Atlas", notes: "Discuss Q2 order",   status: "Confirmed" },
    { id: 2, client: "Karim Alaoui", date: "2026-03-09", time: "14:30", location: "Office",     notes: "Contract renewal",  status: "Pending"   },
    { id: 3, client: "New Prospect", date: "2026-03-11", time: "11:00", location: "Zoom",       notes: "First intro call",  status: "Confirmed" },
  ],
  // ── CHEQUES ──
  cheques: [
    { id: 1, number: "CHQ-2026-001", amount: 15000, bank: "Attijariwafa", issuedBy: "Sara Benali",  issuedTo: "My Business",    issueDate: "2026-02-20", dueDate: "2026-03-15", status: "Pending", notes: ""       },
    { id: 2, number: "CHQ-2026-002", amount: 8500,  bank: "CIH",          issuedBy: "My Business",  issuedTo: "Fournisseur A",  issueDate: "2026-02-25", dueDate: "2026-03-10", status: "Pending", notes: "Urgent" },
    { id: 3, number: "CHQ-2026-003", amount: 22000, bank: "BMCE",         issuedBy: "Karim Alaoui", issuedTo: "My Business",    issueDate: "2026-01-15", dueDate: "2026-02-28", status: "Cashed",  notes: ""       },
  ],
  // ── SUPPLIER CREDITS ──
  supplierCredits: [
    { id: 1, supplier: "Fournisseur Textile",   phone: "+212 6 11 22 33 44", product: "Tissus collection été",        total: 45000, paid: 20000, dueDate: "2026-03-20", status: "Partial"  },
    { id: 2, supplier: "Emballage Pro",         phone: "+212 6 55 66 77 88", product: "Boîtes et packaging",          total: 12000, paid: 12000, dueDate: "2026-02-28", status: "Paid"     },
    { id: 3, supplier: "Imprimerie Casablanca", phone: "+212 6 99 00 11 22", product: "Cartes de visite & flyers",    total: 8000,  paid: 0,     dueDate: "2026-03-05", status: "Overdue"  },
  ],
  // ── CLIENT CREDITS ──
  clientCredits: [
    { id: 1, client: "Sara Benali",  phone: "+212 6 12 34 56 78", product: "Commande Mars",   total: 8000,  paid: 4800,  dueDate: "2026-03-18", status: "Partial"  },
    { id: 2, client: "Fatima Zahra", phone: "+212 6 55 44 33 22", product: "Service Design",  total: 4500,  paid: 3000,  dueDate: "2026-03-08", status: "Overdue"  },
    { id: 3, client: "Ahmed Rifi",   phone: "+212 6 77 88 99 00", product: "Grossiste lot A", total: 18000, paid: 18000, dueDate: "2026-02-20", status: "Paid"     },
  ],
  // ── CONTENT ──
  content: [
    { id: 1, title: "Spring Collection Reveal", platform: "Instagram", format: "Carousel", status: "Ready",     date: "2026-03-09", topic: "New arrivals" },
    { id: 2, title: "Behind the Scenes",        platform: "TikTok",    format: "Reel",     status: "Editing",   date: "2026-03-10", topic: "Brand story"  },
    { id: 3, title: "Client Testimonial",       platform: "LinkedIn",  format: "Post",     status: "Script",    date: "2026-03-12", topic: "Social proof" },
    { id: 4, title: "Product Tutorial",         platform: "YouTube",   format: "Video",    status: "Idea",      date: "2026-03-15", topic: "Education"    },
    { id: 5, title: "Flash Sale Promo",         platform: "Facebook",  format: "Post",     status: "Published", date: "2026-03-07", topic: "Promotion"    },
  ],
  // ── TASKS ──
  tasks: [
    { id: "T1", title: "Relancer Sara pour paiement facture FAC-2026-001", clientId: 1, clientName: "Sara Benali", priority: "Urgent",  status: "Todo",       dueDate: "2026-03-09", category: "Finance",  notes: "" },
    { id: "T2", title: "Préparer devis refonte site FZ Design",            clientId: 3, clientName: "Fatima Zahra",priority: "High",    status: "InProgress", dueDate: "2026-03-10", category: "Sales",    notes: "DEV-2026-002 en cours" },
    { id: "T3", title: "Appeler Karim pour renouvellement contrat",        clientId: 2, clientName: "Karim Alaoui",priority: "Normal",  status: "Todo",       dueDate: "2026-03-11", category: "Client",   notes: "" },
    { id: "T4", title: "Régler fournisseur Imprimerie Casablanca",         clientId: null,clientName: "",          priority: "Urgent",  status: "Todo",       dueDate: "2026-03-09", category: "Finance",  notes: "En retard !" },
    { id: "T5", title: "Publier Reel Instagram Spring Collection",         clientId: null,clientName: "",          priority: "Normal",  status: "Todo",       dueDate: "2026-03-09", category: "Content",  notes: "" },
    { id: "T6", title: "Mettre à jour catalog produits",                   clientId: null,clientName: "",          priority: "Low",     status: "Todo",       dueDate: "2026-03-15", category: "Admin",    notes: "" },
    { id: "T7", title: "Envoyer contrat signé à Sara Benali",              clientId: 1, clientName: "Sara Benali", priority: "High",    status: "Completed",  dueDate: "2026-03-07", category: "Client",   notes: "" },
  ],
  // ── EXPENSES ──
  expenses: [
    { id: "E1", category: "Loyer",          amount: 4500,  date: "2026-03-01", supplier: "Propriétaire",         paymentMethod: "Virement bancaire", note: "Loyer mars 2026",             status: "Paid" },
    { id: "E2", category: "Internet",       amount: 299,   date: "2026-03-02", supplier: "Maroc Telecom",        paymentMethod: "Prélèvement auto",  note: "Abonnement fibre",            status: "Paid" },
    { id: "E3", category: "Marketing",      amount: 1200,  date: "2026-03-03", supplier: "Meta Ads",             paymentMethod: "Carte bancaire",    note: "Campagne Instagram mars",     status: "Paid" },
    { id: "E4", category: "Transport",      amount: 350,   date: "2026-03-05", supplier: "Divers",               paymentMethod: "Espèces",           note: "Déplacements clients",        status: "Paid" },
    { id: "E5", category: "Fournitures",    amount: 680,   date: "2026-03-07", supplier: "Imprimerie Casablanca",paymentMethod: "Chèque",            note: "Cartes de visite + flyers",   status: "Pending" },
    { id: "E6", category: "Équipement",     amount: 3200,  date: "2026-02-28", supplier: "MediaMarkt",           paymentMethod: "Carte bancaire",    note: "Nouvel ordinateur portable",  status: "Paid" },
    { id: "E7", category: "Services",       amount: 800,   date: "2026-03-08", supplier: "Comptable",            paymentMethod: "Espèces",           note: "Honoraires comptabilité",     status: "Paid" },
  ],
  // ── SALES PIPELINE ──
  pipeline: [
    { id: "P1", title: "Boutique Sara — Collection Été 2026",  clientId: 1, clientName: "Sara Benali",  value: 28000, stage: "Won",        probability: 100, source: "Existing client", lastContact: "2026-03-05", notes: "Contrat signé" },
    { id: "P2", title: "Refonte Site Web FZ Design",           clientId: 3, clientName: "Fatima Zahra", value: 10000, stage: "QuoteSent",   probability: 60,  source: "Referral",        lastContact: "2026-03-07", notes: "Devis envoyé, attente retour" },
    { id: "P3", title: "Audit SI Tech Solutions",              clientId: 2, clientName: "Karim Alaoui", value: 15000, stage: "Negotiation", probability: 75,  source: "Existing client", lastContact: "2026-03-06", notes: "Discussion tarifs" },
    { id: "P4", title: "Identité visuelle Nouvelle Boulangerie",clientId:null,clientName: "Nouveau prospect",value:6500,stage:"Meeting",     probability: 40,  source: "Instagram",       lastContact: "2026-03-08", notes: "RDV fixé le 11 mars" },
    { id: "P5", title: "Shooting produits E-commerce",         clientId: null,clientName:"Ahmed Rifi",  value: 4500,  stage: "Contacted",  probability: 25,  source: "Referral",        lastContact: "2026-03-04", notes: "En attente de confirmation" },
    { id: "P6", title: "Logo + charte graphique restaurant",   clientId: null,clientName:"Lead Instagram",value:3200, stage: "NewLead",    probability: 10,  source: "Instagram",       lastContact: "2026-03-08", notes: "DM Instagram reçu" },
    { id: "P7", title: "Flyers événement annulé",              clientId: null,clientName:"Prospect Casablanca",value:1800,stage:"Lost",     probability: 0,   source: "Direct",          lastContact: "2026-02-20", notes: "Client parti chez concurrent" },
  ],
  // ── PRODUCT CATALOG ──
  catalog: [
    { id: "C1", name: "Création identité visuelle",    category: "Design",      price: 3500, vat: 20, description: "Logo + charte graphique complète",         active: true  },
    { id: "C2", name: "Design packaging",              category: "Design",      price: 800,  vat: 20, description: "Packaging produit (1 variante)",            active: true  },
    { id: "C3", name: "Refonte site web (5 pages)",   category: "Web",         price: 8000, vat: 20, description: "Site vitrine responsive, 5 pages max",      active: true  },
    { id: "C4", name: "Shooting photo produits",       category: "Photo",       price: 2800, vat: 20, description: "30 clichés HD retouchés, livraison 72h",     active: true  },
    { id: "C5", name: "Campagne réseaux sociaux",      category: "Marketing",   price: 2500, vat: 20, description: "Gestion 1 mois Instagram + Facebook",       active: true  },
    { id: "C6", name: "Formation CMS (2h)",            category: "Formation",   price: 400,  vat: 20, description: "Formation utilisation CMS client",          active: true  },
    { id: "C7", name: "Maintenance mensuelle",         category: "Web",         price: 600,  vat: 20, description: "Mises à jour, backup, support",             active: true  },
    { id: "C8", name: "Audit système informatique",    category: "IT",          price: 5000, vat: 20, description: "Audit complet + rapport recommandations",   active: false },
  ],
  // ── CASH FLOW / TREASURY ──
  cashflow: {
    bankBalance: 42500,
    cashBalance: 3200,
    month: "2026-03",
  },
  cashEntries: [
    { id: "CF01", date: "2026-03-01", label: "Loyer mars",              type: "out", amount: 4500,  category: "Loyer",       method: "Virement",  ref: "",           reconciled: true  },
    { id: "CF02", date: "2026-03-02", label: "Abonnement Maroc Telecom",type: "out", amount: 299,   category: "Internet",    method: "Prélévement",ref: "",           reconciled: true  },
    { id: "CF03", date: "2026-03-03", label: "Encaissement FAC-2026-002",type:"in",  amount: 12000, category: "Facture",     method: "Chèque",    ref: "CHQ-2026-045",reconciled: true  },
    { id: "CF04", date: "2026-03-03", label: "Campagne Meta Ads",        type: "out",amount: 1200,  category: "Marketing",   method: "CB",        ref: "",           reconciled: true  },
    { id: "CF05", date: "2026-03-05", label: "Déplacements clients",     type: "out",amount: 350,   category: "Transport",   method: "Espèces",   ref: "",           reconciled: true  },
    { id: "CF06", date: "2026-03-06", label: "Acompte Sara Benali",      type: "in", amount: 2500,  category: "Facture",     method: "Virement",  ref: "VIR-2026-03-001", reconciled: true },
    { id: "CF07", date: "2026-03-07", label: "Cartes de visite",         type: "out",amount: 680,   category: "Fournitures", method: "Chèque",    ref: "",           reconciled: false },
    { id: "CF08", date: "2026-03-08", label: "Honoraires comptable",     type: "out",amount: 800,   category: "Services",    method: "Espèces",   ref: "",           reconciled: true  },
    { id: "CF09", date: "2026-03-08", label: "Matériel MediaMarkt",      type: "out",amount: 3200,  category: "Équipement",  method: "CB",        ref: "",           reconciled: true  },
    { id: "CF10", date: "2026-03-10", label: "Encaissement prévu FAC-2026-001",type:"in",amount:4500,category:"Facture",     method: "Virement",  ref: "",           reconciled: false },
    { id: "CF11", date: "2026-03-15", label: "Chèque Attijariwafa dû",   type: "in", amount: 15000, category: "Chèque",      method: "Chèque",    ref: "CHQ-2026-001",reconciled: false },
    { id: "CF12", date: "2026-03-20", label: "Règlement fournisseur textile",type:"out",amount:25000,category:"Fournisseur", method: "Virement",  ref: "",           reconciled: false },
  ],
  // ── CLIENT NOTES (used by Client 360°) ──
  clientNotes: [
    { id: "N1", clientId: 1, text: "Client très réactif. Préfère contact WhatsApp. Paiements parfois en retard.", date: "2026-03-06", author: "Moi" },
    { id: "N2", clientId: 1, text: "Intéressée par un devis packaging pour la collection été. À relancer en avril.", date: "2026-03-01", author: "Moi" },
    { id: "N3", clientId: 2, text: "Décideur principal. Délais stricts. Toujours payé à temps. Potentiel fort.", date: "2026-03-05", author: "Moi" },
    { id: "N4", clientId: 3, text: "Indécise sur le budget. Suit bien sur Instagram. Relancer après envoi devis.", date: "2026-03-07", author: "Moi" },
  ],
  // ── QUOTES & INVOICES ──
  companyProfile: DEFAULT_COMPANY,
  documents: [
    {
      id: "DOC-001", type: "Devis", number: "DEV-2026-001",
      clientId: 1, clientName: "Sara Benali", clientBusiness: "Boutique Sara",
      clientPhone: "+212 6 12 34 56 78", clientEmail: "sara@boutique.ma", clientAddress: "Rue Mohammed V, Tanger",
      issueDate: "2026-03-01", dueDate: "2026-03-15", validityDate: "2026-03-31",
      status: "Accepted", currency: "MAD",
      items: [mkItem("Création identité visuelle complète", 1, 3500, 20), mkItem("Design packaging produit (3 variantes)", 3, 800, 20), mkItem("Charte graphique PDF", 1, 500, 20)],
      notes: "Devis valable 30 jours. Acompte de 50% à la commande.",
      terms: "Paiement sous 15 jours après livraison.", internalNote: "Client sérieux, priorité haute.",
      driveLink: "https://drive.google.com/file/d/abc123",
      paymentMethod: "", amountPaid: 0, paymentDate: "", paymentRef: "",
      createdAt: "2026-03-01T09:00:00Z", updatedAt: "2026-03-05T14:00:00Z",
    },
    {
      id: "DOC-002", type: "Facture", number: "FAC-2026-001",
      clientId: 1, clientName: "Sara Benali", clientBusiness: "Boutique Sara",
      clientPhone: "+212 6 12 34 56 78", clientEmail: "sara@boutique.ma", clientAddress: "Rue Mohammed V, Tanger",
      issueDate: "2026-03-05", dueDate: "2026-03-20", validityDate: "",
      status: "Partial", currency: "MAD",
      items: [mkItem("Création identité visuelle complète", 1, 3500, 20), mkItem("Design packaging produit (3 variantes)", 3, 800, 20), mkItem("Charte graphique PDF", 1, 500, 20)],
      notes: "Facture suite au devis DEV-2026-001 accepté.", terms: "Paiement sous 15 jours après livraison.", internalNote: "",
      driveLink: "https://drive.google.com/file/d/def456",
      paymentMethod: "Virement bancaire", amountPaid: 2500, paymentDate: "2026-03-06", paymentRef: "VIR-2026-03-001",
      createdAt: "2026-03-05T10:00:00Z", updatedAt: "2026-03-06T11:00:00Z",
    },
    {
      id: "DOC-003", type: "Devis", number: "DEV-2026-002",
      clientId: 3, clientName: "Fatima Zahra", clientBusiness: "FZ Design",
      clientPhone: "+212 6 55 44 33 22", clientEmail: "fz@design.ma", clientAddress: "Boulevard Zerktouni, Casablanca",
      issueDate: "2026-03-07", dueDate: "2026-03-22", validityDate: "2026-04-07",
      status: "Sent", currency: "MAD",
      items: [mkItem("Refonte site web (5 pages)", 1, 8000, 20), mkItem("Intégration formulaire de contact", 1, 600, 20), mkItem("Formation CMS (2h)", 2, 400, 20)],
      notes: "Prix dégressifs sur volume.", terms: "50% à la commande, 50% à la livraison.", internalNote: "A relancer le 14 mars.",
      driveLink: "", paymentMethod: "", amountPaid: 0, paymentDate: "", paymentRef: "",
      createdAt: "2026-03-07T08:30:00Z", updatedAt: "2026-03-07T08:30:00Z",
    },
    {
      id: "DOC-004", type: "Facture", number: "FAC-2026-002",
      clientId: 2, clientName: "Karim Alaoui", clientBusiness: "Tech Solutions",
      clientPhone: "+212 6 98 76 54 32", clientEmail: "karim@tech.ma", clientAddress: "Technopark, Casablanca",
      issueDate: "2026-02-20", dueDate: "2026-03-05", validityDate: "",
      status: "Paid", currency: "MAD",
      items: [mkItem("Audit système informatique", 1, 5000, 20), mkItem("Rapport + recommandations", 1, 2500, 20), mkItem("Formation équipe (demi-journée)", 1, 2500, 20)],
      notes: "", terms: "Paiement comptant.", internalNote: "Client récurrent, excellent.",
      driveLink: "https://drive.google.com/file/d/ghi789",
      paymentMethod: "Chèque", amountPaid: 12000, paymentDate: "2026-03-03", paymentRef: "CHQ-2026-045",
      createdAt: "2026-02-20T09:00:00Z", updatedAt: "2026-03-03T16:00:00Z",
    },
    {
      id: "DOC-005", type: "Facture", number: "FAC-2026-003",
      clientId: 3, clientName: "Fatima Zahra", clientBusiness: "FZ Design",
      clientPhone: "+212 6 55 44 33 22", clientEmail: "fz@design.ma", clientAddress: "Boulevard Zerktouni, Casablanca",
      issueDate: "2026-03-08", dueDate: "2026-03-23", validityDate: "",
      status: "Unpaid", currency: "MAD",
      items: [mkItem("Shooting photo produits (30 clichés)", 1, 2800, 20), mkItem("Retouche et livraison fichiers HD", 1, 700, 20)],
      notes: "", terms: "Paiement sous 15 jours.", internalNote: "Relancer si non payé avant le 25.",
      driveLink: "", paymentMethod: "", amountPaid: 0, paymentDate: "", paymentRef: "",
      createdAt: "2026-03-08T10:00:00Z", updatedAt: "2026-03-08T10:00:00Z",
    },
  ],
};

// ─── NAV ──────────────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  { label: "Overview" },
  { id: "home",        icon: "⬡", label: "Dashboard"           },
  { id: "analytics",   icon: "◐", label: "Analytics"           },
  { label: "Operations" },
  { id: "tasks",       icon: "◻", label: "Tasks"               },
  { id: "clients",     icon: "◈", label: "CRM / Clients"       },
  { id: "client360",   icon: "◉", label: "Client 360°"          },
  { id: "appointments",icon: "◷", label: "Appointments"        },
  { id: "pipeline",    icon: "◧", label: "Sales Pipeline"      },
  { label: "Finance" },
  { id: "quotes",      icon: "◑", label: "Devis / Facturation" },
  { id: "cheques",     icon: "◫", label: "Cheques"             },
  { id: "supplier",    icon: "◬", label: "Supplier Credit"     },
  { id: "clientcredit",icon: "◭", label: "Client Credit"       },
  { id: "expenses",    icon: "◲", label: "Expenses"            },
  { id: "cashflow",    icon: "◌", label: "Cash Flow"           },
  { label: "Tools" },
  { id: "catalog",     icon: "◳", label: "Product Catalog"     },
  { id: "content",     icon: "◉", label: "Content Planner"     },
  { id: "whatsapp",    icon: "◎", label: "WhatsApp"            },
  { id: "files",       icon: "◪", label: "Files"               },
];
const NAV_ITEMS = NAV_GROUPS.filter(n => n.id);

// ═══════════════════════════════════════════════════════════════════════════════
// EXISTING PAGES (unchanged)
// ═══════════════════════════════════════════════════════════════════════════════

const HomePage = ({ data }) => {
  const today = "2026-03-09";
  const todayAppts = data.appointments.filter(a => a.date === today);
  const todayContent = data.content.filter(c => c.date === today && c.status !== "Published");
  const upcomingCheques = data.cheques.filter(c => c.status === "Pending" && c.dueDate >= today).slice(0, 3);
  const totalSupplierDebt = data.supplierCredits.filter(s => s.status !== "Paid").reduce((s, c) => s + (c.total - c.paid), 0);
  const totalClientCredit = data.clientCredits.filter(c => c.status !== "Paid").reduce((s, c) => s + (c.total - c.paid), 0);
  const overdue = [...data.supplierCredits, ...data.clientCredits].filter(c => c.status === "Overdue").length;
  // Quotes summary for home
  const unpaidInvoices = (data.documents || []).filter(d => d.type === "Facture" && ["Unpaid","Partial"].includes(d.status));
  const unpaidTotal = unpaidInvoices.reduce((s, d) => s + parseFloat(calcDocTotals(d).totalTTC), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Monday, March 9 — 2026</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>Good morning 👋</h1>
        <p style={{ color: C.textMuted, margin: "6px 0 0", fontSize: 14 }}>
          You have {todayAppts.length} meeting{todayAppts.length !== 1 ? "s" : ""} and {todayContent.length} post{todayContent.length !== 1 ? "s" : ""} to publish today.
        </p>
      </div>

      {overdue > 0 && (
        <div style={{ background: C.redSoft, border: `1px solid ${C.red}40`, borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span style={{ color: C.red, fontWeight: 600, fontSize: 13 }}>{overdue} overdue payment{overdue > 1 ? "s" : ""} require your attention</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
        <MetricCard icon="◷" label="Today's Meetings"  value={todayAppts.length}      sub="Scheduled today"       color={C.accent} />
        <MetricCard icon="◫" label="Pending Cheques"   value={upcomingCheques.length}  sub="Due this week"         color={C.amber}  />
        <MetricCard icon="◬" label="Supplier Debt"     value={MAD(totalSupplierDebt)}  sub="Total outstanding"     color={C.red}    />
        <MetricCard icon="◭" label="Client Credit"     value={MAD(totalClientCredit)}  sub="Total to collect"      color={C.green}  />
        <MetricCard icon="◑" label="Unpaid Invoices"   value={unpaidInvoices.length}   sub={MAD(unpaidTotal)}      color={C.purple} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim, marginBottom: 14, letterSpacing: "0.05em", textTransform: "uppercase" }}>📅 Today's Appointments</div>
          {todayAppts.length === 0
            ? <div style={{ color: C.textMuted, fontSize: 13 }}>No meetings today</div>
            : todayAppts.map(a => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}20` }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{a.client}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{a.time} · {a.location}</div>
                </div>
                {statusBadge(a.status)}
              </div>
            ))
          }
        </Card>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim, marginBottom: 14, letterSpacing: "0.05em", textTransform: "uppercase" }}>📢 Content Due Today</div>
          {todayContent.length === 0
            ? <div style={{ color: C.textMuted, fontSize: 13 }}>No content scheduled today</div>
            : todayContent.map(c => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}20` }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{c.platform} · {c.format}</div>
                </div>
                {statusBadge(c.status)}
              </div>
            ))
          }
        </Card>
      </div>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim, marginBottom: 14, letterSpacing: "0.05em", textTransform: "uppercase" }}>🔔 Upcoming Cheque Deadlines</div>
        <Table
          headers={["Cheque #", "Amount", "Bank", "Party", "Due Date", "Status"]}
          rows={upcomingCheques.map(c => [
            <span style={{ color: C.text, fontWeight: 600 }}>{c.number}</span>,
            <span style={{ color: C.amber, fontWeight: 700 }}>{MAD(c.amount)}</span>,
            c.bank,
            c.dueDate <= today ? c.issuedBy : c.issuedTo,
            <span style={{ color: c.dueDate <= today ? C.red : C.textDim }}>{c.dueDate}</span>,
            statusBadge(c.status),
          ])}
        />
      </Card>

      {unpaidInvoices.length > 0 && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim, marginBottom: 14, letterSpacing: "0.05em", textTransform: "uppercase" }}>🧾 Unpaid Invoices</div>
          <Table
            headers={["Invoice #", "Client", "Total TTC", "Due Date", "Status"]}
            rows={unpaidInvoices.slice(0, 4).map(d => {
              const { totalTTC } = calcDocTotals(d);
              return [
                <span style={{ color: C.text, fontWeight: 600 }}>{d.number}</span>,
                d.clientName,
                <span style={{ color: C.red, fontWeight: 700 }}>{totalTTC} MAD</span>,
                <span style={{ color: C.red }}>{d.dueDate}</span>,
                statusBadge(d.status),
              ];
            })}
          />
        </Card>
      )}
    </div>
  );
};

const ClientsPage = ({ data, setData }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", business: "", phone: "", email: "", status: "Active", credit: 0 });

  const add = () => {
    if (!form.name) return;
    setData(d => ({ ...d, clients: [...d.clients, { ...form, id: Date.now(), credit: Number(form.credit) }] }));
    setForm({ name: "", business: "", phone: "", email: "", status: "Active", credit: 0 });
    setShowForm(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>CRM · Clients</h2>
          <p style={{ color: C.textMuted, margin: "4px 0 0", fontSize: 13 }}>{data.clients.length} clients total</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Add Client</button>
      </div>

      {showForm && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim, marginBottom: 14 }}>New Client</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[["name","Full Name *"],["business","Business Name"],["phone","Phone"],["email","Email"]].map(([k,pl]) => (
              <input key={k} placeholder={pl} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, outline: "none" }} />
            ))}
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13 }}>
              {["Active","Follow-up","Inactive"].map(s => <option key={s}>{s}</option>)}
            </select>
            <input placeholder="Credit Balance (MAD)" type="number" value={form.credit} onChange={e => setForm(f => ({ ...f, credit: e.target.value }))}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={add} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Save Client</button>
            <button onClick={() => setShowForm(false)} style={{ background: "transparent", color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer" }}>Cancel</button>
          </div>
        </Card>
      )}

      <Card style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px 0" }}>
          <input placeholder="🔍 Search clients…" style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" }} />
        </div>
        <div style={{ padding: 20 }}>
          <Table
            headers={["Client","Business","Phone","Email","Credit","Invoiced","Status"]}
            rows={data.clients.map(c => {
              const clientDocs = (data.documents || []).filter(d => d.clientId === c.id);
              const invoiced = clientDocs.filter(d => d.type === "Facture").reduce((s,d) => s + parseFloat(calcDocTotals(d).totalTTC), 0);
              return [
                <span style={{ color: C.text, fontWeight: 600 }}>{c.name}</span>,
                c.business,
                <a href={`tel:${c.phone}`} style={{ color: C.accent, textDecoration: "none" }}>{c.phone}</a>,
                c.email,
                c.credit > 0 ? <span style={{ color: C.amber, fontWeight: 700 }}>{MAD(c.credit)}</span> : <span style={{ color: C.green }}>—</span>,
                invoiced > 0 ? <span style={{ color: C.textMuted, fontSize: 11 }}>🧾 {MAD(invoiced)}</span> : null,
                statusBadge(c.status),
              ];
            })}
          />
        </div>
      </Card>
    </div>
  );
};

const AppointmentsPage = ({ data, setData }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client: "", date: "", time: "", location: "", notes: "", status: "Pending" });
  const today = "2026-03-09";

  const add = () => {
    if (!form.client || !form.date) return;
    setData(d => ({ ...d, appointments: [...d.appointments, { ...form, id: Date.now() }] }));
    setForm({ client: "", date: "", time: "", location: "", notes: "", status: "Pending" });
    setShowForm(false);
  };

  const todayAppts = data.appointments.filter(a => a.date === today);
  const upcoming = data.appointments.filter(a => a.date > today);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Appointments</h2>
          <p style={{ color: C.textMuted, margin: "4px 0 0", fontSize: 13 }}>{todayAppts.length} today · {upcoming.length} upcoming</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Schedule</button>
      </div>

      {showForm && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim, marginBottom: 14 }}>New Appointment</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[["client","Client Name *"],["date","Date *"],["time","Time"],["location","Location"]].map(([k,pl]) => (
              <input key={k} placeholder={pl} type={k==="date"?"date":k==="time"?"time":"text"} value={form[k]}
                onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, outline: "none" }} />
            ))}
            <input placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, outline: "none" }} />
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13 }}>
              {["Pending","Confirmed","Cancelled"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={add} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Save</button>
            <button onClick={() => setShowForm(false)} style={{ background: "transparent", color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer" }}>Cancel</button>
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 14, letterSpacing: "0.05em", textTransform: "uppercase" }}>Today</div>
          {todayAppts.length === 0
            ? <div style={{ color: C.textMuted, fontSize: 13 }}>No meetings today</div>
            : todayAppts.map(a => <ApptItem key={a.id} a={a} />)
          }
        </Card>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim, marginBottom: 14, letterSpacing: "0.05em", textTransform: "uppercase" }}>Upcoming</div>
          {upcoming.length === 0
            ? <div style={{ color: C.textMuted, fontSize: 13 }}>No upcoming appointments</div>
            : upcoming.map(a => <ApptItem key={a.id} a={a} />)
          }
        </Card>
      </div>
    </div>
  );
};

const ApptItem = ({ a }) => (
  <div style={{ padding: "12px 0", borderBottom: `1px solid ${C.border}20`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{a.client}</div>
      <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>{a.date}{a.time && ` · ${a.time}`}{a.location && ` · ${a.location}`}</div>
      {a.notes && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2, fontStyle: "italic" }}>{a.notes}</div>}
    </div>
    {statusBadge(a.status)}
  </div>
);

const ChequesPage = ({ data, setData }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ number: "", amount: "", bank: "", issuedBy: "", issuedTo: "", issueDate: "", dueDate: "", status: "Pending", notes: "" });
  const today = "2026-03-09";

  const add = () => {
    if (!form.number) return;
    setData(d => ({ ...d, cheques: [...d.cheques, { ...form, id: Date.now(), amount: Number(form.amount) }] }));
    setForm({ number: "", amount: "", bank: "", issuedBy: "", issuedTo: "", issueDate: "", dueDate: "", status: "Pending", notes: "" });
    setShowForm(false);
  };

  const pending = data.cheques.filter(c => c.status === "Pending");
  const totalPending = pending.reduce((s, c) => s + c.amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Cheque Tracker</h2>
          <p style={{ color: C.textMuted, margin: "4px 0 0", fontSize: 13 }}>{pending.length} pending · {MAD(totalPending)} total</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Add Cheque</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <MetricCard icon="◫" label="Pending"  value={pending.length}                                                               sub={MAD(totalPending)} color={C.amber} />
        <MetricCard icon="✓" label="Cashed"   value={data.cheques.filter(c => c.status === "Cashed").length}                       sub="This period"       color={C.green} />
        <MetricCard icon="⚠" label="Overdue"  value={data.cheques.filter(c => c.status === "Pending" && c.dueDate < today).length} sub="Past due date"     color={C.red}   />
      </div>

      {showForm && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim, marginBottom: 14 }}>New Cheque</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[["number","Cheque # *"],["amount","Amount (MAD)"],["bank","Bank"],["issuedBy","Issued By"],["issuedTo","Issued To"],["notes","Notes"]].map(([k,pl]) => (
              <input key={k} placeholder={pl} type={k==="amount"?"number":"text"} value={form[k]}
                onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, outline: "none" }} />
            ))}
            <input type="date" value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, outline: "none" }} />
            <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, outline: "none" }} />
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13 }}>
              {["Pending","Cashed","Cancelled"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={add} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Save</button>
            <button onClick={() => setShowForm(false)} style={{ background: "transparent", color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer" }}>Cancel</button>
          </div>
        </Card>
      )}

      <Card style={{ padding: 0 }}>
        <div style={{ padding: 20 }}>
          <Table
            headers={["Cheque #","Amount","Bank","Issued By","Issued To","Due Date","Status"]}
            rows={data.cheques.map(c => [
              <span style={{ color: C.text, fontWeight: 600 }}>{c.number}</span>,
              <span style={{ color: c.status==="Pending"?C.amber:C.green, fontWeight: 700 }}>{MAD(c.amount)}</span>,
              c.bank, c.issuedBy, c.issuedTo,
              <span style={{ color: c.dueDate < today && c.status==="Pending" ? C.red : C.textDim }}>{c.dueDate}</span>,
              statusBadge(c.status),
            ])}
          />
        </div>
      </Card>
    </div>
  );
};

const CreditPage = ({ type, data, setData }) => {
  const key = type === "supplier" ? "supplierCredits" : "clientCredits";
  const items = data[key];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ supplier: "", client: "", phone: "", product: "", total: "", paid: "", dueDate: "", status: "Partial", notes: "" });

  const add = () => {
    const name = type === "supplier" ? form.supplier : form.client;
    if (!name) return;
    setData(d => ({ ...d, [key]: [...d[key], { ...form, id: Date.now(), total: Number(form.total), paid: Number(form.paid) }] }));
    setForm({ supplier: "", client: "", phone: "", product: "", total: "", paid: "", dueDate: "", status: "Partial", notes: "" });
    setShowForm(false);
  };

  const totalDebt = items.filter(i => i.status !== "Paid").reduce((s, c) => s + (c.total - c.paid), 0);
  const overdue = items.filter(i => i.status === "Overdue").length;
  const nameKey = type === "supplier" ? "supplier" : "client";
  const label = type === "supplier" ? "Supplier Credit" : "Client Credit";
  const color = type === "supplier" ? C.red : C.green;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>{label}</h2>
          <p style={{ color: C.textMuted, margin: "4px 0 0", fontSize: 13 }}>{items.length} records · {MAD(totalDebt)} outstanding</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: color, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Add</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <MetricCard icon={type==="supplier"?"◬":"◭"} label="Total Outstanding" value={MAD(totalDebt)} sub="Remaining balance" color={color} />
        <MetricCard icon="⚠" label="Overdue" value={overdue} sub="Past due date" color={C.red} />
        <MetricCard icon="✓" label="Fully Paid" value={items.filter(i => i.status === "Paid").length} sub="Settled" color={C.green} />
      </div>

      {showForm && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim, marginBottom: 14 }}>New Record</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <input placeholder={type==="supplier"?"Supplier Name *":"Client Name *"} value={form[nameKey]}
              onChange={e => setForm(f => ({ ...f, [nameKey]: e.target.value }))}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, outline: "none" }} />
            {[["phone","Phone"],["product","Product / Service"],["total","Total Amount (MAD)"],["paid","Amount Paid (MAD)"]].map(([k,pl]) => (
              <input key={k} placeholder={pl} type={["total","paid"].includes(k)?"number":"text"} value={form[k]}
                onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, outline: "none" }} />
            ))}
            <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, outline: "none" }} />
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13 }}>
              {["Partial","Paid","Overdue"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={add} style={{ background: color, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Save</button>
            <button onClick={() => setShowForm(false)} style={{ background: "transparent", color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer" }}>Cancel</button>
          </div>
        </Card>
      )}

      <Card style={{ padding: 0 }}>
        <div style={{ padding: 20 }}>
          <Table
            headers={[type==="supplier"?"Supplier":"Client","Product","Total","Paid","Remaining","Due Date","Status"]}
            rows={items.map(c => [
              <div><div style={{ color: C.text, fontWeight: 600 }}>{c[nameKey]}</div><div style={{ fontSize: 11, color: C.textMuted }}>{c.phone}</div></div>,
              c.product,
              <span style={{ fontWeight: 700 }}>{MAD(c.total)}</span>,
              <span style={{ color: C.green }}>{MAD(c.paid)}</span>,
              <span style={{ color: c.total-c.paid>0?color:C.green, fontWeight: 700 }}>{MAD(c.total-c.paid)}</span>,
              <span style={{ color: c.status==="Overdue"?C.red:C.textDim }}>{c.dueDate}</span>,
              statusBadge(c.status),
            ])}
          />
        </div>
      </Card>
    </div>
  );
};

const ContentPage = ({ data, setData }) => {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({ title: "", topic: "", platform: "Instagram", format: "Post", status: "Idea", date: "", notes: "" });

  const add = () => {
    if (!form.title) return;
    setData(d => ({ ...d, content: [...d.content, { ...form, id: Date.now() }] }));
    setForm({ title: "", topic: "", platform: "Instagram", format: "Post", status: "Idea", date: "", notes: "" });
    setShowForm(false);
  };

  const statuses = ["All","Idea","Script","Recording","Editing","Ready","Published"];
  const filtered = filter === "All" ? data.content : data.content.filter(c => c.status === filter);
  const platformIcon = { Instagram: "📸", TikTok: "🎵", YouTube: "▶️", LinkedIn: "💼", Facebook: "📘" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Content Planner</h2>
          <p style={{ color: C.textMuted, margin: "4px 0 0", fontSize: 13 }}>{data.content.length} total · {data.content.filter(c=>c.status==="Published").length} published</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: C.purple, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Add Content</button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ background: filter===s?C.purple:C.surface, color: filter===s?"#fff":C.textMuted, border: `1px solid ${filter===s?C.purple:C.border}`, borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{s}</button>
        ))}
      </div>

      {showForm && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim, marginBottom: 14 }}>New Content</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <input placeholder="Content Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, outline: "none" }} />
            <input placeholder="Topic" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, outline: "none" }} />
            {[["platform",["Instagram","TikTok","YouTube","LinkedIn","Facebook"]],["format",["Post","Reel","Carousel","Video"]],["status",["Idea","Script","Recording","Editing","Ready","Published"]]].map(([k,opts]) => (
              <select key={k} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13 }}>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            ))}
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, outline: "none" }} />
            <input placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={add} style={{ background: C.purple, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Save</button>
            <button onClick={() => setShowForm(false)} style={{ background: "transparent", color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer" }}>Cancel</button>
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {filtered.map(c => (
          <div key={c.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, transition: "border-color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.purple+"60"}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>{platformIcon[c.platform]}</span>
              {statusBadge(c.status)}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{c.title}</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>{c.topic}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge color="purple">{c.platform}</Badge>
              <Badge color="cyan">{c.format}</Badge>
            </div>
            {c.date && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 10 }}>📅 {c.date}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

const WhatsAppPage = ({ data }) => {
  const templates = [
    { label: "Appointment Reminder", icon: "📅", text: "Bonjour {name}, je vous rappelle votre rendez-vous prévu le {date} à {time}. Merci de confirmer. 🙏" },
    { label: "Payment Reminder",     icon: "💰", text: "Bonjour {name}, votre solde en attente est de {amount} MAD. Merci de procéder au règlement avant le {date}. Cordialement." },
    { label: "Follow-up",            icon: "👋", text: "Bonjour {name}, j'espère que tout va bien. Je souhaitais faire un suivi suite à notre dernière réunion. Avez-vous des questions ?" },
    { label: "Supplier Payment",     icon: "🏭", text: "Bonjour, veuillez trouver ci-joint la confirmation de paiement pour la facture du {date} d'un montant de {amount} MAD. Merci." },
  ];
  const [selected, setSelected] = useState(templates[0]);
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState(templates[0].text);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>WhatsApp Messaging</h2>
        <p style={{ color: C.textMuted, margin: "4px 0 0", fontSize: 13 }}>Click-to-chat with pre-written templates</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim, letterSpacing: "0.05em", textTransform: "uppercase" }}>Message Templates</div>
          {templates.map(t => (
            <div key={t.label} onClick={() => { setSelected(t); setMsg(t.text); }}
              style={{ background: selected.label===t.label?C.accentSoft:C.surface, border: `1px solid ${selected.label===t.label?C.accent+"60":C.border}`, borderRadius: 12, padding: 16, cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ fontSize: 16, marginBottom: 6 }}>{t.icon} <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{t.label}</span></div>
              <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{t.text.slice(0, 80)}…</div>
            </div>
          ))}
        </div>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim, marginBottom: 16, letterSpacing: "0.05em", textTransform: "uppercase" }}>Compose & Send</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 12, color: C.textMuted }}>Recipient Phone (with country code)</div>
            <input placeholder="+212 6 XX XX XX XX" value={phone} onChange={e => setPhone(e.target.value)}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, outline: "none" }} />
            <div style={{ fontSize: 12, color: C.textMuted }}>Message</div>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={6}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
            <button onClick={() => window.open(`https://wa.me/${phone.replace(/\s/g,"")}?text=${encodeURIComponent(msg)}`,"_blank")} disabled={!phone}
              style={{ background: phone?"#25D366":C.border, color: phone?"#fff":C.textMuted, border: "none", borderRadius: 10, padding: "12px 20px", fontWeight: 700, fontSize: 14, cursor: phone?"pointer":"default" }}>
              💬 Open in WhatsApp
            </button>
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim, marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>Quick Send to Clients</div>
            {data.clients.slice(0, 4).map(c => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}20` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{c.phone}</div>
                </div>
                <button onClick={() => setPhone(c.phone.replace(/\s/g,""))}
                  style={{ background: C.accentSoft, color: C.accent, border: `1px solid ${C.accent}30`, borderRadius: 7, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Select</button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const FilesPage = () => {
  const folders = [
    { name: "Cheques",   icon: "◫", color: C.amber,    count: 8  },
    { name: "Clients",   icon: "◈", color: C.accent,   count: 12 },
    { name: "Suppliers", icon: "◬", color: C.red,      count: 5  },
    { name: "Payments",  icon: "💳", color: C.green,    count: 23 },
    { name: "Contracts", icon: "📄", color: C.purple,   count: 4  },
    { name: "Devis",     icon: "📋", color: C.cyan,     count: 3  },
    { name: "Factures",  icon: "🧾", color: C.teal,     count: 5  },
    { name: "Other",     icon: "📁", color: C.textMuted,count: 7  },
  ];
  const recentFiles = [
    { name: "DEV-2026-001_SaraBenali.pdf",      folder: "Devis",    date: "2026-03-01", size: "180 KB" },
    { name: "FAC-2026-001_SaraBenali.pdf",      folder: "Factures", date: "2026-03-05", size: "195 KB" },
    { name: "Facture_Textile_Mars2026.pdf",     folder: "Suppliers",date: "2026-03-08", size: "245 KB" },
    { name: "CHQ-2026-001_scan.jpg",            folder: "Cheques",  date: "2026-03-07", size: "1.2 MB" },
    { name: "Contrat_SaraBenali.pdf",           folder: "Contracts",date: "2026-03-05", size: "430 KB" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>File Management</h2>
          <p style={{ color: C.textMuted, margin: "4px 0 0", fontSize: 13 }}>Google Drive integration · automatic folder structure</p>
        </div>
        <button style={{ background: "#4285F4", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>☁ Connect Google Drive</button>
      </div>
      <div style={{ background: C.accentSoft, border: `1px solid ${C.accent}30`, borderRadius: 12, padding: "14px 18px", fontSize: 13, color: C.textDim }}>
        📁 <strong style={{ color: C.accent }}>Drive Structure:</strong>{" "}
        My Business / Clients / {"{Client}"} / <span style={{ color: C.cyan }}>Devis</span> · <span style={{ color: C.teal }}>Factures</span>{" "}|{" "}Cheques · Suppliers · Payments · Contracts
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
        {folders.map(f => (
          <div key={f.name} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, cursor: "pointer", transition: "all 0.15s", display: "flex", flexDirection: "column", gap: 8 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = f.color+"60"; e.currentTarget.style.background = C.surfaceHover; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface; }}
          >
            <span style={{ fontSize: 26 }}>{f.icon}</span>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{f.name}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{f.count} files</div>
          </div>
        ))}
      </div>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim, letterSpacing: "0.05em", textTransform: "uppercase" }}>Recent Files</div>
          <button style={{ background: C.accentSoft, color: C.accent, border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Upload File</button>
        </div>
        <Table
          headers={["File Name","Folder","Date","Size","Action"]}
          rows={recentFiles.map(f => [
            <span style={{ color: C.text }}>{f.name}</span>,
            <Badge color="blue">{f.folder}</Badge>,
            f.date,
            <span style={{ color: C.textMuted }}>{f.size}</span>,
            <button style={{ background: "transparent", color: C.accent, border: "none", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>Open ↗</button>,
          ])}
        />
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// QUOTES & INVOICES MODULE
// ═══════════════════════════════════════════════════════════════════════════════

// ── Calculation engine ──────────────────────────────────────────────────────
function calcDocTotals(doc) {
  let subtotalHT = 0, totalDiscount = 0, totalVAT = 0;
  const lines = (doc.items || []).map(it => {
    const base      = (it.qty || 0) * (it.unitPrice || 0);
    const discAmt   = base * ((it.discount || 0) / 100);
    const afterDisc = base - discAmt;
    const vatAmt    = afterDisc * ((it.vat || 0) / 100);
    subtotalHT    += afterDisc;
    totalDiscount += discAmt;
    totalVAT      += vatAmt;
    return { ...it, lineTotal: afterDisc + vatAmt };
  });
  return {
    lines,
    subtotalHT:    fmtN(subtotalHT),
    totalDiscount: fmtN(totalDiscount),
    totalVAT:      fmtN(totalVAT),
    totalTTC:      fmtN(subtotalHT + totalVAT),
  };
}

function getRemaining(doc) {
  return fmtN(parseFloat(calcDocTotals(doc).totalTTC) - parseFloat(doc.amountPaid || 0));
}

function blankDoc(type, existingDocs) {
  const prefix = type === "Devis" ? "DEV" : "FAC";
  const seq = (existingDocs || []).filter(d => d.type === type).length + 1;
  return {
    id: "", type, number: `${prefix}-2026-${String(seq).padStart(3,"0")}`,
    clientId: "", clientName: "", clientBusiness: "", clientPhone: "", clientEmail: "", clientAddress: "",
    issueDate: "2026-03-09", dueDate: "", validityDate: "",
    status: "Draft", currency: "MAD",
    paymentMethod: "", amountPaid: 0, paymentDate: "", paymentRef: "",
    items: [mkItem("", 1, 0, 20, 0)],
    notes: "", terms: "Paiement sous 15 jours après livraison.", internalNote: "",
    driveLink: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
}

async function simulateDriveUpload(doc) {
  await new Promise(r => setTimeout(r, 1200));
  return `https://drive.google.com/file/d/${Math.random().toString(36).slice(2,10)}/view`;
}

// ── PDF generator ────────────────────────────────────────────────────────────
function generatePDFHTML(doc, company) {
  const { lines, subtotalHT, totalDiscount, totalVAT, totalTTC } = calcDocTotals(doc);
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a2e;font-size:13px}
.page{width:210mm;min-height:297mm;padding:16mm 18mm;background:#fff}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #4F7FFF}
.co-name{font-size:22px;font-weight:800;color:#4F7FFF;margin-bottom:6px}
.co-info{font-size:11px;color:#555;line-height:1.8}
.doc-title{text-align:right}
.doc-type{font-size:32px;font-weight:900;color:#4F7FFF;letter-spacing:-1px;text-transform:uppercase}
.doc-num{font-size:14px;font-weight:700;color:#333;margin-top:4px}
.doc-meta{font-size:11px;color:#666;margin-top:3px}
.billing{display:flex;gap:40px;margin-bottom:24px}
.bill-block{flex:1;background:#f8f9ff;border:1px solid #e5e8f5;border-radius:8px;padding:14px}
.bill-lbl{font-size:10px;font-weight:800;color:#4F7FFF;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px}
.bill-name{font-size:15px;font-weight:700;color:#1a1a2e}
.bill-info{font-size:11px;color:#555;line-height:1.8;margin-top:4px}
table{width:100%;border-collapse:collapse;margin-bottom:20px}
thead tr{background:#4F7FFF}
thead th{color:#fff;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:9px 10px;text-align:left}
tbody tr:nth-child(even){background:#f8f9ff}
tbody td{padding:9px 10px;font-size:12px;color:#333;border-bottom:1px solid #eee}
.totals{margin-left:auto;width:280px}
.tot-row{display:flex;justify-content:space-between;padding:5px 0;font-size:12px;color:#555}
.tot-row.main{border-top:2px solid #4F7FFF;margin-top:6px;padding-top:10px;font-size:15px;font-weight:900;color:#1a1a2e}
.notes-sec{margin-top:24px;background:#f8f9ff;border-radius:8px;padding:14px}
.notes-lbl{font-size:10px;font-weight:800;color:#4F7FFF;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px}
.footer{margin-top:32px;padding-top:14px;border-top:1px solid #eee;display:flex;justify-content:space-between;font-size:10px;color:#888}
@media print{.page{padding:12mm 14mm}}
</style></head><body><div class="page">
<div class="header">
  <div><div class="co-name">${company.nom || company.name}</div>
  <div class="co-info">ICE : ${company.ice || company.ice}
    | IF : ${company.identifiant_fiscal || company.if_ || ""}
    | RC : ${company.registre_commerce || company.rc || ""}<br/>
    ${company.adresse || company.address || ""}<br/>
    Tél : ${company.telephone || company.phone || ""} | ${company.email || ""}
  </div></div>
  <div class="doc-title">
    <div class="doc-type">${doc.type}</div>
    <div class="doc-num">N° ${doc.number}</div>
    <div class="doc-meta">Date : ${doc.issueDate}</div>
    <div class="doc-meta">Échéance : ${doc.dueDate||"—"}</div>
    ${doc.validityDate?`<div class="doc-meta">Validité : ${doc.validityDate}</div>`:""}
  </div>
</div>
<div class="billing">
  <div class="bill-block"><div class="bill-lbl">Émetteur</div><div class="bill-name">${company.nom || company.name}</div><div class="bill-info">${company.adresse || company.address}<br/>${company.telephone || company.phone} · ${company.email}<br/>${company.bank}</div></div>
  <div class="bill-block"><div class="bill-lbl">Client</div><div class="bill-name">${doc.clientName}${doc.clientBusiness?` — ${doc.clientBusiness}`:""}</div><div class="bill-info">${doc.clientAddress||""}<br/>${doc.clientPhone} · ${doc.clientEmail}</div></div>
</div>
<table>
  <thead><tr><th style="width:38%">Description</th><th style="width:8%">Qté</th><th style="width:14%">Prix HT</th><th style="width:10%">Remise</th><th style="width:8%">TVA</th><th style="width:14%">Total TTC</th></tr></thead>
  <tbody>${lines.map(it=>`<tr><td>${it.description||"—"}</td><td>${it.qty}</td><td>${fmtN(it.unitPrice)} MAD</td><td>${it.discount}%</td><td>${it.vat}%</td><td style="font-weight:700">${fmtN(it.lineTotal)} MAD</td></tr>`).join("")}</tbody>
</table>
<div class="totals">
  <div class="tot-row"><span>Sous-total HT</span><span>${subtotalHT} MAD</span></div>
  ${parseFloat(totalDiscount)>0?`<div class="tot-row"><span>Remises</span><span>- ${totalDiscount} MAD</span></div>`:""}
  <div class="tot-row"><span>TVA</span><span>${totalVAT} MAD</span></div>
  <div class="tot-row main"><span>Total TTC</span><span>${totalTTC} MAD</span></div>
  ${doc.amountPaid>0?`<div class="tot-row" style="margin-top:8px;color:#16a34a"><span>Payé</span><span>${fmtN(doc.amountPaid)} MAD</span></div><div class="tot-row" style="color:#dc2626;font-weight:700"><span>Reste dû</span><span>${getRemaining(doc)} MAD</span></div>`:""}
</div>
${doc.notes||doc.terms?`<div class="notes-sec">${doc.notes?`<div><div class="notes-lbl">Notes</div><p style="font-size:12px;color:#333;line-height:1.6">${doc.notes}</p></div>`:""} ${doc.terms?`<div style="margin-top:${doc.notes?"10px":"0"}"><div class="notes-lbl">Conditions</div><p style="font-size:12px;color:#333;line-height:1.6">${doc.terms}</p></div>`:""}</div>`:""}
<div style="margin-top:28px;display:flex;justify-content:flex-end"><div style="border:1px solid #ddd;border-radius:8px;padding:20px 40px;text-align:center;min-width:180px"><div style="font-size:10px;color:#888;margin-bottom:24px;text-transform:uppercase;letter-spacing:0.1em">Signature & Cachet</div><div style="height:1px;background:#ddd;width:120px;margin:0 auto"></div></div></div>
<div class="footer"><span>${company.footer}</span><span>${doc.number} · Généré le ${new Date().toLocaleDateString("fr-MA")}</span></div>
</div></body></html>`;
}

function printDocument(doc, company) {
  const w = window.open("","_blank","width=900,height=700");
  w.document.write(generatePDFHTML(doc, company));
  w.document.close();
  setTimeout(() => w.print(), 600);
}

// ── Line item row ────────────────────────────────────────────────────────────
const LineItemRow = ({ item, onChange, onRemove, onDuplicate }) => {
  const { lineTotal } = calcDocTotals({ items: [item] }).lines[0] || {};
  const inp = (extra = {}) => ({ style: { background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 8px", color: C.text, fontSize: 12, outline: "none", width: "100%" }, ...extra });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "3fr 65px 100px 65px 65px 110px 84px", gap: 6, alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${C.border}20` }}>
      <input value={item.description} placeholder="Description / service"
        onChange={e => onChange({ ...item, description: e.target.value })}
        style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, outline: "none" }}
        onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border}
      />
      <input type="number" min="0" value={item.qty} onChange={e => onChange({ ...item, qty: parseFloat(e.target.value)||0 })} {...inp({ style: { ...inp().style, textAlign: "center" } })} />
      <input type="number" min="0" value={item.unitPrice} onChange={e => onChange({ ...item, unitPrice: parseFloat(e.target.value)||0 })} {...inp({ style: { ...inp().style, textAlign: "right" } })} />
      <div style={{ position: "relative" }}>
        <input type="number" min="0" max="100" value={item.discount} onChange={e => onChange({ ...item, discount: parseFloat(e.target.value)||0 })} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 18px 8px 6px", color: C.text, fontSize: 12, outline: "none", width: "100%", textAlign: "center" }} />
        <span style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: C.textMuted }}>%</span>
      </div>
      <div style={{ position: "relative" }}>
        <input type="number" min="0" max="100" value={item.vat} onChange={e => onChange({ ...item, vat: parseFloat(e.target.value)||0 })} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 18px 8px 6px", color: C.text, fontSize: 12, outline: "none", width: "100%", textAlign: "center" }} />
        <span style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: C.textMuted }}>%</span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, textAlign: "right" }}>{fmtN(lineTotal)} MAD</div>
      <div style={{ display: "flex", gap: 3 }}>
        <button onClick={() => onDuplicate(item)} style={{ background: C.accentSoft, color: C.accent, border: "none", borderRadius: 5, padding: "5px 7px", cursor: "pointer", fontSize: 11 }}>⊕</button>
        <button onClick={() => onRemove(item.id)} style={{ background: C.redSoft, color: C.red, border: "none", borderRadius: 5, padding: "5px 7px", cursor: "pointer", fontSize: 11 }}>✕</button>
      </div>
    </div>
  );
};

// ── Totals summary ───────────────────────────────────────────────────────────
const TotalsSummary = ({ items, amountPaid = 0, showPayment = false }) => {
  const { subtotalHT, totalDiscount, totalVAT, totalTTC } = calcDocTotals({ items });
  const remaining = fmtN(parseFloat(totalTTC) - parseFloat(amountPaid));
  return (
    <div style={{ marginLeft: "auto", width: 300 }}>
      {[
        ["Sous-total HT", `${subtotalHT} MAD`, C.textDim],
        parseFloat(totalDiscount) > 0 && ["Remises", `- ${totalDiscount} MAD`, C.red],
        ["TVA", `${totalVAT} MAD`, C.textDim],
      ].filter(Boolean).map(([l, v, col]) => (
        <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13, color: col }}><span>{l}</span><span>{v}</span></div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: 16, fontWeight: 900, color: C.text, borderTop: `2px solid ${C.accent}`, marginTop: 4 }}>
        <span>Total TTC</span><span style={{ color: C.accent }}>{totalTTC} MAD</span>
      </div>
      {showPayment && <>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12, color: C.green }}><span>Payé</span><span>{fmtN(amountPaid)} MAD</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, fontWeight: 700, color: parseFloat(remaining)>0?C.red:C.green }}><span>Reste dû</span><span>{remaining} MAD</span></div>
      </>}
    </div>
  );
};

// ── Company settings modal ───────────────────────────────────────────────────
const CompanySettingsModal = ({ company, onSave, onClose }) => {
  const [form, setForm] = useState(company);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20, overflow: "auto" }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, width: 680, maxWidth: "95vw" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: C.text, fontSize: 16, fontWeight: 800 }}>⚙ Profil entreprise</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <FInput label="Nom entreprise"       value={form.name}    onChange={e => set("name",    e.target.value)} />
          <FInput label="ICE"                  value={form.ice}     onChange={e => set("ice",     e.target.value)} />
          <FInput label="IF"                   value={form.if_}     onChange={e => set("if_",     e.target.value)} />
          <FInput label="RC"                   value={form.rc}      onChange={e => set("rc",      e.target.value)} />
          <FInput label="Adresse"              value={form.address} onChange={e => set("address", e.target.value)} />
          <FInput label="Téléphone"            value={form.phone}   onChange={e => set("phone",   e.target.value)} />
          <FInput label="Email"                value={form.email}   onChange={e => set("email",   e.target.value)} />
          <FInput label="Coordonnées bancaires"value={form.bank}    onChange={e => set("bank",    e.target.value)} />
          <FTextarea label="Pied de page / mentions légales" value={form.footer} rows={3}
            onChange={e => set("footer", e.target.value)} style={{ gridColumn: "span 2", width: "100%" }} />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
          <Btn onClick={() => { onSave(form); onClose(); }}>✓ Sauvegarder</Btn>
        </div>
      </div>
    </div>
  );
};

// ── WhatsApp modal ───────────────────────────────────────────────────────────
const WAModal = ({ doc, onClose }) => {
  const mainMsg = doc.type === "Devis"
    ? `Bonjour ${doc.clientName},\n\nVeuillez trouver ci-joint votre devis *${doc.number}* d'un montant de *${calcDocTotals(doc).totalTTC} MAD*.\n\n${doc.driveLink?`📎 ${doc.driveLink}\n\n`:""}N'hésitez pas à me contacter pour toute question.\n\nCordialement.`
    : `Bonjour ${doc.clientName},\n\nVoici votre facture *${doc.number}* d'un montant de *${calcDocTotals(doc).totalTTC} MAD*.\n\n${doc.driveLink?`📎 ${doc.driveLink}\n\n`:""}Merci de procéder au règlement avant le *${doc.dueDate}*.\n\nCordialement.`;
  const reminderMsg = `Bonjour ${doc.clientName},\n\nPetit rappel concernant votre facture *${doc.number}*, reste dû : *${getRemaining(doc)} MAD* (échéance : ${doc.dueDate}).\n\nMerci de régulariser.\n\nCordialement.`;
  const [tab, setTab] = useState("main");
  const [msg, setMsg] = useState(mainMsg);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, width: 520, maxWidth: "90vw" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: C.text, fontSize: 15, fontWeight: 800 }}>💬 Envoyer par WhatsApp</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[["main","Message principal"],["reminder","Rappel paiement"]].map(([k,l]) => (
            <button key={k} onClick={() => { setTab(k); setMsg(k==="main"?mainMsg:reminderMsg); }}
              style={{ background: tab===k?"#25D366":"transparent", color: tab===k?"#fff":C.textMuted, border: `1px solid ${tab===k?"#25D366":C.border}`, borderRadius: 7, padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{l}</button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6, fontWeight: 700 }}>Destinataire : {doc.clientPhone}</div>
        <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={8}
          style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 12, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
        <button onClick={() => window.open(`https://wa.me/${doc.clientPhone.replace(/\s/g,"")}?text=${encodeURIComponent(msg)}`,"_blank")}
          style={{ marginTop: 14, background: "#25D366", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 800, fontSize: 14, cursor: "pointer", width: "100%" }}>
          Ouvrir dans WhatsApp ↗
        </button>
      </div>
    </div>
  );
};

// ── Document form ─────────────────────────────────────────────────────────────
const DocumentForm = ({ initial, company, allDocs, onSave, onCancel }) => {
  const [doc, setDoc] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState("info");
  const set = (k, v) => setDoc(d => ({ ...d, [k]: v }));

  const CLIENTS_QUICK = [
    { id: 1, name: "Sara Benali",  business: "Boutique Sara",  phone: "+212 6 12 34 56 78", email: "sara@boutique.ma",  address: "Rue Mohammed V, Tanger" },
    { id: 2, name: "Karim Alaoui", business: "Tech Solutions", phone: "+212 6 98 76 54 32", email: "karim@tech.ma",    address: "Technopark, Casablanca" },
    { id: 3, name: "Fatima Zahra", business: "FZ Design",      phone: "+212 6 55 44 33 22", email: "fz@design.ma",    address: "Zerktouni, Casablanca" },
  ];

  const selectClient = c => setDoc(d => ({ ...d, clientId: c.id, clientName: c.name, clientBusiness: c.business, clientPhone: c.phone, clientEmail: c.email, clientAddress: c.address }));
  const addLine = () => set("items", [...doc.items, mkItem("",1,0,20,0)]);
  const updLine = upd => set("items", doc.items.map(it => it.id === upd.id ? upd : it));
  const remLine = id  => set("items", doc.items.filter(it => it.id !== id));
  const dupLine = it  => set("items", [...doc.items, { ...it, id: Math.random().toString(36).slice(2) }]);

  const handleSave = async (andUpload) => {
    setSaving(true);
    const saved = { ...doc, id: doc.id || `DOC-${Date.now()}`, updatedAt: new Date().toISOString() };
    if (andUpload) {
      setUploading(true);
      saved.driveLink = await simulateDriveUpload(saved);
      setUploading(false);
    }
    onSave(saved);
    setSaving(false);
  };

  const convertToInvoice = () => {
    const fac = {
      ...doc, id: "", type: "Facture",
      number: `FAC-2026-${String((allDocs||[]).filter(d=>d.type==="Facture").length+1).padStart(3,"0")}`,
      status: "Draft", paymentMethod: "", amountPaid: 0, paymentDate: "", paymentRef: "",
      notes: `Facture suite au devis ${doc.number}.`,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    onSave({ ...doc, status: "Accepted", updatedAt: new Date().toISOString() });
    setTimeout(() => onSave(fac), 80);
  };

  const statusOpts = doc.type === "Devis"
    ? ["Draft","Sent","Accepted","Rejected","Expired"]
    : ["Draft","Sent","Paid","Unpaid","Partial","Cancelled"];

  const TABS = [
    { id: "info",    label: "📄 Informations" },
    { id: "items",   label: `📦 Lignes (${doc.items.length})` },
    { id: "payment", label: "💳 Paiement" },
    { id: "notes",   label: "📝 Notes" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 18, borderBottom: `1px solid ${C.border}`, marginBottom: 18 }}>
        <div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 22 }}>{doc.type==="Devis"?"📋":"🧾"}</span>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0 }}>{doc.id ? `Modifier ${doc.type}` : `Nouveau ${doc.type}`}</h2>
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>N° {doc.number}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onCancel}>← Annuler</Btn>
          <Btn variant="ghost" onClick={() => printDocument(doc, company)}>🖨 Aperçu PDF</Btn>
          <Btn variant="custom" color={C.cyan} onClick={() => handleSave(true)} disabled={saving||uploading}>
            {uploading ? "⟳ Drive…" : "☁ Sauvegarder + Drive"}
          </Btn>
          <Btn onClick={() => handleSave(false)} disabled={saving}>{saving?"⟳ …":"✓ Sauvegarder"}</Btn>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 18, flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab===t.id?C.accent:"transparent", color: tab===t.id?"#fff":C.textMuted, border: `1px solid ${tab===t.id?C.accent:C.border}`, borderRadius: 8, padding: "7px 15px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{t.label}</button>
        ))}
      </div>

      {tab === "info" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Document</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14 }}>
              <FSelect label="Type"       value={doc.type}      options={["Devis","Facture"]}   onChange={e => set("type",      e.target.value)} />
              <FInput  label="Numéro"     value={doc.number}                                    onChange={e => set("number",    e.target.value)} />
              <FInput  label="Émission"   type="date" value={doc.issueDate}                     onChange={e => set("issueDate", e.target.value)} />
              <FInput  label="Échéance"   type="date" value={doc.dueDate}                       onChange={e => set("dueDate",   e.target.value)} />
              <FSelect label="Statut"     value={doc.status}    options={statusOpts}            onChange={e => set("status",    e.target.value)} />
            </div>
            {doc.type === "Devis" && (
              <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 4fr", gap: 14 }}>
                <FInput label="Validité" type="date" value={doc.validityDate} onChange={e => set("validityDate", e.target.value)} />
              </div>
            )}
          </Card>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Client</div>
              <div style={{ display: "flex", gap: 6 }}>
                {CLIENTS_QUICK.map(c => (
                  <button key={c.id} onClick={() => selectClient(c)} style={{ background: doc.clientId===c.id?C.accentSoft:"transparent", color: doc.clientId===c.id?C.accent:C.textMuted, border: `1px solid ${doc.clientId===c.id?C.accent+"50":C.border}`, borderRadius: 7, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{c.name.split(" ")[0]}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <FInput label="Nom client"  value={doc.clientName}     onChange={e => set("clientName",     e.target.value)} />
              <FInput label="Entreprise"  value={doc.clientBusiness} onChange={e => set("clientBusiness", e.target.value)} />
              <FInput label="Téléphone"   value={doc.clientPhone}    onChange={e => set("clientPhone",    e.target.value)} />
              <FInput label="Email"       value={doc.clientEmail}    onChange={e => set("clientEmail",    e.target.value)} />
              <FInput label="Adresse"     value={doc.clientAddress}  onChange={e => set("clientAddress",  e.target.value)} style={{ gridColumn: "span 2" }} />
            </div>
          </Card>
        </div>
      )}

      {tab === "items" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Lignes de facturation</div>
            <Btn onClick={addLine}>+ Ajouter ligne</Btn>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "3fr 65px 100px 65px 65px 110px 84px", gap: 6, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
            {["Description","Qté","P.U. HT","Remise","TVA","Total TTC",""].map((h,i) => (
              <div key={i} style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: i>=5?"right":"left" }}>{h}</div>
            ))}
          </div>
          {doc.items.map(it => <LineItemRow key={it.id} item={it} onChange={updLine} onRemove={remLine} onDuplicate={dupLine} />)}
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
            <TotalsSummary items={doc.items} amountPaid={doc.amountPaid} showPayment={doc.type==="Facture"} />
          </div>
        </Card>
      )}

      {tab === "payment" && (
        <Card>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
            {doc.type==="Facture" ? "Paiement" : "Convertir en Facture"}
          </div>
          {doc.type === "Devis" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
              <p style={{ color: C.textDim, fontSize: 13 }}>Convertir ce devis en facture — toutes les lignes seront copiées automatiquement.</p>
              <Btn variant="success" onClick={convertToInvoice}>⇄ Convertir en Facture</Btn>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
                <FSelect label="Mode de paiement" value={doc.paymentMethod}
                  options={["","Espèces","Virement bancaire","Chèque","Carte bancaire","Autre"]}
                  onChange={e => set("paymentMethod", e.target.value)} />
                <FInput label="Montant payé (MAD)" type="number" value={doc.amountPaid} onChange={e => set("amountPaid", parseFloat(e.target.value)||0)} />
                <FInput label="Date de paiement" type="date" value={doc.paymentDate} onChange={e => set("paymentDate", e.target.value)} />
                <FInput label="Référence" value={doc.paymentRef} onChange={e => set("paymentRef", e.target.value)} />
              </div>
              <TotalsSummary items={doc.items} amountPaid={doc.amountPaid} showPayment />
            </div>
          )}
        </Card>
      )}

      {tab === "notes" && (
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FTextarea label="Notes client (affichées sur le doc)" value={doc.notes}    rows={4} onChange={e => set("notes",        e.target.value)} style={{ width: "100%" }} />
            <FTextarea label="Conditions générales"                value={doc.terms}    rows={4} onChange={e => set("terms",        e.target.value)} style={{ width: "100%" }} />
            <FTextarea label="Note interne (non visible)"          value={doc.internalNote} rows={3} onChange={e => set("internalNote", e.target.value)} style={{ width: "100%", borderColor: C.amber+"50" }} />
          </div>
        </Card>
      )}
    </div>
  );
};

// ── Document detail view ──────────────────────────────────────────────────────
const DocumentDetail = ({ doc, company, onEdit, onClose, onMarkPaid, onSendWA }) => {
  const { lines, subtotalHT, totalDiscount, totalVAT, totalTTC } = calcDocTotals(doc);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 24 }}>{doc.type==="Devis"?"📋":"🧾"}</span>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0 }}>{doc.number}</h2>
            <div style={{ fontSize: 12, color: C.textMuted }}>{doc.clientName} · {doc.clientBusiness}</div>
          </div>
          {statusBadge(doc.status)}
        </div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>← Retour</Btn>
          <Btn variant="ghost" onClick={() => printDocument(doc, company)}>🖨 PDF</Btn>
          {doc.driveLink && <a href={doc.driveLink} target="_blank" rel="noopener noreferrer"><Btn variant="custom" color={C.cyan}>☁ Drive</Btn></a>}
          <Btn variant="custom" color="#25D366" onClick={() => onSendWA(doc)}>💬 WhatsApp</Btn>
          {doc.type==="Facture" && doc.status!=="Paid" && <Btn variant="success" onClick={() => onMarkPaid(doc.id)}>✓ Marquer payé</Btn>}
          <Btn onClick={() => onEdit(doc)}>✏ Modifier</Btn>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Client</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{doc.clientName}</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4, lineHeight: 1.8 }}>{doc.clientBusiness}<br/>{doc.clientPhone}<br/>{doc.clientEmail}<br/>{doc.clientAddress}</div>
        </Card>
        <Card>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Détails</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[["Type",doc.type],["Numéro",doc.number],["Émission",doc.issueDate],["Échéance",doc.dueDate||"—"],doc.validityDate&&["Validité",doc.validityDate],doc.paymentMethod&&["Paiement",doc.paymentMethod]].filter(Boolean).map(([l,v]) => (
              <div key={l}><div style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{l}</div><div style={{ fontSize: 13, color: C.text, marginTop: 2 }}>{v}</div></div>
            ))}
          </div>
        </Card>
      </div>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Lignes</div>
        </div>
        <div style={{ padding: "0 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "3fr 65px 100px 65px 65px 110px", gap: 6, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
            {["Description","Qté","P.U. HT","Remise","TVA","Total TTC"].map((h,i) => (
              <div key={i} style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: i>=5?"right":"left" }}>{h}</div>
            ))}
          </div>
          {lines.map((it,i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "3fr 65px 100px 65px 65px 110px", gap: 6, padding: "10px 0", borderBottom: `1px solid ${C.border}20` }}>
              <div style={{ color: C.text, fontSize: 13 }}>{it.description}</div>
              <div style={{ color: C.textDim, textAlign: "center" }}>{it.qty}</div>
              <div style={{ color: C.textDim, textAlign: "right" }}>{fmtN(it.unitPrice)}</div>
              <div style={{ color: it.discount>0?C.red:C.textMuted, textAlign: "center" }}>{it.discount}%</div>
              <div style={{ color: C.textMuted, textAlign: "center" }}>{it.vat}%</div>
              <div style={{ color: C.accent, fontWeight: 700, textAlign: "right" }}>{fmtN(it.lineTotal)} MAD</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "16px 20px", borderTop: `1px solid ${C.border}` }}>
          <TotalsSummary items={doc.items} amountPaid={doc.amountPaid} showPayment={doc.type==="Facture"} />
        </div>
      </Card>

      {(doc.notes||doc.terms) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {doc.notes && <Card><div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Notes</div><p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.7 }}>{doc.notes}</p></Card>}
          {doc.terms && <Card><div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Conditions</div><p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.7 }}>{doc.terms}</p></Card>}
        </div>
      )}
    </div>
  );
};

// ── Main quotes page ──────────────────────────────────────────────────────────
const QuotesPage = ({ data, setData }) => {
  const docs    = data.documents    || [];
  const company = data.companyProfile || DEFAULT_COMPANY;

  const updateDocs = useCallback(fn => setData(d => ({ ...d, documents: fn(d.documents || []) })), [setData]);
  const updateCompany = c => setData(d => ({ ...d, companyProfile: c }));

  const [view,        setView]        = useState("list");
  const [activeDoc,   setActiveDoc]   = useState(null);
  const [filter,      setFilter]      = useState("All");
  const [search,      setSearch]      = useState("");
  const [waDoc,       setWaDoc]       = useState(null);
  const [showSettings,setShowSettings]= useState(false);

  const saveDoc = doc => {
    updateDocs(prev => {
      const idx = prev.findIndex(d => d.id === doc.id);
      return idx >= 0 ? prev.map(d => d.id === doc.id ? doc : d) : [...prev, { ...doc, id: `DOC-${Date.now()}` }];
    });
    setView("list");
  };

  const markPaid = id => updateDocs(prev => prev.map(d =>
    d.id === id ? { ...d, status: "Paid", amountPaid: parseFloat(calcDocTotals(d).totalTTC), updatedAt: new Date().toISOString() } : d
  ));

  const duplicate = doc => {
    const nd = { ...doc, id: "", status: "Draft",
      number: `${doc.type==="Devis"?"DEV":"FAC"}-2026-${String(docs.filter(d=>d.type===doc.type).length+1).padStart(3,"0")}`,
      issueDate: "2026-03-09", dueDate: "", driveLink: "", amountPaid: 0,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    setActiveDoc(nd); setView("form");
  };

  const del = id => { if (window.confirm("Supprimer ce document ?")) updateDocs(p => p.filter(d => d.id !== id)); };

  // Stats
  const invoices     = docs.filter(d => d.type === "Facture");
  const thisMonth    = docs.filter(d => d.issueDate?.startsWith("2026-03") && d.type === "Facture");
  const unpaidAmt    = invoices.filter(d => ["Unpaid","Partial"].includes(d.status)).reduce((s,d) => s + parseFloat(getRemaining(d)), 0);
  const totalRevenue = invoices.reduce((s,d) => s + parseFloat(calcDocTotals(d).totalTTC), 0);

  const filtered = useMemo(() => docs
    .filter(d => filter === "All" || d.status === filter || (filter==="Devis"&&d.type==="Devis") || (filter==="Facture"&&d.type==="Facture"))
    .filter(d => !search || d.clientName.toLowerCase().includes(search.toLowerCase()) || d.number.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => b.createdAt.localeCompare(a.createdAt)),
    [docs, filter, search]
  );

  const STATUS_FILTERS = ["All","Devis","Facture","Draft","Sent","Accepted","Paid","Unpaid","Partial"];

  if (view === "form") return (
    <DocumentForm initial={activeDoc||blankDoc("Devis",docs)} company={company} allDocs={docs} onSave={saveDoc} onCancel={() => setView("list")} />
  );

  if (view === "detail" && activeDoc) return (
    <>
      <DocumentDetail doc={activeDoc} company={company} onEdit={d => { setActiveDoc(d); setView("form"); }} onClose={() => setView("list")} onMarkPaid={markPaid} onSendWA={setWaDoc} />
      {waDoc && <WAModal doc={waDoc} onClose={() => setWaDoc(null)} />}
    </>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {waDoc       && <WAModal doc={waDoc} onClose={() => setWaDoc(null)} />}
      {showSettings && <CompanySettingsModal company={company} onSave={updateCompany} onClose={() => setShowSettings(false)} />}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>Devis & Facturation</h2>
          <p style={{ color: C.textMuted, margin: "5px 0 0", fontSize: 13 }}>{docs.length} documents · {invoices.filter(d=>d.status==="Paid").length} factures payées</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost"   onClick={() => setShowSettings(true)}>⚙ Entreprise</Btn>
          <Btn variant="ghost"   onClick={() => { setActiveDoc(blankDoc("Devis",  docs)); setView("form"); }}>+ Devis</Btn>
          <Btn                   onClick={() => { setActiveDoc(blankDoc("Facture",docs)); setView("form"); }}>+ Facture</Btn>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
        <MetricCard icon="📋" label="Total Devis"     value={docs.filter(d=>d.type==="Devis").length}                    sub={fmtMAD(docs.filter(d=>d.type==="Devis").reduce((s,d)=>s+parseFloat(calcDocTotals(d).totalTTC),0))} color={C.cyan}   />
        <MetricCard icon="🧾" label="Total Factures"  value={invoices.length}                                             sub={fmtMAD(totalRevenue)}  color={C.accent}  />
        <MetricCard icon="✓"  label="Payées"          value={invoices.filter(d=>d.status==="Paid").length}               sub={fmtMAD(invoices.filter(d=>d.status==="Paid").reduce((s,d)=>s+parseFloat(calcDocTotals(d).totalTTC),0))} color={C.green}  />
        <MetricCard icon="⚠"  label="Impayées"        value={invoices.filter(d=>["Unpaid","Partial"].includes(d.status)).length} sub={fmtMAD(unpaidAmt)}     color={C.red}    />
        <MetricCard icon="📅" label="CA ce mois"      value={fmtMAD(thisMonth.reduce((s,d)=>s+parseFloat(calcDocTotals(d).totalTTC),0))} sub={`${thisMonth.length} factures`} color={C.amber}  />
        <MetricCard icon="📄" label="Brouillons"      value={docs.filter(d=>d.status==="Draft").length}                  sub="En attente"             color={C.purple}  />
      </div>

      {/* Search + filters */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textMuted }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher client ou numéro…"
            style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px 9px 34px", color: C.text, fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ background: filter===f?C.accent:"transparent", color: filter===f?"#fff":C.textMuted, border: `1px solid ${filter===f?C.accent:C.border}`, borderRadius: 7, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card style={{ padding: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["N°","Type","Client","Date","Échéance","HT","TVA","TTC","Statut","Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 12px", textAlign: "left", fontSize: 10, color: C.textMuted, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={10} style={{ padding: 40, textAlign: "center", color: C.textMuted, fontSize: 13 }}>Aucun document trouvé</td></tr>}
              {filtered.map(doc => {
                const { subtotalHT, totalVAT, totalTTC } = calcDocTotals(doc);
                return (
                  <tr key={doc.id}
                    style={{ borderBottom: `1px solid ${C.border}20`, cursor: "pointer", transition: "background 0.12s" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.surfaceHover}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "12px 12px" }}><span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{doc.number}</span></td>
                    <td style={{ padding: "12px 12px" }}><Badge color={doc.type==="Devis"?"cyan":"blue"}>{doc.type}</Badge></td>
                    <td style={{ padding: "12px 12px" }}>
                      <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{doc.clientName}</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>{doc.clientBusiness}</div>
                    </td>
                    <td style={{ padding: "12px 12px", fontSize: 12, color: C.textDim }}>{doc.issueDate}</td>
                    <td style={{ padding: "12px 12px", fontSize: 12, color: C.textDim }}>{doc.dueDate||"—"}</td>
                    <td style={{ padding: "12px 12px", fontSize: 12, color: C.textDim, textAlign: "right" }}>{subtotalHT}</td>
                    <td style={{ padding: "12px 12px", fontSize: 12, color: C.textDim, textAlign: "right" }}>{totalVAT}</td>
                    <td style={{ padding: "12px 12px", fontSize: 13, fontWeight: 800, color: C.accent, textAlign: "right" }}>{totalTTC} MAD</td>
                    <td style={{ padding: "12px 12px" }}><Badge color={statusBadgeColor(doc.status)}>{doc.status}</Badge></td>
                    <td style={{ padding: "12px 12px" }}>
                      <div style={{ display: "flex", gap: 3 }}>
                        {[
                          ["👁", C.accentSoft, C.accent, () => { setActiveDoc(doc); setView("detail"); }, "Voir"],
                          ["✏", C.accentSoft, C.accent, () => { setActiveDoc(doc); setView("form"); },   "Modifier"],
                          ["⊕", C.purpleSoft, C.purple, () => duplicate(doc),                           "Dupliquer"],
                          ["🖨", C.amberSoft,  C.amber,  () => printDocument(doc, company),              "PDF"],
                          ["💬","#25D36620","#25D366",  () => setWaDoc(doc),                             "WhatsApp"],
                        ].map(([ic,bg,col,fn,title]) => (
                          <button key={title} onClick={fn} title={title} style={{ background: bg, color: col, border: "none", borderRadius: 5, padding: "5px 8px", cursor: "pointer", fontSize: 12 }}>{ic}</button>
                        ))}
                        {doc.type==="Facture" && doc.status!=="Paid" && (
                          <button onClick={() => markPaid(doc.id)} title="Marquer payé" style={{ background: C.greenSoft, color: C.green, border: "none", borderRadius: 5, padding: "5px 8px", cursor: "pointer", fontSize: 12 }}>✓</button>
                        )}
                        <button onClick={() => del(doc.id)} title="Supprimer" style={{ background: C.redSoft, color: C.red, border: "none", borderRadius: 5, padding: "5px 8px", cursor: "pointer", fontSize: 12 }}>✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

function statusBadgeColor(s) {
  return { Draft:"amber", Sent:"blue", Accepted:"teal", Rejected:"red", Expired:"red", Paid:"green", Unpaid:"red", Partial:"purple", Cancelled:"red" }[s] || "blue";
}


// ═══════════════════════════════════════════════════════════════════════════════
// NEW MODULE 1 — TASKS / FOLLOW-UPS
// ═══════════════════════════════════════════════════════════════════════════════
const TASK_PRIORITIES = ["Urgent", "High", "Normal", "Low"];
const TASK_STATUSES   = ["Todo", "InProgress", "Completed"];
const TASK_CATEGORIES = ["Finance", "Sales", "Client", "Content", "Admin", "Other"];

const priorityColor = (p) => ({ Urgent: "red", High: "amber", Normal: "blue", Low: "teal" }[p] || "blue");
const taskStatusColor = (s) => ({ Todo: "amber", InProgress: "blue", Completed: "green" }[s] || "blue");

const TasksPage = ({ data, setData }) => {
  const tasks = data.tasks || [];
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const today = "2026-03-09";

  const blank = { title: "", clientName: "", priority: "Normal", status: "Todo", dueDate: today, category: "Client", notes: "" };
  const [form, setForm] = useState(blank);
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openNew = () => { setForm(blank); setEditTask(null); setShowForm(true); };
  const openEdit = (t) => { setForm({ ...t }); setEditTask(t.id); setShowForm(true); };

  const save = () => {
    if (!form.title) return;
    if (editTask) {
      setData(d => ({ ...d, tasks: d.tasks.map(t => t.id === editTask ? { ...form, id: editTask } : t) }));
    } else {
      setData(d => ({ ...d, tasks: [...d.tasks, { ...form, id: `T${Date.now()}` }] }));
    }
    setShowForm(false);
  };

  const toggle = (id, newStatus) => setData(d => ({ ...d, tasks: d.tasks.map(t => t.id === id ? { ...t, status: newStatus } : t) }));
  const del = (id) => setData(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== id) }));

  const filtered = filter === "All" ? tasks : filter === "Today"
    ? tasks.filter(t => t.dueDate === today && t.status !== "Completed")
    : filter === "Completed" ? tasks.filter(t => t.status === "Completed")
    : tasks.filter(t => t.status === filter || t.priority === filter || t.category === filter);

  const byStatus = (s) => tasks.filter(t => t.status === s);
  const urgentToday = tasks.filter(t => t.priority === "Urgent" && t.status !== "Completed" && t.dueDate <= today);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Tasks & Follow-ups</h2>
          <p style={{ color: C.textMuted, margin: "4px 0 0", fontSize: 13 }}>
            {byStatus("Todo").length} à faire · {byStatus("InProgress").length} en cours · {byStatus("Completed").length} terminées
          </p>
        </div>
        <button onClick={openNew} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Nouvelle tâche</button>
      </div>

      {urgentToday.length > 0 && (
        <div style={{ background: C.redSoft, border: `1px solid ${C.red}40`, borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18 }}>🔥</span>
          <div>
            <span style={{ color: C.red, fontWeight: 700, fontSize: 13 }}>{urgentToday.length} tâche{urgentToday.length > 1 ? "s urgentes" : " urgente"} aujourd'hui : </span>
            <span style={{ color: C.red, fontSize: 13 }}>{urgentToday.map(t => t.title).join(" · ")}</span>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        <MetricCard icon="🔥" label="Urgentes"    value={tasks.filter(t => t.priority==="Urgent" && t.status!=="Completed").length}   sub="À traiter maintenant" color={C.red}    />
        <MetricCard icon="📋" label="À faire"     value={byStatus("Todo").length}                                                       sub="En attente"           color={C.amber}  />
        <MetricCard icon="⚡" label="En cours"    value={byStatus("InProgress").length}                                                 sub="Active"               color={C.accent} />
        <MetricCard icon="✓"  label="Terminées"   value={byStatus("Completed").length}                                                  sub="Cette semaine"        color={C.green}  />
        <MetricCard icon="📅" label="Aujourd'hui" value={tasks.filter(t => t.dueDate===today && t.status!=="Completed").length}         sub="Dues aujourd'hui"     color={C.purple} />
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["All","Today","Todo","InProgress","Urgent","Finance","Client","Sales","Completed"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter===f?C.accent:"transparent", color: filter===f?"#fff":C.textMuted, border: `1px solid ${filter===f?C.accent:C.border}`, borderRadius: 7, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{f}</button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim, marginBottom: 14 }}>{editTask ? "Modifier tâche" : "Nouvelle tâche"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <input placeholder="Titre de la tâche *" value={form.title} onChange={e => setF("title", e.target.value)}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none" }} />
            <select value={form.priority} onChange={e => setF("priority", e.target.value)} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13 }}>
              {TASK_PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
            <select value={form.status} onChange={e => setF("status", e.target.value)} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13 }}>
              {TASK_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={form.category} onChange={e => setF("category", e.target.value)} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13 }}>
              {TASK_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input type="date" value={form.dueDate} onChange={e => setF("dueDate", e.target.value)}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
            <input placeholder="Client lié (optionnel)" value={form.clientName} onChange={e => setF("clientName", e.target.value)}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none" }} />
            <input placeholder="Notes" value={form.notes} onChange={e => setF("notes", e.target.value)}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={save} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Sauvegarder</button>
            <button onClick={() => setShowForm(false)} style={{ background: "transparent", color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer" }}>Annuler</button>
          </div>
        </Card>
      )}

      {/* Task list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 && <div style={{ color: C.textMuted, fontSize: 13, padding: 20, textAlign: "center" }}>Aucune tâche trouvée</div>}
        {filtered.map(t => (
          <div key={t.id} style={{
            background: C.surface, border: `1px solid ${t.status === "Completed" ? C.border : t.priority === "Urgent" ? C.red + "40" : C.border}`,
            borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14,
            opacity: t.status === "Completed" ? 0.55 : 1, transition: "opacity 0.2s",
          }}>
            {/* Checkbox */}
            <button onClick={() => toggle(t.id, t.status === "Completed" ? "Todo" : "Completed")}
              style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${t.status === "Completed" ? C.green : C.border}`, background: t.status === "Completed" ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}>
              {t.status === "Completed" && <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span>}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.status === "Completed" ? C.textMuted : C.text, textDecoration: t.status === "Completed" ? "line-through" : "none" }}>{t.title}</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3, display: "flex", gap: 12 }}>
                {t.clientName && <span>👤 {t.clientName}</span>}
                {t.dueDate && <span style={{ color: t.dueDate < today && t.status !== "Completed" ? C.red : C.textMuted }}>📅 {t.dueDate}</span>}
                {t.notes && <span>💬 {t.notes}</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              <Badge color={priorityColor(t.priority)}>{t.priority}</Badge>
              <Badge color={taskStatusColor(t.status)}>{t.status}</Badge>
              <span style={{ fontSize: 11, color: C.textMuted, background: C.surfaceHover, borderRadius: 5, padding: "2px 8px" }}>{t.category}</span>
              {t.status === "Todo" && (
                <button onClick={() => toggle(t.id, "InProgress")} style={{ background: C.accentSoft, color: C.accent, border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>▶ Start</button>
              )}
              <button onClick={() => openEdit(t)} style={{ background: "transparent", color: C.textMuted, border: "none", fontSize: 13, cursor: "pointer" }}>✏</button>
              <button onClick={() => del(t.id)} style={{ background: "transparent", color: C.red, border: "none", fontSize: 13, cursor: "pointer" }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// NEW MODULE 2 — EXPENSES / CHARGES
// ═══════════════════════════════════════════════════════════════════════════════
const EXPENSE_CATEGORIES = ["Loyer", "Internet", "Marketing", "Transport", "Fournitures", "Équipement", "Services", "Taxes", "Salaires", "Autres"];

const ExpensesPage = ({ data, setData }) => {
  const expenses = data.expenses || [];
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState("All");
  const blank = { category: "Loyer", amount: "", date: "2026-03-09", supplier: "", paymentMethod: "Virement bancaire", note: "", status: "Paid" };
  const [form, setForm] = useState(blank);
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const add = () => {
    if (!form.amount) return;
    setData(d => ({ ...d, expenses: [...d.expenses, { ...form, id: `E${Date.now()}`, amount: parseFloat(form.amount) }] }));
    setForm(blank);
    setShowForm(false);
  };
  const del = (id) => setData(d => ({ ...d, expenses: d.expenses.filter(e => e.id !== id) }));

  const filtered = filterCat === "All" ? expenses : expenses.filter(e => e.category === filterCat);
  const thisMonth = expenses.filter(e => e.date.startsWith("2026-03"));
  const totalMonth = thisMonth.reduce((s, e) => s + e.amount, 0);
  const totalAll = expenses.reduce((s, e) => s + e.amount, 0);

  // Category breakdown
  const byCategory = EXPENSE_CATEGORIES.map(cat => ({
    cat,
    total: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const maxCat = byCategory[0]?.total || 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Expenses / Charges</h2>
          <p style={{ color: C.textMuted, margin: "4px 0 0", fontSize: 13 }}>{expenses.length} entrées · {MAD(totalAll)} total</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: C.red, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Ajouter dépense</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <MetricCard icon="📅" label="Ce mois"      value={MAD(totalMonth)}                                   sub={`${thisMonth.length} dépenses`}      color={C.red}    />
        <MetricCard icon="📊" label="Total période" value={MAD(totalAll)}                                    sub="Toutes dépenses"                      color={C.amber}  />
        <MetricCard icon="🔝" label="Plus grosse"   value={expenses.length ? MAD(Math.max(...expenses.map(e=>e.amount))) : "—"} sub="Dépense unique max" color={C.purple} />
        <MetricCard icon="✓"  label="Payées"        value={expenses.filter(e=>e.status==="Paid").length}     sub="Règlements effectués"                color={C.green}  />
      </div>

      {showForm && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim, marginBottom: 14 }}>Nouvelle dépense</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr", gap: 12 }}>
            <select value={form.category} onChange={e => setF("category", e.target.value)} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13 }}>
              {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input type="number" placeholder="Montant (MAD) *" value={form.amount} onChange={e => setF("amount", e.target.value)}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none" }} />
            <input type="date" value={form.date} onChange={e => setF("date", e.target.value)}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none" }} />
            <input placeholder="Fournisseur" value={form.supplier} onChange={e => setF("supplier", e.target.value)}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none" }} />
            <select value={form.paymentMethod} onChange={e => setF("paymentMethod", e.target.value)} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13 }}>
              {["Virement bancaire","Espèces","Chèque","Carte bancaire","Prélèvement auto"].map(m => <option key={m}>{m}</option>)}
            </select>
            <input placeholder="Note" value={form.note} onChange={e => setF("note", e.target.value)}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={add} style={{ background: C.red, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Enregistrer</button>
            <button onClick={() => setShowForm(false)} style={{ background: "transparent", color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer" }}>Annuler</button>
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Expenses table */}
        <Card style={{ padding: 0 }}>
          <div style={{ padding: "14px 20px 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["All", ...EXPENSE_CATEGORIES.filter(c => expenses.some(e => e.category === c))].map(f => (
              <button key={f} onClick={() => setFilterCat(f)} style={{ background: filterCat===f?C.red:"transparent", color: filterCat===f?"#fff":C.textMuted, border: `1px solid ${filterCat===f?C.red:C.border}`, borderRadius: 6, padding: "4px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>{f}</button>
            ))}
          </div>
          <div style={{ padding: 20 }}>
            <Table
              headers={["Date","Catégorie","Montant","Fournisseur","Mode","Note","Action"]}
              rows={filtered.sort((a,b) => b.date.localeCompare(a.date)).map(e => [
                <span style={{ color: C.textDim }}>{e.date}</span>,
                <Badge color="red">{e.category}</Badge>,
                <span style={{ color: C.red, fontWeight: 700 }}>{MAD(e.amount)}</span>,
                <span style={{ color: C.textDim }}>{e.supplier}</span>,
                <span style={{ color: C.textMuted, fontSize: 11 }}>{e.paymentMethod}</span>,
                <span style={{ color: C.textMuted, fontSize: 11 }}>{e.note}</span>,
                <button onClick={() => del(e.id)} style={{ background: "transparent", color: C.red, border: "none", fontSize: 12, cursor: "pointer" }}>✕</button>,
              ])}
            />
          </div>
        </Card>

        {/* Category breakdown */}
        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 16, letterSpacing: "0.08em", textTransform: "uppercase" }}>Répartition par catégorie</div>
          {byCategory.map(({ cat, total }) => (
            <div key={cat} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: C.textDim }}>{cat}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.red }}>{MAD(total)}</span>
              </div>
              <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(total / maxCat) * 100}%`, background: C.red, borderRadius: 3, transition: "width 0.4s" }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.textDim }}>Total</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: C.red }}>{MAD(totalAll)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// NEW MODULE 3 — SALES PIPELINE
// ═══════════════════════════════════════════════════════════════════════════════
const PIPELINE_STAGES = [
  { id: "NewLead",     label: "Nouveau lead",       color: C.textMuted },
  { id: "Contacted",   label: "Contacté",           color: C.cyan      },
  { id: "Meeting",     label: "RDV planifié",       color: C.accent    },
  { id: "QuoteSent",   label: "Devis envoyé",       color: C.purple    },
  { id: "Negotiation", label: "Négociation",        color: C.amber     },
  { id: "Won",         label: "Gagné ✓",           color: C.green     },
  { id: "Lost",        label: "Perdu",              color: C.red       },
];

const stageColor = (s) => PIPELINE_STAGES.find(p => p.id === s)?.color || C.textMuted;

const PipelinePage = ({ data, setData }) => {
  const pipeline = data.pipeline || [];
  const [view, setView] = useState("board"); // board | list
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const blank = { title: "", clientName: "", value: "", stage: "NewLead", probability: 20, source: "Direct", lastContact: "2026-03-09", notes: "" };
  const [form, setForm] = useState(blank);
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openNew = () => { setForm(blank); setEditId(null); setShowForm(true); };
  const openEdit = (d) => { setForm({ ...d }); setEditId(d.id); setShowForm(true); };

  const save = () => {
    if (!form.title) return;
    if (editId) {
      setData(d => ({ ...d, pipeline: d.pipeline.map(p => p.id === editId ? { ...form, id: editId, value: parseFloat(form.value) || 0 } : p) }));
    } else {
      setData(d => ({ ...d, pipeline: [...d.pipeline, { ...form, id: `P${Date.now()}`, value: parseFloat(form.value) || 0 }] }));
    }
    setShowForm(false);
  };

  const moveStage = (id, newStage) => setData(d => ({ ...d, pipeline: d.pipeline.map(p => p.id === id ? { ...p, stage: newStage } : p) }));
  const del = (id) => setData(d => ({ ...d, pipeline: d.pipeline.filter(p => p.id !== id) }));

  const active = pipeline.filter(p => !["Won","Lost"].includes(p.stage));
  const totalPipeline = active.reduce((s, p) => s + (p.value * p.probability / 100), 0);
  const totalWon = pipeline.filter(p => p.stage === "Won").reduce((s, p) => s + p.value, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Sales Pipeline</h2>
          <p style={{ color: C.textMuted, margin: "4px 0 0", fontSize: 13 }}>{active.length} deals actifs · {MAD(totalPipeline)} valeur pondérée</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["board","list"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ background: view===v?C.accent:"transparent", color: view===v?"#fff":C.textMuted, border: `1px solid ${view===v?C.accent:C.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{v === "board" ? "⬛ Board" : "≡ Liste"}</button>
          ))}
          <button onClick={openNew} style={{ background: C.green, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Nouveau deal</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <MetricCard icon="⚡" label="Deals actifs"  value={active.length}                                                         sub="En cours"              color={C.accent} />
        <MetricCard icon="💰" label="Valeur totale" value={MAD(pipeline.filter(p=>!["Won","Lost"].includes(p.stage)).reduce((s,p)=>s+p.value,0))} sub="Pipeline brut"  color={C.purple} />
        <MetricCard icon="🎯" label="Valeur pondérée" value={MAD(totalPipeline)}                                                  sub="× probabilité"         color={C.amber}  />
        <MetricCard icon="✓"  label="Deals gagnés" value={pipeline.filter(p=>p.stage==="Won").length}                            sub={MAD(totalWon)}         color={C.green}  />
        <MetricCard icon="✕"  label="Perdus"        value={pipeline.filter(p=>p.stage==="Lost").length}                          sub="À analyser"            color={C.red}    />
      </div>

      {showForm && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim, marginBottom: 14 }}>{editId ? "Modifier deal" : "Nouveau deal"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <input placeholder="Titre du deal *" value={form.title} onChange={e => setF("title", e.target.value)}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none" }} />
            <input placeholder="Client / Prospect" value={form.clientName} onChange={e => setF("clientName", e.target.value)}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none" }} />
            <input type="number" placeholder="Valeur (MAD)" value={form.value} onChange={e => setF("value", e.target.value)}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none" }} />
            <select value={form.stage} onChange={e => setF("stage", e.target.value)} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13 }}>
              {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="number" min="0" max="100" value={form.probability} onChange={e => setF("probability", parseInt(e.target.value)||0)}
                style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 8px", color: C.text, fontSize: 13, outline: "none", width: "70px" }} />
              <span style={{ color: C.textMuted, fontSize: 13 }}>% prob.</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 12 }}>
            <select value={form.source} onChange={e => setF("source", e.target.value)} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13 }}>
              {["Direct","Referral","Instagram","LinkedIn","Website","Existing client","Other"].map(s => <option key={s}>{s}</option>)}
            </select>
            <input type="date" value={form.lastContact} onChange={e => setF("lastContact", e.target.value)}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none" }} />
            <input placeholder="Notes" value={form.notes} onChange={e => setF("notes", e.target.value)}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={save} style={{ background: C.green, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Sauvegarder</button>
            <button onClick={() => setShowForm(false)} style={{ background: "transparent", color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer" }}>Annuler</button>
          </div>
        </Card>
      )}

      {/* BOARD VIEW */}
      {view === "board" && (
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
          {PIPELINE_STAGES.map(stage => {
            const deals = pipeline.filter(p => p.stage === stage.id);
            const stageValue = deals.reduce((s, p) => s + p.value, 0);
            return (
              <div key={stage.id} style={{ minWidth: 220, width: 220, flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "6px 10px", background: stage.color + "18", borderRadius: 8, border: `1px solid ${stage.color}30` }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: stage.color }}>{stage.label}</span>
                  <span style={{ fontSize: 10, color: stage.color, fontWeight: 600 }}>{deals.length} · {MAD(stageValue)}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {deals.map(deal => (
                    <div key={deal.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, cursor: "pointer", transition: "border-color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = stage.color + "80"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4, lineHeight: 1.3 }}>{deal.title}</div>
                      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>👤 {deal.clientName}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: stage.color }}>{MAD(deal.value)}</span>
                        <span style={{ fontSize: 10, color: C.textMuted, background: C.surfaceHover, borderRadius: 4, padding: "2px 6px" }}>{deal.probability}%</span>
                      </div>
                      <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                        {PIPELINE_STAGES.filter(s => s.id !== stage.id && s.id !== "Lost").slice(0, 2).map(ns => (
                          <button key={ns.id} onClick={() => moveStage(deal.id, ns.id)} title={`→ ${ns.label}`}
                            style={{ background: ns.color + "15", color: ns.color, border: "none", borderRadius: 5, padding: "3px 7px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>→ {ns.label.split(" ")[0]}</button>
                        ))}
                        <button onClick={() => openEdit(deal)} style={{ background: "transparent", color: C.textMuted, border: "none", fontSize: 11, cursor: "pointer", marginLeft: "auto" }}>✏</button>
                        <button onClick={() => del(deal.id)} style={{ background: "transparent", color: C.red, border: "none", fontSize: 11, cursor: "pointer" }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {view === "list" && (
        <Card style={{ padding: 0 }}>
          <div style={{ padding: 20 }}>
            <Table
              headers={["Deal","Client","Valeur","Stage","Probabilité","Source","Dernier contact","Actions"]}
              rows={pipeline.map(d => [
                <span style={{ color: C.text, fontWeight: 600 }}>{d.title}</span>,
                d.clientName,
                <span style={{ color: stageColor(d.stage), fontWeight: 700 }}>{MAD(d.value)}</span>,
                <span style={{ background: stageColor(d.stage)+"18", color: stageColor(d.stage), border: `1px solid ${stageColor(d.stage)}30`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{PIPELINE_STAGES.find(s=>s.id===d.stage)?.label}</span>,
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 50, height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${d.probability}%`, height: "100%", background: stageColor(d.stage), borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 11, color: C.textDim }}>{d.probability}%</span>
                </div>,
                <span style={{ fontSize: 11, color: C.textMuted }}>{d.source}</span>,
                d.lastContact,
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => openEdit(d)} style={{ background: C.accentSoft, color: C.accent, border: "none", borderRadius: 5, padding: "4px 8px", fontSize: 11, cursor: "pointer" }}>✏</button>
                  <button onClick={() => del(d.id)} style={{ background: C.redSoft, color: C.red, border: "none", borderRadius: 5, padding: "4px 8px", fontSize: 11, cursor: "pointer" }}>✕</button>
                </div>,
              ])}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// NEW MODULE 4 — PRODUCT / SERVICE CATALOG
// ═══════════════════════════════════════════════════════════════════════════════
const CatalogPage = ({ data, setData }) => {
  const catalog = data.catalog || [];
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterCat, setFilterCat] = useState("All");
  const blank = { name: "", category: "Design", price: "", vat: 20, description: "", active: true };
  const [form, setForm] = useState(blank);
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openNew = () => { setForm(blank); setEditId(null); setShowForm(true); };
  const openEdit = (p) => { setForm({ ...p }); setEditId(p.id); setShowForm(true); };

  const save = () => {
    if (!form.name || !form.price) return;
    if (editId) {
      setData(d => ({ ...d, catalog: d.catalog.map(c => c.id === editId ? { ...form, id: editId, price: parseFloat(form.price) } : c) }));
    } else {
      setData(d => ({ ...d, catalog: [...d.catalog, { ...form, id: `C${Date.now()}`, price: parseFloat(form.price) }] }));
    }
    setShowForm(false);
  };

  const toggleActive = (id) => setData(d => ({ ...d, catalog: d.catalog.map(c => c.id === id ? { ...c, active: !c.active } : c) }));
  const del = (id) => setData(d => ({ ...d, catalog: d.catalog.filter(c => c.id !== id) }));

  const categories = ["All", ...new Set(catalog.map(c => c.category))];
  const filtered = filterCat === "All" ? catalog : catalog.filter(c => c.category === filterCat);

  const catColor = (c) => ({ Design:"purple",Web:"blue",Photo:"cyan",Marketing:"amber",Formation:"teal",IT:"blue" }[c] || "blue");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Product & Service Catalog</h2>
          <p style={{ color: C.textMuted, margin: "4px 0 0", fontSize: 13 }}>{catalog.filter(c=>c.active).length} actifs · {catalog.length} total</p>
        </div>
        <button onClick={openNew} style={{ background: C.purple, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Ajouter produit</button>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {categories.map(f => (
          <button key={f} onClick={() => setFilterCat(f)} style={{ background: filterCat===f?C.purple:"transparent", color: filterCat===f?"#fff":C.textMuted, border: `1px solid ${filterCat===f?C.purple:C.border}`, borderRadius: 7, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{f}</button>
        ))}
      </div>

      {showForm && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim, marginBottom: 14 }}>{editId ? "Modifier produit/service" : "Nouveau produit/service"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <input placeholder="Nom *" value={form.name} onChange={e => setF("name", e.target.value)}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none" }} />
            <select value={form.category} onChange={e => setF("category", e.target.value)} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13 }}>
              {["Design","Web","Photo","Marketing","Formation","IT","Autres"].map(c => <option key={c}>{c}</option>)}
            </select>
            <input type="number" placeholder="Prix HT (MAD) *" value={form.price} onChange={e => setF("price", e.target.value)}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="number" min="0" max="100" value={form.vat} onChange={e => setF("vat", parseInt(e.target.value)||0)}
                style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 8px", color: C.text, fontSize: 13, outline: "none", width: "70px" }} />
              <span style={{ color: C.textMuted, fontSize: 13 }}>% TVA</span>
            </div>
          </div>
          <textarea placeholder="Description" value={form.description} onChange={e => setF("description", e.target.value)} rows={2}
            style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={save} style={{ background: C.purple, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Sauvegarder</button>
            <button onClick={() => setShowForm(false)} style={{ background: "transparent", color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer" }}>Annuler</button>
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ background: C.surface, border: `1px solid ${p.active ? C.border : C.border}`, borderRadius: 14, padding: 18, opacity: p.active ? 1 : 0.5, transition: "all 0.15s" }}
            onMouseEnter={e => { if(p.active) e.currentTarget.style.borderColor = C.purple+"60"; }}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <Badge color={catColor(p.category)}>{p.category}</Badge>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => toggleActive(p.id)} style={{ background: p.active ? C.greenSoft : C.redSoft, color: p.active ? C.green : C.red, border: "none", borderRadius: 5, padding: "3px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>{p.active ? "Actif" : "Inactif"}</button>
              </div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>{p.name}</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12, lineHeight: 1.5 }}>{p.description}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.accent }}>{MAD(p.price)}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>HT · TVA {p.vat}% · TTC : {MAD(p.price * (1 + p.vat / 100))}</div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => openEdit(p)} style={{ background: C.accentSoft, color: C.accent, border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer" }}>✏</button>
                <button onClick={() => del(p.id)} style={{ background: C.redSoft, color: C.red, border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer" }}>✕</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// NEW MODULE 5 — ANALYTICS / REPORTING
// ═══════════════════════════════════════════════════════════════════════════════
const AnalyticsPage = ({ data }) => {
  const today = "2026-03-09";
  const thisMonth = "2026-03";

  // Revenue from invoices
  const invoices = (data.documents || []).filter(d => d.type === "Facture");
  const invoicesThisMonth = invoices.filter(d => d.issueDate.startsWith(thisMonth));
  const revenueThisMonth = invoicesThisMonth.reduce((s, d) => s + parseFloat(calcDocTotals(d).totalTTC), 0);
  const revenueCollected = invoicesThisMonth.filter(d => d.status === "Paid").reduce((s, d) => s + parseFloat(calcDocTotals(d).totalTTC), 0);
  const revenueUnpaid = invoices.filter(d => ["Unpaid","Partial"].includes(d.status)).reduce((s, d) => s + parseFloat(getRemaining(d)), 0);

  // Expenses
  const expenses = data.expenses || [];
  const expensesThisMonth = expenses.filter(e => e.date.startsWith(thisMonth));
  const totalExpenses = expensesThisMonth.reduce((s, e) => s + e.amount, 0);

  // Profit estimate
  const profit = revenueCollected - totalExpenses;

  // Supplier / client debts
  const supplierDebt = data.supplierCredits.filter(s => s.status !== "Paid").reduce((s, c) => s + (c.total - c.paid), 0);
  const clientDebt = data.clientCredits.filter(c => c.status !== "Paid").reduce((s, c) => s + (c.total - c.paid), 0);

  // Pipeline
  const pipeline = data.pipeline || [];
  const pipelineValue = pipeline.filter(p => !["Won","Lost"].includes(p.stage)).reduce((s, p) => s + p.value, 0);
  const wonValue = pipeline.filter(p => p.stage === "Won").reduce((s, p) => s + p.value, 0);

  // Top clients by invoiced amount
  const clientTotals = {};
  invoices.forEach(d => {
    if (!d.clientName) return;
    clientTotals[d.clientName] = (clientTotals[d.clientName] || 0) + parseFloat(calcDocTotals(d).totalTTC);
  });
  const topClients = Object.entries(clientTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxClient = topClients[0]?.[1] || 1;

  // Expense breakdown
  const expCats = {};
  expenses.forEach(e => { expCats[e.category] = (expCats[e.category] || 0) + e.amount; });
  const expBreakdown = Object.entries(expCats).sort((a, b) => b[1] - a[1]);
  const maxExp = expBreakdown[0]?.[1] || 1;

  // Tasks completion
  const tasks = data.tasks || [];
  const tasksDone = tasks.filter(t => t.status === "Completed").length;
  const tasksTotal = tasks.length;

  const SectionTitle = ({ children }) => (
    <div style={{ fontSize: 11, fontWeight: 800, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>{children}</div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Analytics & Reporting</h2>
        <p style={{ color: C.textMuted, margin: "4px 0 0", fontSize: 13 }}>Vue consolidée — Mars 2026</p>
      </div>

      {/* KPI row 1 — Revenue & P&L */}
      <div>
        <SectionTitle>💰 Chiffre d'affaires & Résultat — Mars 2026</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 14 }}>
          <MetricCard icon="📈" label="CA facturé (mois)"   value={MAD(revenueThisMonth)}   sub={`${invoicesThisMonth.length} factures`}  color={C.green}  />
          <MetricCard icon="✓"  label="CA encaissé"         value={MAD(revenueCollected)}    sub="Paiements reçus"                          color={C.teal}   />
          <MetricCard icon="📉" label="Charges (mois)"      value={MAD(totalExpenses)}       sub={`${expensesThisMonth.length} dépenses`}  color={C.red}    />
          <MetricCard icon="⚖"  label="Résultat estimé"     value={MAD(profit)}              sub={profit >= 0 ? "Bénéfice ✓" : "Déficit !"} color={profit >= 0 ? C.green : C.red} />
          <MetricCard icon="⚠"  label="Impayés clients"     value={MAD(revenueUnpaid)}       sub="À encaisser"                              color={C.amber}  />
        </div>
      </div>

      {/* KPI row 2 — Debts & Pipeline */}
      <div>
        <SectionTitle>🔄 Dettes & Pipeline</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 14 }}>
          <MetricCard icon="◬" label="Dettes fournisseurs" value={MAD(supplierDebt)}         sub="À régler"           color={C.red}    />
          <MetricCard icon="◭" label="Créances clients"    value={MAD(clientDebt)}            sub="À encaisser"        color={C.green}  />
          <MetricCard icon="◧" label="Pipeline actif"      value={MAD(pipelineValue)}         sub="Deals en cours"     color={C.purple} />
          <MetricCard icon="🎯" label="Deals gagnés"        value={MAD(wonValue)}              sub="Ce mois/période"    color={C.teal}   />
          <MetricCard icon="📋" label="Tâches terminées"   value={`${tasksDone}/${tasksTotal}`} sub="Productivité"     color={C.accent} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Top clients */}
        <Card>
          <SectionTitle>🏆 Top Clients par CA facturé</SectionTitle>
          {topClients.length === 0
            ? <div style={{ color: C.textMuted, fontSize: 13 }}>Aucune facture enregistrée</div>
            : topClients.map(([name, total]) => (
              <div key={name} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{MAD(total)}</span>
                </div>
                <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(total / maxClient) * 100}%`, background: C.green, borderRadius: 3, transition: "width 0.5s" }} />
                </div>
              </div>
            ))
          }
        </Card>

        {/* Expense breakdown */}
        <Card>
          <SectionTitle>📊 Répartition des charges</SectionTitle>
          {expBreakdown.length === 0
            ? <div style={{ color: C.textMuted, fontSize: 13 }}>Aucune dépense enregistrée</div>
            : expBreakdown.map(([cat, total]) => (
              <div key={cat} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: C.textDim }}>{cat}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.red }}>{MAD(total)}</span>
                </div>
                <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(total / maxExp) * 100}%`, background: C.red, borderRadius: 3 }} />
                </div>
              </div>
            ))
          }
        </Card>
      </div>

      {/* Pipeline funnel */}
      <Card>
        <SectionTitle>🔵 Entonnoir Pipeline</SectionTitle>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
          {PIPELINE_STAGES.map(stage => {
            const count = pipeline.filter(p => p.stage === stage.id).length;
            const val = pipeline.filter(p => p.stage === stage.id).reduce((s, p) => s + p.value, 0);
            const maxHeight = 80;
            const maxCount = Math.max(...PIPELINE_STAGES.map(s => pipeline.filter(p => p.stage === s.id).length), 1);
            const h = Math.max(20, (count / maxCount) * maxHeight);
            return (
              <div key={stage.id} style={{ flex: 1, minWidth: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: stage.color }}>{count}</div>
                <div style={{ width: "100%", height: h, background: stage.color + "30", border: `1px solid ${stage.color}60`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", transition: "height 0.5s" }}>
                  {count > 0 && <span style={{ fontSize: 10, color: stage.color, fontWeight: 700 }}>{MAD(val).replace(" MAD","")}</span>}
                </div>
                <div style={{ fontSize: 10, color: C.textMuted, textAlign: "center", lineHeight: 1.3 }}>{stage.label}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent invoices table */}
      <Card>
        <SectionTitle>🧾 Factures récentes</SectionTitle>
        <Table
          headers={["N°","Client","Montant TTC","Date","Échéance","Statut"]}
          rows={invoices.slice(0,6).map(d => {
            const { totalTTC } = calcDocTotals(d);
            return [
              <span style={{ color: C.text, fontWeight: 600 }}>{d.number}</span>,
              d.clientName,
              <span style={{ color: C.accent, fontWeight: 700 }}>{totalTTC} MAD</span>,
              d.issueDate,
              d.dueDate || "—",
              statusBadge(d.status),
            ];
          })}
        />
      </Card>
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT 360° PROFILE PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const Client360Page = ({ data, setData, setActive }) => {
  const [selectedId, setSelectedId]   = useState(null);
  const [noteText,   setNoteText]     = useState("");
  const [activeTab,  setActiveTab]    = useState("overview");
  const today = "2026-03-09";

  const client = data.clients.find(c => c.id === selectedId);

  // ── Per-client derived data ─────────────────────────────────────────────────
  const clientDocs      = selectedId ? (data.documents    ||[]).filter(d => d.clientId    === selectedId) : [];
  const clientAppts     = selectedId ? (data.appointments ||[]).filter(a => a.client      === client?.name) : [];
  const clientTasks     = selectedId ? (data.tasks        ||[]).filter(t => t.clientId    === selectedId) : [];
  const clientPipeline  = selectedId ? (data.pipeline     ||[]).filter(p => p.clientId   === selectedId) : [];
  const clientCredits   = selectedId ? (data.clientCredits||[]).filter(c => c.client     === client?.name) : [];
  const clientNotes     = selectedId ? (data.clientNotes  ||[]).filter(n => n.clientId   === selectedId) : [];

  const invoices        = clientDocs.filter(d => d.type === "Facture");
  const devis           = clientDocs.filter(d => d.type === "Devis");
  const totalInvoiced   = invoices.reduce((s,d) => s + parseFloat(calcDocTotals(d).totalTTC), 0);
  const totalPaid       = invoices.reduce((s,d) => s + (d.amountPaid || 0), 0);
  const totalUnpaid     = totalInvoiced - totalPaid;
  const lastAppt        = [...clientAppts].sort((a,b) => b.date.localeCompare(a.date))[0];
  const openTasks       = clientTasks.filter(t => t.status !== "Completed");
  const pipelineValue   = clientPipeline.filter(p => !["Won","Lost"].includes(p.stage)).reduce((s,p) => s+p.value,0);
  const wonValue        = clientPipeline.filter(p => p.stage==="Won").reduce((s,p) => s+p.value,0);

  const addNote = () => {
    if (!noteText.trim() || !selectedId) return;
    setData(d => ({
      ...d,
      clientNotes: [...(d.clientNotes||[]), {
        id: `N${Date.now()}`, clientId: selectedId,
        text: noteText.trim(), date: today, author: "Moi",
      }],
    }));
    setNoteText("");
  };

  const deleteNote = (id) => setData(d => ({ ...d, clientNotes: (d.clientNotes||[]).filter(n => n.id !== id) }));

  const TABS = [
    { id: "overview",  label: "Vue d'ensemble" },
    { id: "documents", label: `Documents (${clientDocs.length})` },
    { id: "tasks",     label: `Tâches (${clientTasks.length})` },
    { id: "history",   label: "Historique" },
    { id: "notes",     label: `Notes (${clientNotes.length})` },
  ];

  // ── CLIENT LIST (left panel) ────────────────────────────────────────────────
  if (!selectedId) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Client 360°</h2>
          <p style={{ color: C.textMuted, margin: "4px 0 0", fontSize: 13 }}>Sélectionnez un client pour voir son profil complet</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {data.clients.map(c => {
            const docs   = (data.documents||[]).filter(d => d.clientId === c.id);
            const inv    = docs.filter(d => d.type==="Facture");
            const ttl    = inv.reduce((s,d) => s + parseFloat(calcDocTotals(d).totalTTC), 0);
            const unpaid = inv.filter(d => ["Unpaid","Partial"].includes(d.status)).length;
            const tasks  = (data.tasks||[]).filter(t => t.clientId === c.id && t.status !== "Completed").length;
            const lastDoc= [...docs].sort((a,b) => (b.updatedAt||"").localeCompare(a.updatedAt||""))[0];
            return (
              <div key={c.id}
                onClick={() => setSelectedId(c.id)}
                style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, cursor: "pointer", transition: "border-color 0.18s, transform 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent+"60"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border;      e.currentTarget.style.transform = "none"; }}
              >
                {/* Avatar + name */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: C.accentSoft, border: `2px solid ${C.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: C.accent, flexShrink: 0 }}>
                    {c.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 2 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>{c.business}</div>
                  </div>
                  {statusBadge(c.status)}
                </div>

                {/* Stats grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                  {[
                    { label: "CA Total",  value: MAD(ttl),        color: C.green  },
                    { label: "Impayés",   value: unpaid > 0 ? `${unpaid} fact.` : "—", color: unpaid > 0 ? C.red : C.textMuted },
                    { label: "Tâches",    value: tasks > 0 ? tasks : "—",              color: tasks  > 0 ? C.amber : C.textMuted },
                  ].map(s => (
                    <div key={s.label} style={{ background: C.bg, borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 3 }}>{s.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 11, color: C.textMuted }}>{c.phone}</span>
                  {lastDoc && <span style={{ fontSize: 11, color: C.textMuted }}>Dernier doc: {lastDoc.issueDate}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── PROFILE VIEW ───────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Back + header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <button onClick={() => { setSelectedId(null); setActiveTab("overview"); }}
          style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, padding: "8px 14px", fontSize: 12, color: C.textMuted, cursor: "pointer", flexShrink: 0, marginTop: 2 }}>
          ← Retour
        </button>

        {/* Client hero card */}
        <div style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 22px", display: "flex", alignItems: "center", gap: 18 }}>
          {/* Avatar */}
          <div style={{ width: 56, height: 56, borderRadius: 16, background: C.accentSoft, border: `2px solid ${C.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, color: C.accent, flexShrink: 0 }}>
            {client.name.charAt(0)}
          </div>

          {/* Identity */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: C.text }}>{client.name}</span>
              {statusBadge(client.status)}
            </div>
            <div style={{ fontSize: 13, color: C.textMuted }}>{client.business}</div>
            <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
              <a href={`tel:${client.phone}`} style={{ fontSize: 12, color: C.accent, textDecoration: "none" }}>📞 {client.phone}</a>
              <a href={`mailto:${client.email}`} style={{ fontSize: 12, color: C.accent, textDecoration: "none" }}>✉ {client.email}</a>
            </div>
          </div>

          {/* Quick KPIs */}
          <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
            {[
              { label: "CA Total",      value: MAD(totalInvoiced), color: C.green  },
              { label: "Encaissé",      value: MAD(totalPaid),     color: C.teal   },
              { label: "Reste dû",      value: MAD(totalUnpaid),   color: totalUnpaid > 0 ? C.red : C.textMuted },
              { label: "Pipeline",      value: MAD(pipelineValue), color: C.purple },
            ].map(k => (
              <div key={k.label} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 14px", textAlign: "center", minWidth: 90 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: k.color }}>{k.value}</div>
                <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
            <a href={`https://wa.me/${client.phone.replace(/[^0-9]/g,"")}`} target="_blank" rel="noreferrer"
              style={{ background: C.greenSoft, color: C.green, border: `1px solid ${C.green}30`, borderRadius: 7, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", textDecoration: "none", textAlign: "center" }}>
              WhatsApp
            </a>
            <button onClick={() => setActive("quotes")}
              style={{ background: C.accentSoft, color: C.accent, border: `1px solid ${C.accent}30`, borderRadius: 7, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              + Devis
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 4, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: 1, background: activeTab === t.id ? C.accentSoft : "transparent",
            color: activeTab === t.id ? C.accent : C.textMuted,
            border: `1px solid ${activeTab === t.id ? C.accent+"40" : "transparent"}`,
            borderRadius: 9, padding: "8px 10px", fontSize: 12, fontWeight: activeTab === t.id ? 700 : 500,
            cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
          }}>{t.label}</button>
        ))}
      </div>

      {/* ══════════════════ TAB: OVERVIEW ══════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* Last appointment */}
            <Card>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>📅 Dernier rendez-vous</div>
              {lastAppt ? (
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{lastAppt.notes || "Rendez-vous"}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{lastAppt.date} à {lastAppt.time} · {lastAppt.location}</div>
                  <div style={{ marginTop: 8 }}>{statusBadge(lastAppt.status)}</div>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: C.textMuted }}>Aucun rendez-vous enregistré</div>
              )}
            </Card>

            {/* Open tasks */}
            <Card>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>📋 Tâches en cours</div>
              {openTasks.length === 0
                ? <div style={{ fontSize: 13, color: C.textMuted }}>Aucune tâche en attente</div>
                : openTasks.slice(0, 3).map(t => (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid ${C.border}20` }}>
                      <div style={{ width: 6, height: 6, borderRadius: 99, background: t.priority === "Urgent" ? C.red : t.priority === "High" ? C.amber : C.accent, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: C.text, flex: 1 }}>{t.title}</span>
                      <span style={{ fontSize: 11, color: C.textMuted }}>{t.dueDate}</span>
                    </div>
                  ))
              }
            </Card>

            {/* Client credits */}
            <Card>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>💳 Crédit client</div>
              {clientCredits.length === 0
                ? <div style={{ fontSize: 13, color: C.textMuted }}>Aucun crédit enregistré</div>
                : clientCredits.map(cc => (
                    <div key={cc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}20` }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{cc.product}</div>
                        <div style={{ fontSize: 11, color: C.textMuted }}>Échéance: {cc.dueDate}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>{MAD(cc.total - cc.paid)} restant</div>
                        <div style={{ marginTop: 4 }}>{statusBadge(cc.status)}</div>
                      </div>
                    </div>
                  ))
              }
            </Card>

            {/* Pipeline */}
            <Card>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>◧ Pipeline</div>
              {clientPipeline.length === 0
                ? <div style={{ fontSize: 13, color: C.textMuted }}>Aucun deal en pipeline</div>
                : clientPipeline.map(p => {
                    const stageColors = { NewLead: C.textMuted, Contacted: C.cyan, Meeting: C.accent, QuoteSent: C.purple, Negotiation: C.amber, Won: C.green, Lost: C.red };
                    return (
                      <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}20` }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.title}</div>
                          <div style={{ fontSize: 11, color: C.textMuted }}>{p.probability}% probabilité</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: stageColors[p.stage] || C.textDim }}>{MAD(p.value)}</div>
                          <div style={{ fontSize: 11, color: stageColors[p.stage] || C.textMuted, marginTop: 2 }}>{p.stage}</div>
                        </div>
                      </div>
                    );
                  })
              }
            </Card>
          </div>
        </div>
      )}

      {/* ══════════════════ TAB: DOCUMENTS ══════════════════════════════════════ */}
      {activeTab === "documents" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Devis */}
          {devis.length > 0 && (
            <Card>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>📋 Devis ({devis.length})</div>
              <Table
                headers={["Numéro","Date","Validité","Montant TTC","Statut"]}
                rows={devis.map(d => {
                  const { totalTTC } = calcDocTotals(d);
                  return [
                    <span style={{ color: C.text, fontWeight: 700 }}>{d.number}</span>,
                    d.issueDate,
                    d.validityDate || "—",
                    <span style={{ color: C.accent, fontWeight: 700 }}>{totalTTC} MAD</span>,
                    statusBadge(d.status),
                  ];
                })}
              />
            </Card>
          )}
          {/* Factures */}
          {invoices.length > 0 && (
            <Card>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>🧾 Factures ({invoices.length})</div>
              <Table
                headers={["Numéro","Date","Échéance","Montant TTC","Payé","Reste","Statut"]}
                rows={invoices.map(d => {
                  const { totalTTC } = calcDocTotals(d);
                  const reste = parseFloat(totalTTC) - (d.amountPaid || 0);
                  return [
                    <span style={{ color: C.text, fontWeight: 700 }}>{d.number}</span>,
                    d.issueDate,
                    <span style={{ color: d.dueDate < "2026-03-09" && d.status !== "Paid" ? C.red : C.textDim }}>{d.dueDate}</span>,
                    <span style={{ color: C.accent, fontWeight: 700 }}>{totalTTC} MAD</span>,
                    <span style={{ color: C.green }}>{MAD(d.amountPaid||0)}</span>,
                    <span style={{ color: reste > 0 ? C.red : C.textMuted, fontWeight: reste > 0 ? 700 : 400 }}>{reste > 0 ? MAD(reste) : "—"}</span>,
                    statusBadge(d.status),
                  ];
                })}
              />
            </Card>
          )}
          {clientDocs.length === 0 && (
            <div style={{ color: C.textMuted, fontSize: 13, padding: 20, textAlign: "center" }}>Aucun document pour ce client</div>
          )}
        </div>
      )}

      {/* ══════════════════ TAB: TÂCHES ════════════════════════════════════════ */}
      {activeTab === "tasks" && (
        <Card>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>📋 Toutes les tâches liées à ce client</div>
          {clientTasks.length === 0
            ? <div style={{ color: C.textMuted, fontSize: 13 }}>Aucune tâche pour ce client</div>
            : clientTasks.map(t => (
                <div key={t.id} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "12px 0",
                  borderBottom: `1px solid ${C.border}20`,
                  opacity: t.status === "Completed" ? 0.5 : 1,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: 99, background: t.priority === "Urgent" ? C.red : t.priority === "High" ? C.amber : C.accent, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, textDecoration: t.status === "Completed" ? "line-through" : "none" }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{t.category} · {t.dueDate}</div>
                  </div>
                  <Badge color={{ Urgent:"red", High:"amber", Normal:"blue", Low:"teal" }[t.priority] || "blue"}>{t.priority}</Badge>
                  <Badge color={taskStatusColor(t.status)}>{t.status}</Badge>
                </div>
              ))
          }
        </Card>
      )}

      {/* ══════════════════ TAB: HISTORIQUE ════════════════════════════════════ */}
      {activeTab === "history" && (
        <Card>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>🕐 Historique complet de la relation</div>
          {/* Build unified timeline */}
          {(() => {
            const events = [
              ...clientAppts.map(a => ({ date: a.date, type: "appointment", icon: "📅", title: `RDV: ${a.notes || "Rendez-vous"}`, sub: `${a.time} · ${a.location}`, status: a.status })),
              ...clientDocs.map(d => { const { totalTTC } = calcDocTotals(d); return { date: d.issueDate, type: "document", icon: d.type === "Devis" ? "📋" : "🧾", title: `${d.type}: ${d.number}`, sub: `${totalTTC} MAD`, status: d.status }; }),
              ...clientTasks.map(t => ({ date: t.dueDate, type: "task", icon: "✓", title: `Tâche: ${t.title}`, sub: `${t.priority} · ${t.category}`, status: t.status })),
              ...clientPipeline.map(p => ({ date: p.lastContact, type: "pipeline", icon: "◧", title: `Deal: ${p.title}`, sub: `${MAD(p.value)} · ${p.stage}`, status: p.stage })),
            ].sort((a,b) => b.date.localeCompare(a.date));

            if (events.length === 0) return <div style={{ color: C.textMuted, fontSize: 13 }}>Aucun historique disponible</div>;

            return events.map((ev, i) => (
              <div key={i} style={{ display: "flex", gap: 14, paddingBottom: 16, position: "relative" }}>
                {/* Timeline line */}
                {i < events.length - 1 && (
                  <div style={{ position: "absolute", left: 15, top: 32, width: 1, bottom: 0, background: C.border }} />
                )}
                {/* Icon dot */}
                <div style={{ width: 32, height: 32, borderRadius: 99, background: C.surface, border: `2px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, zIndex: 1 }}>
                  {ev.icon}
                </div>
                <div style={{ flex: 1, paddingTop: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{ev.title}</div>
                      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{ev.sub}</div>
                    </div>
                    <span style={{ fontSize: 11, color: C.textMuted, flexShrink: 0, marginLeft: 12 }}>{ev.date}</span>
                  </div>
                </div>
              </div>
            ));
          })()}
        </Card>
      )}

      {/* ══════════════════ TAB: NOTES ═════════════════════════════════════════ */}
      {activeTab === "notes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Add note */}
          <Card>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>✏ Ajouter une note</div>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Écrivez votre note ici… (ex: client intéressé par nouveau devis packaging, préfère être contacté le matin)"
              rows={3}
              style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e => e.target.style.borderColor = C.border}
            />
            <button onClick={addNote} style={{ marginTop: 10, background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
              Sauvegarder la note
            </button>
          </Card>

          {/* Notes list */}
          {clientNotes.length === 0
            ? <div style={{ color: C.textMuted, fontSize: 13, padding: "8px 0" }}>Aucune note pour ce client</div>
            : [...clientNotes].sort((a,b) => b.date.localeCompare(a.date)).map(n => (
                <div key={n.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <div style={{ width: 24, height: 24, borderRadius: 7, background: C.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: C.accent }}>{n.author.charAt(0)}</div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.textDim }}>{n.author}</span>
                      <span style={{ fontSize: 11, color: C.textMuted }}>· {n.date}</span>
                    </div>
                    <button onClick={() => deleteNote(n.id)} style={{ background: "transparent", color: C.textMuted, border: "none", fontSize: 13, cursor: "pointer", padding: "0 4px" }}>✕</button>
                  </div>
                  <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{n.text}</div>
                </div>
              ))
          }
        </div>
      )}

    </div>
  );
};


// ═══════════════════════════════════════════════════════════════════════════════
// CASH FLOW / TREASURY PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const CashFlowPage = ({ data, setData }) => {
  const today = "2026-03-09";
  const [showForm,  setShowForm]  = useState(false);
  const [filterType,setFilterType]= useState("all");  // all | in | out
  const [form, setForm] = useState({
    date: today, label: "", type: "in", amount: "",
    category: "Facture", method: "Virement", ref: "",
  });

  const entries  = data.cashEntries || [];
  const cf       = data.cashflow    || { bankBalance: 0, cashBalance: 0 };

  // ── Derived totals (current month) ─────────────────────────────────────────
  const thisMonth = entries.filter(e => e.date.startsWith("2026-03"));
  const totalIn   = thisMonth.filter(e => e.type === "in" ).reduce((s,e) => s + e.amount, 0);
  const totalOut  = thisMonth.filter(e => e.type === "out").reduce((s,e) => s + e.amount, 0);
  const netFlow   = totalIn - totalOut;

  // Past entries: confirmed real balance movement
  const pastIn    = thisMonth.filter(e => e.type==="in"  && e.date <= today).reduce((s,e)=>s+e.amount,0);
  const pastOut   = thisMonth.filter(e => e.type==="out" && e.date <= today).reduce((s,e)=>s+e.amount,0);

  // Future: scheduled / expected
  const futureIn  = thisMonth.filter(e => e.type==="in"  && e.date > today).reduce((s,e)=>s+e.amount,0);
  const futureOut = thisMonth.filter(e => e.type==="out" && e.date > today).reduce((s,e)=>s+e.amount,0);
  const projectedBalance = cf.bankBalance + cf.cashBalance + futureIn - futureOut;

  // Unreconciled count
  const unreconciled = entries.filter(e => !e.reconciled).length;

  // ── Filters ─────────────────────────────────────────────────────────────────
  const visible = entries
    .filter(e => filterType === "all" || e.type === filterType)
    .sort((a,b) => b.date.localeCompare(a.date));

  // ── Running balance column ──────────────────────────────────────────────────
  // Start from bank+cash, subtract/add entries newest-first is hard; do oldest-first
  const chronological = [...entries].sort((a,b) => a.date.localeCompare(b.date));
  const runningMap = {};
  let running = 0;
  chronological.forEach(e => {
    running += e.type === "in" ? e.amount : -e.amount;
    runningMap[e.id] = running;
  });

  const IN_CATEGORIES  = ["Facture","Chèque","Espèces reçues","Autre entrée"];
  const OUT_CATEGORIES = ["Loyer","Internet","Marketing","Transport","Fournitures","Équipement","Services","Taxes","Salaires","Fournisseur","Autre sortie"];

  const addEntry = () => {
    if (!form.label || !form.amount || !form.date) return;
    setData(d => ({
      ...d,
      cashEntries: [...(d.cashEntries||[]), {
        ...form,
        id:         `CF${Date.now()}`,
        amount:     parseFloat(form.amount),
        reconciled: form.date <= today,
      }],
    }));
    setForm({ date: today, label: "", type: "in", amount: "", category: "Facture", method: "Virement", ref: "" });
    setShowForm(false);
  };

  const toggleReconciled = (id) =>
    setData(d => ({
      ...d,
      cashEntries: (d.cashEntries||[]).map(e => e.id === id ? { ...e, reconciled: !e.reconciled } : e),
    }));

  const deleteEntry = (id) =>
    setData(d => ({ ...d, cashEntries: (d.cashEntries||[]).filter(e => e.id !== id) }));

  const updateBalance = (field, val) =>
    setData(d => ({ ...d, cashflow: { ...(d.cashflow||{}), [field]: parseFloat(val)||0 } }));

  // ── Mini horizontal bar for in/out comparison ───────────────────────────────
  const maxBar = Math.max(totalIn, totalOut, 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Cash Flow · Trésorerie</h2>
          <div style={{ color: C.textMuted, marginTop: 4, fontSize: 13 }}>Mars 2026{unreconciled > 0 && <span style={{ color: C.amber, marginLeft: 8 }}>⚠ {unreconciled} entrée{unreconciled>1?"s":""} non rapprochée{unreconciled>1?"s":""}</span>}</div>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          + Mouvement
        </button>
      </div>

      {/* ── KPI row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
        <MetricCard icon="🏦" label="Solde banque"    value={MAD(cf.bankBalance)}  color={C.accent}  sub="Compte courant" />
        <MetricCard icon="💵" label="Solde caisse"    value={MAD(cf.cashBalance)}  color={C.teal}    sub="Espèces en main" />
        <MetricCard icon="↑"  label="Entrées (mars)"  value={MAD(totalIn)}         color={C.green}   sub={`Dont ${MAD(futureIn)} prévu`} />
        <MetricCard icon="↓"  label="Sorties (mars)"  value={MAD(totalOut)}        color={C.red}     sub={`Dont ${MAD(futureOut)} prévu`} />
        <MetricCard icon="◎"  label="Solde projeté"   value={MAD(projectedBalance)}color={projectedBalance >= 0 ? C.green : C.red} sub="Fin de mois estimé" />
      </div>

      {/* ── Balance editors + flow bar ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>

        {/* Edit live balances */}
        <Card>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Soldes actuels</div>
          {[
            { key: "bankBalance", label: "Banque (MAD)", icon: "🏦" },
            { key: "cashBalance", label: "Caisse (MAD)", icon: "💵" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: C.textMuted, display: "block", marginBottom: 5 }}>{f.icon} {f.label}</label>
              <input
                type="number"
                value={cf[f.key]}
                onChange={e => updateBalance(f.key, e.target.value)}
                style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", color: C.text, fontSize: 14, fontWeight: 700, outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>
          ))}
          <div style={{ marginTop: 8, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Total disponible</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.green }}>{MAD(cf.bankBalance + cf.cashBalance)}</div>
          </div>
        </Card>

        {/* In/Out flow comparison */}
        <Card>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Flux du mois</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Entrées",  amount: totalIn,  confirmed: pastIn,  future: futureIn,  color: C.green },
              { label: "Sorties",  amount: totalOut, confirmed: pastOut, future: futureOut, color: C.red   },
            ].map(row => (
              <div key={row.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.textDim }}>{row.label}</span>
                  <div style={{ display: "flex", gap: 12 }}>
                    <span style={{ fontSize: 11, color: C.textMuted }}>confirmé: <strong style={{ color: row.color }}>{MAD(row.confirmed)}</strong></span>
                    <span style={{ fontSize: 11, color: C.textMuted }}>prévu: <strong style={{ color: C.textDim }}>{MAD(row.future)}</strong></span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: row.color }}>{MAD(row.amount)}</span>
                  </div>
                </div>
                {/* Stacked bar: confirmed + future */}
                <div style={{ height: 10, background: C.bg, borderRadius: 99, overflow: "hidden", display: "flex" }}>
                  <div style={{ width: `${(row.confirmed/maxBar)*100}%`, background: row.color, borderRadius: "99px 0 0 99px", transition: "width 0.6s" }} />
                  <div style={{ width: `${(row.future/maxBar)*100}%`, background: row.color+"50", transition: "width 0.6s" }} />
                </div>
              </div>
            ))}
            <div style={{ paddingTop: 10, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.textDim }}>Flux net</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: netFlow >= 0 ? C.green : C.red }}>{netFlow >= 0 ? "+" : ""}{MAD(netFlow)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Add entry form ── */}
      {showForm && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim, marginBottom: 16 }}>Nouveau mouvement</div>

          {/* Type toggle */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {[["in","↑ Entrée",C.green],["out","↓ Sortie",C.red]].map(([val,lbl,col]) => (
              <button key={val} onClick={() => setForm(f => ({ ...f, type: val, category: val==="in"?"Facture":"Loyer" }))}
                style={{ flex: 1, background: form.type===val ? col+"22" : "transparent", color: form.type===val ? col : C.textMuted, border: `1px solid ${form.type===val ? col+"50" : C.border}`, borderRadius: 8, padding: "9px", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}>
                {lbl}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            {/* Date */}
            <div>
              <label style={{ fontSize: 11, color: C.textMuted, display: "block", marginBottom: 5 }}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))}
                style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", color:C.text, fontSize:13, outline:"none", boxSizing:"border-box" }} />
            </div>
            {/* Label */}
            <div>
              <label style={{ fontSize: 11, color: C.textMuted, display: "block", marginBottom: 5 }}>Libellé *</label>
              <input placeholder="ex: Paiement Sara Benali" value={form.label} onChange={e => setForm(f=>({...f,label:e.target.value}))}
                style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", color:C.text, fontSize:13, outline:"none", boxSizing:"border-box" }} />
            </div>
            {/* Amount */}
            <div>
              <label style={{ fontSize: 11, color: C.textMuted, display: "block", marginBottom: 5 }}>Montant (MAD) *</label>
              <input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))}
                style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", color:form.type==="in"?C.green:C.red, fontSize:13, fontWeight:700, outline:"none", boxSizing:"border-box" }} />
            </div>
            {/* Category */}
            <div>
              <label style={{ fontSize: 11, color: C.textMuted, display: "block", marginBottom: 5 }}>Catégorie</label>
              <select value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}
                style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", color:C.text, fontSize:13 }}>
                {(form.type==="in" ? IN_CATEGORIES : OUT_CATEGORIES).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            {/* Method */}
            <div>
              <label style={{ fontSize: 11, color: C.textMuted, display: "block", marginBottom: 5 }}>Mode de paiement</label>
              <select value={form.method} onChange={e => setForm(f=>({...f,method:e.target.value}))}
                style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", color:C.text, fontSize:13 }}>
                {["Virement","Chèque","Espèces","CB","Prélévement","Autre"].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            {/* Ref */}
            <div>
              <label style={{ fontSize: 11, color: C.textMuted, display: "block", marginBottom: 5 }}>Référence</label>
              <input placeholder="N° chèque, virement…" value={form.ref} onChange={e => setForm(f=>({...f,ref:e.target.value}))}
                style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", color:C.text, fontSize:13, outline:"none", boxSizing:"border-box" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={addEntry}
              style={{ background: form.type==="in" ? C.green : C.red, color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              {form.type==="in" ? "Ajouter entrée" : "Ajouter sortie"}
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ background: "transparent", color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 18px", fontSize: 13, cursor: "pointer" }}>
              Annuler
            </button>
          </div>
        </Card>
      )}

      {/* ── Entries table ── */}
      <Card style={{ padding: 0 }}>
        {/* Filter bar */}
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginRight: 8 }}>Mouvements</span>
          {[["all","Tous"],["in","Entrées"],["out","Sorties"]].map(([val,lbl]) => (
            <button key={val} onClick={() => setFilterType(val)}
              style={{ background: filterType===val ? C.accentSoft : "transparent", color: filterType===val ? C.accent : C.textMuted, border: `1px solid ${filterType===val ? C.accent+"40" : C.border}`, borderRadius: 7, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
              {lbl}
            </button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 11, color: C.textMuted }}>{visible.length} lignes</span>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Date","Libellé","Catégorie","Méthode","Référence","Montant","Solde cumulé","✓"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((e, i) => {
                const isFuture = e.date > today;
                return (
                  <tr key={e.id}
                    style={{ borderBottom: `1px solid ${C.border}20`, opacity: isFuture ? 0.6 : 1, transition: "background 0.15s", cursor: "default" }}
                    onMouseEnter={el => el.currentTarget.style.background = C.surfaceHover}
                    onMouseLeave={el => el.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "11px 14px", fontSize: 12, color: isFuture ? C.textMuted : C.textDim, whiteSpace: "nowrap" }}>
                      {isFuture && <span style={{ fontSize: 9, color: C.purple, fontWeight: 700, marginRight: 4 }}>PRÉVU</span>}
                      {e.date}
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 13, color: C.text, fontWeight: 600, maxWidth: 220 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.label}</div>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: C.textMuted, whiteSpace: "nowrap" }}>{e.category}</td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: C.textMuted, whiteSpace: "nowrap" }}>{e.method}</td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: C.textMuted, whiteSpace: "nowrap", fontFamily: "monospace" }}>{e.ref || "—"}</td>
                    <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 800, color: e.type==="in" ? C.green : C.red, whiteSpace: "nowrap" }}>
                      {e.type==="in" ? "+" : "−"}{MAD(e.amount)}
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: C.textDim, whiteSpace: "nowrap", fontFamily: "monospace" }}>
                      {MAD(runningMap[e.id] || 0)}
                    </td>
                    <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button onClick={() => toggleReconciled(e.id)}
                          style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${e.reconciled ? C.green : C.border}`, background: e.reconciled ? C.greenSoft : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.green, flexShrink: 0 }}>
                          {e.reconciled ? "✓" : ""}
                        </button>
                        <button onClick={() => deleteEntry(e.id)}
                          style={{ background: "transparent", color: C.textMuted, border: "none", fontSize: 12, cursor: "pointer", padding: "2px 4px", lineHeight: 1 }}>
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {visible.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: C.textMuted, fontSize: 13 }}>Aucun mouvement pour ce filtre</div>
        )}
      </Card>

    </div>
  );
};

export default function App() {
  const [active,      setActive]      = useState("home");
  const [data,        setData]        = useState(initialData);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const pages = {
    home:         <HomePage        data={data}                              />,
    analytics:    <AnalyticsPage   data={data}                              />,
    tasks:        <TasksPage       data={data} setData={setData}            />,
    clients:      <ClientsPage     data={data} setData={setData}            />,
    client360:    <Client360Page   data={data} setData={setData} setActive={setActive} />,
    appointments: <AppointmentsPage data={data} setData={setData}           />,
    pipeline:     <PipelinePage    data={data} setData={setData}            />,
    quotes:       <QuotesPage      data={data} setData={setData}            />,
    cheques:      <ChequesPage     data={data} setData={setData}            />,
    supplier:     <CreditPage      type="supplier" data={data} setData={setData} />,
    clientcredit: <CreditPage      type="client"   data={data} setData={setData} />,
    expenses:     <ExpensesPage    data={data} setData={setData}            />,
    cashflow:     <CashFlowPage    data={data} setData={setData}            />,
    catalog:      <CatalogPage     data={data} setData={setData}            />,
    content:      <ContentPage     data={data} setData={setData}            />,
    whatsapp:     <WhatsAppPage    data={data}                              />,
    files:        <FilesPage                                                />,
  };

  // Live badge counts
  const badgeCounts = {
    tasks:        (data.tasks||[]).filter(t => t.status!=="Completed" && t.priority==="Urgent" && t.dueDate<="2026-03-09").length,
    quotes:       (data.documents||[]).filter(d => d.type==="Facture" && ["Unpaid","Partial"].includes(d.status)).length,
    cheques:      data.cheques.filter(c => c.status==="Pending" && c.dueDate<"2026-03-09").length,
    pipeline:     (data.pipeline||[]).filter(p => p.stage==="Negotiation").length,
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1E2230; border-radius: 4px; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
        select option { background: #111318; color: #F1F5F9; }
        textarea { font-family: 'DM Sans', 'Segoe UI', sans-serif; }
      `}</style>

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <div style={{ width: sidebarOpen ? 228 : 56, minWidth: sidebarOpen ? 228 : 56, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", transition: "width 0.25s, min-width 0.25s", overflow: "hidden" }}>
        {/* Logo */}
        <div style={{ padding: "18px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flexShrink: 0 }} onClick={() => setSidebarOpen(o => !o)}>
          <div style={{ width: 30, height: 30, background: C.accent, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff", flexShrink: 0, fontWeight: 800 }}>B</div>
          {sidebarOpen && <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.text, lineHeight: 1 }}>BizOS</div>
            <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>v2 · Business OS</div>
          </div>}
        </div>

        {/* Grouped Nav */}
        <nav style={{ flex: 1, padding: "10px 6px", display: "flex", flexDirection: "column", gap: 1, overflowY: "auto" }}>
          {NAV_GROUPS.map((item, idx) => {
            if (!item.id) {
              // Group label
              if (!sidebarOpen) return null;
              return (
                <div key={`grp-${idx}`} style={{ padding: "10px 8px 4px", fontSize: 9, fontWeight: 800, color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  {item.label}
                </div>
              );
            }
            const isActive = active === item.id;
            const badge = badgeCounts[item.id];
            return (
              <button key={item.id} onClick={() => setActive(item.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 9, border: "none", cursor: "pointer", width: "100%", textAlign: "left", background: isActive ? C.accentSoft : "transparent", color: isActive ? C.accent : C.textMuted, borderLeft: isActive ? `2px solid ${C.accent}` : "2px solid transparent", transition: "all 0.15s", fontSize: 13, fontWeight: isActive ? 700 : 500 }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.surfaceHover; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: 15, flexShrink: 0, width: 18, textAlign: "center" }}>{item.icon}</span>
                {sidebarOpen && <span style={{ whiteSpace: "nowrap", flex: 1 }}>{item.label}</span>}
                {sidebarOpen && badge > 0 && (
                  <span style={{ background: C.red, color: "#fff", borderRadius: 10, padding: "1px 6px", fontSize: 9, fontWeight: 800, flexShrink: 0 }}>{badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div style={{ padding: "10px 14px", borderTop: `1px solid ${C.border}`, fontSize: 11, color: C.textMuted, flexShrink: 0 }}>
            <div style={{ fontWeight: 700, color: C.text, marginBottom: 2 }}>Mon Entreprise SARL</div>
            <div>Entrepreneur · Tanger</div>
          </div>
        )}
      </div>

      {/* ── Main area ────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ height: 56, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", background: C.surface, flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
            {NAV_ITEMS.find(n => n.id === active)?.label}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {/* Quick action buttons */}
            <button onClick={() => setActive("tasks")} style={{ background: C.redSoft, color: C.red, border: `1px solid ${C.red}30`, borderRadius: 7, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              {badgeCounts.tasks > 0 ? `🔥 ${badgeCounts.tasks} urgent` : "+ Task"}
            </button>
            <button onClick={() => setActive("quotes")} style={{ background: C.accentSoft, color: C.accent, border: `1px solid ${C.accent}30`, borderRadius: 7, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              + Devis / Facture
            </button>
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: "6px 12px", fontSize: 12, color: C.textMuted, display: "flex", gap: 7, alignItems: "center" }}>
              <span>🔍</span><span>Search…</span>
            </div>
            <div style={{ width: 32, height: 32, background: C.accentSoft, border: `1px solid ${C.accent}30`, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, cursor: "pointer", color: C.accent, position: "relative" }}>
              🔔
              {(badgeCounts.tasks + badgeCounts.quotes + badgeCounts.cheques) > 0 && (
                <span style={{ position: "absolute", top: -4, right: -4, background: C.red, color: "#fff", borderRadius: 8, padding: "0 5px", fontSize: 9, fontWeight: 800 }}>
                  {badgeCounts.tasks + badgeCounts.quotes + badgeCounts.cheques}
                </span>
              )}
            </div>
            <div style={{ width: 32, height: 32, background: C.accent, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff" }}>E</div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflow: "auto", padding: 22 }}>
          {pages[active]}
        </div>
      </div>
    </div>
  );
}
