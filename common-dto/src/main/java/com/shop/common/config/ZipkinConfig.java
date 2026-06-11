package com.shop.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import zipkin2.reporter.Sender;
import zipkin2.reporter.urlconnection.URLConnectionSender;

@Configuration
public class ZipkinConfig {
    @Value("${spring.application.name:unknown-service}")
    private String applicationName;

    @Value("${management.zipkin.tracing.endpoint:http://localhost:19411/api/v2/spans}")
    private String zipkinEndpoint;

    @Bean
    public Sender zipkinSender() {
        return URLConnectionSender.create(zipkinEndpoint);
    }

    @Bean
    public zipkin2.reporter.brave.AsyncZipkinSpanHandler zipkinSpanHandler(Sender sender) {
        return zipkin2.reporter.brave.AsyncZipkinSpanHandler.create(sender);
    }

    @Bean
    public brave.Tracing braveTracing(zipkin2.reporter.brave.AsyncZipkinSpanHandler spanHandler) {
        return brave.Tracing.newBuilder()
                .localServiceName(applicationName)
                .currentTraceContext(brave.propagation.ThreadLocalCurrentTraceContext.newBuilder()
                        .addScopeDecorator(brave.context.slf4j.MDCScopeDecorator.get())
                        .build())
                .addSpanHandler(spanHandler)
                .build();
    }

    @Bean
    public io.micrometer.tracing.Tracer micrometerTracer(brave.Tracing tracing) {
        return new io.micrometer.tracing.brave.bridge.BraveTracer(
                tracing.tracer(),
                new io.micrometer.tracing.brave.bridge.BraveCurrentTraceContext(tracing.currentTraceContext()),
                new io.micrometer.tracing.brave.bridge.BraveBaggageManager()
        );
    }

    @Bean
    public io.micrometer.observation.ObservationHandler<io.micrometer.observation.Observation.Context> defaultTracingObservationHandler(io.micrometer.tracing.Tracer tracer) {
        return new io.micrometer.tracing.handler.DefaultTracingObservationHandler(tracer);
    }

    @Bean
    @SuppressWarnings("rawtypes")
    public io.micrometer.observation.ObservationHandler<io.micrometer.observation.Observation.Context> propagatingReceiverTracingObservationHandler(
            io.micrometer.tracing.Tracer tracer, brave.Tracing tracing) {
        return new io.micrometer.tracing.handler.PropagatingReceiverTracingObservationHandler(
                tracer, new io.micrometer.tracing.brave.bridge.BravePropagator(tracing));
    }

    @Bean
    @SuppressWarnings("rawtypes")
    public io.micrometer.observation.ObservationHandler<io.micrometer.observation.Observation.Context> propagatingSenderTracingObservationHandler(
            io.micrometer.tracing.Tracer tracer, brave.Tracing tracing) {
        return new io.micrometer.tracing.handler.PropagatingSenderTracingObservationHandler(
                tracer, new io.micrometer.tracing.brave.bridge.BravePropagator(tracing));
    }
}
