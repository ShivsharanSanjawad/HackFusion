package com.shivsharan.HackFusion.bot.telegram;

import com.shivsharan.HackFusion.Service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.telegram.abilitybots.api.bot.AbilityBot;
import org.telegram.abilitybots.api.bot.BaseAbilityBot;
import org.telegram.abilitybots.api.objects.Ability;
import org.telegram.abilitybots.api.objects.Locality;
import org.telegram.abilitybots.api.objects.Privacy;
import org.telegram.telegrambots.meta.api.methods.GetFile;
import org.telegram.telegrambots.meta.api.objects.File;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import java.lang.reflect.Field;
import java.util.ArrayList;

@Component
public class IssueBot extends AbilityBot {

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
        super.onRegister();

        // --- CRITICAL FIX START (Reflection for Spring Proxy issue) ---
        try {
            Field repliesField = BaseAbilityBot.class.getDeclaredField("replies");
            repliesField.setAccessible(true);
            if (repliesField.get(this) == null) {
                repliesField.set(this, new ArrayList<>());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        // --- CRITICAL FIX END ---

        // Initialize handlers
        this.responseHandler = new ResponseHandler(silent, db, this, departmentService, reportService, operatorsService, mLpipeline, cloudinaryService);
        // Note: I adjusted the constructor call below to match your likely HistoryResponseHandler signature
        this.historyHandler = new HistoryResponseHandler(silent, db, this, departmentService, reportService, operatorsService, cloudinaryService);
    }

    @Override
    public long creatorId() {
        return 1L;
    }

    // --- COMMANDS ---

    /**
     * /start
     * Displays the main menu with available commands.
     */
    public Ability startCommand() {
        return Ability.builder()
                .name("start")
                .info("Show main menu")
                .locality(Locality.ALL)
                .privacy(Privacy.PUBLIC)
                .action(ctx -> {
                    // Reset any active conversation states so the menu is fresh
                    if (historyHandler != null) historyHandler.clearState(ctx.chatId());
                    // If ResponseHandler has a clear/reset method, call it here too.

                    String menu = "👋 **Welcome to the Civil Issue Register**\n\n" +
                            "Please choose an action:\n" +
                            "📢 /reports - Register a new civil issue\n" +
                            "📂 /history - View your past reports";
                    silent.send(menu, ctx.chatId());
                })
                .build();
    }

    /**
     * /report
     * Triggers the ResponseHandler to start the reporting flow.
     */
    public Ability reportCommand() {
        return Ability.builder()
                .name("reports")
                .info("Register a new issue")
                .locality(Locality.ALL)
                .privacy(Privacy.PUBLIC)
                .action(ctx -> {
                    // Clear history state to avoid conflicts
                    if (historyHandler != null) historyHandler.clearState(ctx.chatId());
                    // Start the reporting conversation
                    responseHandler.replyToStart(ctx.chatId());
                })
                .build();
    }

    /**
     * /history
     * Triggers the HistoryResponseHandler to view past reports.
     */
    public Ability getAllReportsCommand() {
        return Ability.builder()
                .name("history")
                .info("See all past reports registered")
                .locality(Locality.ALL)
                .privacy(Privacy.PUBLIC)
                .action(ctx -> {
                    // Clear history state initially to start fresh
                    if (historyHandler != null) historyHandler.clearState(ctx.chatId());
                    // Trigger the history view
                    historyHandler.replyToHistory(ctx.chatId());
                })
                .build();
    }

    // --- ROUTING ---

    @Override
    public void onUpdateReceived(Update update) {
        // Handle commands (/start, /report, /history) via AbilityBot
        super.onUpdateReceived(update);

        // Handle conversation flow (text inputs, images, etc.)
        if (update.hasMessage()) {
            long chatId = update.getMessage().getChatId();
            String msgText = update.getMessage().hasText() ? update.getMessage().getText() : "";

            // If the message is a command, skip manual routing (super.onUpdateReceived handled it)
            if (msgText.startsWith("/")) {
                return;
            }

            // ROUTING LOGIC:
            // 1. If user is in the middle of checking history, route to HistoryHandler
            if (historyHandler != null && historyHandler.chatHasState(chatId)) {
                historyHandler.handleUpdate(update);
            }
            // 2. Otherwise, route to ResponseHandler (Reporting Flow)
            // Note: Ideally, check if responseHandler actually HAS a state for this user
            // to avoid responding to random text, but for now this acts as the default handler.
            else if (responseHandler != null) {
                responseHandler.handleUpdate(update);
            }
        }
    }

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