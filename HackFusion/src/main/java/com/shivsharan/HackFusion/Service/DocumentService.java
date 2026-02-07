package com.shivsharan.HackFusion.Service;

import com.shivsharan.HackFusion.Model.Report;
import com.shivsharan.HackFusion.Model.ReportStatus;
import com.shivsharan.HackFusion.Repository.ReportRepository;
import com.shivsharan.HackFusion.Repository.ReportStatusRepository;
import fr.opensagres.xdocreport.converter.ConverterTypeTo;
import fr.opensagres.xdocreport.converter.ConverterTypeVia;
import fr.opensagres.xdocreport.converter.Options;
import fr.opensagres.xdocreport.document.IXDocReport;
import fr.opensagres.xdocreport.document.registry.XDocReportRegistry;
import fr.opensagres.xdocreport.template.IContext;
import fr.opensagres.xdocreport.template.TemplateEngineKind;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class DocumentService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private ReportStatusRepository reportStatusRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public void fillMap(UUID reportId, IContext context) {
        // 1. Fetch data from DB
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        List<ReportStatus> statusHistory = reportStatusRepository.findByReports_IdOrderByDateDesc(reportId);

        // 2. Map basic report fields
        // Use these keys in your Word Doc: ${id}, ${description}, etc.
        context.put("id", report.getId().toString());
        context.put("description", report.getDescription());
        context.put("status", report.getStatus());
        context.put("priority", String.valueOf(report.getPriority()));
        context.put("upvotes", report.getUpvotes());
        context.put("lat", report.getLat());
        context.put("lon", report.getLon());

        // Dates
        context.put("entryDate", report.getEntryDate() != null ? report.getEntryDate().toString() : "N/A");
        context.put("issueSince", report.getIssueSince() != null ? report.getIssueSince().toString() : "N/A");

        // 3. Map Associated Objects
        if (report.getDepartment() != null) {
            context.put("department", report.getDepartment().getName());
        }

        if (report.getSenders() != null) {
            context.put("operatorName", report.getSenders().getUsername());
        }

        // 4. Map the Status History List for a Table in Word
        // In Word, you can use a loop: [#list history as item] ${item.status} [/#list]
        context.put("history", statusHistory);
    }

    public String generatePdfFromTemplate(UUID reportId) {
        Map<String, Object> data = new HashMap<>();
        try {
            // 1. Load the template from resources
            InputStream in = getClass().getResourceAsStream("/template.docx");
            if (in == null) {
                throw new RuntimeException("Template file not found!");
            }

            // 2. Load XDocReport with FreeMarker engine
            IXDocReport report = XDocReportRegistry.getRegistry()
                    .loadReport(in, TemplateEngineKind.Freemarker);

            // 3. Create Context and put data (just like a Map)
            IContext context = report.createContext();
            fillMap(reportId, context);

            // 4. Set up PDF conversion options
            Options options = Options.getTo(ConverterTypeTo.PDF).via(ConverterTypeVia.XWPF);

            // 5. Generate the PDF into a ByteArrayOutputStream
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            report.convert(context, options, out);
            byte[] pdfBytes = out.toByteArray();

            String fileName = "issue_report_" + System.currentTimeMillis();

            String pdfUrl = cloudinaryService.uploadFile(pdfBytes, fileName, "generated_reports");

            if (pdfUrl != null) {
                System.out.println("PDF uploaded successfully: " + pdfUrl);

                return pdfUrl;
            } else {
                return null;
            }
            
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }
}


//        return ResponseEntity.ok()
//                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=issue_report.pdf")
//                .contentType(MediaType.APPLICATION_PDF)
//                .body(pdfBytes);
