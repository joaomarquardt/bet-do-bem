package com.api.betdobem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BetdobemApplication {

	public static void main(String[] args) {
		SpringApplication.run(BetdobemApplication.class, args);
	}

}
