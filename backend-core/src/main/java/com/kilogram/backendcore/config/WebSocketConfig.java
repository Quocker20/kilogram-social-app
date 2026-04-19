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
 * WebSocket + STOMP message broker configuration.
 *
 * <p>Topic naming convention used in Kilogram:
 * <ul>
 *   <li>{@code /user/{username}/topic/notifications} — notifications</li>
 *   <li>{@code /user/{username}/topic/messages}      — realtime chat</li>
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
        // Prefix for clients to send messages to @MessageMapping handlers on the server
        registry.setApplicationDestinationPrefixes("/app");

        // Prefix for server push (in-memory broker)
        // /topic/* — broadcast (multiple subscribers)
        // /queue/*  — point-to-point
        registry.enableSimpleBroker("/topic", "/queue");

        // Prefix for user-specific destinations
        // /user/quocker20/topic/notifications → only send to quocker20
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry
                .addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173")
                // SockJS fallback in case WebSocket is blocked
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Register JWT interceptor — validate token in STOMP CONNECT frame
        registration.interceptors(webSocketAuthInterceptor);
    }
}
