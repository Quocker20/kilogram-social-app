package com.kilogram.backendcore.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Cấu hình Spring @Async — cần thiết cho fan-out thông báo tới follower.
 * Khi đăng bài, việc notify N follower được chạy async để không block HTTP response.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "notificationExecutor")
    public Executor notificationExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        // Số thread luôn sẵn sàng
        executor.setCorePoolSize(5);
        // Số thread tối đa khi tải cao
        executor.setMaxPoolSize(20);
        // Queue chứa task khi tất cả thread đều bận
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("notif-async-");
        executor.initialize();
        return executor;
    }
}
