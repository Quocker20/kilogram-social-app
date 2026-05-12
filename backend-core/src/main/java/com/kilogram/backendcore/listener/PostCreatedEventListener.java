package com.kilogram.backendcore.listener;

import com.kilogram.backendcore.event.PostCreatedEvent;
import com.kilogram.backendcore.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Listens for {@link PostCreatedEvent} and triggers follower fan-out notifications
 * AFTER the originating transaction has been committed.
 *
 * <p>Using {@code AFTER_COMMIT} guarantees that the post row is already visible
 * in the database when the async notification thread reads it, preventing the
 * {@code postId = NULL} bug that occurs when notifications run inside the
 * still-open createPost transaction.</p>
 *
 * <p>{@code @Async} keeps the fan-out off the main request thread so large
 * follower lists do not block the HTTP response.</p>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PostCreatedEventListener {

    private final NotificationService notificationService;

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPostCreated(PostCreatedEvent event) {
        log.info("Post committed – starting follower fan-out for post {} by {}",
                event.postId(), event.authorUsername());
        notificationService.notifyFollowers(event.authorUsername(), event.postId());
    }
}
