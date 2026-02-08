package com.shivsharan.HackFusion.bot.telegram;

import com.shivsharan.HackFusion.Service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.telegram.abilitybots.api.bot.AbilityBot;
import org.telegram.abilitybots.api.objects.Ability;
import org.telegram.abilitybots.api.objects.Locality;
import org.telegram.abilitybots.api.objects.Privacy;
import org.telegram.telegrambots.meta.api.methods.GetFile;
import org.telegram.telegrambots.meta.api.objects.File;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

@Component
public class IssueBot extends AbilityBot {

    // Handlers
    private ResponseHandler responseHandler;
    private HistoryResponseHandler historyHandler;

    // Services
    private final DepartmentService departmentService;
    private final ReportService reportService;
    private final OperatorsService operatorsService;
    private final MLpipeline mLpipeline;
    private final CloudinaryService cloudinaryService;

    @Autowired
    public IssueBot(Environment env,
                    DepartmentService departmentService,
                    ReportService reportService,
                    OperatorsService operatorsService,
                    MLpipeline mLpipeline,
                    CloudinaryService cloudinaryService
    ) {
        super(env.getProperty("TelegramBot"), "CivilIssueRegister");

        this.departmentService = departmentService;
        this.reportService = reportService;
        this.operatorsService = operatorsService;
        this.mLpipeline = mLpipeline;
        this.cloudinaryService = cloudinaryService;
    }

    @Override
    public void onRegister() {
        // Initialize handlers here or in constructor, but ensure 'silent' (sender) is available
        // abilitybots 'silent' sender is available after super() init.
        this.responseHandler = new ResponseHandler(silent, db, this, departmentService, reportService, operatorsService, mLpipeline, cloudinaryService);
        this.historyHandler = new HistoryResponseHandler(silent, db, this, departmentService, reportService, operatorsService, cloudinaryService);
    }

    @Override
    public long creatorId() {
        return 1L;
    }

    public Ability startCommand() {
        return Ability.builder()
                .name("start")
                .info("Begin the issue registration")
                .locality(Locality.ALL)
                .privacy(Privacy.PUBLIC)
                .action(ctx -> responseHandler.replyToStart(ctx.chatId()))
                .build();
    }

    public Ability historyCommand() {
        return Ability.builder()
                .name("history") // User types /history
                .info("See all past reports registered")
                .locality(Locality.ALL)
                .privacy(Privacy.PUBLIC)
                .action(ctx -> historyHandler.replyToHistory(ctx.chatId()))
                .build();
    }

    @Override
    public void onUpdateReceived(Update update) {
        // 1. Process standard AbilityBot commands (like /start, /history)
        super.onUpdateReceived(update);

        // 2. Process conversational inputs (text, images, locations)
        if (update.hasMessage()) {
            long chatId = update.getMessage().getChatId();
            String msgText = update.getMessage().hasText() ? update.getMessage().getText() : "";

            // Ignore commands here, they are handled by AbilityBot above
            if (msgText.startsWith("/")) {
                return;
            }

            // ROUTING LOGIC:
            // If the user is currently viewing history (waiting to pick a number), send to HistoryHandler.
            if (historyHandler != null && historyHandler.chatHasState(chatId)) {
                historyHandler.handleUpdate(update);
            }
            // Otherwise, default to the Report Submission flow.
            else if (responseHandler != null) {
                responseHandler.handleUpdate(update);
            }
        }
    }

    // Helper for ResponseHandler to get photo links
    public String getPhotoLink(String fileId) {
        try {
            GetFile getFileMethod = new GetFile();
            getFileMethod.setFileId(fileId);
            File file = execute(getFileMethod);
            return file.getFileUrl(getBotToken());
        } catch (TelegramApiException e) {
            e.printStackTrace();
            return null;
        }
    }
}