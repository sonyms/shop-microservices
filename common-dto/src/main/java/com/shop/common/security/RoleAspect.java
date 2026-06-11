package com.shop.common.security;

import com.shop.common.exception.BaseException;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.core.annotation.AnnotationUtils;
import org.aspectj.lang.reflect.MethodSignature;

@Aspect
@Component
public class RoleAspect {

    private static final Logger logger = LoggerFactory.getLogger(RoleAspect.class);

    @Before("@annotation(com.shop.common.security.RequireRole) || @within(com.shop.common.security.RequireRole)")
    public void checkRole(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();

        RequireRole requireRole = AnnotationUtils.findAnnotation(signature.getMethod(), RequireRole.class);

        if (requireRole == null) {
            requireRole = AnnotationUtils.findAnnotation(joinPoint.getTarget().getClass(), RequireRole.class);
        }

        if (requireRole == null) {
            return; // Should not happen given the pointcut, but safe fallback
        }

        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            throw new BaseException("UNAUTHORIZED", "No request context available", HttpStatus.UNAUTHORIZED);
        }

        HttpServletRequest request = attributes.getRequest();
        String userRole = request.getHeader("X-Auth-Role");

        if (userRole == null || !userRole.equals(requireRole.value())) {
            logger.warn("Access denied. Required role: {}, but found: {}", requireRole.value(), userRole);
            throw new BaseException("FORBIDDEN", "You do not have the required role to access this resource.",
                    HttpStatus.FORBIDDEN);
        }
    }
}
