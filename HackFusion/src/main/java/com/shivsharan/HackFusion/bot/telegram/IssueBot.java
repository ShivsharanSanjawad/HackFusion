package com.shivsharan.HackFusion.bot.telegram;

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

    @Autowired
    public IssueBot(Environment env) {
        // Passing Bot Token and Username from properties
        super(env.getProperty("TelegramBot"), "CivilIssueRegister");

        // PASS 'this' TO THE HANDLER so it can call methods on this bot
        this.responseHandler = new ResponseHandler(silent, db, this);
    }

    @Override
    public long creatorId() {
        return 1L; // Replace with your actual Telegram User ID
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
        // Must call super to let AbilityBot handle internal states/claims
        super.onUpdateReceived(update);

        if (update.hasMessage()) {
            responseHandler.handleUpdate(update);
        }
    }

    // This method generates the temporary download link
    public String getPhotoLink(String fileId) {
        try {
            GetFile getFileMethod = new GetFile();
            getFileMethod.setFileId(fileId);
            File file = execute(getFileMethod);
            return file.getFileUrl(getBotToken());

        } catch (TelegramApiException e) {
            e.printStackTrace();
            return "Error retrieving file url";
        }
    }
}