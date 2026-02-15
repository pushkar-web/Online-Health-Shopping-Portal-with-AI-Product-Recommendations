package com.healthshop.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Health Shop API")
                        .description("AI-Powered Online Health Shopping Portal REST API")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Health Shop Team")
                                .email("support@healthshop.com")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .schemaRequirement("Bearer Authentication",
                        new SecurityScheme()
                                .name("Bearer Authentication")
                                .type(SecurityScheme.Type.HTTP)
                                .bearerFormat("JWT")
                                .scheme("bearer"));
    }
}
