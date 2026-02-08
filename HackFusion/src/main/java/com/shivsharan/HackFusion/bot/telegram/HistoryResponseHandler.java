package com.shivsharan.HackFusion.bot.telegram;

import com.shivsharan.HackFusion.Model.Operators;
import com.shivsharan.HackFusion.Model.Report;
import com.shivsharan.HackFusion.Service.*;
import org.telegram.abilitybots.api.db.DBContext;
import org.telegram.abilitybots.api.sender.SilentSender;
import org.telegram.telegrambots.meta.api.objects.Update;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class HistoryResponseHandler {
    private final SilentSender silent;
    private final Map<Long, HistoryState> historyStates;

    // Services
    private final ReportService reportService;
    private final OperatorsService operatorsService;

    // Enum to track where the user is in the conversation
    public enum HistoryState {
        IDLE,
        AWAITING_REPORT_SELECTION
    }

    IssueBot issueBot;
    DepartmentService departmentService;
    CloudinaryService cloudinaryService;

    public HistoryResponseHandler(SilentSender silent, DBContext db, IssueBot issueBot,
                                  DepartmentService departmentService,
                                  ReportService reportService,
                                  OperatorsService operatorsService,
                                  CloudinaryService cloudinaryService) {
        this.silent = silent;
        this.issueBot = issueBot;
        this.departmentService = departmentService;
        this.issueBot = issueBot;
        this.cloudinaryService = cloudinaryService;
        this.historyStates = db.getMap("HISTORY_STATES");
        this.reportService = reportService;
        this.operatorsService = operatorsService;
    }

    // --- STEP 1: TRIGGER HISTORY LIST ---
    public void replyToHistory(Long chatId) {
        Operators operator = operatorsService.findByUsername(String.valueOf(chatId));

        if (operator == null) {
            silent.send("You are not registered. Please create a report first.", chatId);
            return;
        }

        List<Report> reports = reportService.getALlBySenders(operator);

        if (reports.isEmpty()) {
            silent.send("No submitted reports found.", chatId);
            historyStates.put(chatId, HistoryState.IDLE);
        } else {
            // Sort reports by date (newest first)
            reports.sort(Comparator.comparing(Report::getEntryDate).reversed());

            StringBuilder sb = new StringBuilder("**Report History**\n\n");

            for (int i = 0; i < reports.size(); i++) {
                Report r = reports.get(i);
                String deptName = (r.getDepartment() != null) ? r.getDepartment().getName() : "Unassigned";
                String shortDesc = r.getDescription().length() > 30
                        ? r.getDescription().substring(0, 30) + "..."
                        : r.getDescription();

                sb.append(String.format("%d. [%s] %s - %s\n",
                        i + 1,
                        r.getStatus(),
                        deptName,
                        shortDesc));
            }

            sb.append("\nReply with the number of the report you want to view.");

            silent.send(sb.toString(), chatId);
            historyStates.put(chatId, HistoryState.AWAITING_REPORT_SELECTION);
        }
    }

    // --- STEP 2: HANDLE USER SELECTION ---
    public void handleUpdate(Update update) {
        long chatId = update.getMessage().getChatId();
        HistoryState state = historyStates.getOrDefault(chatId, HistoryState.IDLE);

        if (state == HistoryState.AWAITING_REPORT_SELECTION) {
            if (update.getMessage().hasText()) {
                String text = update.getMessage().getText();

                // Allow user to cancel
                if (text.equalsIgnoreCase("/cancel") || text.equalsIgnoreCase("cancel")) {
                    historyStates.remove(chatId);
                    silent.send("History view closed.", chatId);
                    return;
                }

                try {
                    int selection = Integer.parseInt(text);
                    showReportDetails(chatId, selection);
                } catch (NumberFormatException e) {
                    silent.send("Invalid input. Please reply with a number from the list.", chatId);
                }
            }
        }
    }

    // --- STEP 3: SHOW DETAILS & MEDIA ---
    private void showReportDetails(long chatId, int selection) {
        Operators operator = operatorsService.findByUsername(String.valueOf(chatId));
        List<Report> reports = reportService.getALlBySenders(operator);

        // Ensure consistency with the list view sorting
        reports.sort(Comparator.comparing(Report::getEntryDate).reversed());

        if (selection < 1 || selection > reports.size()) {
            silent.send("Number out of range. Please try again.", chatId);
            return;
        }

        Report report = reports.get(selection - 1); // Adjust for 0-based index

        // 1. Build Text Details
        String deptName = (report.getDepartment() != null) ? report.getDepartment().getName() : "Pending Assignment";

        String details = String.format(
                "**Report Details**\n" +
                        "------------------------------\n" +
                        "**ID:** %s\n" +
                        "**Date:** %s\n" +
                        "**Department:** %s\n" +
                        "**Status:** %s\n" +
                        "**Priority:** %d\n" +
                        "**Description:** %s\n" +
                        "**Address:** %s\n",
                report.getId().toString().substring(0, 8) + "...", // Shorten UUID for readability
                report.getEntryDate(),
                deptName,
                report.getStatus(),
                report.getPriority(),
                report.getDescription(),
                (report.getLat() != 0.0 ? "GPS Coordinates Provided" : "No GPS Data")
        );
        silent.send(details, chatId);

        // 2. Send Images (Media URL)
        List<String> images = report.getMedia_url();
        if (images != null && !images.isEmpty()) {
            silent.send("**Attached Images:**", chatId);
            for (String imgUrl : images) {
                silent.send(imgUrl, chatId);
            }
        } else {
            silent.send("No images attached.", chatId);
        }

        // 3. Send PDF Document
        if (report.getPdf_url() != null && !report.getPdf_url().isEmpty()) {
            silent.send("**Official Document:**", chatId);
            silent.send(report.getPdf_url(), chatId);
        }

        // 4. Close Session
        silent.send("\nType /history to view the list again, or /start to report a new issue.", chatId);
        historyStates.remove(chatId); // End the conversation
    }

    // Helper to check if this handler should claim the update
    public boolean chatHasState(long chatId) {
        return historyStates.containsKey(chatId) && historyStates.get(chatId) != HistoryState.IDLE;
    }

    // Helper to clear state manually if needed
    public void clearState(long chatId) {
        historyStates.remove(chatId);
    }

}