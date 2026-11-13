import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { useBudget } from "@services/budgetsService";
import { useSetting } from "@services/settingsService";
import BudgetPrintSheet from "@components/features/budgets/BudgetPrintSheet";

const BudgetPrint = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isLoading } = useBudget(id);
  const { data: settingData } = useSetting();
  const printRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const budget = data?.data;
  const setting = settingData?.data;

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
        allowTaint: false,
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
      pdf.save(`presupuesto-${id}.pdf`);
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
        Presupuesto no encontrado.
      </div>
    );
  }

  return (
    <div>
      {/* Screen toolbar — hidden on print */}
      <div className="flex items-center gap-3 mb-6 print:hidden flex-wrap">
        <button
          onClick={() => navigate(`/budgets/${id}/edit`)}
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
      </div>

      {/* Print sheet preview */}
      <div
        id="budget-print-root"
        className="bg-white shadow-xl rounded-lg overflow-hidden mx-auto"
        style={{ maxWidth: "210mm" }}
        ref={printRef}
      >
        <BudgetPrintSheet budget={budget} setting={setting} />
      </div>
    </div>
  );
};

export default BudgetPrint;
