package com.shop.gateway.filter;

import com.shop.gateway.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.shop.common.dto.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import java.util.List;
import io.jsonwebtoken.Claims;

import java.io.IOException;

@Component
public class AuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    public AuthenticationFilter(JwtUtil jwtUtil, ObjectMapper objectMapper) {
        this.jwtUtil = jwtUtil;
        this.objectMapper = objectMapper;
    }

    @Value("${security.public-endpoints:}")
    private List<String> publicEndpoints;

    @Value("${security.public-get-endpoints:}")
    private List<String> publicGetEndpoints;



    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        boolean isPublic = publicEndpoints != null && publicEndpoints.stream().anyMatch(uri::startsWith);
        boolean isPublicGet = "GET".equalsIgnoreCase(request.getMethod()) &&
                publicGetEndpoints != null && publicGetEndpoints.stream().anyMatch(uri::startsWith);

        // Allow static resources and taxonomy to be public for now, taxonomy mutation
        // is admin only
        if (uri.startsWith("/uploads/")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (isPublic || isPublicGet) {
            HeaderMapRequestWrapper wrappedRequest = new HeaderMapRequestWrapper(request);
            wrappedRequest.addHeader("X-Auth-Role", null);
            wrappedRequest.addHeader("X-Auth-User", null);
            filterChain.doFilter(wrappedRequest, response);
            return;
        }

        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                jwtUtil.validateToken(token);
                Claims claims = jwtUtil.getClaims(token);
                String role = claims.get("role", String.class);
                String username = claims.getSubject();

                HeaderMapRequestWrapper wrappedRequest = new HeaderMapRequestWrapper(request);
                wrappedRequest.addHeader("X-Auth-Role", role);
                wrappedRequest.addHeader("X-Auth-User", username);

                filterChain.doFilter(wrappedRequest, response);
                return;

            } catch (Exception e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write(objectMapper.writeValueAsString(
                        new ErrorResponse("UNAUTHORIZED", "Unauthorized access")));
                return;
            }
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write(objectMapper.writeValueAsString(
                    new ErrorResponse("UNAUTHORIZED", "Missing authorization header")));
            return;
        }
    }
}
