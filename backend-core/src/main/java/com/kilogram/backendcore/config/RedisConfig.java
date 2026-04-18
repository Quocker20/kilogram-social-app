package com.kilogram.backendcore.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.JacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@Configuration
public class RedisConfig {

    /**
     * Shared {@link ObjectMapper} bean using Jackson 3.x ({@code tools.jackson}).
     * {@code java.time} types are supported natively — no manual module registration required.
     */
    @Bean
    public ObjectMapper objectMapper() {
        return JsonMapper.builder().build();
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory,
                                                       ObjectMapper objectMapper) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        JacksonJsonRedisSerializer<Object> jacksonSerializer =
                new JacksonJsonRedisSerializer<>(objectMapper, Object.class);

        template.setValueSerializer(jacksonSerializer);
        template.setHashValueSerializer(jacksonSerializer);

        return template;
    }
}
