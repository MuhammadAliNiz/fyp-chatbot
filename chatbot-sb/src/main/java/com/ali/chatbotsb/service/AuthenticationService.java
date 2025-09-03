package com.ali.chatbotsb.service;

import com.ali.chatbotsb.config.JwtProperties;
import com.ali.chatbotsb.dto.AuthenticationRequest;
import com.ali.chatbotsb.dto.AuthenticationResponse;
import com.ali.chatbotsb.dto.ChangePasswordRequest;
import com.ali.chatbotsb.dto.RegisterRequest;
import com.ali.chatbotsb.jwt.JwtService;
import com.ali.chatbotsb.jwt.RefreshTokenService;
import com.ali.chatbotsb.model.RefreshToken;
import com.ali.chatbotsb.model.Role;
import com.ali.chatbotsb.model.User;
import com.ali.chatbotsb.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
    private final JwtProperties jwtProperties;
    private final RoleService roleService;

    @Transactional
    public AuthenticationResponse register(RegisterRequest request, HttpServletResponse response) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        // Assign default USER role to new users
        Role defaultRole = roleService.getDefaultUserRole();
        user.addRole(defaultRole);

        var savedUser = userRepository.save(user);
        var accessToken = jwtService.generateAccessToken(savedUser);
        var refreshToken = jwtService.generateRefreshToken(savedUser);

        // Save refresh token to database
        refreshTokenService.createRefreshToken(savedUser, refreshToken);

        // Set refresh token as HTTP-only cookie
        setRefreshTokenCookie(response, refreshToken);

        return createAuthenticationResponse(accessToken, savedUser);
    }

    @Transactional
    public AuthenticationResponse authenticate(AuthenticationRequest request, HttpServletResponse response) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        var accessToken = jwtService.generateAccessToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        // Save refresh token to database
        refreshTokenService.createRefreshToken(user, refreshToken);

        // Set refresh token as HTTP-only cookie
        setRefreshTokenCookie(response, refreshToken);

        return createAuthenticationResponse(accessToken, user);
    }

    @Transactional
    public AuthenticationResponse refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = extractRefreshTokenFromCookies(request);

        if (refreshToken == null) {
            throw new IllegalArgumentException("Refresh token not found");
        }

        Optional<RefreshToken> refreshTokenEntity = refreshTokenService.findByToken(refreshToken);

        if (refreshTokenEntity.isEmpty() || !refreshTokenService.isTokenValid(refreshTokenEntity.get())) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }

        User user = refreshTokenEntity.get().getUser();
        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);

        // Update refresh token in database
        refreshTokenService.createRefreshToken(user, newRefreshToken);

        // Set new refresh token as HTTP-only cookie
        setRefreshTokenCookie(response, newRefreshToken);

        return createAuthenticationResponse(newAccessToken, user);
    }

    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = extractRefreshTokenFromCookies(request);

        if (refreshToken != null) {
            refreshTokenService.revokeToken(refreshToken);
        }

        // Clear refresh token cookie
        clearRefreshTokenCookie(response);
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie(jwtProperties.getCookieName(), refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(true); // Use only over HTTPS in production
        cookie.setPath("/");
        cookie.setMaxAge((int) (jwtProperties.getRefreshTokenExpiration() / 1000));
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(jwtProperties.getCookieName(), "");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private String extractRefreshTokenFromCookies(HttpServletRequest request) {
        if (request.getCookies() != null) {
            return Arrays.stream(request.getCookies())
                    .filter(cookie -> jwtProperties.getCookieName().equals(cookie.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);
        }
        return null;
    }

    private AuthenticationResponse createAuthenticationResponse(String accessToken, User user) {
        var userInfo = new AuthenticationResponse.UserInfo(
                user.getId().toString(),
                user.getName(),
                user.getEmail(),
                user.getRoleNames() // Now returns Set<String> of all role names
        );

        return new AuthenticationResponse(
                accessToken,
                "Bearer",
                jwtProperties.getAccessTokenExpiration(),
                userInfo
        );
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        // Verify new password and confirmation match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirmation do not match");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}