package com.kilogram.backendcore.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.kilogram.backendcore.config.WebSocketAuthInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.config.ChannelRegistration;

/**
 * Cấu hình WebSocket + STOMP message broker.
 *
 * <p>Topic naming convention dùng trong Kilogram:
 * <ul>
 *   <li>{@code /user/{username}/topic/notifications} — thông báo (feature này)</li>
 *   <li>{@code /user/{username}/topic/messages}      — chat realtime (feature tương lai)</li>
 * </ul>
 * </p>
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthInterceptor webSocketAuthInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Prefix để client gửi message đến @MessageMapping handlers trên server
        registry.setApplicationDestinationPrefixes("/app");

        // Prefix cho server push (in-memory broker)
        // /topic/* — broadcast (nhiều subscriber)
        // /queue/*  — point-to-point
        registry.enableSimpleBroker("/topic", "/queue");

        // Prefix cho user-specific destinations
        // /user/quocker20/topic/notifications → chỉ gửi cho quocker20
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry
                .addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173")
                // SockJS fallback cho trường hợp WebSocket bị block
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Đăng ký JWT interceptor — validate token trong STOMP CONNECT frame
        registration.interceptors(webSocketAuthInterceptor);
    }
}
