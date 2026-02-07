package com.shivsharan.HackFusion.bot.telegram;

import com.shivsharan.HackFusion.DTO.ClassificationDetailsDto;
import com.shivsharan.HackFusion.Model.Operators; // Assuming this is your User/Operator model
import com.shivsharan.HackFusion.Model.Report;
import com.shivsharan.HackFusion.Service.*;
import org.telegram.abilitybots.api.db.DBContext;
import org.telegram.abilitybots.api.sender.SilentSender;
import org.telegram.telegrambots.meta.api.objects.Location;
import org.telegram.telegrambots.meta.api.objects.PhotoSize;
import org.telegram.telegrambots.meta.api.objects.Update;
import com.shivsharan.HackFusion.DTO.ReportRequest;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;

public class ResponseHandler {
    private final SilentSender silent;
    private final Map<Long, UserState> chatStates;
    private final Map<Long, Report> reportDrafts;
    private final IssueBot bot;

    // Services
    private final DepartmentService departmentService;
    private final ReportService reportService;
    private final OperatorsService operatorsService;
    private final MLpipeline mLpipeline;
    private final CloudinaryService cloudinaryService;

    public enum UserState {
        START,
        AWAITING_DESCRIPTION,
        AWAITING_DEPARTMENT,
        AWAITING_ISSUE_SINCE,
        AWAITING_LOCATION,
        AWAITING_IMAGE,
        COMPLETED
    }

    // Constructor: Inject Services here to ensure they are not null
    public ResponseHandler(SilentSender silent, DBContext db, IssueBot bot,
                           DepartmentService departmentService,
                           ReportService reportService, OperatorsService operatorsService,
                           MLpipeline mLpipeline,
                           CloudinaryService cloudinaryService
    ) {
        this.silent = silent;
        this.chatStates = db.getMap("USER_STATES");
        this.reportDrafts = new HashMap<>();
        this.bot = bot;
        this.departmentService = departmentService;
        this.reportService = reportService;
        this.operatorsService = operatorsService;
        this.mLpipeline = mLpipeline;
        this.cloudinaryService = cloudinaryService;
    }

    // --- STEP 1: START ---
    public void replyToStart(long chatId) {
        silent.send("Welcome to the Civil Issue Reporting System.\n\nPlease providing a brief description of the issue.", chatId);
        chatStates.put(chatId, UserState.AWAITING_DESCRIPTION);
        reportDrafts.put(chatId, new Report());
        if(operatorsService.findByUsername(String.valueOf(chatId)) == null){
            Operators operators = new Operators();
            operators.setJoinDate(LocalDate.now());
            operators.setRole("Citizen");
            operators.setDepartment(null);
            operators.setUsername(String.valueOf(chatId));
            operatorsService.save(operators);
        }
    }

