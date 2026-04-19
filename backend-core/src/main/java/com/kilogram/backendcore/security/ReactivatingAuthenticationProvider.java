package com.kilogram.backendcore.security;

import com.kilogram.backendcore.entity.User;
import com.kilogram.backendcore.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AccountExpiredException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsChecker;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
public class ReactivatingAuthenticationProvider extends DaoAuthenticationProvider {

    private final UserRepository userRepository;

    public ReactivatingAuthenticationProvider(
            CustomUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository) {

        super(userDetailsService);
        setPasswordEncoder(passwordEncoder);
        this.userRepository = userRepository;
        setPreAuthenticationChecks(new SkipDisabledPreAuthChecks());
    }

    @Override
    protected Authentication createSuccessAuthentication(
            Object principal, Authentication authentication, UserDetails user) {

        User kilogramUser = (User) user;
        if (!kilogramUser.isActive()) {
            log.info("Auto-reactivating deactivated account for user: {}", kilogramUser.getUsername());
            kilogramUser.setActive(true);
            userRepository.save(kilogramUser);
        }
        return super.createSuccessAuthentication(principal, authentication, kilogramUser);
    }

    private static class SkipDisabledPreAuthChecks implements UserDetailsChecker {
        @Override
        public void check(UserDetails user) {
            if (!user.isAccountNonLocked()) {
                throw new LockedException("User account is locked");
            }
            if (!user.isAccountNonExpired()) {
                throw new AccountExpiredException("User account has expired");
            }
            // isEnabled() is intentionally skipped — reactivation happens in
            // createSuccessAuthentication() after the password has been verified.
        }
    }
}
