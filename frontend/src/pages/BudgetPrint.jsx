import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { useBudget } from "@services/budgetsService";

const formatCurrency = (value) => {
  const n = Number(value) || 0;
  return `$${n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

const formatDate = (iso) => {
  if (!iso) return { day: "", month: "", year: "" };
  const [y, m, d] = iso.split("-");
  return { day: d, month: m, year: y };
};

const PrintSheet = ({ budget }) => {
  const { day, month, year } = formatDate(budget.date);
  const items = budget.items || [];

  // Pad items to at least 12 rows for the print layout
  const MIN_ROWS = 12;
  const padded = [
    ...items,
    ...Array.from({ length: Math.max(0, MIN_ROWS - items.length) }, () => null),
  ];

  return (
    <div
      id="budget-print-sheet"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "8mm 10mm",
        fontFamily: "Arial, sans-serif",
        fontSize: "11px",
        color: "#000",
        backgroundColor: "#fff",
        boxSizing: "border-box",
      }}
    >
      {/* Top info row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "6px",
          fontSize: "10px",
        }}
      >
        <div>
          <div>
            <strong>CUIT:</strong> _______________
          </div>
          <div style={{ marginTop: "3px" }}>
            <strong>FACT:</strong> _______________
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div>
            <strong>NOMBRE:</strong>{" "}
            {budget.customer?.name || budget.vehicle_description || ""}
          </div>
          <div style={{ marginTop: "3px" }}>
            <strong>WSP:</strong> {budget.customer?.phone || ""}
          </div>
        </div>
      </div>

      {/* Logo / Brand header */}
      <div
        style={{
          backgroundColor: "#1a1a1a",
          color: "#fff",
          padding: "8px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0",
          borderRadius: "4px 4px 0 0",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: "900",
              letterSpacing: "2px",
              color: "#ffffff",
            }}
          >
            KILLAMET
          </div>
          <div
            style={{ fontSize: "11px", color: "#cccccc", letterSpacing: "3px" }}
          >
            LUBRICANTES
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: "10px", color: "#cccccc" }}>
          <div>Cel: 02245 - 459938</div>
          <div>Cel: 02245 - 459133</div>
        </div>
      </div>

      {/* PRESUPUESTO banner */}
      <div
        style={{
          backgroundColor: "#cc2200",
          color: "#fff",
          padding: "6px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0",
        }}
      >
        <span
          style={{ fontSize: "16px", fontWeight: "900", letterSpacing: "2px" }}
        >
          PRESUPUESTO
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
          }}
        >
          <span>DÍA</span>
          <span
            style={{
              background: "#fff",
              color: "#cc2200",
              fontWeight: "bold",
              padding: "1px 6px",
              borderRadius: "2px",
              minWidth: "22px",
              textAlign: "center",
            }}
          >
            {day}
          </span>
          <span>MES</span>
          <span
            style={{
              background: "#fff",
              color: "#cc2200",
              fontWeight: "bold",
              padding: "1px 6px",
              borderRadius: "2px",
              minWidth: "22px",
              textAlign: "center",
            }}
          >
            {month}
          </span>
          <span>AÑO</span>
          <span
            style={{
              background: "#fff",
              color: "#cc2200",
              fontWeight: "bold",
              padding: "1px 6px",
              borderRadius: "2px",
              minWidth: "36px",
              textAlign: "center",
            }}
          >
            {year}
          </span>
        </div>
      </div>

      {/* Vehicle row */}
      <div
        style={{
          border: "1px solid #ccc",
          borderTop: "none",
          padding: "5px 8px",
          fontSize: "11px",
        }}
      >
        <strong>Vehículo:</strong>{" "}
        {budget.vehicle_description ||
          (budget.vehicle
            ? `${budget.vehicle.brand} ${budget.vehicle.model} ${budget.vehicle.year}`
            : "")}
      </div>

      {/* Items table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "11px",
          marginTop: "0",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#cc2200", color: "#fff" }}>
            <th
              style={{
                border: "1px solid #999",
                padding: "4px 6px",
                textAlign: "center",
                width: "40px",
              }}
            >
              CANT
            </th>
            <th
              style={{
                border: "1px solid #999",
                padding: "4px 6px",
                textAlign: "left",
              }}
            >
              ARTÍCULO
            </th>
            <th
              style={{
                border: "1px solid #999",
                padding: "4px 6px",
                textAlign: "right",
                width: "90px",
              }}
            >
              IMPORTE
            </th>
          </tr>
        </thead>
        <tbody>
          {padded.map((item, idx) => (
            <tr key={idx} style={{ height: "22px" }}>
              <td
                style={{
                  border: "1px solid #ccc",
                  padding: "3px 6px",
                  textAlign: "center",
                  color: item ? "#000" : "transparent",
                }}
              >
                {item ? item.quantity : "."}
              </td>
              <td
                style={{
                  border: "1px solid #ccc",
                  padding: "3px 8px",
                  color: item ? "#000" : "transparent",
                }}
              >
                {item ? item.description : "."}
              </td>
              <td
                style={{
                  border: "1px solid #ccc",
                  padding: "3px 8px",
                  textAlign: "right",
                  color: item ? "#000" : "transparent",
                  fontWeight: item ? "600" : "normal",
                }}
              >
                {item ? formatCurrency(item.total) : "."}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Brand logos row */}
      <div
        style={{
          border: "1px solid #ccc",
          borderTop: "none",
          padding: "5px 8px",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          fontSize: "9px",
          color: "#555",
          letterSpacing: "1px",
          fontWeight: "bold",
        }}
      >
        {["FRAM", "BARDAHL", "BOSCH", "MOTUL", "elf", "Shell", "ZM"].map(
          (brand) => (
            <span key={brand} style={{ padding: "0 4px" }}>
              {brand}
            </span>
          ),
        )}
      </div>

      {/* Totals */}
      <div
        style={{
          border: "1px solid #ccc",
          borderTop: "none",
          padding: "8px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "11px" }}>
            <strong>PRECIO D/LISTA / </strong>
            <span
              style={{
                backgroundColor: "#ffe066",
                padding: "1px 4px",
                fontWeight: "bold",
              }}
            >
              EFT/DEB
            </span>
            <strong> TOTAL $</strong>
          </div>
          <div style={{ fontSize: "14px", fontWeight: "900" }}>
            {formatCurrency(budget.total_list)}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "11px" }}>
            <strong>TARJETA D/CRED TOTAL $</strong>
          </div>
          <div style={{ fontSize: "14px", fontWeight: "900" }}>
            {formatCurrency(budget.total_card)}
          </div>
        </div>
        {budget.notes && (
          <div
            style={{
              marginTop: "4px",
              fontSize: "10px",
              color: "#444",
              fontStyle: "italic",
            }}
          >
            {budget.notes}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: "#cc2200",
          color: "#fff",
          padding: "4px 12px",
          fontSize: "10px",
          textAlign: "center",
          borderRadius: "0 0 4px 4px",
          marginTop: "0",
        }}
      >
        santiagokilla10@gmail.com
      </div>
    </div>
  );
};

const BudgetPrint = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isLoading } = useBudget(id);
  const printRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const budget = data?.data;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("budget-print-sheet");
    if (!element) return;

    setIsGenerating(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      const finalHeight = Math.min(imgHeight, pageHeight);

      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, finalHeight);
      pdf.save(`budget-${id}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const styleId = "budget-print-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        @media print {
          body > * { display: none !important; }
          #budget-print-root { display: block !important; }
          #budget-print-sheet { margin: 0; box-shadow: none; }
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="text-center py-24 text-secondary">
        Budget no encontrado.
      </div>
    );
  }

  return (
    <div>
      {/* Screen toolbar — hidden on print */}
      <div className="flex items-center gap-3 mb-6 print:hidden flex-wrap">
        <button
          onClick={() => navigate(`/presupuestos/${id}/editar`)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-outline-variant text-secondary hover:text-on-surface hover:bg-surface-container-high text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary rounded-lg font-semibold text-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Download className="w-4 h-4" />
          {isGenerating ? "Generando..." : "Descargar PDF"}
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-secondary hover:text-on-surface hover:bg-surface-container-high text-sm transition-colors"
        >
          <Printer className="w-4 h-4" />
          Imprimir
        </button>
      </div>

      {/* Print sheet preview */}
      <div
        id="budget-print-root"
        className="bg-white shadow-xl rounded-lg overflow-hidden mx-auto"
        style={{ maxWidth: "210mm" }}
        ref={printRef}
      >
        <PrintSheet budget={budget} />
      </div>
    </div>
  );
};

export default BudgetPrint;
