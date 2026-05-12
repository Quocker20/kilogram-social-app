package com.kilogram.backendcore.event;

/**
 * Application event published after a new post is successfully persisted.
 * Consumed by {@link com.kilogram.backendcore.listener.PostCreatedEventListener}
 * via {@code @TransactionalEventListener(phase = AFTER_COMMIT)} to guarantee
 * the post row is visible in DB before fan-out notifications are sent.
 */
public record PostCreatedEvent(String authorUsername, String postId) {}
