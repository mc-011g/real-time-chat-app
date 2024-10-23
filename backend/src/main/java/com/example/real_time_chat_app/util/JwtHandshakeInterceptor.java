package com.example.real_time_chat_app.util;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;

import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

/**
 * Checks if a token exists in the web socket URI and either accepts or rejects
 * the handshake
 */
@Component
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(JwtHandshakeInterceptor.class);

    @Override
    public boolean beforeHandshake(@NonNull ServerHttpRequest request, @NonNull ServerHttpResponse response,
            @NonNull WebSocketHandler wsHandler, @NonNull Map<String, Object> attributes) throws Exception {

        String token = request.getURI().getQuery().split("token=")[1]; // Gets the token from the URI

        if (token != null) {
            return true; // Accept handshake
        } else {
            response.setStatusCode(HttpStatus.FORBIDDEN);
            return false; // Reject handshake
        }
    }

    @Override
    public void afterHandshake(@NonNull ServerHttpRequest request, @NonNull ServerHttpResponse response,
            @NonNull WebSocketHandler wsHandler,
            @Nullable Exception exception) {
        logger.info("After Handshake: " + request.getURI());
    }

}
