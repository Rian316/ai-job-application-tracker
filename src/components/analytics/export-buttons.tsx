"use client";

import * as React from "react";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ExportButtons({
  rows,
}: {
  rows: Array<Record<string, string | number | null>>;
}) {
  const [exporting, setExporting] = React.useState<string | null>(null);

  async function exportCsv() {
    setExporting("csv");
    try {
      const { default: Papa } = await import("papaparse");
      const csv = Papa.unparse(rows);
      downloadBlob(csv, "applications.csv", "text/csv;charset=utf-8;");
      toast.success("CSV exported");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(null);
    }
  }

  async function exportExcel() {
    setExporting("excel");
    try {
      const { default: ExcelJS } = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Applications");
      if (rows.length > 0) {
        sheet.columns = Object.keys(rows[0]).map((key) => ({
          header: key,
          key,
          width: 24,
        }));
        sheet.addRows(rows);
      }
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      downloadBlob(blob, "applications.xlsx");
      toast.success("Excel exported");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(null);
    }
  }

  async function exportPdf() {
    setExporting("pdf");
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(14);
      doc.text("AI Job Application Tracker — Export", 14, 14);
      doc.setFontSize(9);

      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
      const columnWidths = columns.map(() => 40);
      const startY = 24;

      if (rows.length > 0) {
        let x = 14;
        doc.setFont("helvetica", "bold");
        columns.forEach((col, index) => {
          doc.text(col, x, startY);
          x += columnWidths[index];
        });
      }

      let y = startY + 8;
      doc.setFont("helvetica", "normal");
      for (const row of rows.slice(0, 200)) {
        let x = 14;
        columns.forEach((col, index) => {
          const value = row[col] ?? "";
          const text = String(value).slice(0, 30);
          doc.text(text, x, y);
          x += columnWidths[index];
        });
        y += 6;
        if (y > 190) {
          doc.addPage();
          y = 24;
        }
      }

      doc.save("applications.pdf");
      toast.success("PDF exported");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(null);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={exporting !== null}>
          {exporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportCsv} disabled={exporting !== null}>
          <FileText className="size-4" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportExcel} disabled={exporting !== null}>
          <FileSpreadsheet className="size-4" />
          Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPdf} disabled={exporting !== null}>
          <FileText className="size-4" />
          PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function downloadBlob(content: BlobPart, filename: string, type?: string) {
  const blob = new Blob([content], type ? { type } : undefined);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}