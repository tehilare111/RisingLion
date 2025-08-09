package com.risinglion.util;

import com.risinglion.domain.entity.User;
import com.risinglion.domain.repo.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class Bootstrap {
    @Bean
    CommandLineRunner initUsers(UserRepository users, PasswordEncoder encoder) {
        return args -> {
            if (users.count() == 0) {
                User admin = User.builder().username("admin").email("admin@demo.com").password(encoder.encode("min123!")).isAdmin(true).build();
                User jane = User.builder().username("jane").email("jane@demo.com").password(encoder.encode("user123!")).isAdmin(false).build();
                users.save(admin);
                users.save(jane);
            }
        };
    }
}
