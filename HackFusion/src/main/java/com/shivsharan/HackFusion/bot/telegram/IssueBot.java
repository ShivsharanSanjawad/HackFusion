package com.shivsharan.HackFusion.bot.telegram;

import com.shivsharan.HackFusion.Service.DepartmentService;
import com.shivsharan.HackFusion.Service.ReportService;
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

    private final ResponseHandler responseHandler;

    // 1. Declare services to hold the injected instances
    private final DepartmentService departmentService;
    private final ReportService reportService;

    @Autowired
    public IssueBot(Environment env,
                    DepartmentService departmentService,
                    ReportService reportService) {
        // 2. Pass Bot Token and Username
        super(env.getProperty("TelegramBot"), "CivilIssueRegister");

        // 3. Save the services
        this.departmentService = departmentService;
        this.reportService = reportService;

        // 4. Initialize Handler with ALL 5 required arguments
        // (silent, db, this, departmentService, reportService)
        this.responseHandler = new ResponseHandler(silent, db, this, departmentService, reportService);
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

    @Override
    public void onUpdateReceived(Update update) {
        super.onUpdateReceived(update);
        // Forward updates to the handler
        if (update.hasMessage()) {
            responseHandler.handleUpdate(update);
        }
    }

    public String getPhotoLink(String fileId) {
        try {
            GetFile getFileMethod = new GetFile();
            getFileMethod.setFileId(fileId);
            File file = execute(getFileMethod);
            // Generates https://api.telegram.org/file/bot<token>/<path>
            return file.getFileUrl(getBotToken());
        } catch (TelegramApiException e) {
            e.printStackTrace();
            return "Error retrieving file url";
        }
    }
}