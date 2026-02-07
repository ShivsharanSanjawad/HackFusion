package com.shivsharan.HackFusion.bot.telegram;

import org.telegram.abilitybots.api.db.DBContext;
import org.telegram.abilitybots.api.sender.SilentSender;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.PhotoSize;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

public class ResponseHandler {
    private final SilentSender silent;
    private final Map<Long, UserState> chatStates;
    private final IssueBot bot; // Reference to the main bot

    public enum UserState {
        START, AWAITING_NAME, AWAITING_LOCATION, AWAITING_IMAGE, COMPLETED
    }

    // Constructor now accepts IssueBot
    public ResponseHandler(SilentSender silent, DBContext db, IssueBot bot) {
        this.silent = silent;
        this.chatStates = db.getMap("USER_STATES");
        this.bot = bot;
    }

    public void replyToStart(long chatId) {
        silent.send("Welcome! Let's register your civil issue. First, please enter your **Full Name**:", chatId);
        chatStates.put(chatId, UserState.AWAITING_NAME);
    }

    public void handleUpdate(Update update) {
        long chatId = update.getMessage().getChatId();
        UserState currentState = chatStates.getOrDefault(chatId, UserState.START);

        switch (currentState) {
            case AWAITING_NAME:
                if (update.getMessage().hasText()) {
                    String name = update.getMessage().getText();
                    // Save name logic here...
                    silent.send("Got it, " + name + ". Now, please send the **Location** of the issue:", chatId);
                    chatStates.put(chatId, UserState.AWAITING_LOCATION);
                } else {
                    silent.send("Please provide a valid text name.", chatId);
                }
                break;

            case AWAITING_LOCATION:
                if (update.getMessage().hasText()) {
                    // Save location logic here...
                    silent.send("Location received. Finally, please upload a **Photo** of the issue:", chatId);
                    chatStates.put(chatId, UserState.AWAITING_IMAGE);
                } else {
                    silent.send("Please send the location as text.", chatId);
                }
                break;

            case AWAITING_IMAGE:
                if (update.getMessage().hasPhoto()) {
                    // 1. Get the largest photo (Telegram sends multiple sizes)
                    List<PhotoSize> photos = update.getMessage().getPhoto();
                    String fileId = photos.stream()
                            .max(Comparator.comparing(PhotoSize::getFileSize))
                            .orElse(photos.get(0))
                            .getFileId();

                    // 2. Call the bot to get the actual Link
                    String link = bot.getPhotoLink(fileId);

                    // 3. Send link back to user (or store in DB)
                    silent.send("Registration complete! Link generated: " + link, chatId);

                    // Clear state or set to completed
                    chatStates.put(chatId, UserState.COMPLETED);
                } else {
                    silent.send("That wasn't a photo. Please upload an image of the issue.", chatId);
                }
                break;

            default:
                silent.send("Type /start to begin a new report.", chatId);
                break;
        }
    }
}