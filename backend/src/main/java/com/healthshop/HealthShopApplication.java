package com.healthshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EntityScan("com.healthshop.model")
@EnableJpaRepositories("com.healthshop.repository")
@EnableMongoRepositories("com.healthshop.repository")
@EnableScheduling
public class HealthShopApplication {
    public static void main(String[] args) {
        SpringApplication.run(HealthShopApplication.class, args);
    }
}
