package com.oroboros.notafiscal.web.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuração de CORS para desenvolvimento local.
 * <p>
 * <b>⚠ ATENÇÃO — SEGURANÇA:</b> Esta configuração libera CORS para qualquer
 * origem em localhost. Antes de expor o backend fora da máquina local (staging,
 * produção, VPN, etc.), é <b>obrigatório</b> restringir as origens permitidas
 * a domínios específicos e confiáveis. Nunca permita {@code *} em produção.
 */
@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOriginPatterns("http://localhost:*")
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true)
                        .maxAge(3600);
            }
        };
    }
}
