package com.shop.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;
import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.uri;
import static org.springframework.cloud.gateway.server.mvc.filter.LoadBalancerFilterFunctions.lb;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;

@Configuration
public class GatewayConfig {

    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins(allowedOrigins)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }

    // --- Local (Eureka) Routes ---

    @Bean
    @Profile("!k8s")
    public RouterFunction<ServerResponse> authRouteLocal() {
        return route("auth-service")
                .route(RequestPredicates.path("/auth/**"), http())
                .filter(lb("auth-service"))
                .build();
    }

    @Bean
    @Profile("!k8s")
    public RouterFunction<ServerResponse> userRouteLocal() {
        return route("user-service")
                .route(RequestPredicates.path("/users/**"), http())
                .filter(lb("user-service"))
                .build();
    }

    @Bean
    @Profile("!k8s")
    public RouterFunction<ServerResponse> productRouteLocal() {
        return route("product-service")
                .route(RequestPredicates.path("/products/**"), http())
                .filter(lb("product-service"))
                .build();
    }

    @Bean
    @Profile("!k8s")
    public RouterFunction<ServerResponse> taxonomyRouteLocal() {
        return route("product-service-taxonomy")
                .route(RequestPredicates.path("/taxonomy/**"), http())
                .filter(lb("product-service"))
                .build();
    }

    @Bean
    @Profile("!k8s")
    public RouterFunction<ServerResponse> uploadsRouteLocal() {
        return route("product-service-uploads")
                .route(RequestPredicates.path("/uploads/**"), http())
                .filter(lb("product-service"))
                .build();
    }

    @Bean
    @Profile("!k8s")
    public RouterFunction<ServerResponse> cartRouteLocal() {
        return route("cart-service")
                .route(RequestPredicates.path("/cart/**"), http())
                .filter(lb("cart-service"))
                .build();
    }

    @Bean
    @Profile("!k8s")
    public RouterFunction<ServerResponse> orderRouteLocal() {
        return route("order-service")
                .route(RequestPredicates.path("/orders/**"), http())
                .filter(lb("order-service"))
                .build();
    }

    // --- Kubernetes Routes ---

    @Bean
    @Profile("k8s")
    public RouterFunction<ServerResponse> authRouteK8s() {
        return route("auth-service")
                .route(RequestPredicates.path("/auth/**"), http())
                .before(uri("http://auth-service:8081"))
                .build();
    }

    @Bean
    @Profile("k8s")
    public RouterFunction<ServerResponse> userRouteK8s() {
        return route("user-service")
                .route(RequestPredicates.path("/users/**"), http())
                .before(uri("http://user-service:8082"))
                .build();
    }

    @Bean
    @Profile("k8s")
    public RouterFunction<ServerResponse> productRouteK8s() {
        return route("product-service")
                .route(RequestPredicates.path("/products/**"), http())
                .before(uri("http://product-service:8083"))
                .build();
    }

    @Bean
    @Profile("k8s")
    public RouterFunction<ServerResponse> taxonomyRouteK8s() {
        return route("product-service-taxonomy")
                .route(RequestPredicates.path("/taxonomy/**"), http())
                .before(uri("http://product-service:8083"))
                .build();
    }

    @Bean
    @Profile("k8s")
    public RouterFunction<ServerResponse> uploadsRouteK8s() {
        return route("product-service-uploads")
                .route(RequestPredicates.path("/uploads/**"), http())
                .before(uri("http://product-service:8083"))
                .build();
    }

    @Bean
    @Profile("k8s")
    public RouterFunction<ServerResponse> cartRouteK8s() {
        return route("cart-service")
                .route(RequestPredicates.path("/cart/**"), http())
                .before(uri("http://cart-service:8084"))
                .build();
    }

    @Bean
    @Profile("k8s")
    public RouterFunction<ServerResponse> orderRouteK8s() {
        return route("order-service")
                .route(RequestPredicates.path("/orders/**"), http())
                .before(uri("http://order-service:8085"))
                .build();
    }
}
