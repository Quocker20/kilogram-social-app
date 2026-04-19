package com.kilogram.backendcore.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Spring @Async configuration — necessary for fan-out notifications to followers.
 * When posting, notifying N followers is run asynchronously to avoid blocking the HTTP response.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "notificationExecutor")
    public Executor notificationExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        // Number of threads always ready
        executor.setCorePoolSize(5);
        // Maximum number of threads under high load
        executor.setMaxPoolSize(20);
        // Queue holding tasks when all threads are busy
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("notif-async-");
        executor.initialize();
        return executor;
    }
}
