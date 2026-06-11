package com.shop.clients.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class FeignAuthInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null) {
                template.header("Authorization", authHeader);
            }
            
            String authUser = request.getHeader("X-Auth-User");
            if (authUser != null) {
                template.header("X-Auth-User", authUser);
            }
            
            String authRole = request.getHeader("X-Auth-Role");
            if (authRole != null) {
                template.header("X-Auth-Role", authRole);
            }
        }
    }
}
