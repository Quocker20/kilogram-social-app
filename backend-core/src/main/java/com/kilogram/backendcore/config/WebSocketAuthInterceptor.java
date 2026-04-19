package com.kilogram.backendcore.config;

import com.kilogram.backendcore.security.CustomUserDetailsService;
import com.kilogram.backendcore.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * STOMP ChannelInterceptor — validate JWT trong CONNECT frame.
 *
 * <p>Vì WebSocket sau khi handshake không còn HTTP headers nữa,
 * client gửi JWT trong STOMP CONNECT frame header "Authorization".
 * Interceptor này chặn CONNECT frame, validate token, và set Authentication
 * vào StompHeaderAccessor để Spring biết user nào đang kết nối
 * (cần thiết cho routing {@code /user/*} destinations).</p>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            log.debug("WebSocket CONNECT received, Authorization header present: {}",
                    StringUtils.hasText(authHeader));

            if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    if (jwtTokenProvider.validateToken(token)) {
                        String username = jwtTokenProvider.getUsernameFromToken(token);
                        UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails, null, userDetails.getAuthorities());

                        // Set Authentication vào STOMP header accessor
                        // Đây là cơ sở để Spring route /user/{username}/... đúng user
                        accessor.setUser(authentication);
                        log.debug("WebSocket authenticated for user: {}", username);
                    }
                } catch (Exception e) {
                    log.warn("WebSocket CONNECT JWT validation failed: {}", e.getMessage());
                }
            }
        }

        return message;
    }
}
