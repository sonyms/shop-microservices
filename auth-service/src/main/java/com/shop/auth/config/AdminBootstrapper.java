package com.shop.auth.config;

import com.shop.auth.entity.UserCredential;
import com.shop.auth.repository.UserCredentialRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class AdminBootstrapper implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapper.class);

    private final UserCredentialRepository repository;
    private final PasswordEncoder passwordEncoder;

    public AdminBootstrapper(UserCredentialRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Check if any admin exists. If not, create a default master admin.
        if (repository.findByUsername("admin@shopsphere.com").isEmpty()) {
            UserCredential admin = new UserCredential();
            admin.setUsername("admin@shopsphere.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            repository.save(admin);
            log.info("====== MASTER ADMIN CREATED: admin / admin123 ======");
        }
    }
}