    public void handleUpdate(Update update) {
        long chatId = update.getMessage().getChatId();
        UserState currentState = chatStates.getOrDefault(chatId, UserState.START);
        Report report = reportDrafts.getOrDefault(chatId, new Report());

        // Ignore commands if they interrupt the flow (optional)
        if (update.getMessage().hasText() && update.getMessage().getText().startsWith("/")) {
            return;
        }

        switch (currentState) {
            // --- STEP 2: DESCRIPTION ---
            case AWAITING_DESCRIPTION:
                if (update.getMessage().hasText()) {
                    report.setDescription(update.getMessage().getText());

                    silent.send("Description recorded. Please specify the Department responsible (e.g., Roads, Sanitation, Electrical).", chatId);

                    reportDrafts.put(chatId, report);
                    chatStates.put(chatId, UserState.AWAITING_DEPARTMENT);
                } else {
                    silent.send("Invalid input. Please provide a text description.", chatId);
                }
                break;

            // --- STEP 3: DEPARTMENT ---
            case AWAITING_DEPARTMENT:
                if (update.getMessage().hasText()) {
                    String deptName = update.getMessage().getText();
//                    Department dept = departmentService.findByName(deptName);
//
//                    if (dept != null) {
                        report.setDepartment(null);
                        silent.send("Department confirmed. Please enter the number of days since the issue has persisted (Format: Number).", chatId);
                        reportDrafts.put(chatId, report);
                        chatStates.put(chatId, UserState.AWAITING_ISSUE_SINCE);
//                    } else {
//                        silent.send("Department not found. Please ensure the name is correct and try again.", chatId);
//                    }
                } else {
                    silent.send("Please enter a valid department name.", chatId);
                }
                break;

            // --- STEP 4: ISSUE SINCE (DATE) ---
            case AWAITING_ISSUE_SINCE:
                if (update.getMessage().hasText()) {
                    try {
                        LocalDate date = LocalDate.now();
                        int noOfDays = Integer.parseInt(update.getMessage().getText());
                        date = date.minusDays(noOfDays);
                        report.setIssueSince(date);

                        silent.send("Date recorded. Please share the precise location of the issue using the attachment menu.", chatId);

                        reportDrafts.put(chatId, report);
                        chatStates.put(chatId, UserState.AWAITING_LOCATION);
                    } catch (DateTimeParseException e) {
                        silent.send("Invalid date format. Please use YYYY-MM-DD (e.g., 2024-05-20).", chatId);
                    }
                } else {
                    silent.send("Please enter the date in YYYY-MM-DD format.", chatId);
                }
                break;

            // --- STEP 5: LOCATION ---
            case AWAITING_LOCATION:
                if (update.getMessage().hasLocation()) {
                    Location loc = update.getMessage().getLocation();
                    report.setLat(loc.getLatitude());
                    report.setLon(loc.getLongitude());
                    chatStates.put(chatId, UserState.AWAITING_IMAGE);
                    proceedToImage(chatId, report);
                }
                else if (update.getMessage().hasText()) {
                    // Fallback for text location
                    report.setLat(0.0);
                    report.setLon(0.0);
                    // Append address to description since we lack coordinates
                    String currentDesc = report.getDescription();
                    report.setDescription(currentDesc + " [Address: " + update.getMessage().getText() + "]");
                    chatStates.put(chatId, UserState.AWAITING_IMAGE);

                    silent.send("Location text recorded. Note: GPS coordinates are preferred for accuracy.", chatId);
                    proceedToImage(chatId, report);
                } else {
                    silent.send("Please share a location via the attachment menu or type the address.", chatId);
                }
                break;

            case AWAITING_IMAGE:
                if (update.getMessage().hasPhoto()) {
                    List<PhotoSize> photos = update.getMessage().getPhoto();
                    String fileId = photos.stream()
                            .max(Comparator.comparing(PhotoSize::getFileSize))
                            .orElse(photos.get(0))
                            .getFileId();

                    String photoUrl = bot.getPhotoLink(fileId);

                    finalizeAndSaveReport(chatId, report, photoUrl);

                    chatStates.put(chatId, UserState.COMPLETED);
                    chatStates.remove(chatId);
                    reportDrafts.remove(chatId);
                } else {
                    silent.send("Please upload an image file to finalize the report.", chatId);
                }
                break;

            case COMPLETED:
                chatStates.put(chatId, UserState.START);
            default:
                silent.send("Session expired or invalid state. Type /start to begin.", chatId);
                break;
        }
    }

    private void proceedToImage(long chatId, Report report) {
        reportDrafts.put(chatId, report);
        silent.send("Location recorded. Finally, please upload a photo of the issue.", chatId);
        chatStates.put(chatId, UserState.AWAITING_IMAGE);
    }

    private void finalizeAndSaveReport(long chatId, Report report, String photoUrl) {
        try {
            String photourl = cloudinaryService.uploadFile(photoUrl, "images");
            ReportRequest reportRequest = new ReportRequest();

            reportRequest.setUid(null);
            reportRequest.setIssue_since(report.getIssueSince());
            reportRequest.setDescription(report.getDescription());
            reportRequest.setLat(report.getLat());
            reportRequest.setLon(report.getLon());
            reportRequest.setMedia_url(Collections.singletonList(photoUrl));
            reportRequest.setUsername(String.valueOf(chatId));


            reportRequest.setDepartment_id(null);

            report = reportService.save(reportRequest);

            ClassificationDetailsDto classificationDetailsDto = mLpipeline.update(report);
            report.setDepartment(departmentService.findByName(classificationDetailsDto.getFinalDepartment()));
            report.setPriority(classificationDetailsDto.getFinalPriority());

            String confirmation = String.format(
                    "Report Registered Successfully.\n\nID: %s\nDepartment: %s\nStatus: %s\nView Image: %s",
                    report.getId().toString(),
                    report.getDepartment() == null ?" ": report.getDepartment().getName(),
                    report.getStatus(),
                    photoUrl
            );
            silent.send(confirmation, chatId);

        } catch (Exception e) {
            e.printStackTrace();
            silent.send("An error occurred while saving your report. Please contact support.", chatId);
        }
    }

    // TODO: You must implement this based on your User/Operator Service
    private Operators getOrCreateOperator(long telegramChatId) {
        // Example logic:
        // return operatorRepository.findByTelegramId(telegramChatId)
        //         .orElseGet(() -> operatorService.createGuestUser(telegramChatId));
        return null; // <-- REPLACE THIS with actual logic or the save will fail
    }
}